// Domain/Entities/Order.cs
using System;
using System.Collections.Generic;
using System.Linq;

namespace Domain.Entities
{
    public class Order
    {
        public Guid Id { get; private set; }
        public Guid CustomerId { get; private set; }
        public string? IdempotencyKeyId { get; set; } // Chave de idempotência
        public decimal TotalAmount { get; private set; }
        public string Status { get; private set; } = "CREATED";
        public DateTime CreatedAt { get; private set; }

        public ICollection<OrderItem> Items { get; private set; }

        public Order(Guid customerId, IEnumerable<OrderItem> items)
        {
            Id = Guid.NewGuid();
            CustomerId = customerId;
            CreatedAt = DateTime.UtcNow;
            Items = new List<OrderItem>(items);
            CalculateTotal();
        }

        private Order() { }

        private void CalculateTotal()
        {
            TotalAmount = Items.Sum(item => item.LineTotal);
        }

        public void SetStatus(string newStatus)
        {
            Status = newStatus;
        }
    }
}