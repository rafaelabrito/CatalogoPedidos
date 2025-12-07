// Application/DTOs/ApiResponse.cs
namespace Application.DTOs
{
    public record ApiResponse<T>(int cod_retorno, string? mensagem, T? data);
}
