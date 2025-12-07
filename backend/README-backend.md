### API Catálogo & Pedidos — Backend (.NET 8)

API ASP.NET Core estruturada em camadas (Domain, Application, Infrastructure e Api). Responsável pelos CRUDs de produtos, clientes e pedidos, incluindo criação idempotente de pedidos.


<img width="1359" height="649" alt="swagger_documentação_endpoints" src="https://github.com/user-attachments/assets/8b3ca785-c2e8-44c9-98a1-2cc0200ee06c" />

#### Pré-requisitos
- .NET SDK 8.0
- PostgreSQL local (opcional quando não estiver usando Docker Compose)
- Arquivo `.env` na raiz do monorepo com `ConnectionStrings__DefaultConnection`

#### Executando localmente
```powershell
dotnet restore
dotnet run --project src/Api/Api.csproj
```
- Swagger: `http://localhost:5000/swagger/index.html`
- Health check: `http://localhost:5000/health`

#### Migrações e seed
O `Program.cs` aplica `Database.Migrate()` e chama `DataSeeder.SeedAsync()` automaticamente. Para rodar manualmente:
```powershell
dotnet ef database update --project src/Infrastructure/Infrastructure.csproj --startup-project src/Api/Api.csproj
```

#### Logs estruturados
- Middleware `CorrelationIdMiddleware` e Serilog adicionam `CorrelationId` ao contexto
- Console e arquivo (`logs/api-log-YYYYMMDD.json`) em formato JSON (útil para ELK / seq)

#### Testes
```powershell
dotnet test backend.sln
```
(Esse comando também é executado pelos scripts `scripts/verify.*` na raiz.)

#### Configuração Docker
O `backend/Dockerfile` faz publish apenas do projeto `Api`. Use `docker compose up --build` na raiz para subir API + PostgreSQL + Frontend.
