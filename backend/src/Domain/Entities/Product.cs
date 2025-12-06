// Domain/Entities/Product.cs
using System;

namespace Domain.Entities
{
    public class Product
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public string Sku { get; private set; }
        public decimal Price { get; private set; }
        public int StockQty { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public Product(string name, string sku, decimal price, int stockQty)
        {
            Id = Guid.NewGuid();
            Name = name;
            Sku = sku;
            Price = price;
            StockQty = stockQty;
            IsActive = true;
            CreatedAt = DateTime.UtcNow;
        }

        private Product() { }

        public void Update(string name, decimal price, int stockQty, bool isActive)
        {
            Name = name;
            Price = price;
            StockQty = stockQty;
            IsActive = isActive;
        }

        public void DecreaseStock(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentOutOfRangeException(nameof(quantity), "Quantidade deve ser maior que zero.");

            if (quantity > StockQty)
                throw new InvalidOperationException("Estoque insuficiente para a operação.");

            StockQty -= quantity;
        }
    }
}