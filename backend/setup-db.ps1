# Setup do banco de dados e migrations
# Execute este script na raiz do projeto backend

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Fullstack .NET 8 + Angular 17 - Database Setup             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$backendPath = $PSScriptRoot
$migrationName = "InitialCreate"
$infra = "src\Infrastructure\Infrastructure.csproj"
$api = "src\Api\Api.csproj"

Write-Host "📍 Diretório: $backendPath" -ForegroundColor Yellow
Write-Host ""

# 1. Limpar artifacts antigos
Write-Host "🧹 Limpando build anterior..." -ForegroundColor Blue
dotnet clean -q -o bin 2>$null | Out-Null

# 2. Restaurar dependências
Write-Host "📦 Restaurando dependências..." -ForegroundColor Blue
dotnet restore | Out-Null

# 3. Build da solução
Write-Host "🔨 Compilando solução..." -ForegroundColor Blue
$buildResult = dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro na compilação!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build concluído com sucesso" -ForegroundColor Green
Write-Host ""

# 4. Criar migration
Write-Host "📋 Criando migration '$migrationName'..." -ForegroundColor Blue
Write-Host "   Comando: dotnet ef migrations add $migrationName -p $infra -s $api" -ForegroundColor DarkCyan
$migResult = dotnet ef migrations add $migrationName -p $infra -s $api 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration '$migrationName' criada com sucesso" -ForegroundColor Green
} else {
    if ($migResult -like "*already exists*") {
        Write-Host "⚠️  Migration '$migrationName' já existe" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro ao criar migration: $migResult" -ForegroundColor Red
        Write-Host ""
        Write-Host "Verifique:"
        Write-Host "1. Se o arquivo .env existe e está configurado"
        Write-Host "2. Se o PostgreSQL está rodando: docker compose ps"
        Write-Host "3. Se o ApplicationDbContext está correto"
    }
}
Write-Host ""

# 5. Informações finais
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Iniciar os containers:"
Write-Host "   docker compose down && docker compose up -d" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "2️⃣  Rodar o backend:"
Write-Host "   dotnet run --project src\Api\Api.csproj" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "3️⃣  Acessar a API:"
Write-Host "   🌐 Swagger: http://localhost:5000/swagger" -ForegroundColor DarkCyan
Write-Host "   📊 API: http://localhost:5000/api/products" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "4️⃣  Verificar dados no banco:"
Write-Host "   docker exec desafio_postgres_db psql -U appuser -d catalog_db -c \"SELECT * FROM products;\"" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
