<#
.SYNOPSIS
    Starts the Angular 19 Logistics Tracking UI on http://localhost:4200 with API proxy.
#>
$frontendDir = Join-Path $PSScriptRoot "..\frontend"
Set-Location $frontendDir
npm start

