@echo off
setlocal

set bytecount=100
set min_byte=0
set max_byte=34
set generate_hexline="%~dp0random-hexline" %bytecount% %min_byte% %max_byte%
for /f %%i in ('call %generate_hexline%') do set hexline=%%i

rem  The %name% of this script is expected to be "write-%test_name%".
set name=%~n0
set test_name=%name:~6%
call "%~dp0write" %hexline% %test_name% && exit /b 0 || exit /b 1

endlocal
