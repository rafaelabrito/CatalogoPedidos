# Catálogo & Pedidos — Monorepo

Projeto full-stack com **.NET 8** (API) e **Angular 17** (SPA) para gerenciamento de produtos, clientes e pedidos, empacotado com **PostgreSQL** e **Docker Compose**. O repositório consolida infraestrutura, backend, frontend e scripts de verificação para facilitar a entrega end-to-end do desafio.
<img width="1344" height="644" alt="detalhe_pedido" src="https://github.com/user-attachments/assets/1ebcb2d9-d39d-44ec-9703-10ac82f0a42f" />

## Sumário
- [Arquitetura Geral](#arquitetura-geral)
- [Pré-requisitos](#pré-requisitos)
- [Execução com Docker](#execução-com-docker)
- [Ambiente de Desenvolvimento Local](#ambiente-de-desenvolvimento-local)
- [Testes, Lint e Verificações](#testes-lint-e-verificações)
- [Observabilidade & Correlation ID](#observabilidade--correlation-id)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Documentação Complementar](#documentação-complementar)

## Arquitetura Geral
- **Backend** (`backend/`): API REST ASP.NET Core 8 com camadas *Domain / Application / Infrastructure / Api*, Entity Framework Core + PostgreSQL, Serilog estruturado e idempotência para criação de pedidos.
- **Frontend** (`frontend/`): SPA Angular 17 standalone components. Fluxo completo de pedidos com criação, listagem filtrada/paginada e tela de detalhes, integração com o backend via envelope (`ApiResponse`).
- **Banco de dados**: PostgreSQL (veja `docker-compose.yml` e `backend/src/Infrastructure`). Seeds automáticos garantem 20 produtos e 10 clientes.
- **Infraestrutura**: Docker Compose com health-checks e scripts auxiliares (`scripts/` e `verify-db.*`).

## Pré-requisitos
- Docker + Docker Compose (para execução conteinerizada).
- .NET SDK 8.0 (para desenvolvimento/testes do backend).
- Node.js 20.x e npm 10.x (para desenvolvimento/testes do frontend).

Crie um arquivo `.env` na raiz com base no `.env.example` (mesmos valores utilizados pelo compose e pela API).

## Execução com Docker
```powershell
# Restaurar dependências e subir todos os serviços
docker compose up --build
```
A stack sobe três contêineres:
1. **api** (`http://localhost:5000`) com Swagger em `/swagger/index.html`.
2. **frontend** (`http://localhost:4200`) servindo a aplicação Angular.
3. **postgres** (`localhost:5432`) com dados semente carregados automaticamente.

Use `docker compose down -v` para parar os serviços e remover volumes temporários.

## Ambiente de Desenvolvimento Local
### Backend
```powershell
cd backend
 dotnet restore
 dotnet run --project src/Api/Api.csproj
```
- Conexão padrão: ver `appsettings.json` ou variável `ConnectionStrings__DefaultConnection`.
- Logs estruturados ficam em `backend/logs/api-log-*.json` (rotacionados diariamente).

### Frontend
```powershell
cd frontend
npm install
npm start
```
- O dev-server usa `http://localhost:4200` e um proxy (`proxy.conf.json`) que encaminha `/api` para `http://localhost:5000`.
- Ajuste o arquivo `.env`/proxy caso rode o backend em outra porta.

## Testes, Lint e Verificações
Scripts unificados vivem em `scripts/verify.*`:
```powershell
# Windows PowerShell
scripts\verify.ps1

# Mac/Linux
./scripts/verify.sh
```
Esses scripts executam, nessa ordem:
1. `dotnet test backend/backend.sln`
2. `npm run lint`
3. `npm run test:ci` (Chrome headless, sem watch)

Você pode pular etapas exportando `SKIP_BACKEND_TESTS=1`, `SKIP_FRONTEND_LINT=1` ou `SKIP_FRONTEND_TESTS=1` (ou passando os switches no PowerShell).

## Observabilidade & Correlation ID
- Cada requisição recebe/propaga `X-Correlation-ID` via middleware ASP.NET Core e interceptor Angular. O header é exibido também no banner de feedback quando erros ocorrem.
- Serilog está configurado para Console (JSON) e arquivo (`logs/`). Use o correlation ID para rastrear requisições end-to-end.

## Estrutura do Repositório
```
backend/           # API .NET (Clean Architecture)
frontend/          # SPA Angular
scripts/           # Scripts utilitários (verify, db helpers)
data-volumes/      # Volume persistente do PostgreSQL (ignorado pelo git)
docs/              # Plano de refatoração, registro de uso de IA, etc.
docker-compose.yml # Orquestração dos serviços
```

## Documentação Complementar
- Plano de refatoração: `docs/plano-refatorar-v1.md`
- Registro de uso de IA: `docs/uso-ia.md`
- Configuração de persistência local: `PERSISTENCIA.md`

> Em caso de dúvidas ou para executar apenas parte do stack, consulte também `backend/README-backend.md` e `frontend/README.md`.
