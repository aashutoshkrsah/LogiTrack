@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-backend.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Backend exited with an error. Check your MySQL password and ensure MySQL80 is running.
    pause
)
