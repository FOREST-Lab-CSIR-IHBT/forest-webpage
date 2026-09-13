@echo off
echo Renaming images to lowercase...
node rename.js
echo.
echo Compressing new images...
node compress.js
echo.
echo Enter commit message:
set /p msg=
git add .
git commit -m "%msg%"
git push
echo.
echo Done!
pause