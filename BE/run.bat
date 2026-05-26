@echo off
chcp 65001 > nul
echo ========================================
echo  Nhom 8 CRM - Khoi dong Backend Server
echo ========================================
echo.

REM Tim Maven cua IntelliJ
set MVN="D:\Inteliji\IntelliJ IDEA 2025.3\plugins\maven\lib\maven3\bin\mvn.cmd"

REM Kiem tra Maven ton tai
if not exist %MVN% (
    echo [LOI] Khong tim thay Maven tai: %MVN%
    echo Vui long sua duong dan MVN trong file nay.
    pause
    exit /b 1
)

REM Dung process Java dang chay tren port 8081
echo [0/2] Dung process cu tren port 8081...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8081"') do (
    taskkill /PID %%a /F > nul 2>&1
)

REM Build
echo [1/2] Dang build project...
%MVN% clean package -DskipTests -f pom.xml
if %errorlevel% neq 0 (
    echo.
    echo [LOI] Build that bai!
    pause
    exit /b 1
)

REM Chay JAR
echo.
echo [2/2] Khoi dong server...
echo.
echo  Server : http://localhost:8081
echo  Swagger: http://localhost:8081/api/swagger-ui.html
echo  Test email: http://localhost:8081/api/test-email?to=YOUR_EMAIL
echo.
echo Nhan Ctrl+C de dung server
echo ========================================
echo.

java -jar target\crm-backend-1.0.0.jar

pause
