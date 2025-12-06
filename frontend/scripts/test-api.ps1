$body = '{"name":"Teste CLI","sku":"CLI-1","price":4500,"stockQuantity":5}'
try {
    Invoke-RestMethod -Uri http://localhost:5000/api/products -Method Post -ContentType 'application/json' -Body $body | ConvertTo-Json -Depth 5
} catch {
    if ($null -ne $_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd()
    } else {
        $_.Exception | Out-String
    }
}
