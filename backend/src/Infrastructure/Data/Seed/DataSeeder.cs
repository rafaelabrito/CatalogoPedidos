using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Seed
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
        {
            await SeedCustomersAsync(context, cancellationToken);
            await SeedProductsAsync(context, cancellationToken);

            if (context.ChangeTracker.HasChanges())
            {
                await context.SaveChangesAsync(cancellationToken);
            }
        }

        private static async Task SeedCustomersAsync(ApplicationDbContext context, CancellationToken cancellationToken)
        {
            if (await context.Customers.AnyAsync(cancellationToken))
            {
                return;
            }

            var customers = new List<Customer>
            {
                new("Alice Ramos", "alice.ramos@example.com", "11111111111"),
                new("Bruno Costa", "bruno.costa@example.com", "22222222222"),
                new("Carla Mendes", "carla.mendes@example.com", "33333333333"),
                new("Diego Nogueira", "diego.nogueira@example.com", "44444444444"),
                new("Elaine Souza", "elaine.souza@example.com", "55555555555"),
                new("Felipe Torres", "felipe.torres@example.com", "66666666666"),
                new("Gabriela Lima", "gabriela.lima@example.com", "77777777777"),
                new("Hugo Martins", "hugo.martins@example.com", "88888888888"),
                new("Isabela Rocha", "isabela.rocha@example.com", "99999999999"),
                new("Joao Batista", "joao.batista@example.com", "00000000000")
            };

            await context.Customers.AddRangeAsync(customers, cancellationToken);
        }

        private static async Task SeedProductsAsync(ApplicationDbContext context, CancellationToken cancellationToken)
        {
            if (await context.Products.AnyAsync(cancellationToken))
            {
                return;
            }

            var products = new List<Product>
            {
                new("Notebook Pro 14", "NB-0001", 5299.90m, 25),
                new("Notebook Lite 13", "NB-0002", 3899.90m, 40),
                new("Mouse Optico Wireless", "AC-0003", 149.90m, 120),
                new("Teclado Mecanico Azul", "AC-0004", 449.90m, 80),
                new("Monitor LED 27 Polegadas", "AC-0005", 1699.90m, 35),
                new("Monitor Ultrawide 34 Polegadas", "AC-0006", 2599.90m, 20),
                new("Cadeira Ergonomica Gamer", "OF-0007", 1299.90m, 18),
                new("Mesa Ajustavel Escritorio", "OF-0008", 899.90m, 22),
                new("Headset Bluetooth ANC", "AC-0009", 699.90m, 65),
                new("Hub USB-C 7 em 1", "AC-0010", 299.90m, 95),
                new("SSD NVMe 1TB", "HW-0011", 749.90m, 55),
                new("HD Externo 2TB", "HW-0012", 529.90m, 60),
                new("Smartphone Plus 128GB", "MB-0013", 3899.90m, 30),
                new("Tablet 11 Polegadas 256GB", "MB-0014", 3299.90m, 27),
                new("Impressora Laser WiFi", "OF-0015", 1599.90m, 14),
                new("Webcam Full HD", "AC-0016", 249.90m, 85),
                new("Projetor Portátil", "OF-0017", 2199.90m, 12),
                new("Switch Gigabit 16 Portas", "NW-0018", 849.90m, 33),
                new("Roteador WiFi 6", "NW-0019", 699.90m, 45),
                new("Nobreak 1500VA", "PW-0020", 1599.90m, 16)
            };

            await context.Products.AddRangeAsync(products, cancellationToken);
        }
    }
}
