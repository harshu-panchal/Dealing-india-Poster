@echo off
cd backend
call npm install firebase-admin
cd ..
cd frontend
call npm install firebase
echo Done!
