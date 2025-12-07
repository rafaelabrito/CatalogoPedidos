// Application/Interfaces/ICustomerQueryRepository.cs
using System.Threading.Tasks;
using Application.DTOs;
using Application.Features.Customers.Queries;

namespace Application.Interfaces
{
    public interface ICustomerQueryRepository
    {
        Task<PagedResult<CustomerListItemDto>> ListCustomersAsync(ListCustomersQuery query);
    }
}