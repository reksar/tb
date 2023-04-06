@echo off
setlocal

rem  --------------------------------------------------------------------------
rem  Echo'ing a printable char to a file that ends with 0x1A (SUB) control char
rem  will replace the SUB with that printable char. This test ensures that the
rem  "x1AxHH" chain will be written instead of "xHH", where "xHH" - is a
rem  printable char triplet.
rem  --------------------------------------------------------------------------

set HEXLINE=x1Ax40

rem  The %name% of this script is expected to be "write-%test_name%".
set name=%~n0
set test_name=%name:~6%
call "%~dp0write" %HEXLINE% %test_name% && exit /b 0 || exit /b 1

endlocal
