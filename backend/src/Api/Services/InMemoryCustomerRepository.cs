using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;

namespace Api.Services
{
    public class InMemoryCustomerRepository : ICustomerRepository
    {
        private readonly ConcurrentDictionary<Guid, Customer> _customers = new();

        public Task<Customer?> GetByIdAsync(Guid id)
        {
            _customers.TryGetValue(id, out var customer);
            return Task.FromResult(customer);
        }

        public Task AddAsync(Customer customer)
        {
            _customers[customer.Id] = customer;
            return Task.CompletedTask;
        }

        public Task UpdateAsync(Customer customer)
        {
            _customers[customer.Id] = customer;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Customer customer)
        {
            _customers.TryRemove(customer.Id, out _);
            return Task.CompletedTask;
        }

        public Task<Customer?> GetByDocumentAsync(string document)
        {
            var customer = _customers.Values.FirstOrDefault(x => x.Document == document);
            return Task.FromResult(customer);
        }

        public Task SaveChangesAsync()
        {
            return Task.CompletedTask;
        }
    }
}
