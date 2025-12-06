// Application/Features/Customers/Commands/CreateCustomerCommandHandler.cs
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Application.Features.Customers.Commands
{
    public class CreateCustomerCommandHandler
    {
        private readonly ICustomerRepository _repository;

        public CreateCustomerCommandHandler(ICustomerRepository repository)
        {
            _repository = repository;
        }

        public async Task<Guid> Handle(CreateCustomerCommand command)
        {
            var existingCustomer = await _repository.GetByDocumentAsync(command.Document);
            if (existingCustomer != null)
            {
                throw new InvalidOperationException($"Cliente com documento {command.Document} já existe.");
            }
            
            var customer = new Customer(
                command.Name,
                command.Email,
                command.Document
            );

            await _repository.AddAsync(customer);

            return customer.Id;
        }
    }
}