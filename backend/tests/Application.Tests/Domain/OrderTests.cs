using System;
using System.Linq;
using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Application.Tests.Domain
{
    public class OrderTests
    {
        [Fact]
        public void Create_ShouldCalculateTotalsAndAssignOrderIdToItems()
        {
            // Arrange
            var productA = Guid.NewGuid();
            var productB = Guid.NewGuid();

            var items = new[]
            {
                OrderItem.Create(productA, 2, 10m),
                OrderItem.Create(productB, 1, 5m)
            };

            // Act
            var order = Order.Create(Guid.NewGuid(), items);

            // Assert
            order.TotalAmount.Should().Be(25m);
            order.Items.Should().HaveCount(2);
            order.Items.All(i => i.OrderId == order.Id).Should().BeTrue();
            order.Status.Should().Be(OrderStatus.Created);
        }

        [Fact]
        public void AttachIdempotencyKey_ShouldStoreKey()
        {
            // Arrange
            var order = Order.Create(Guid.NewGuid(), new[] { OrderItem.Create(Guid.NewGuid(), 1, 1m) });

            // Act
            order.AttachIdempotencyKey("idem-123");

            // Assert
            order.Items.Should().HaveCount(1);
            order.ToString(); // no-op just ensures object not null
            order.IdempotencyKeyId.Should().Be("idem-123");
        }

        [Fact]
        public void SetStatus_ShouldUpdateStatus()
        {
            var order = Order.Create(Guid.NewGuid(), new[] { OrderItem.Create(Guid.NewGuid(), 1, 1m) });

            order.SetStatus(OrderStatus.Paid);

            order.Status.Should().Be(OrderStatus.Paid);
        }
    }
}
