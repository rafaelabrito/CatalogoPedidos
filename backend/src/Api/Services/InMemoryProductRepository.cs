using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;

namespace Api.Services
{
    public class InMemoryProductRepository : IProductRepository
    {
        private readonly ConcurrentDictionary<Guid, Product> _products = new();

        public Task<Product> AddAsync(Product product)
        {
            _products[product.Id] = product;
            return Task.FromResult(product);
        }

        public Task<Product?> GetByIdAsync(Guid id)
        {
            _products.TryGetValue(id, out var product);
            return Task.FromResult(product);
        }

        public Task UpdateAsync(Product product)
        {
            _products[product.Id] = product;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Product product)
        {
            _products.TryRemove(product.Id, out _);
            return Task.CompletedTask;
        }

        public Task<bool> ExistsBySkuAsync(string sku)
        {
            var exists = _products.Values.Any(p => p.Sku.Equals(sku, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(exists);
        }

        public Task<int> GetStockQuantityAsync(Guid productId)
        {
            _products.TryGetValue(productId, out var product);
            return Task.FromResult(product?.StockQty ?? 0);
        }
    }
}
