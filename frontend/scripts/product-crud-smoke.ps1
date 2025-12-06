$ErrorActionPreference = 'Stop'
$apiBase = 'http://localhost:5000/api/products'

function Write-Step($message) {
    Write-Host "[SMOKE] $message"
}

try {
    # Create
    $createPayload = @{
        name = 'Produto Smoke Test'
        sku = 'SMK-001'
        price = 199.9
        stockQty = 4
        stockQuantity = 4
        isActive = $true
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri $apiBase -Method Post -ContentType 'application/json' -Body $createPayload
    $productId = $createResponse.data
    Write-Step "Produto criado: $productId"

    # Update
    $updatePayload = @{
        id = $productId
        name = 'Produto Smoke Test (editado)'
        sku = 'SMK-001'
        price = 249.9
        stockQty = 6
        stockQuantity = 6
        isActive = $true
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$apiBase/$productId" -Method Put -ContentType 'application/json' -Body $updatePayload | Out-Null
    Write-Step "Produto atualizado: $productId"

    # Delete
    Invoke-RestMethod -Uri "$apiBase/$productId" -Method Delete | Out-Null
    Write-Step "Produto excluído: $productId"
}
catch {
    Write-Error $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        $reader.Close()
        Write-Error "Detalhes: $body"
    }
    exit 1
}
