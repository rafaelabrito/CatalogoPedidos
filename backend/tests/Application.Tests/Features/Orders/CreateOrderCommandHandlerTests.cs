using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Features.Orders.Commands;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace Application.Tests.Features.Orders
{
    public class CreateOrderCommandHandlerTests
    {
        private readonly Mock<IOrderRepository> _orderRepositoryMock = new();
        private readonly Mock<ICustomerRepository> _customerRepositoryMock = new();
        private readonly Mock<IProductRepository> _productRepositoryMock = new();
        private readonly CreateOrderCommandHandler _handler;

        public CreateOrderCommandHandlerTests()
        {
            _handler = new CreateOrderCommandHandler(
                _orderRepositoryMock.Object,
                _customerRepositoryMock.Object,
                _productRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ShouldReturnExistingOrderId_WhenIdempotencyKeyAlreadyProcessed()
        {
            // Arrange
            var existingOrderId = Guid.NewGuid();
            _orderRepositoryMock
                .Setup(repo => repo.GetOrderIdByKeyAsync("key"))
                .ReturnsAsync(existingOrderId);

            var command = new CreateOrderCommand(
                Guid.NewGuid(),
                new List<OrderItemDto> { new(Guid.NewGuid(), 1) },
                "key");

            // Act
            var result = await _handler.Handle(command);

            // Assert
            result.Should().Be(existingOrderId);
            _customerRepositoryMock.Verify(r => r.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
            _productRepositoryMock.Verify(r => r.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
            _orderRepositoryMock.Verify(repo => repo.SaveOrderTransactionAsync(
                It.IsAny<Order>(),
                It.IsAny<List<OrderItem>>(),
                It.IsAny<IdempotencyKey>(),
                It.IsAny<Dictionary<Guid, int>>()), Times.Never);
        }

        [Fact]
        public async Task Handle_ShouldThrow_WhenStockIsInsufficient()
        {
            // Arrange
            var customerId = Guid.NewGuid();

            var products = PrepareHappyPathMocks(customerId, new Product("Produto", "SKU-1", 10m, stockQty: 5));
            var productId = Assert.Single(products.Keys);

            var command = new CreateOrderCommand(
                customerId,
                new List<OrderItemDto> { new(productId, 10) },
                "key-1");

            // Act
            Func<Task> action = () => _handler.Handle(command);

            // Assert
            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Estoque insuficiente*");
        }

        [Fact]
        public async Task Handle_ShouldThrow_WhenAccumulatedQuantityExceedsStock()
        {
            // Arrange
            var customerId = Guid.NewGuid();

            var products = PrepareHappyPathMocks(customerId, new Product("Produto", "SKU-1", 10m, stockQty: 5));
            var productId = Assert.Single(products.Keys);

            var command = new CreateOrderCommand(
                customerId,
                new List<OrderItemDto>
                {
                    new(productId, 3),
                    new(productId, 3)
                },
                "key-2");

            // Act
            Func<Task> action = () => _handler.Handle(command);

            // Assert
            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Estoque insuficiente*");
        }

        [Fact]
        public async Task Handle_ShouldPersistOrder_WhenRequestIsValid()
        {
            // Arrange
            var customerId = Guid.NewGuid();
            var idempotencyKey = "key-3";

            var products = PrepareHappyPathMocks(
                customerId,
                new Product("Produto A", "SKU-A", 10m, 10),
                new Product("Produto B", "SKU-B", 5m, 5));

            var firstProductId = products.Single(p => p.Value.Sku == "SKU-A").Key;
            var secondProductId = products.Single(p => p.Value.Sku == "SKU-B").Key;

            var command = new CreateOrderCommand(
                customerId,
                new List<OrderItemDto>
                {
                    new(firstProductId, 2),
                    new(secondProductId, 1)
                },
                idempotencyKey);

            var capturedOrder = default(Order);
            var capturedItems = default(List<OrderItem>);
            var capturedKey = default(IdempotencyKey);
            var capturedStockUpdates = default(Dictionary<Guid, int>);
            var expectedOrderId = Guid.NewGuid();

            _orderRepositoryMock
                .Setup(repo => repo.SaveOrderTransactionAsync(
                    It.IsAny<Order>(),
                    It.IsAny<List<OrderItem>>(),
                    It.IsAny<IdempotencyKey>(),
                    It.IsAny<Dictionary<Guid, int>>() ))
                .Callback<Order, List<OrderItem>, IdempotencyKey, Dictionary<Guid, int>>((order, items, key, stock) =>
                {
                    capturedOrder = order;
                    capturedItems = items;
                    capturedKey = key;
                    capturedStockUpdates = stock;
                })
                .ReturnsAsync(expectedOrderId);

            // Act
            var result = await _handler.Handle(command);

            // Assert
            result.Should().Be(expectedOrderId);
            capturedOrder.Should().NotBeNull();
            capturedOrder!.CustomerId.Should().Be(customerId);
            capturedOrder.TotalAmount.Should().Be(10m * 2 + 5m * 1);
            capturedKey.Should().NotBeNull();
            capturedKey!.Key.Should().Be(idempotencyKey);
            capturedItems.Should().HaveCount(2);
            capturedItems!.Should().OnlyContain(item => item.OrderId == capturedOrder.Id);
            capturedStockUpdates.Should().Contain(new KeyValuePair<Guid, int>(firstProductId, 2));
            capturedStockUpdates.Should().Contain(new KeyValuePair<Guid, int>(secondProductId, 1));
        }

        private Dictionary<Guid, Product> PrepareHappyPathMocks(Guid customerId, params Product[] products)
        {
            _orderRepositoryMock.Reset();
            _orderRepositoryMock.Setup(r => r.GetOrderIdByKeyAsync(It.IsAny<string>()))
                .ReturnsAsync((Guid?)null);
            _orderRepositoryMock.Setup(r => r.GetIdempotencyKeyAsync(It.IsAny<string>()))
                .ReturnsAsync((IdempotencyKey?)null);

            _customerRepositoryMock.Reset();
            _customerRepositoryMock.Setup(r => r.GetByIdAsync(customerId))
                .ReturnsAsync(new Customer("Cliente", "cliente@email.com", "12345678900"));

            _productRepositoryMock.Reset();
            var productMap = products.ToDictionary(p => p.Id, p => p);
            _productRepositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync((Guid id) => productMap.TryGetValue(id, out var product) ? product : null);

            return productMap;
        }
    }
}