// Application/Features/Products/Queries/ListProductsQueryHandler.cs
using System.Threading.Tasks;
using Application.Interfaces;
using Application.DTOs;

namespace Application.Features.Products.Queries
{
    public class ListProductsQueryHandler
    {
        private readonly IProductQueryRepository _queryRepository;

        public ListProductsQueryHandler(IProductQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<PagedResult<ProductListItemDto>> Handle(ListProductsQuery query)
        {
            var result = await _queryRepository.ListProductsAsync(query);
            return result;
        }
    }
}