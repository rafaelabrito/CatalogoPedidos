# Frontend — Angular 17

Aplicação SPA que consome a API de Catálogo & Pedidos. A tela de pedidos inclui busca por cliente, criação com idempotência e validação de estoque, listagem paginada/filtrável e visualização detalhada. Todos os serviços usam o envelope `ApiResponse` retornado pelo backend e exibem mensagens acessíveis via banner global com ID de correlação.

<img width="1359" height="649" alt="gestao_de_produto" src="https://github.com/user-attachments/assets/14cb5984-9f35-47d5-a7dd-0efd4c72f9b9" />

## Pré-requisitos
- Node.js 20.x e npm 10.x
- Backend rodando em `http://localhost:5000` (via Docker Compose ou `dotnet run`).

## Instalação
```powershell
npm install
```

## Servidor de desenvolvimento
```powershell
npm start
```
- Usa `ng serve --proxy-config proxy.conf.json --port 4200`
- O proxy redireciona `/api` para `http://localhost:5000`
- Caso a porta 4200 esteja ocupada, libere-a (por exemplo, parando o container `frontend`) antes de iniciar o dev-server

## Build de produção
```powershell
npm run build
```
Os artefatos ficam em `dist/frontend1/`.

## Testes e lint
- `npm run lint` — validação ESLint
- `npm run test` — modo interativo com Karma + Jasmine
- `npm run test:ci` — mesma suíte em modo headless (usada nos scripts `scripts/verify.*`)

## Estrutura relevante
- `src/app/features/orders` — fluxos de pedidos (create/list/details)
- `src/app/core/interceptors` — interceptors de envelope, erro e `X-Correlation-ID`
- `src/app/shared/components/feedback-banner` — banner global para mensagens e correlação

## Variáveis importantes
- `proxy.conf.json` — configurações de proxy para o backend local
- `environment.*.ts` não são utilizados; as URLs são relativas (`/api`) para facilitar uso com proxy e Docker

## Portas padrão

| Serviço | Porta | Observação |
|---------|-------|------------|
| Angular dev server | 4200 | `npm start` |
| Backend API | 5000 | Swagger em `/swagger/index.html` |
| PostgreSQL | 5432 | Credenciais definidas no `.env` da raiz |

## Ferramentas úteis
- `npm run lint -- --fix` para autofix quando disponível
- `npm run test -- --watch=false` para rodar uma vez em ambiente interativo
