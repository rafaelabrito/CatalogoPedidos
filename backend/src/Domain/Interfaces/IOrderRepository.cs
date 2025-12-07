// backend/src/Domain/Interfaces/IOrderRepository.cs

using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IOrderRepository
    {
        Task<Guid> SaveOrderTransactionAsync(
            Order order, 
            List<OrderItem> items, 
            IdempotencyKey idempotencyKey, 
            Dictionary<Guid, int> stockUpdates);
            
        Task<IdempotencyKey?> GetIdempotencyKeyAsync(string key);
        Task<Guid?> GetOrderIdByKeyAsync(string key);
    }
}