@echo off

rem  --------------------------------------------------------------------------
rem  Echoes the time difference {start_time} - {end_time} in milliseconds:
rem
rem    msdiff {start_time} {end_time}
rem
rem  NOTE: the time must be passed in the format of the standard %TIME% var.
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

set /a start_hr=%start_time:~0,2%
set /a start_min=%start_time:~3,2%
set /a start_ms=%start_time:~-5,2%%start_time:~-2,2%
set /a start_ms+=%start_min%*%ms_per_min%+%start_hr%*%ms_per_hr%

set /a end_hr=%end_time:~0,2%
set /a end_min=%end_time:~3,2%
set /a end_ms=%end_time:~-5,2%%end_time:~-2,2%
set /a end_ms+=%end_min%*%ms_per_min%+%end_hr%*%ms_per_hr%

if %end_ms% LSS %start_ms% set /a end_ms+=%ms_per_day%

set /a ms_diff=%end_ms%-%start_ms%

echo %ms_diff%

endlocal
