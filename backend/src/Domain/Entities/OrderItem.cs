// backend/src/Domain/Entities/OrderItem.cs

using System;

namespace Domain.Entities
{
    public class OrderItem
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // Preço no momento da compra
        public decimal LineTotal { get; set; } // unitPrice * Quantity
        
        // Propriedades de Navegação
        public Order Order { get; set; } = default!;
        public Product Product { get; set; } = default!;
    }
}