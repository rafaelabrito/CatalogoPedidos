using Application.DTOs;
using Application.Features.Products.Queries;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Data.QueryRepositories
{
    /// <summary>
    /// EF Core-based projection queries for <see cref="ListProductsQuery"/>.
    /// </summary>
    public class ProductQueryRepository : IProductQueryRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductQueryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<ProductListItemDto>> ListProductsAsync(ListProductsQuery query)
        {
            var pageNumber = Math.Max(1, query.PageNumber);
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var skip = (pageNumber - 1) * pageSize;

            IQueryable<Product> products = _context.Products.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var term = $"%{query.SearchTerm.Trim()}%";
                products = products.Where(p =>
                    EF.Functions.ILike(p.Name, term) ||
                    EF.Functions.ILike(p.Sku, term));
            }

            if (query.IsActive.HasValue)
            {
                products = products.Where(p => p.IsActive == query.IsActive.Value);
            }

            products = ApplySorting(products, query);

            var totalCount = await products.CountAsync();

            var items = await products
                .Skip(skip)
                .Take(pageSize)
                .Select(p => new ProductListItemDto(p.Id, p.Name, p.Sku, p.Price, p.StockQty))
                .ToListAsync();

            var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

            return new PagedResult<ProductListItemDto>(items, totalCount, pageNumber, pageSize, totalPages);
        }

        private static IQueryable<Product> ApplySorting(IQueryable<Product> queryable, ListProductsQuery query)
        {
            var direction = string.Equals(query.SortDirection, "desc", StringComparison.OrdinalIgnoreCase)
                ? "desc"
                : "asc";

            return (query.SortBy?.ToLowerInvariant()) switch
            {
                "sku" => direction == "desc"
                    ? queryable.OrderByDescending(p => p.Sku)
                    : queryable.OrderBy(p => p.Sku),
                "price" => direction == "desc"
                    ? queryable.OrderByDescending(p => p.Price)
                    : queryable.OrderBy(p => p.Price),
                "stockqty" => direction == "desc"
                    ? queryable.OrderByDescending(p => p.StockQty)
                    : queryable.OrderBy(p => p.StockQty),
                _ => direction == "desc"
                    ? queryable.OrderByDescending(p => p.Name)
                    : queryable.OrderBy(p => p.Name),
            };
        }
    }
}