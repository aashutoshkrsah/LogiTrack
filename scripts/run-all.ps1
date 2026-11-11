# LogiTrack — run backend + frontend locally on Windows (no Docker).
# Prerequisites: JDK 21, Maven 3.9+, Node 20+, MySQL 8 running with logistics_db.
#   1. Copy .env.example to .env and edit DB_PASSWORD
#   2. powershell -ExecutionPolicy Bypass -File scripts\run-all.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (Test-Path "$root\.env") {
  Get-Content "$root\.env" | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process') }
  }
}
$backend = Start-Process -FilePath 'mvn' -ArgumentList 'spring-boot:run' -WorkingDirectory "$root\backend" -PassThru -NoNewWindow
$frontend = Start-Process -FilePath 'npm' -ArgumentList 'start' -WorkingDirectory "$root\frontend" -PassThru -NoNewWindow
Write-Host "Backend:  http://localhost:8080/api"
Write-Host "Frontend: http://localhost:4200"
Write-Host "Press Ctrl+C to stop both (PIDs: $($backend.Id), $($frontend.Id))."
try { Wait-Process -Id $backend.Id, $frontend.Id } finally {
  Stop-Process -Id $backend.Id, $frontend.Id -ErrorAction SilentlyContinue
}
