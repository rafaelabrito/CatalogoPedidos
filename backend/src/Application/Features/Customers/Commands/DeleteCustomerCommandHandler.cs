using Domain.Interfaces;
using System.Threading.Tasks;

namespace Application.Features.Customers.Commands
{
    public class DeleteCustomerCommandHandler
    {
        private readonly ICustomerRepository _repository;

        public DeleteCustomerCommandHandler(ICustomerRepository repository)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteCustomerCommand command)
        {
            var existing = await _repository.GetByIdAsync(command.Id);
            if (existing is null) return;
            await _repository.DeleteAsync(existing);
        }
    }
}
