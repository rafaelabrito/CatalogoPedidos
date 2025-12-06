// backend/src/Domain/Entities/OrderItem.cs

using System;

namespace Domain.Entities
{
    public class OrderItem
    {
        public Guid Id { get; private set; }
        public Guid OrderId { get; private set; }
        public Guid ProductId { get; private set; }
        public int Quantity { get; private set; }
        public decimal UnitPrice { get; private set; }
        public decimal LineTotal { get; private set; }

        public Order Order { get; private set; } = default!;
        public Product Product { get; private set; } = default!;

        private OrderItem() { }

        private OrderItem(Guid productId, int quantity, decimal unitPrice)
        {
            if (quantity <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(quantity), "Quantidade deve ser maior que zero.");
            }

            if (unitPrice < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(unitPrice), "Preço unitário inválido.");
            }

            Id = Guid.NewGuid();
            ProductId = productId;
            Quantity = quantity;
            UnitPrice = unitPrice;
            LineTotal = unitPrice * quantity;
        }

        public static OrderItem Create(Guid productId, int quantity, decimal unitPrice)
            => new(productId, quantity, unitPrice);

        public void SetOrder(Guid orderId)
        {
            if (orderId == Guid.Empty)
            {
                throw new ArgumentException("OrderId inválido.", nameof(orderId));
            }

            OrderId = orderId;
        }
    }
}