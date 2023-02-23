@echo off

setlocal
set hexline=%~1
set name=%~2

if "%name%" == "" exit /b 1

call "%~dp0ensure-trb-path"

set "TEST_DIR=%~dp0data"
set "outfile=%TEST_DIR%\%name%.bin"
set "logfile=%TEST_DIR%\%name%.log"

echo Writing test data "%name%"

if not exist "%TEST_DIR%" mkdir "%TEST_DIR%"
if exist "%outfile%" del "%outfile%"

echo %hexline% > "%logfile%"

set start_time=%TIME%
call trb %hexline% "%outfile%"
set end_time=%TIME%

for /f %%i in ('call "%~dp0msdiff" "%start_time%" "%end_time%"') do (
  echo %%i ms >> "%logfile%"
)
endlocal
