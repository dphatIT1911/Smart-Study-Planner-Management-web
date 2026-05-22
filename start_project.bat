@echo off
title Smart Study Planner Management - Start Services
echo ========================================================
echo   Smart Study Planner Management - Start Script
echo ========================================================
echo.

:: Kiem tra phien ban python
echo Checking Python version...
for /f "tokens=2" %%I in ('python --version 2^>^&1') do set PYTHON_VERSION=%%I
echo %PYTHON_VERSION% | findstr /b "3.12" >nul
if errorlevel 1 (
    echo ========================================================
    echo [WARNING] Du an nay hoat dong tot nhat tren Python 3.12.x
    echo [WARNING] Phien ban Python hien tai tren may la: %PYTHON_VERSION%
    echo Nhuoc diem khi chay Local la co the xay ra loi khong tuong thich thu vien.
    echo Khuyen nghi: Ban nen chon chay bang Docker [Lua chon 2] de khong bi anh huong.
    echo ========================================================
    echo.
) else (
    echo Python version is compatible: %PYTHON_VERSION%
    echo.
)

echo Please choose how to run the Backend (BE):
echo [1] Run BE in Local environment (Python virtual environment)
echo [2] Run BE with Docker (docker-compose)
echo.
set /p be_mode="Enter your choice (1 or 2): "

echo.
echo ========================================================
echo Starting Backend (BE)...
echo ========================================================
cd backend
if "%be_mode%"=="1" (
    echo Mode: Local Virtual Environment
    if not exist ".venv" (
        echo Creating Python virtual environment...
        py -3.12 -m venv .venv
    )
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
    echo Installing Backend dependencies...
    pip install -r requirements.txt
    echo Starting Uvicorn server...
    start "Backend Service (Local)" cmd /k "uvicorn app.main:app --reload"
    goto fe_start
)

if "%be_mode%"=="2" (
    echo Mode: Docker
    echo Starting docker-compose...
    start "Backend Service (Docker)" cmd /k "docker-compose up --build"
    goto fe_start
)

echo Invalid choice for Backend. Skipping Backend startup...

:fe_start
cd ..

echo Waiting a moment for Backend to begin starting...
ping 127.0.0.1 -n 3 > nul

echo.
echo ========================================================
echo Starting Frontend (FE)...
echo ========================================================
cd frontend
if not exist "node_modules" (
    echo Installing Frontend dependencies...
    call npm install
)
echo Starting Frontend server...
start "Frontend Service" cmd /k "npm run dev"
cd ..

echo Waiting a few seconds for Frontend to initialize...
ping 127.0.0.1 -n 6 > nul

echo Opening Frontend in browser...
start http://localhost:5173

echo.
echo ========================================================
echo All requested services have been launched in new windows!
echo You can close this window now.
echo ========================================================
pause
