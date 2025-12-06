#!/bin/bash
# Script para verificar dados no PostgreSQL

CONTAINER="fullstack-dotnet8-angular17-catalogo-pedidos-db-1"
DB="catalog_db"
USER="appuser"

echo "═══════════════════════════════════════════════════════════════"
echo "Verificando dados no PostgreSQL"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verificar se as tabelas existem
echo "1️⃣  Tabelas do banco:"
docker exec $CONTAINER psql -U $USER -d $DB -c "\dt" 2>/dev/null | head -15

echo ""
echo "2️⃣  Contagem de produtos:"
docker exec $CONTAINER psql -U $USER -d $DB -c "SELECT COUNT(*) as total FROM products;" 2>/dev/null

echo ""
echo "3️⃣  Primeiros 5 produtos:"
docker exec $CONTAINER psql -U $USER -d $DB -c "SELECT id, name, sku, price, stock_qty FROM products LIMIT 5;" 2>/dev/null

echo ""
echo "4️⃣  Contagem de clientes:"
docker exec $CONTAINER psql -U $USER -d $DB -c "SELECT COUNT(*) as total FROM customers;" 2>/dev/null

echo ""
echo "5️⃣  Contagem de pedidos:"
docker exec $CONTAINER psql -U $USER -d $DB -c "SELECT COUNT(*) as total FROM orders;" 2>/dev/null

echo ""
echo "═══════════════════════════════════════════════════════════════"
