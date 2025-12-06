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
            // 1. VALIDAÇÃO: Cliente existe
            var customer = await _customerRepository.GetByIdAsync(request.CustomerId);
            if (customer == null)
                throw new InvalidOperationException($"Cliente com ID {request.CustomerId} não encontrado.");

            // 2. VALIDAÇÃO: Produtos existem e há estoque suficiente
            var stockUpdates = new Dictionary<Guid, int>();
            var orderItems = new List<OrderItem>();

            foreach (var itemDto in request.Items)
            {
                var product = await _productRepository.GetByIdAsync(itemDto.ProductId);
                if (product == null)
                    throw new InvalidOperationException($"Produto com ID {itemDto.ProductId} não encontrado.");

                if (product.StockQty < itemDto.Quantity)
                    throw new InvalidOperationException(
                        $"Estoque insuficiente para o produto '{product.Name}'. " +
                        $"Disponível: {product.StockQty}, Solicitado: {itemDto.Quantity}");

                // Registra a atualização de estoque
                stockUpdates[itemDto.ProductId] = itemDto.Quantity;

                // Cria item do pedido
                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = product.Price,
                    LineTotal = product.Price * itemDto.Quantity
                };
                orderItems.Add(orderItem);
            }

            // 3. CRIAR PEDIDO
            var order = new Order(request.CustomerId, orderItems);

            // 4. IDEMPOTÊNCIA: Gerar chave única
            var idempotencyKeyValue = Guid.NewGuid().ToString();
            var idempotencyKey = new IdempotencyKey { Key = idempotencyKeyValue, CreatedAt = DateTime.UtcNow };

            // 5. PERSISTIR TRANSACIONALMENTE
            var orderId = await _orderRepository.SaveOrderTransactionAsync(
                order,
                orderItems,
                idempotencyKey,
                stockUpdates);

            return orderId;
        }
    }
}