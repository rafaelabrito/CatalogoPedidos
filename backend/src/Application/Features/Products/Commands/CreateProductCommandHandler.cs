// Application/Features/Products/Commands/CreateProductCommandHandler.cs
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Application.Features.Products.Commands
{
    public class CreateProductCommandHandler
    {
        private readonly IProductRepository _repository;

        public CreateProductCommandHandler(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task<Guid> Handle(CreateProductCommand command)
        {
            var product = new Product(
                command.Name,
                command.Sku,
                command.Price,
                command.StockQty
            );

            await _repository.AddAsync(product);

            return product.Id;
        }
    }
}