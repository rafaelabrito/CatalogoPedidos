// backend/src/Infrastructure/Data/Repositories/OrderRepository.cs

using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> SaveOrderTransactionAsync(
            Order order,
            List<OrderItem> items,
            IdempotencyKey idempotencyKey,
            Dictionary<Guid, int> stockUpdates)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                order.AttachIdempotencyKey(idempotencyKey.Key);

                foreach (var item in items)
                {
                    item.SetOrder(order.Id);
                }

                _context.IdempotencyKeys.Add(idempotencyKey);
                _context.Orders.Add(order);
                _context.OrderItems.AddRange(items);

                foreach (var (productId, quantity) in stockUpdates)
                {
                    var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
                    if (product == null)
                    {
                        throw new InvalidOperationException($"Produto ID {productId} não encontrado durante a transação.");
                    }

                    product.DecreaseStock(quantity);
                    _context.Products.Update(product);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return order.Id;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public Task<IdempotencyKey?> GetIdempotencyKeyAsync(string key)
        {
            return _context.IdempotencyKeys.FirstOrDefaultAsync(k => k.Key == key);
        }

        public Task<Guid?> GetOrderIdByKeyAsync(string key)
        {
            return _context.Orders
                .Where(o => o.IdempotencyKeyId == key)
                .Select(o => (Guid?)o.Id)
                .FirstOrDefaultAsync();
        }
    }
}
