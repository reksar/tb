@echo off
setlocal

rem  --------------------------------------------------------------------------
rem  Writes a big size of data, when the hexline is much longer than the batch
rem  cmd length limit.
rem
rem  NOTE: will be skipped if MS JScript is not available.
rem  --------------------------------------------------------------------------

set BYTECOUNT=5000
set MIN_BYTE=0
set MAX_BYTE=255

rem  The %name% of this script is expected to be "write-%test_name%".
set name=%~n0
set test_name=%name:~6%

set root=%~dp0
set "workdir=%root%data"
set "outfile=%workdir%\%test_name%.bin"
set "logfile=%workdir%\%test_name%.log"

cscript >NUL 2>&1 || exit /b 1
call "%root%ensure-tb-path"
echo Writing test data "%test_name%"

if not exist "%workdir%" mkdir "%workdir%"
if exist "%outfile%" del "%outfile%"

call cscript /nologo "%root%random-hexline.js" ^
  %BYTECOUNT% %MIN_BYTE% %MAX_BYTE% "%logfile%"

set start_time=%TIME%
for /f %%i in (%logfile%) do call tb %%i "%outfile%"
set end_time=%TIME%

for /f %%i in ('call "%root%time-diff" "%start_time%" "%end_time%"') do (
  echo %%i ms >> "%logfile%"
)

endlocal
