@echo off
setlocal
set bytecount=512
set min_byte=128
set max_byte=254

rem  The %name% of this script is expected to be "write-%test_name%".
set name=%~n0
set test_name=%name:~6%
call "%~dp0write-random" %bytecount% %test_name% %min_byte% %max_byte% ^
  && exit /b 0 || exit /b 1
endlocal
