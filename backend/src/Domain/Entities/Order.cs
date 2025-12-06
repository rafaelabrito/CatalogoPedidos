// Domain/Entities/Order.cs
using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Enums;

namespace Domain.Entities
{
    public class Order
    {
        public Guid Id { get; private set; }
        public Guid CustomerId { get; private set; }
        public string? IdempotencyKeyId { get; private set; }
        public decimal TotalAmount { get; private set; }
        public OrderStatus Status { get; private set; } = OrderStatus.Created;
        public DateTime CreatedAt { get; private set; }

        private readonly List<OrderItem> _items = new();
        public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

        public Order(Guid customerId)
        {
            Id = Guid.NewGuid();
            CustomerId = customerId;
            CreatedAt = DateTime.UtcNow;
        }

        private Order() { }

        public static Order Create(Guid customerId, IEnumerable<OrderItem> items)
        {
            var order = new Order(customerId);
            order.ReplaceItems(items);
            return order;
        }

        public void ReplaceItems(IEnumerable<OrderItem> items)
        {
            if (items == null) throw new ArgumentNullException(nameof(items));

            _items.Clear();

            foreach (var item in items)
            {
                AddItem(item);
            }

            RecalculateTotal();
        }

        public void AddItem(OrderItem item)
        {
            if (item == null) throw new ArgumentNullException(nameof(item));

            item.SetOrder(Id);
            _items.Add(item);
            RecalculateTotal();
        }

        public void SetStatus(OrderStatus newStatus)
        {
            Status = newStatus;
        }

        public void AttachIdempotencyKey(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException("A chave de idempotência é obrigatória.", nameof(key));
            }

            IdempotencyKeyId = key;
        }

        private void RecalculateTotal()
        {
            TotalAmount = _items.Sum(item => item.LineTotal);
        }
    }
}