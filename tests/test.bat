@echo off
setlocal

set tests=%~dp0

if "%1" == "-c" goto :CHECK

call "%tests%clean"

for %%i in ("%tests%write-*.bat") do call "%%i"

:CHECK
cscript /nologo "%tests%check-data.js"

endlocal
