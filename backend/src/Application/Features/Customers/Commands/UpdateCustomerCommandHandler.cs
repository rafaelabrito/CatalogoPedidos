using Domain.Entities;
using Domain.Interfaces;
using System.Threading.Tasks;

namespace Application.Features.Customers.Commands
{
    public class UpdateCustomerCommandHandler
    {
        private readonly ICustomerRepository _repository;

        public UpdateCustomerCommandHandler(ICustomerRepository repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateCustomerCommand command)
        {
            var existing = await _repository.GetByIdAsync(command.Id);
            if (existing is null) return;
            existing.Update(command.Name, command.Email, command.Document);
            await _repository.UpdateAsync(existing);
        }
    }
}
