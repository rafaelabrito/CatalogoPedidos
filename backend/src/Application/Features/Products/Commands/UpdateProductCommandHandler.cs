using Domain.Entities;
using Domain.Interfaces;
using System.Threading.Tasks;

namespace Application.Features.Products.Commands
{
    public class UpdateProductCommandHandler
    {
        private readonly IProductRepository _repository;

        public UpdateProductCommandHandler(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateProductCommand command)
        {
            var existing = await _repository.GetByIdAsync(command.Id);
            if (existing is null) return;
            existing.Update(command.Name, command.Price, command.StockQty, command.IsActive);
            await _repository.UpdateAsync(existing);
        }
    }
}
