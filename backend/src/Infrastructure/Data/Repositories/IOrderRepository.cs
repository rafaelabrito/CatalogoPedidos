// backend/src/Infrastructure/Repositories/OrderRepository.cs

using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            // Injeção do ApplicationDbContext (EF Core)
            _context = context;
        }

        /// <summary>
        /// Realiza a transação atômica completa para a criação de um pedido, 
        /// garantindo que todas as operações (Pedido, Itens, Estoque, Idempotência) 
        /// sejam salvas ou revertidas em conjunto.
        /// </summary>
        public async Task<Guid> SaveOrderTransactionAsync(
            Order order, 
            List<OrderItem> items, 
            IdempotencyKey idempotencyKey, 
            Dictionary<Guid, int> stockUpdates)
        {
            // O DbContext é usado como a Unidade de Trabalho e o EF Core gerencia a transação
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // 1. REGISTRAR CHAVE DE IDEMPOTÊNCIA
                    // Se esta linha falhar (ex: chave duplicada), a transação será revertida.
                    _context.IdempotencyKeys.Add(idempotencyKey);
                    
                    // 2. INSERIR O PEDIDO E SEUS ITENS
                    _context.Orders.Add(order);
                    _context.OrderItems.AddRange(items);
                    
                    // 3. ATUALIZAR ESTOQUE DOS PRODUTOS
                    foreach (var update in stockUpdates)
                    {
                        var product = await _context.Products
                                                    .FirstOrDefaultAsync(p => p.Id == update.Key);
                        
                        if (product == null)
                        {
                            // Isso deve ser validado antes pelo Handler, mas é um safety check
                            throw new Exception($"Produto ID {update.Key} não encontrado durante a transação.");
                        }
                        
                        // Garante que o estoque seja atualizado (decrementado)
                        product.DecreaseStock(update.Value);
                        _context.Products.Update(product);
                    }
                    
                    // Salva todas as operações pendentes (DbSets) no PostgreSQL
                    await _context.SaveChangesAsync();
                    
                    // Confirma a transação. A partir daqui, as alterações são permanentes no banco.
                    await transaction.CommitAsync();
                    
                    return order.Id;
                }
                catch (Exception)
                {
                    // Em caso de qualquer falha (incluindo violação de unicidade da IdempotencyKey 
                    // ou erro interno do Postgres), todas as mudanças são desfeitas.
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }
        
        /// <summary>
        /// Busca uma chave de idempotência para verificar se uma requisição já foi processada.
        /// </summary>
        public async Task<IdempotencyKey?> GetIdempotencyKeyAsync(string key)
        {
            return await _context.IdempotencyKeys.FirstOrDefaultAsync(k => k.Key == key);
        }
        
        /// <summary>
        /// Busca o ID do pedido associado a uma chave de idempotência.
        /// </summary>
        public async Task<Guid?> GetOrderIdByKeyAsync(string key)
        {
            return await _context.Orders
                                 .Where(o => o.IdempotencyKeyId == key)
                                 .Select(o => (Guid?)o.Id)
                                 .FirstOrDefaultAsync();
        }
    }
}