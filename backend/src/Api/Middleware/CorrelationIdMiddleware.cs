// Api/Middleware/CorrelationIdMiddleware.cs
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Serilog.Context;

namespace Api.Middleware
{
    public class CorrelationIdMiddleware
    {
        public const string HeaderName = "X-Correlation-ID";
        private readonly RequestDelegate _next;

        public CorrelationIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var correlationId = EnsureCorrelationId(context);

            using (LogContext.PushProperty("CorrelationId", correlationId))
            {
                context.Response.OnStarting(() =>
                {
                    context.Response.Headers[HeaderName] = correlationId;
                    return Task.CompletedTask;
                });

                await _next(context);
            }
        }

        private static string EnsureCorrelationId(HttpContext context)
        {
            if (context.Request.Headers.TryGetValue(HeaderName, out var headerValue) && !string.IsNullOrWhiteSpace(headerValue))
            {
                return headerValue!.ToString();
            }

            var correlationId = Guid.NewGuid().ToString();
            context.Request.Headers[HeaderName] = correlationId;
            return correlationId;
        }
    }
}
