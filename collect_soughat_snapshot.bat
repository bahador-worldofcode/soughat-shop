@echo off
REM تغییر مسیر به ریشه پروژه و اجرای اسکریپت پایتون
cd /d "C:\projects\soughat-shop"
python collect_soughat_snapshot.py --out snapshot_soughat.txt
echo.
echo Snapshot created at "%CD%\snapshot_soughat.txt"
pause
