// tests/Application.Tests/Features/Orders/CreateOrderCommandHandlerTests.cs
using Xunit;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// As referências abaixo são para as classes geradas nas camadas Domain e Application
// using Domain.Interfaces; 
// using Application.Features.Orders; 
// using Domain.Entities;
// using Domain.Exceptions; 

public class CreateOrderCommandHandlerTests
{
    private readonly Mock<IOrderRepository> _mockOrderRepo;
    private readonly Mock<IProductRepository> _mockProductRepo;
    private readonly CreateOrderCommandHandler _handler;

    public CreateOrderCommandHandlerTests()
    {
        _mockOrderRepo = new Mock<IOrderRepository>();
        _mockProductRepo = new Mock<IProductRepository>();
        _handler = new CreateOrderCommandHandler(
            _mockOrderRepo.Object, 
            _mockProductRepo.Object
        );
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenStockIsInsufficient()
    {
        // ARRANGE (Preparação)
        var productId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var idempotencyKey = "test-key";
        
        // 1. Configura a lista de produtos (Produto com 5 no estoque)
        var products = new List<Product>
        {
            new Product("Laptop A", "LPA-001", 1000m, 5) // Estoque atual = 5
        };

        // 2. Configura o Repositório para retornar os produtos
        _mockProductRepo
            .Setup(repo => repo.GetByIdsAsync(It.IsAny<List<Guid>>()))
            .ReturnsAsync(products);

        // 3. Cria o Comando que requer mais estoque do que o disponível (Requer 10)
        var command = new CreateOrderCommand(
            CustomerId: customerId,
            Items: new List<OrderItemInputDto>
            {
                new OrderItemInputDto(ProductId: productId, Quantity: 10) // Tenta pedir 10
            }
        );

        // 4. Configura o check de Idempotência (Não usado)
        _mockOrderRepo
            .Setup(repo => repo.IsIdempotencyKeyUsedAsync(It.IsAny<string>()))
            .ReturnsAsync((false, null));


        // ACT & ASSERT (Ação e Verificação)
        
        // Espera que o método Handle lance a exceção InsufficientStockException
        await Assert.ThrowsAsync<InsufficientStockException>(() =>
            _handler.Handle(command, idempotencyKey)
        );
    }

    [Fact]
    public async Task Handle_ShouldReturnOrderId_WhenStockIsSufficient()
    {
        // ARRANGE (Preparação)
        var productId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var idempotencyKey = "test-key-2";
        var products = new List<Product>
        {
            new Product("Monitor B", "MON-002", 500m, 20) // Estoque suficiente = 20
        };
        var command = new CreateOrderCommand(
            CustomerId: customerId,
            Items: new List<OrderItemInputDto>
            {
                new OrderItemInputDto(ProductId: productId, Quantity: 5) // Pede 5
            }
        );

        _mockProductRepo
            .Setup(repo => repo.GetByIdsAsync(It.IsAny<List<Guid>>()))
            .ReturnsAsync(products);

        _mockOrderRepo
            .Setup(repo => repo.IsIdempotencyKeyUsedAsync(It.IsAny<string>()))
            .ReturnsAsync((false, null));
            
        // Configura a persistência para não fazer nada (simulação)
        _mockOrderRepo
            .Setup(repo => repo.SaveOrderTransactionAsync(It.IsAny<Order>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);


        // ACT
        var resultId = await _handler.Handle(command, idempotencyKey);

        // ASSERT
        // Verifica se um GUID válido foi retornado
        Assert.NotEqual(Guid.Empty, resultId);

        // Verifica se o repositório de pedidos foi chamado para salvar a transação
        _mockOrderRepo.Verify(
            repo => repo.SaveOrderTransactionAsync(It.IsAny<Order>(), idempotencyKey), 
            Times.Once
        );
    }
}