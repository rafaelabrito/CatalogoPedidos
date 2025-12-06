// backend/src/Application/DTOs/OrderListItemDto.cs
public record OrderListItemDto(
    Guid Id,
    string CustomerName, // Traz o nome do cliente por JOIN (Dapper)
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt
);