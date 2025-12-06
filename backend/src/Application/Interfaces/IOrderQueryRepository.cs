// Application/Interfaces/IOrderQueryRepository.cs
using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IOrderQueryRepository
    {
        Task<PagedResult<OrderListItemDto>> ListOrdersAsync(
            int pageNumber,
            int pageSize,
            string? customerNameFilter = null,
            string? statusFilter = null,
            string? sortBy = null);

        Task<OrderDetailsDto?> GetOrderDetailsAsync(Guid orderId);
    }
}