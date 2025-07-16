@echo off
echo Deploying to Render...

REM Change to the backend directory
cd backend

REM Create a new virtual environment if it doesn't exist
if not exist "paint_env" (
    python -m venv paint_env
)

REM Activate the virtual environment
call paint_env\Scripts\activate.bat

REM Install requirements
pip install -r requirements.txt

REM Deploy to Render (you'll need to replace this with your actual Render deployment command)
render deploy

REM Deactivate the virtual environment
deactivate

echo Deployment complete!
pause
