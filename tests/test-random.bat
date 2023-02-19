@echo off

setlocal
set NAME=random
call :GENERATE_HEXLINE
call "%~dp0write-test-hexline" %hexline% %NAME% && exit /b 0 || exit /b 1
endlocal


:GENERATE_HEXLINE
setlocal EnableDelayedExpansion
rem  Amount of random bytes to generate.
set /a BYTES_TOTAL=100
rem  Max short int value.
set /a MAX_RANDOM=32767
set /a MAX_BYTE=255
set hexline=
rem  Generate %hexline% of %BYTES_TOTAL% random bytes.
for /l %%i in (1,1,%BYTES_TOTAL%) do (
  set /a byte=!RANDOM! * %MAX_BYTE% / %MAX_RANDOM% + 1
  cmd /c exit !byte!
  set hex=!=ExitCode!
  set hexline=!hexline!x!hex:~-2,2!
)
endlocal & (
  set hexline=%hexline%
  exit /b 0
)
