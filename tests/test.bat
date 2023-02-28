@echo off
setlocal

if "%1" == "-c" goto :CHECK

for %%i in ("%~dp0write-*.bat") do call "%%i"

:CHECK
cscript /nologo "%~dp0check-data.js"

endlocal
