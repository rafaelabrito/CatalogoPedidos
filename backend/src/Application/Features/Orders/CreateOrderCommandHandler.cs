// Application/Features/Orders/CreateOrderCommandHandler.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Features.Orders.Commands
{
    public class CreateOrderCommandHandler
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IProductRepository _productRepository;

        public CreateOrderCommandHandler(
            IOrderRepository orderRepository,
            ICustomerRepository customerRepository,
            IProductRepository productRepository)
        {
            _orderRepository = orderRepository;
            _customerRepository = customerRepository;
            _productRepository = productRepository;
        }

        public async Task<Guid> Handle(CreateOrderCommand request)
        {
            if (string.IsNullOrWhiteSpace(request.IdempotencyKey))
            {
                throw new InvalidOperationException("A chave de idempotência é obrigatória para criar um pedido.");
            }

            var existingOrderId = await _orderRepository.GetOrderIdByKeyAsync(request.IdempotencyKey);
            if (existingOrderId.HasValue)
            {
                return existingOrderId.Value;
            }

            var existingKey = await _orderRepository.GetIdempotencyKeyAsync(request.IdempotencyKey);
            if (existingKey is not null)
            {
                throw new InvalidOperationException("Esta requisição de pedido já foi processada.");
            }

            var customer = await _customerRepository.GetByIdAsync(request.CustomerId);
            if (customer == null)
            {
                throw new InvalidOperationException($"Cliente com ID {request.CustomerId} não encontrado.");
            }

            if (request.Items == null || request.Items.Count == 0)
            {
                throw new InvalidOperationException("O pedido deve conter ao menos um item.");
            }

            var stockUpdates = new Dictionary<Guid, int>();
            var orderItems = new List<OrderItem>();

            foreach (var itemDto in request.Items)
            {
                if (itemDto.Quantity <= 0)
                {
                    throw new InvalidOperationException("A quantidade de cada item deve ser maior que zero.");
                }

                var product = await _productRepository.GetByIdAsync(itemDto.ProductId);
                if (product == null)
                {
                    throw new InvalidOperationException($"Produto com ID {itemDto.ProductId} não encontrado.");
                }

                var requestedQuantity = stockUpdates.TryGetValue(product.Id, out var alreadyRequested)
                    ? alreadyRequested + itemDto.Quantity
                    : itemDto.Quantity;

                if (product.StockQty < requestedQuantity)
                {
                    throw new InvalidOperationException(
                        $"Estoque insuficiente para o produto '{product.Name}'. Disponível: {product.StockQty}, Solicitado: {requestedQuantity}");
                }

                var orderItem = OrderItem.Create(product.Id, itemDto.Quantity, product.Price);
                orderItems.Add(orderItem);

                stockUpdates[product.Id] = requestedQuantity;
            }

            var order = Order.Create(request.CustomerId, orderItems);
            order.AttachIdempotencyKey(request.IdempotencyKey);

            var idempotencyKey = new IdempotencyKey
            {
                Key = request.IdempotencyKey,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                return await _orderRepository.SaveOrderTransactionAsync(
                    order,
                    orderItems,
                    idempotencyKey,
                    stockUpdates);
            }
            catch (Exception)
            {
                var persistedOrderId = await _orderRepository.GetOrderIdByKeyAsync(request.IdempotencyKey);
                if (persistedOrderId.HasValue)
                {
                    return persistedOrderId.Value;
                }

                throw;
            }
        }
    }
}