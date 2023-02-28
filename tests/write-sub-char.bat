@echo off
setlocal

rem  Echoing a char to a file that ends with 0x1A (SUB) symbol will replace the
rem  SUB with that char.
set HEXLINE=x1Ax40

rem  The %name% of this script is expected to be "write-%test_name%".
set name=%~n0
set test_name=%name:~6%
call "%~dp0write" %HEXLINE% %test_name% && exit /b 0 || exit /b 1

endlocal
