// backend/src/Application/DTOs/OrderDetailsDto.cs
public record OrderDetailsDto(
    Guid Id,
    Guid CustomerId,
    string CustomerName,
    string CustomerDocument,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt,
    List<OrderDetailsItemDto> Items
);

// backend/src/Application/DTOs/OrderDetailsItemDto.cs
public record OrderDetailsItemDto(
    Guid ProductId,
    string ProductName, // Traz o nome do produto por JOIN (Dapper)
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal
);