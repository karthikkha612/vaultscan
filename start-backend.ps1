Set-Location $PSScriptRoot\backend
if (-not (Test-Path "venv\Scripts\python.exe")) {
    python -m venv venv
    .\venv\Scripts\pip install -r requirements.txt
}
Write-Host "Starting VaultScan API on http://localhost:8000" -ForegroundColor Green
.\venv\Scripts\uvicorn main:app --reload --host 0.0.0.0 --port 8000
