// Application/Features/Customers/Queries/ListCustomersQuery.cs
using System;
using Application.DTOs;

namespace Application.Features.Customers.Queries
{
    public record ListCustomersQuery(
        int PageNumber = 1,
        int PageSize = 10,
        string SortBy = "name",
        string SortDirection = "asc",
        string? SearchTerm = null
    );

    public record CustomerListItemDto(
        Guid Id,
        string Name,
        string Email,
        string Document,
        DateTime CreatedAt
    );

}