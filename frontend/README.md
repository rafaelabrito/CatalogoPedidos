# Frontend1

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Default Ports and URLs

| Serviço            | URL / Host              | Observações |
|--------------------|-------------------------|-------------|
| 🌐 Frontend (Angular dev server) | `http://localhost:4200/` | Execute `npm start`/`ng serve --port 4200`. Se a porta estiver em uso (por exemplo, pelo container frontend do Docker), libere-a antes de iniciar o dev‑server (`docker stop fullstack-dotnet8-angular17-catalogo-pedidos_frontend_1` ou finalize qualquer processo Node nessa porta) para evitar que o Angular escolha uma porta aleatória. |
| 🔧 Backend API (.NET) | `http://localhost:5000/` | Inclui Swagger em `http://localhost:5000/swagger/index.html`. O proxy do Angular (`proxy.conf.json`) já encaminha `/api` para este endereço. |
| 🗄️ PostgreSQL       | `localhost:5432`        | Utilize as credenciais definidas em `.env`/`.env.example`. |

Manter essas portas fixas facilita o roteamento do proxy, o consumo dos endpoints e a configuração compartilhada entre frontend, backend e scripts de automação.

## Development server

Run `npm start` (or `ng serve --proxy-config proxy.conf.json --port 4200`) for a dev server. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
