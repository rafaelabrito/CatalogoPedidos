// backend/src/Domain/Interfaces/IProductRepository.cs

using Domain.Entities;
using System;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IProductRepository
    {
        Task<Product> AddAsync(Product product);
        Task<Product?> GetByIdAsync(Guid id);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Product product);
        Task<bool> ExistsBySkuAsync(string sku);
        Task<int> GetStockQuantityAsync(Guid productId);
    }
}