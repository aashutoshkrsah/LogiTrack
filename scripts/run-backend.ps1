<#
.SYNOPSIS
    Starts the Logistics Tracking Spring Boot REST API on port 8080.
.EXAMPLE
    $env:DB_PASSWORD="your_mysql_password"
    .\scripts\run-backend.ps1
#>
param(
    [string]$DbUrl = $env:DB_URL,
    [string]$DbUsername = $env:DB_USERNAME,
    [string]$DbPassword = $env:DB_PASSWORD
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim()
            if (-not [Environment]::GetEnvironmentVariable($key)) {
                [Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
    if (-not $DbUrl) { $DbUrl = $env:DB_URL }
    if (-not $DbUsername) { $DbUsername = $env:DB_USERNAME }
    if (-not $DbPassword) { $DbPassword = $env:DB_PASSWORD }
}

if (-not $DbUrl) {
    $DbUrl = "jdbc:mysql://localhost:3306/logistics_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
}
if (-not $DbUsername) {
    $DbUsername = "root"
}
if (-not $DbPassword) {
    $securePwd = Read-Host "Enter MySQL password for user '$DbUsername'" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
    try {
        $DbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    } finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

$env:DB_URL = $DbUrl
$env:DB_USERNAME = $DbUsername
$env:DB_PASSWORD = $DbPassword

if (Test-Path "C:\Program Files\Java\jdk-24\bin\java.exe") {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
    $env:Path = "C:\Program Files\Java\jdk-24\bin;" + $env:Path
}

$backendDir = Join-Path $projectRoot "backend"
Set-Location $backendDir

$jarPath = Join-Path $backendDir "target\logistics-tracking-system-1.0.0.jar"
if (Test-Path $jarPath) {
    & "$env:JAVA_HOME\bin\java.exe" -jar $jarPath
} elseif (Get-Command mvn -ErrorAction SilentlyContinue) {
    mvn spring-boot:run
} elseif (Test-Path "C:\Users\aashu\tools\apache-maven-3.9.9\bin\mvn.cmd") {
    & "C:\Users\aashu\tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
} else {
    Write-Error "Neither packaged JAR nor Apache Maven (mvn) was found."
    exit 1
}
