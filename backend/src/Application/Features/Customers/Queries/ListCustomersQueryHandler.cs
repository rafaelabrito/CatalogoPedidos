// Application/Features/Customers/Queries/ListCustomersQueryHandler.cs
using System.Threading.Tasks;
using Application.Interfaces;
using Application.DTOs;

namespace Application.Features.Customers.Queries
{
    public class ListCustomersQueryHandler
    {
        private readonly ICustomerQueryRepository _queryRepository;

        public ListCustomersQueryHandler(ICustomerQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<PagedResult<CustomerListItemDto>> Handle(ListCustomersQuery query)
        {
            var result = await _queryRepository.ListCustomersAsync(query);
            return result;
        }
    }
}