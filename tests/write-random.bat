@echo off
rem  --------------------------------------------------------------------------
rem  Generates and writes %hexline% of {bytes_total} random bytes, where each
rem  byte value is in the range {min_byte} .. {max_byte}:
rem
rem    write-random {bytes_total} {name} {min_byte} {max_byte}
rem
rem  --------------------------------------------------------------------------
setlocal
set /a bytes_total=%~1
set name=%~2
set /a min_byte=%~3
set /a max_byte=%~4

if %bytes_total% LEQ 0 exit /b 2
if %max_byte% LSS %min_byte% exit /b 3
if %min_byte% LSS 0 exit /b 4
if %max_byte% GTR 255 exit /b 5

call :GENERATE_HEXLINE
call "%~dp0write" %hexline% %name% && exit /b 0 || exit /b 1
endlocal


:GENERATE_HEXLINE
rem  --------------------------------------------------------------------------
rem  Separated subroutine in order to narrow the `EnableDelayedExpansion` block
rem  and allow to expand other vars correctly, e.g. the `!` char in paths.
rem  --------------------------------------------------------------------------
setlocal EnableDelayedExpansion
rem  Max short int value + 1.
set /a MAX_RANDOM=32768
set /a diff=%max_byte%-%min_byte%+1
set hexline=
for /l %%i in (1,1,%bytes_total%) do (
  set /a byte=%min_byte%+%diff%*!RANDOM!/%MAX_RANDOM%
  cmd /c exit !byte!
  set hex=!=ExitCode!
  set hexline=!hexline!x!hex:~-2,2!
)
endlocal & (
  set hexline=%hexline%
  exit /b 0
)
