// Api/Controllers/CustomersController.cs
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Features.Customers.Commands;
using Application.Features.Customers.Queries;
using Domain.Entities;
using Domain.Interfaces;
using System.Linq;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/customers")]
    public class CustomersController : ControllerBase
    {
        private readonly ListCustomersQueryHandler _listHandler;
        private readonly CreateCustomerCommandHandler _createHandler;
        private readonly UpdateCustomerCommandHandler _updateHandler;
        private readonly DeleteCustomerCommandHandler _deleteHandler;
        private readonly ICustomerRepository _customerRepo;

        public CustomersController(ListCustomersQueryHandler listHandler, CreateCustomerCommandHandler createHandler, UpdateCustomerCommandHandler updateHandler, DeleteCustomerCommandHandler deleteHandler, ICustomerRepository customerRepo)
        {
            _listHandler = listHandler;
            _createHandler = createHandler;
            _updateHandler = updateHandler;
            _deleteHandler = deleteHandler;
            _customerRepo = customerRepo;
        }

        /// <summary>
        /// Lista clientes com paginação e filtro.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<CustomerListItemDto>>), 200)]
        public async Task<IActionResult> List([FromQuery] ListCustomersQuery query)
        {
            try
            {
                var result = await _listHandler.Handle(query);
                return Ok(new ApiResponse<PagedResult<CustomerListItemDto>>(0, null, result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>(1, "Erro ao listar clientes: " + ex.Message, null));
            }
        }

        /// <summary>
        /// Cria um novo cliente.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), 201)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        public async Task<IActionResult> Create([FromBody] CreateCustomerCommand command)
        {
            var id = await _createHandler.Handle(command);
            return StatusCode(201, new ApiResponse<Guid>(0, "Cliente criado.", id));
        }

        /// <summary>
        /// Obtém um cliente por Id.
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ApiResponse<CustomerListItemDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var c = await _customerRepo.GetByIdAsync(id);
            if (c is null)
                return NotFound(new ApiResponse<object>(1, "Cliente não encontrado.", null));
            var dto = new CustomerListItemDto(c.Id, c.Name, c.Email, c.Document, c.CreatedAt);
            return Ok(new ApiResponse<CustomerListItemDto>(0, null, dto));
        }

        /// <summary>
        /// Atualiza um cliente.
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(204)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerCommand body)
        {
            var command = body with { Id = id };
            await _updateHandler.Handle(command);
            return NoContent();
        }

        /// <summary>
        /// Exclui um cliente.
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _deleteHandler.Handle(new DeleteCustomerCommand(id));
            return NoContent();
        }
    }
}