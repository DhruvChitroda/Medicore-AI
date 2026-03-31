@echo off
echo ====================================================
echo   Starting AI-Driven Healthcare ^& Medical Analytics
echo   (React + MongoDB Edition)
echo ====================================================

echo [1/3] Installing Backend Dependencies...
cd backend
python -m pip install -r requirements.txt

echo [2/3] Starting Backend Server (Wait 3 seconds)...
start "Backend API Server" cmd /c "uvicorn main:app --host 0.0.0.0 --port 8000"
timeout /t 3 >nul

echo [3/3] Installing Frontend Dependencies ^& Starting React...
cd ../frontend
call npm install
start "Frontend Web Application" cmd /c "node node_modules\vite\bin\vite.js"

echo ====================================================
echo   Application is booting up!
echo   Ensure MongoDB is running locally on port 27017!
echo   Check the pop-up browsers or terminals for the React URL (usually http://localhost:5173)
echo ====================================================
pause
