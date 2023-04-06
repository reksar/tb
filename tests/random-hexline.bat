@echo off
setlocal EnableDelayedExpansion

rem  --------------------------------------------------------------------------
rem  Generates %hexline% of {bytecount} "xHH" triplets representing a random
rem  byte in the range {min_byte} .. {max_byte}:
rem
rem    random-hexline {bytecount} {min_byte} {max_byte}
rem
rem  NOTE: It is recommended to set the {bytecount} no more than 2000.
rem  The max length of a cmd line is 8191 chars. A hexline consists of a hex
rem  triplets. Each triplet "xHH" represents a byte. So the {bytecount} limit
rem  is 8191 / 3 = 2730, but this raw value doesn't include the length of the
rem  other cmd parts.
rem  See https://learn.microsoft.com/en-us/troubleshoot/windows-client/shell-experience/command-line-string-limitation
rem
rem  NOTE: When the length of the produced hexline is over the limit, then
rem  `echo`ing truncates the hexline to the length limit.
rem
rem  NOTE: Generates ~ 55 byte / s
rem  --------------------------------------------------------------------------

set /a bytecount=%~1
set /a min_byte=%~2
set /a max_byte=%~3

if %bytecount% LEQ 0 exit /b 1
if %min_byte% LSS 0 exit /b 2
if %max_byte% LSS %min_byte% exit /b 3
if %max_byte% GTR 255 exit /b 4

rem  Max short int + 1
set /a MAX_RANDOM=32768

set /a diff=%max_byte%-%min_byte%+1

set hexline=

for /l %%i in (1,1,%bytecount%) do (
  set /a byte=%min_byte%+%diff%*!RANDOM!/%MAX_RANDOM%
  cmd /c exit !byte!
  set hex=!=ExitCode!
  set hexline=!hexline!x!hex:~-2,2!
)

echo %hexline%
exit /b 0

endlocal
