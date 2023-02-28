@echo off

rem  --------------------------------------------------------------------------
rem  Generates %hexline% of {bytecount} bytes, where each byte has a random
rem  value in the range {min_byte} .. {max_byte}:
rem
rem    random-hexline {bytecount} {min_byte} {max_byte}
rem
rem  --------------------------------------------------------------------------

setlocal EnableDelayedExpansion

set /a bytecount=%~1
set /a min_byte=%~2
set /a max_byte=%~3

if %bytecount% LEQ 0 exit /b 1
if %min_byte% LSS 0 exit /b 2
if %max_byte% LSS %min_byte% exit /b 3
if %max_byte% GTR 255 exit /b 4

rem  Max short int value + 1.
set /a MAX_RANDOM=32768

set hexline=
set /a diff=%max_byte%-%min_byte%+1
for /l %%i in (1,1,%bytecount%) do (
  set /a byte=%min_byte%+%diff%*!RANDOM!/%MAX_RANDOM%
  cmd /c exit !byte!
  set hex=!=ExitCode!
  set hexline=!hexline!x!hex:~-2,2!
)
echo %hexline%

exit /b 0
endlocal
