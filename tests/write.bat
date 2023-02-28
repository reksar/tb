@echo off

setlocal
set hexline=%~1
set test_name=%~2

if "%test_name%" == "" exit /b 1

call "%~dp0ensure-tb-path"

set "TEST_DIR=%~dp0data"
set "outfile=%TEST_DIR%\%test_name%.bin"
set "logfile=%TEST_DIR%\%test_name%.log"

echo Writing test data "%test_name%"

if not exist "%TEST_DIR%" mkdir "%TEST_DIR%"
if exist "%outfile%" del "%outfile%"
echo %hexline%> "%logfile%"

set start_time=%TIME%
call tb %hexline% "%outfile%"
set end_time=%TIME%

for /f %%i in ('call "%~dp0msdiff" "%start_time%" "%end_time%"') do (
  echo %%i ms >> "%logfile%"
)
endlocal
