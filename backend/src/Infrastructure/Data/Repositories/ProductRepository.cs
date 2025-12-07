// backend/src/Infrastructure/Repositories/ProductRepository.cs

using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    // Implementa o contrato definido na camada Domain
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            // Injeção do ApplicationDbContext (EF Core)
            _context = context;
        }

        // --- C (Create) ---
        public async Task<Product> AddAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync(); // Persiste no banco de dados
            return product;
        }

        // --- R (Read - Busca por ID para CUD) ---
        public async Task<Product?> GetByIdAsync(Guid id)
        {
            // O EF Core é usado para buscar a entidade que será alterada (Update/Delete)
            // As leituras de listagem/otimizadas continuam sendo feitas pelo Dapper
            return await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        }

        // --- U (Update) ---
        public async Task UpdateAsync(Product product)
        {
            // O EF Core rastreia a entidade. Basta marcá-la como modificada se não foi lida do contexto, 
            // mas neste caso, se o DTO for re-mapeado para uma entidade, Update() é seguro.
            // Se o objeto 'product' veio de um GetByIdAsync() anterior, SaveChanges() já bastaria.
            _context.Products.Update(product); 
            await _context.SaveChangesAsync();
        }

        // --- D (Delete) ---
        public async Task DeleteAsync(Product product)
        {
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }
        
        // Exemplo de busca por SKU (necessário para validação na criação/edição)
        public async Task<bool> ExistsBySkuAsync(string sku)
        {
            return await _context.Products.AnyAsync(p => p.Sku == sku);
        }
        
        // Método exigido para a lógica de estoque (consumido pelo OrderCommandHandler)
        public async Task<int> GetStockQuantityAsync(Guid productId)
        {
             return await _context.Products
                                  .Where(p => p.Id == productId)
                                  .Select(p => p.StockQty)
                                  .FirstOrDefaultAsync();
        }
    }
}