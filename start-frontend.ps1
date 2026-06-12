Set-Location $PSScriptRoot\frontend
if (-not (Test-Path "node_modules")) {
    npm install
}
if (-not (Test-Path ".env.local")) {
    "NEXT_PUBLIC_API_URL=http://localhost:8000" | Out-File -Encoding utf8 .env.local
}
Write-Host "Starting VaultScan frontend on http://localhost:3000" -ForegroundColor Green
npm run dev
