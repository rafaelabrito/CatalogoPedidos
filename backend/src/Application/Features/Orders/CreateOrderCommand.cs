// Application/Features/Orders/CreateOrderCommand.cs (O Comando DTO)
using System;
using System.Collections.Generic;

namespace Application.Features.Orders.Commands
{
    public record CreateOrderCommand(
        Guid CustomerId,
        List<OrderItemDto> Items
    );

    public record OrderItemDto(Guid ProductId, int Quantity);
}