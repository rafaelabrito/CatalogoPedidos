// Api/Controllers/OrdersController.cs
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Contracts.Orders;
using Application.DTOs;
using Application.Features.Orders.Commands;
using Application.Interfaces;
using Domain.Interfaces;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly CreateOrderCommandHandler _createHandler;
        private readonly IOrderQueryRepository _queryRepository;

        public OrdersController(CreateOrderCommandHandler createHandler, IOrderQueryRepository queryRepository)
        {
            _createHandler = createHandler;
            _queryRepository = queryRepository;
        }

        /// <summary>
        /// Lista pedidos com paginação e filtros.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<OrderListItemDto>>), 200)]
        public async Task<IActionResult> List(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] string? customerName = null,
            [FromQuery] string? status = null,
            [FromQuery] string? sortBy = null)
        {
            try
            {
                var result = await _queryRepository.ListOrdersAsync(pageNumber, pageSize, customerName, status, sortBy);
                return Ok(new ApiResponse<PagedResult<OrderListItemDto>>(0, null, result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>(1, "Erro ao listar pedidos: " + ex.Message, null));
            }
        }

        /// <summary>
        /// Obtém detalhes de um pedido por Id.
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ApiResponse<OrderDetailsDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        public async Task<IActionResult> Get(Guid id)
        {
            try
            {
                var details = await _queryRepository.GetOrderDetailsAsync(id);
                if (details is null)
                    return NotFound(new ApiResponse<object>(1, "Pedido não encontrado.", null));
                return Ok(new ApiResponse<OrderDetailsDto>(0, null, details));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>(1, "Erro ao obter pedido: " + ex.Message, null));
            }
        }

        /// <summary>
        /// Cria um novo pedido com transação atômica e idempotência.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), 201)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
        {
            try
            {
                if (!Request.Headers.TryGetValue("Idempotency-Key", out var idempotencyKey) || string.IsNullOrWhiteSpace(idempotencyKey))
                {
                    return BadRequest(new ApiResponse<object>(1, "É obrigatório informar o header Idempotency-Key.", null));
                }

                var items = (request.Items ?? new List<CreateOrderItemRequest>())
                    .Select(item => new OrderItemDto(item.ProductId, item.Quantity))
                    .ToList();

                var command = new CreateOrderCommand(
                    request.CustomerId,
                    items,
                    idempotencyKey.ToString());

                var id = await _createHandler.Handle(command);
                return StatusCode(201, new ApiResponse<Guid>(0, "Pedido criado com sucesso.", id));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object>(1, ex.Message, null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>(1, "Erro ao criar pedido: " + ex.Message, null));
            }
        }
    }
}