@echo off

rem  --------------------------------------------------------------------------
rem  Echoes the time difference {start_time} - {end_time} in milliseconds:
rem
rem    msdiff "{start_time}" "{end_time}"
rem
rem  NOTE: the time must be in the format of the standard %TIME% var and must
rem  be quoted when passed as an argument, otherwise milliseconds value will be
rem  missed because of the comma.
rem
rem  NOTE: `set /a` treats a multi-digit number where the first digit is 0 as
rem  octal. Thus a time part 08 or 09 gives an error. For this case, there is a
rem  second statement after `||`.
rem  --------------------------------------------------------------------------

setlocal

set start_time=%~1
set end_time=%~2

set /a HR_PER_DAY=24
set /a TIME_BASE=60
set /a MILLI=100
set /a ms_per_min=%MILLI%*%TIME_BASE%
set /a ms_per_hr=%ms_per_min%*%TIME_BASE%
set /a ms_per_day=%ms_per_hr%*%HR_PER_DAY%

set /a start_hr=%start_time:~0,2% 2>NUL || set /a start_hr=%start_time:~1,1%
set /a start_min=%start_time:~3,2% 2>NUL || set /a start_min=%start_time:~4,1%
set /a start_s=%start_time:~6,2% 2>NUL || set /a start_s=%start_time:~7,1%
set /a start_ms=%start_time:~9,2% 2>NUL || set /a start_ms=%start_time:~10,1%
set /a start_ms+=%start_s%*%MILLI%
set /a start_ms+=%start_min%*%ms_per_min%
set /a start_ms+=%start_hr%*%ms_per_hr%

set /a end_hr=%end_time:~0,2% 2>NUL || set /a end_hr=%end_time:~1,1%
set /a end_min=%end_time:~3,2% 2>NUL || set /a end_min=%end_time:~4,1%
set /a end_s=%end_time:~6,2% 2>NUL || set /a end_s=%end_time:~7,1%
set /a end_ms=%end_time:~9,2% 2>NUL || set /a end_ms=%end_time:~10,1%
set /a end_ms+=%end_s%*%MILLI%
set /a end_ms+=%end_min%*%ms_per_min%
set /a end_ms+=%end_hr%*%ms_per_hr%

if %end_ms% LSS %start_ms% set /a end_ms+=%ms_per_day%

set /a ms_diff=%end_ms%-%start_ms%

echo %ms_diff%

endlocal
