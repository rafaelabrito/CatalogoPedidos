# Script para iniciar o Docker Compose
Set-Location $PSScriptRoot
docker compose up -d
docker compose ps
Write-Host "`nServiços disponíveis:" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Backend Swagger: http://localhost:5000/swagger" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:4200" -ForegroundColor Cyan
Write-Host "PostgreSQL: localhost:5432" -ForegroundColor Cyan
