# Verificar dados no PostgreSQL
# Execute: .\verify-db.ps1

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Verificando dados no PostgreSQL" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$CONTAINER = "fullstack-dotnet8-angular17-catalogo-pedidos-db-1"
$DB = "catalog_db"
$USER = "appuser"

# 1. Verificar se as tabelas existem
Write-Host "1️⃣  Listando tabelas do banco:" -ForegroundColor Green
docker exec $CONTAINER psql -U $USER -d $DB -c "\dt" 2>$null
Write-Host ""

# 2. Contagem de produtos
Write-Host "2️⃣  Total de produtos no banco:" -ForegroundColor Green
$productCount = docker exec $CONTAINER psql -U $USER -d $DB -t -c "SELECT COUNT(*) FROM products;" 2>$null
Write-Host "   $productCount produtos encontrados" -ForegroundColor Yellow
Write-Host ""

# 3. Listar alguns produtos
Write-Host "3️⃣  Amostra de produtos (primeiros 5):" -ForegroundColor Green
docker exec $CONTAINER psql -U $USER -d $DB -c "SELECT id, name, sku, price, stock_qty FROM products LIMIT 5;" 2>$null
Write-Host ""

# 4. Contagem de clientes
Write-Host "4️⃣  Total de clientes:" -ForegroundColor Green
$customerCount = docker exec $CONTAINER psql -U $USER -d $DB -t -c "SELECT COUNT(*) FROM customers;" 2>$null
Write-Host "   $customerCount clientes encontrados" -ForegroundColor Yellow
Write-Host ""

# 5. Contagem de pedidos
Write-Host "5️⃣  Total de pedidos:" -ForegroundColor Green
$orderCount = docker exec $CONTAINER psql -U $USER -d $DB -t -c "SELECT COUNT(*) FROM orders;" 2>$null
Write-Host "   $orderCount pedidos encontrados" -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ([int]$productCount -gt 0) {
    Write-Host "✅ Dados encontrados no banco! Persistência funcionando." -ForegroundColor Green
} else {
    Write-Host "⚠️  Nenhum produto encontrado no banco." -ForegroundColor Yellow
    Write-Host "   Verifique se:" -ForegroundColor Yellow
    Write-Host "   - O backend está salvando via POST /api/products" -ForegroundColor DarkCyan
    Write-Host "   - O repositório está chamando SaveChangesAsync()" -ForegroundColor DarkCyan
    Write-Host "   - As migrations foram aplicadas" -ForegroundColor DarkCyan
}
