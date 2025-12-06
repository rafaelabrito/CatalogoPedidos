using System.Threading.Tasks;
using Application.DTOs;
using Application.Features.Customers.Queries;
using Application.Interfaces;

namespace Api.Services
{
    public class InMemoryCustomerQueryRepository : ICustomerQueryRepository
    {
        public Task<PagedResult<CustomerListItemDto>> ListCustomersAsync(ListCustomersQuery query)
        {
            var empty = new PagedResult<CustomerListItemDto>(
                Items: new List<CustomerListItemDto>(),
                TotalCount: 0,
                PageNumber: query.PageNumber,
                PageSize: query.PageSize
            );
            return Task.FromResult(empty);
        }
    }
}
