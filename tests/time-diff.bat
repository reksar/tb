@echo off
setlocal

rem  --------------------------------------------------------------------------
rem  Echoes the time difference {start_time} - {end_time} in milliseconds:
rem
rem    time-diff "{start_time}" "{end_time}"
rem
rem  NOTE: Passed args must be in the standard %TIME% var format "HH:MM:SS,MS"
rem  and must be quoted because of the comma before the milliseconds.
rem
rem  NOTE: `set /a` treats a number starting with 0 as octal, so 08 and 09
rem  gives an error. There is a second statement after `||` for this case.
rem  --------------------------------------------------------------------------

set start_time=%~1
set end_time=%~2

set /a HH_IN_DAY=24
set /a TIME_BASE=60
set /a MILLI=100
set /a ms_in_mm=%MILLI%*%TIME_BASE%
set /a ms_in_hh=%ms_in_mm%*%TIME_BASE%
set /a ms_in_day=%ms_in_hh%*%HH_IN_DAY%

set /a start_hh=%start_time:~0,2% 2>NUL || set /a start_hh=%start_time:~1,1%
set /a start_mm=%start_time:~3,2% 2>NUL || set /a start_mm=%start_time:~4,1%
set /a start_ss=%start_time:~6,2% 2>NUL || set /a start_ss=%start_time:~7,1%
set /a start_ms=%start_time:~9,2% 2>NUL || set /a start_ms=%start_time:~10,1%
set /a start_ms+=%start_ss%*%MILLI%
set /a start_ms+=%start_mm%*%ms_in_mm%
set /a start_ms+=%start_hh%*%ms_in_hh%

set /a end_hh=%end_time:~0,2% 2>NUL || set /a end_hh=%end_time:~1,1%
set /a end_mm=%end_time:~3,2% 2>NUL || set /a end_mm=%end_time:~4,1%
set /a end_ss=%end_time:~6,2% 2>NUL || set /a end_ss=%end_time:~7,1%
set /a end_ms=%end_time:~9,2% 2>NUL || set /a end_ms=%end_time:~10,1%
set /a end_ms+=%end_ss%*%MILLI%
set /a end_ms+=%end_mm%*%ms_in_mm%
set /a end_ms+=%end_hh%*%ms_in_hh%

if %end_ms% LSS %start_ms% set /a end_ms+=%ms_in_day%

set /a diff_ms=%end_ms%-%start_ms%

echo %diff_ms%

endlocal
