@echo off

rem  --------------------------------------------------------------------------
rem  Translates {hexline} to bytes and *appends* them to {outfile}:
rem
rem    tb [hexline] [outfile]
rem
rem    tb x00x46x6Fx6FxFF file.bin
rem
rem  This is a port of UNIX-like `echo -n -e '\x00\x46\x6F\x6F\xFF' > file.bin`
rem  for Windows.
rem
rem  The idea is to use `copy /b bytes\<byte>.bin + [outfile] [outfile]` for
rem  appending a <byte> [0 .. 255] to `[outfile]`.
rem  --------------------------------------------------------------------------

rem  NOTE: `DisableDelayedExpansion` to process some path symbols correctly,
rem  e.g. `!`.
setlocal DisableDelayedExpansion

set hexline=%~1
set outfile=%~2
if "%hexline%" == "" exit /b 1
if "%outfile%" == "" exit /b 2


rem  --- Translate hexline to bytes {{{

set /a MAX_BYTE=255
set /a xHH_LENGTH=3
set /a xHH_idx=-%xHH_LENGTH%
set /a bytecount=0
set bytes=

:NEXT_xHH

set /a xHH_idx+=%xHH_LENGTH%

setlocal EnableDelayedExpansion
set xHH=!hexline:~%xHH_idx%,%xHH_LENGTH%!
endlocal & set xHH=%xHH%

if "%xHH%" == "" goto :WRITE_BYTES

set /a byte=0%xHH% 2>NUL || (
  echo [ERR][%~n0] Unable to get byte value at index %xHH_idx%
  exit /b 3
)
if %byte% GTR %MAX_BYTE% (
  echo [ERR][%~n0] Invalid byte value at index %xHH_idx%
  exit /b 4
)
if %byte% LSS 0 (
  echo [ERR][%~n0] Invalid byte value at index %xHH_idx%
  exit /b 5
)

set /a bytecount+=1
set bytes[%bytecount%]=%byte%
goto :NEXT_xHH
rem  }}}


:WRITE_BYTES
rem  {{{
if not exist "%outfile%" type NUL > "%outfile%"
set /a byte_idx=0

:NEXT_BYTE

set /a byte_idx+=1

setlocal EnableDelayedExpansion
set /a byte=!bytes[%byte_idx%]!
endlocal & set /a byte=%byte%

copy /b /y "%outfile%" + "%~dp0bytes\%byte%.bin" "%outfile%" > NUL

if %byte_idx% LSS %bytecount% goto :NEXT_BYTE
rem  }}}


exit /b 0
endlocal
