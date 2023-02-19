@echo off

setlocal

set hexline=%~1
set name=%~2

if "%name%" == "" exit /b 1

call :ENSURE_TRB_PATH

set "TEST_DIR=%~dp0result"
set "outfile=%TEST_DIR%\%name%.bin"
set "logfile=%TEST_DIR%\%name%.log"

if not exist "%TEST_DIR%" mkdir "%TEST_DIR%"
if exist "%outfile%" del "%outfile%"

echo %hexline% > "%logfile%"

set start_time=%TIME%
call trb %hexline% "%outfile%"
set end_time=%TIME%

for /f %%i in ('call "%~dp0msdiff" "%start_time%" "%end_time%"') do (
  echo %%i ms >> "%logfile%"
)

exit
endlocal


:ENSURE_TRB_PATH
rem  --------------------------------------------------------------------------
rem  If the `trb` cmd is not available, adds the `trb` root dir to %PATH%.
rem
rem  NOTE: avoid of using `where`, because it is alias for the `powershell` and
rem  may not be available on some Windows configurations.
rem  --------------------------------------------------------------------------
setlocal

rem  We should get this exit code by running `trb` without {outfile}.
set ERR_NO_OUTFILE=2

rem  Provoking the %ERR_NO_OUTFILE%.
trb x > NUL 2>&1

if not "%ExitCode%" == "%ERR_NO_OUTFILE%" (
  rem  We did not get the expected error, so assume that the `trb` is not
  rem  available.
  for /f "delims=" %%i in ('call "%~dp0abspath" "%~dp0.."') do (
    set "PATH=%PATH%;%%i"
  )
)
endlocal & (
  set "PATH=%PATH%"
  exit /b 0
)
