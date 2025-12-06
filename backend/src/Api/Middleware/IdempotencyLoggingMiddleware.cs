    // Api/Middleware/IdempotencyLoggingMiddleware.cs
using Microsoft.AspNetCore.Http;
using Serilog.Context;
using System.Threading.Tasks;

public class IdempotencyLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public IdempotencyLoggingMiddleware(RequestDelegate next) => _next = next;

    public Task Invoke(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue("Idempotency-Key", out var key))
        {
            // Adiciona a chave de idempotência ao contexto do Serilog para todas as logs desta requisição
            using (LogContext.PushProperty("IdempotencyKey", key.ToString()))
            {
                return _next(context);
            }
        }

        return _next(context);
    }
}