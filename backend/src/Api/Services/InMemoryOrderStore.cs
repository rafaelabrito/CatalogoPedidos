using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using Application.DTOs;
using Application.Features.Orders.Commands;
using Domain.Entities;
using Domain.Enums;

public class InMemoryOrderStore
{
    private readonly ConcurrentDictionary<Guid, Order> _orders = new();

    public Guid Create(CreateOrderCommand command)
    {
        var items = command.Items
            .Select(i => OrderItem.Create(i.ProductId, i.Quantity, 0m))
            .ToList();
        var order = Order.Create(command.CustomerId, items);
        _orders[order.Id] = order;
        return order.Id;
    }

    public bool UpdateStatus(Guid id, string status)
    {
        if (_orders.TryGetValue(id, out var o))
        {
            if (Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
            {
                o.SetStatus(parsedStatus);
                return true;
            }
            return false;
        }
        return false;
    }

    public bool Delete(Guid id)
    {
        return _orders.TryRemove(id, out _);
    }

    public PagedResult<OrderListItemDto> List(int pageNumber, int pageSize)
    {
        var items = _orders.Values
            .OrderByDescending(o => o.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderListItemDto(
                o.Id,
                CustomerName: string.Empty,
                o.TotalAmount,
                o.Status.ToString(),
                o.CreatedAt
            ));
        var totalCount = _orders.Count;
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResult<OrderListItemDto>(items.ToList(), totalCount, pageNumber, pageSize, totalPages);
    }

    public OrderDetailsDto? GetDetails(Guid id)
    {
        if (!_orders.TryGetValue(id, out var o)) return null;
        var items = o.Items.Select(i => new OrderDetailsItemDto(
            i.ProductId,
            ProductName: string.Empty,
            i.Quantity,
            i.UnitPrice,
            i.LineTotal
        )).ToList();

        return new OrderDetailsDto(
            o.Id,
            o.CustomerId,
            CustomerName: string.Empty,
            CustomerDocument: string.Empty,
            o.TotalAmount,
            o.Status.ToString(),
            o.CreatedAt,
            items
        );
    }
}
