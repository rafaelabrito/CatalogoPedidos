using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Application.Interfaces;
using Api.Services;
using Application.Features.Products.Queries;
using Application.Features.Customers.Queries;
using Application.Features.Products.Commands;
using Application.Features.Customers.Commands;
using Application.Features.Orders.Commands;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.QueryRepositories;
using Infrastructure.Data.Repositories;
using Infrastructure.Data.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Api.Middleware;
using Serilog;
using Serilog.Formatting.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .Enrich.FromLogContext()
        .WriteTo.Console(new JsonFormatter(renderMessage: true))
        .WriteTo.File(new JsonFormatter(renderMessage: true), "logs/api-log-.json", rollingInterval: RollingInterval.Day);
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
	?? builder.Configuration["ConnectionStrings__DefaultConnection"]
	?? throw new InvalidOperationException("Database connection string is not configured.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHealthChecks();
// CORS: allow the local frontend
builder.Services.AddCors(options =>
{
	options.AddPolicy("Frontend", policy =>
		policy.WithOrigins(
				"http://localhost:53337",
				"https://localhost:53337"
			)
			.AllowAnyHeader()
			.AllowAnyMethod()
			.AllowCredentials());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
	c.SwaggerDoc("v1", new OpenApiInfo
	{
		Title = "Desafio .NET API",
		Version = "v1",
		Description = "CRUD de Produtos, Clientes e Pedidos",
	});

	// Group endpoints by tag (controller name by default)
	c.TagActionsBy(api =>
	{
		var groupName = api.GroupName;
		var controller = api.ActionDescriptor.RouteValues.TryGetValue("controller", out var ctrl)
			? ctrl
			: "API";
		return new[] { groupName ?? controller };
	});

	// Add Bearer auth (JWT) support in Swagger
	c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
	{
		Description = "Informe o token JWT no header Authorization usando o esquema Bearer. Exemplo: Bearer {seu_token}",
		Name = "Authorization",
		In = ParameterLocation.Header,
		Type = SecuritySchemeType.Http,
		Scheme = "bearer",
		BearerFormat = "JWT"
	});
	c.AddSecurityRequirement(new OpenApiSecurityRequirement
	{
		{
			new OpenApiSecurityScheme
			{
				Reference = new OpenApiReference
				{
					Type = ReferenceType.SecurityScheme,
					Id = "Bearer"
				}
			},
			new List<string>()
		}
	});
});
// DI registrations
builder.Services.AddScoped<IProductQueryRepository, ProductQueryRepository>();
builder.Services.AddScoped<ICustomerQueryRepository, CustomerQueryRepository>();
builder.Services.AddScoped<IOrderQueryRepository, OrderQueryRepository>();
builder.Services.AddTransient<ListProductsQueryHandler>();
builder.Services.AddTransient<ListCustomersQueryHandler>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddTransient<CreateProductCommandHandler>();
builder.Services.AddTransient<CreateCustomerCommandHandler>();
builder.Services.AddTransient<CreateOrderCommandHandler>();
builder.Services.AddTransient<UpdateProductCommandHandler>();
builder.Services.AddTransient<DeleteProductCommandHandler>();
builder.Services.AddTransient<UpdateCustomerCommandHandler>();
builder.Services.AddTransient<DeleteCustomerCommandHandler>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
	var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
	await dbContext.Database.MigrateAsync();
	await DataSeeder.SeedAsync(dbContext);
}

app.UseSerilogRequestLogging();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<IdempotencyLoggingMiddleware>();

// Enable CORS before routing/controllers
app.UseCors("Frontend");

// Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
	c.SwaggerEndpoint("/swagger/v1/swagger.json", "Desafio .NET API v1");
	c.RoutePrefix = "swagger";
});

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();