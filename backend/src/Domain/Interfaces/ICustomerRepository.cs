// Domain/Interfaces/ICustomerRepository.cs
using System;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface ICustomerRepository
    {
        Task<Customer?> GetByIdAsync(Guid id);
        Task AddAsync(Customer customer);
        Task UpdateAsync(Customer customer);
        Task DeleteAsync(Customer customer);
        Task<Customer?> GetByDocumentAsync(string document);
        Task SaveChangesAsync(); 
    }
}