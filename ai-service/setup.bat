@echo off
echo Setting up AI Service...

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Setup complete!
echo.
echo To start the AI service:
echo 1. Run: venv\Scripts\activate
echo 2. Run: python app.py
echo.
pause