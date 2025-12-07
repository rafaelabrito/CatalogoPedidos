// Application/Interfaces/IProductQueryRepository.cs
using System.Threading.Tasks;
using Application.DTOs;
using Application.Features.Products.Queries;

namespace Application.Interfaces
{
    public interface IProductQueryRepository
    {
        Task<PagedResult<ProductListItemDto>> ListProductsAsync(ListProductsQuery query);
    }
}