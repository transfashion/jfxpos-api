@echo off
set PORT=3000

if exist .env (
    for /f "usebackq tokens=1,2 delims==" %%i in (".env") do (
        if "%%i"=="PORT" (
            set PORT=%%j
        )
    )
)

rem Remove quotes and spaces
set PORT=%PORT:"=%
set PORT=%PORT:'=%
set PORT=%PORT: =%

echo Checking port %PORT%...

set PID=
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":%PORT%  *LISTENING" 2^>nul') do (
    set PID=%%a
)

if not "%PID%"=="" (
    echo Port %PORT% is already in use by PID %PID%. Terminating process...
    taskkill /F /PID %PID%
    timeout /t 1 /nobreak >nul
) else (
    echo Port %PORT% is free.
)

echo Starting service...
node src/app.js
