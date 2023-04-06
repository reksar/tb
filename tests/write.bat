@echo off
setlocal

set hexline=%~1
set test_name=%~2

if "%test_name%" == "" exit /b 1

set root=%~dp0
set "workdir=%root%data"
set "outfile=%workdir%\%test_name%.bin"
set "logfile=%workdir%\%test_name%.log"

call "%root%ensure-tb-path"
echo Writing test data "%test_name%"

if not exist "%workdir%" mkdir "%workdir%"
if exist "%outfile%" del "%outfile%"
echo %hexline%> "%logfile%"

set start_time=%TIME%
call tb %hexline% "%outfile%"
set end_time=%TIME%

for /f %%i in ('call "%root%time-diff" "%start_time%" "%end_time%"') do (
  echo %%i ms >> "%logfile%"
)

endlocal
