@echo off

rem  --------------------------------------------------------------------------
rem  Writes a big size of data, when the hexline is longer than the batch cmd
rem  length limit.
rem  --------------------------------------------------------------------------

setlocal

set BYTECOUNT=512

rem  The range to generate a random byte value.
set MIN_BYTE=0
set MAX_BYTE=255

set root=%~dp0

call "%root%ensure-tb-path"

rem  The %name% of this script is expected to be "write-%test_name%".
set name=%~n0
set test_name=%name:~6%

set "TEST_DIR=%root%data"
set "outfile=%TEST_DIR%\%test_name%.bin"
set "logfile=%TEST_DIR%\%test_name%.log"

echo Writing test data "%test_name%"

if not exist "%TEST_DIR%" mkdir "%TEST_DIR%"
if exist "%outfile%" del "%outfile%"

set start_time=%TIME%
call cscript /nologo "%root%random-hexline-long.js" ^
  %BYTECOUNT% %MIN_BYTE% %MAX_BYTE% "%outfile%" "%logfile%"
set end_time=%TIME%

for /f %%i in ('call "%root%msdiff" "%start_time%" "%end_time%"') do (
  echo %%i ms >> "%logfile%"
)

endlocal
