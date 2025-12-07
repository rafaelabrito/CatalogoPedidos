// Application/Features/Products/Commands/CreateProductCommand.cs
using System;

namespace Application.Features.Products.Commands
{
    public record CreateProductCommand(
        string Name,
        string Sku,
        decimal Price,
        int StockQty
    );

    public record UpdateProductCommand(
        Guid Id,
        string Name,
        decimal Price,
        int StockQty,
        bool IsActive
    );

    public record DeleteProductCommand(Guid Id);
}