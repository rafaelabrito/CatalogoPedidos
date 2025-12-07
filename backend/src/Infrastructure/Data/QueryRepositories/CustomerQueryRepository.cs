using System;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Features.Customers.Queries;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;

namespace Infrastructure.Data.QueryRepositories
{
    public class CustomerQueryRepository : ICustomerQueryRepository
    {
        private readonly ApplicationDbContext _context;

        public CustomerQueryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<CustomerListItemDto>> ListCustomersAsync(ListCustomersQuery query)
        {
            var pageNumber = Math.Max(1, query.PageNumber);
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var skip = (pageNumber - 1) * pageSize;

            IQueryable<Customer> customers = _context.Customers.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var term = $"%{query.SearchTerm.Trim()}%";
                customers = customers.Where(c =>
                    EF.Functions.ILike(c.Name, term) ||
                    EF.Functions.ILike(c.Email, term) ||
                    EF.Functions.ILike(c.Document, term));
            }

            customers = ApplySorting(customers, query);

            var totalCount = await customers.CountAsync();

            var items = await customers
                .Skip(skip)
                .Take(pageSize)
                .Select(c => new CustomerListItemDto(c.Id, c.Name, c.Email, c.Document, c.CreatedAt))
                .ToListAsync();

            var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

            return new PagedResult<CustomerListItemDto>(items, totalCount, pageNumber, pageSize, totalPages);
        }

        private static IQueryable<Customer> ApplySorting(IQueryable<Customer> source, ListCustomersQuery query)
        {
            var descending = string.Equals(query.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

            return (query.SortBy?.ToLowerInvariant()) switch
            {
                "email" => descending ? source.OrderByDescending(c => c.Email) : source.OrderBy(c => c.Email),
                "document" => descending ? source.OrderByDescending(c => c.Document) : source.OrderBy(c => c.Document),
                "createdat" => descending ? source.OrderByDescending(c => c.CreatedAt) : source.OrderBy(c => c.CreatedAt),
                _ => descending ? source.OrderByDescending(c => c.Name) : source.OrderBy(c => c.Name)
            };
        }
    }
}