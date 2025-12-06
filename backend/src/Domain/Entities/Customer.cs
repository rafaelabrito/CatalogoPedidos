// Domain/Entities/Customer.cs
using System;

namespace Domain.Entities
{
    public class Customer
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public string Email { get; private set; }
        public string Document { get; private set; } // Pode ser CPF/CNPJ
        public DateTime CreatedAt { get; private set; }

        public Customer(string name, string email, string document)
        {
            Id = Guid.NewGuid();
            Name = name;
            Email = email;
            Document = document;
            CreatedAt = DateTime.UtcNow;
        }

        private Customer() { }

        public void Update(string name, string email, string document)
        {
            Name = name;
            Email = email;
            Document = document;
        }
    }
}