using System.Threading.Tasks;
using Application.DTOs;
using Application.Features.Products.Queries;
using Application.Interfaces;

namespace Api.Services
{
    public class InMemoryProductQueryRepository : IProductQueryRepository
    {
        public Task<PagedResult<ProductListItemDto>> ListProductsAsync(ListProductsQuery query)
        {
            var empty = new PagedResult<ProductListItemDto>(
                Items: new List<ProductListItemDto>(),
                TotalCount: 0,
                PageNumber: query.PageNumber,
                PageSize: query.PageSize
            );
            return Task.FromResult(empty);
        }
    }
}
