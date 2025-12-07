// Infrastructure/Data/QueryRepositories/OrderQueryRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.QueryRepositories
{
    public class OrderQueryRepository : IOrderQueryRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderQueryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<OrderListItemDto>> ListOrdersAsync(
            int pageNumber,
            int pageSize,
            string? customerNameFilter = null,
            string? statusFilter = null,
            string? sortBy = null)
        {
            var query = _context.Orders.AsQueryable();

            // Filtro por nome do cliente
            if (!string.IsNullOrEmpty(customerNameFilter))
            {
                var filteredCustomerIds = _context.Customers
                    .Where(c => EF.Functions.ILike(c.Name, $"%{customerNameFilter}%"))
                    .Select(c => c.Id);

                query = query.Where(o => filteredCustomerIds.Contains(o.CustomerId));
            }

            // Filtro por status
            if (!string.IsNullOrEmpty(statusFilter) && Enum.TryParse<OrderStatus>(statusFilter, true, out var parsedStatus))
            {
                query = query.Where(o => o.Status == parsedStatus);
            }

            // Contagem total
            var total = await query.CountAsync();

            // Ordenação
            if (sortBy == "date_desc")
                query = query.OrderByDescending(o => o.CreatedAt);
            else
                query = query.OrderBy(o => o.CreatedAt);

            // Paginação
            var skip = (pageNumber - 1) * pageSize;
            var orders = await query
                .Skip(skip)
                .Take(pageSize)
                .Include(o => o.Items)
                .ToListAsync();

            var customerNames = await _context.Customers
                .Where(c => orders.Select(o => o.CustomerId).Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name);

            var items = orders.Select(o => new OrderListItemDto(
                o.Id,
                customerNames.TryGetValue(o.CustomerId, out var name) ? name : "Cliente Desconhecido",
                o.TotalAmount,
                FormatStatus(o.Status),
                o.CreatedAt
            )).ToList();

            var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);

            return new PagedResult<OrderListItemDto>(
                items,
                total,
                pageNumber,
                pageSize,
                totalPages
            );
        }

        public async Task<OrderDetailsDto?> GetOrderDetailsAsync(Guid orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return null;

            var customer = await _context.Customers.FindAsync(order.CustomerId);

            var items = order.Items.Select(oi => new OrderDetailsItemDto(
                oi.ProductId,
                oi.Product?.Name ?? "Produto Desconhecido",
                oi.Quantity,
                oi.UnitPrice,
                oi.LineTotal
            )).ToList();

            return new OrderDetailsDto(
                order.Id,
                order.CustomerId,
                customer?.Name ?? "Cliente Desconhecido",
                customer?.Document ?? string.Empty,
                order.TotalAmount,
                FormatStatus(order.Status),
                order.CreatedAt,
                items
            );
        }

        private static string FormatStatus(OrderStatus status) => status.ToString().ToUpperInvariant();
    }
}
