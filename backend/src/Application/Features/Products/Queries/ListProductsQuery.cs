// Application/Features/Products/Queries/ListProductsQuery.cs
using System;
using Application.DTOs;

namespace Application.Features.Products.Queries
{
    public record ListProductsQuery(
        int PageNumber = 1,
        int PageSize = 10,
        string SortBy = "name",
        string SortDirection = "asc",
        string? SearchTerm = null,
        bool? IsActive = true
    );

    public record ProductListItemDto(
        Guid Id,
        string Name,
        string Sku,
        decimal Price,
        int StockQty
    );
}