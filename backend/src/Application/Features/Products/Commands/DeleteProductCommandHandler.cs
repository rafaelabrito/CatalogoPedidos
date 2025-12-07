using Domain.Interfaces;
using System.Threading.Tasks;

namespace Application.Features.Products.Commands
{
    public class DeleteProductCommandHandler
    {
        private readonly IProductRepository _repository;

        public DeleteProductCommandHandler(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteProductCommand command)
        {
            var existing = await _repository.GetByIdAsync(command.Id);
            if (existing is null) return;
            await _repository.DeleteAsync(existing);
        }
    }
}
