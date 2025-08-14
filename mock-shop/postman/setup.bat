@echo off
echo Mock Shop API Testing Setup
echo ============================

echo.
echo Starting setup process...
node setup.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Setup completed successfully!
    echo You can now run API tests using the commands shown above.
) else (
    echo.
    echo Setup failed. Please check the error messages above.
    echo Make sure the Mock Shop server is running: npm run dev
)

echo.
pause