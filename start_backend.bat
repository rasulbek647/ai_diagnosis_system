@echo off
echo Backend jildiga o'tilmoqda...
cd backend
if not exist "..\.venv" (
    echo Virtual muhit topilmadi, iltimos avval python -m venv .venv buyrug'i orqali muhit yarating.
) else (
    echo Virtual muhit faollashtirilmoqda va paketlar tekshirilmoqda...
    call ..\.venv\Scripts\activate.bat
    python.exe -m pip install -r requirements.txt
    echo FastAPI server yoqilmoqda...
    uvicorn app.main:app --reload
)
pause
