@echo off

setlocal

set TEST_NAME=test-random
set "TEST_DIR=%~dp0test"
set "OUTFILE=%TEST_DIR%\%TEST_NAME%.bin"
set "LOGFILE=%TEST_DIR%\%TEST_NAME%.log"

rem  Amount of random bytes to generate.
set /a BYTES_TOTAL=100

call :GENERATE_RANDOM_HEXLINE

if not exist "%TEST_DIR%" mkdir "%TEST_DIR%"
if exist "%OUTFILE%" del "%OUTFILE%"

echo %hexline% > "%LOGFILE%"
echo %TIME% >> "%LOGFILE%"
call trb %hexline% "%OUTFILE%"
echo %TIME% >> "%LOGFILE%"

exit /b 0
endlocal


:GENERATE_RANDOM_HEXLINE
setlocal EnableDelayedExpansion
set MAX_RANDOM=32767
set MAX_BYTE=255
set hexline=
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
