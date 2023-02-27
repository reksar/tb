@echo off
setlocal

if "%1" == "-c" goto :CHECK

rem  Write test data for each test in the testlist.
for /f %%i in ('type "%~dp0testlist.txt"') do call "%~dp0write-%%i"

:CHECK
cscript /nologo "%~dp0check-data.js"

endlocal
