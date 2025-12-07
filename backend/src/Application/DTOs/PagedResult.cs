// Application/DTOs/PagedResult.cs
using System.Collections.Generic;

namespace Application.DTOs
{
    public record PagedResult<T>(
        IEnumerable<T> Items,
        int TotalCount,
        int PageNumber,
        int PageSize,
        int TotalPages
    );
}
