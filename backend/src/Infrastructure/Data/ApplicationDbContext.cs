// backend/src/Infrastructure/Data/ApplicationDbContext.cs

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        // Define as coleções de entidades que serão mapeadas para as tabelas no PostgreSQL
        public DbSet<Product> Products { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<IdempotencyKey> IdempotencyKeys { get; set; } // Tabela de Idempotência

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Aplica todas as configurações de mapeamento (Fluent API)
            // Isso permite configurar o nome das tabelas, colunas, chaves e índices
            
            // 1. Produtos
            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("products");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Sku).IsUnique(); 
                entity.Property(e => e.Price).HasColumnType("numeric(18, 2)");
                entity.Property(e => e.StockQty).HasColumnName("stock_qty");
            });

            // 2. Clientes
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.ToTable("customers");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Document).IsUnique();
            });

            // 3. Pedidos
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("orders");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(18, 2)");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");

                // Relação 1:N com Customer
                entity.HasOne<Customer>()
                    .WithMany()
                    .HasForeignKey(o => o.CustomerId);

                // Relação com Chave de Idempotência
                entity.Property(o => o.IdempotencyKeyId)
                      .IsRequired(false);
            });

            // 4. Itens do Pedido
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.ToTable("order_items");
                entity.HasKey(e => e.Id); 
                entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasColumnType("numeric(18, 2)");
                entity.Property(e => e.LineTotal).HasColumnName("line_total").HasColumnType("numeric(18, 2)");
                
                // Relação com Produto
                entity.HasOne(oi => oi.Product)
                      .WithMany()
                      .HasForeignKey(oi => oi.ProductId);
            });
            
            // 5. Chave de Idempotência
            modelBuilder.Entity<IdempotencyKey>(entity =>
            {
                entity.ToTable("idempotency_keys");
                entity.HasKey(e => e.Key);
            });
        }
    }
}