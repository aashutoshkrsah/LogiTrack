@echo off
echo Initializing logistics_db schema and sample data in MySQL 8.0...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < "%~dp0..\database\schema_and_data.sql"
if %ERRORLEVEL% EQU 0 (
    echo Database initialized successfully!
) else (
    echo Database initialization failed. Please check your MySQL password.
)
pause

