# Guia de Persistência de Dados - Fullstack .NET 8 + Angular 17

## Arquitetura Atual

O projeto usa:
- **Backend**: .NET 8 Web API com Entity Framework Core
- **Banco de Dados**: PostgreSQL (rodando no Docker)
- **ORM**: Entity Framework Core (EF Core)
- **Padrão**: Repository Pattern com Handlers (CQRS-like)

## Fluxo de Dados

### 1. Criar um Produto (CREATE)
```
Angular Form
    ↓
HTTP POST /api/products
    ↓
ProductsController.Create()
    ↓
CreateProductCommandHandler
    ↓
ProductRepository.AddAsync()
    ↓
ApplicationDbContext.SaveChangesAsync()
    ↓
PostgreSQL (Table: products)
    ↓
Response JSON para Frontend
```

### 2. Listar Produtos (READ)
```
Angular Component ngOnInit
    ↓
HTTP GET /api/products
    ↓
ProductsController.List()
    ↓
ListProductsQueryHandler
    ↓
ProductQueryRepository.GetAllAsync()
    ↓
PostgreSQL (SELECT * FROM products)
    ↓
Response JSON (lista paginada)
```

### 3. Atualizar Produto (UPDATE)
```
Angular Form Edit
    ↓
HTTP PUT /api/products/{id}
    ↓
ProductsController.Update()
    ↓
UpdateProductCommandHandler
    ↓
ProductRepository.GetByIdAsync() + UpdateAsync()
    ↓
ApplicationDbContext.SaveChangesAsync()
    ↓
PostgreSQL (UPDATE products WHERE id = ...)
```

### 4. Deletar Produto (DELETE)
```
Angular List Delete Button
    ↓
HTTP DELETE /api/products/{id}
    ↓
ProductsController.Delete()
    ↓
DeleteProductCommandHandler
    ↓
ProductRepository.DeleteAsync()
    ↓
ApplicationDbContext.SaveChangesAsync()
    ↓
PostgreSQL (DELETE FROM products WHERE id = ...)
```

## Arquivos Importantes

### Backend - Repositórios (Persistência)
- `src/Infrastructure/Data/Repositories/ProductRepository.cs` - Implementa IProductRepository
- `src/Infrastructure/Data/Repositories/CustomerRepository.cs` - Implementa ICustomerRepository
- `src/Infrastructure/Data/ApplicationDbContext.cs` - Configuração do EF Core e mapeamentos

### Backend - Handlers (Lógica de Negócio)
- `src/Application/Features/Products/Commands/CreateProductCommandHandler.cs`
- `src/Application/Features/Products/Commands/UpdateProductCommandHandler.cs`
- `src/Application/Features/Products/Commands/DeleteProductCommandHandler.cs`
- `src/Application/Features/Products/Queries/ListProductsQueryHandler.cs`

### Backend - Controllers (API REST)
- `src/Api/Controllers/ProductsController.cs` - Endpoints: GET, POST, PUT, DELETE
- `src/Api/Controllers/CustomersController.cs`
- `src/Api/Controllers/OrdersController.cs`

### Configuração
- `src/Api/Program.cs` - Injeção de dependência, DbContext, CORS
- `.env` - Variáveis de ambiente do banco de dados

## Como os Dados Persistem

### No PostgreSQL (via Docker)

1. **Conexão**: A string de conexão vem de `.env`:
```
ConnectionStrings__DefaultConnection="Host=postgres;Port=5432;Database=catalog_db;Username=appuser;Password=secretpassword"
```

2. **Tabelas criadas automaticamente**:
   - `products` - Produtos do catálogo
   - `customers` - Clientes
   - `orders` - Pedidos
   - `order_items` - Itens dos pedidos
   - `idempotency_keys` - Chaves para idempotência de requisições

3. **Volume Docker**: 
   - Os dados persistem em `postgres_data:/var/lib/postgresql/data`
   - Mesmo se o container morrer, os dados sobrevivem

## Próximos Passos

### 1. Criar as Migrations (se ainda não existem)
```powershell
cd c:\Projetos\fullstack-dotnet8-angular17-catalogo-pedidos\backend
dotnet ef migrations add InitialCreate -p src\Infrastructure\Infrastructure.csproj -s src\Api\Api.csproj
```

### 2. Aplicar Migrations (automático no Startup via Program.cs)
```csharp
// Em src/Api/Program.cs - linha ~110
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate(); // Aplica migrations automaticamente
}
```

### 3. Verificar Dados no PostgreSQL
```bash
# Acessar o container do PostgreSQL
docker exec -it desafio_postgres_db psql -U appuser -d catalog_db

# Listar tabelas
\dt

# Ver dados
SELECT * FROM products;
```

### 4. Testar a Integração
1. Acessar Swagger: `http://localhost:5000/swagger`
2. Criar um produto via POST /api/products
3. Listar produtos via GET /api/products
4. Verificar no banco:
```bash
docker exec desafio_postgres_db psql -U appuser -d catalog_db -c "SELECT * FROM products;"
```

## Troubleshooting

### Os dados não aparecem no banco
- Verifique se o `SaveChangesAsync()` foi chamado no repository
- Verifique se a migration foi aplicada: `dbContext.Database.Migrate()`
- Verifique a connection string no `.env`

### Erros de FK (Foreign Key)
- A ordem de criação importa: Products → Orders → OrderItems
- Os Handlers precisam validar se o ID existe antes de criar relação

### Frontend não atualiza após salvar
- O backend retorna o objeto criado?
- O Angular está chamando um `refetch()` ou `getList()` após POST?

