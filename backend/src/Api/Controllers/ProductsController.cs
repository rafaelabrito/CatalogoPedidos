// Api/Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Features.Products.Commands;
using Application.Features.Products.Queries;
using Domain.Entities;
using Domain.Interfaces;
using System.Linq;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly ListProductsQueryHandler _listHandler;
        private readonly CreateProductCommandHandler _createHandler;
        private readonly UpdateProductCommandHandler _updateHandler;
        private readonly DeleteProductCommandHandler _deleteHandler;
        private readonly IProductRepository _productRepo;

        public ProductsController(ListProductsQueryHandler listHandler, CreateProductCommandHandler createHandler, UpdateProductCommandHandler updateHandler, DeleteProductCommandHandler deleteHandler, IProductRepository productRepo)
        {
            _listHandler = listHandler;
            _createHandler = createHandler;
            _updateHandler = updateHandler;
            _deleteHandler = deleteHandler;
            _productRepo = productRepo;
        }

        /// <summary>
        /// Lista produtos com paginação e ordenação.
        /// </summary>
        /// <param name="query">Parâmetros de paginação e filtro.</param>
        /// <returns>Envelope com resultado paginado.</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<ProductListItemDto>>), 200)]
        public async Task<IActionResult> List([FromQuery] ListProductsQuery query)
        {
            try
            {
                var result = await _listHandler.Handle(query);
                return Ok(new ApiResponse<PagedResult<ProductListItemDto>>(0, null, result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>(1, "Erro ao listar produtos: " + ex.Message, null));
            }
        }

        /// <summary>
        /// Cria um novo produto.
        /// </summary>
        /// <param name="command">Dados do produto.</param>
        /// <returns>Id do produto criado.</returns>
        [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
    {
        var id = await _createHandler.Handle(command);
        return StatusCode(201, new ApiResponse<Guid>(0, "Produto criado.", id));
    }

        /// <summary>
        /// Obtém um produto por Id.
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ApiResponse<ProductListItemDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var p = await _productRepo.GetByIdAsync(id);
            if (p is null)
                return NotFound(new ApiResponse<object>(1, "Produto não encontrado.", null));
            var dto = new ProductListItemDto(p.Id, p.Name, p.Sku, p.Price, p.StockQty);
            return Ok(new ApiResponse<ProductListItemDto>(0, null, dto));
        }

        /// <summary>
        /// Atualiza um produto.
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(204)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductCommand body)
        {
            var command = body with { Id = id };
            await _updateHandler.Handle(command);
            return NoContent();
        }

        /// <summary>
        /// Exclui um produto.
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _deleteHandler.Handle(new DeleteProductCommand(id));
            return NoContent();
        }
    }
}