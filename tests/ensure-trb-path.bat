@echo off

rem  --------------------------------------------------------------------------
rem  If the `trb` cmd is not available, adds the `trb` dir abs path to %PATH%.
rem
rem  NOTE: avoid of using `where`, because it is alias for the `powershell` and
rem  may not be available on some Windows configurations.
rem  --------------------------------------------------------------------------

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
