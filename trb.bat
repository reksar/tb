@echo off

rem  --------------------------------------------------------------------------
rem  Translates {hexline} to bytes and *appends* them to {outfile}:
rem
rem    trb {hexline} {outfile}
rem
rem    trb x00x46x6Fx6FxFF file.bin
rem
rem  This is a port of UNIX-like `echo -n -e '\x00\x46\x6F\x6F\xFF' > file.bin`
rem  for Windows.
rem
rem  NOTE: it is recommended to edit this file using a single-byte encoding to
rem  prevent the `ANSI` var value from being incorrectly encoded.
rem  --------------------------------------------------------------------------

setlocal
set hexline=%~1
set outfile=%~2
if "%hexline%" == "" exit /b 1
if "%outfile%" == "" exit /b 2
if not exist "%outfile%" type NUL > "%outfile%"

rem  Charsets {{{

rem  To writing most of byte values as a text chars with `:WRITE_CHAR` method,
rem  that is more efficient than `:WRITE_BYTE`.

rem  The ASCII `"` and `=` chars cannot be written with `:WRITE_CHAR` method,
rem  so we split the printable ASCII charset by these chars into two parts,
rem  that can be written with `:WRITE_CHAR` method. Other printable ASCII chars
rem  will be written with `:WRITE_BYTE` method.

rem  NOTE: some chars in the `ASCII_1` and `ASCII_2` values are escaped, but
rem  the escape chars are not included in the total length.

set DIGITS=0123456789
set LATIN_UPPER=ABCDEFGHIJKLMNOPQRSTUVWXYZ
set LATIN_LOWER=abcdefghijklmnopqrstuvwxyz

set ASCII_1_START=35
set ASCII_1_END=60
set ASCII_1=#$%%^&'()*+,-./%DIGITS%:;^<

set ASCII_2_START=62
set ASCII_2_END=126
set ASCII_2=^>?@%LATIN_UPPER%[\]^^_`%LATIN_LOWER%{^|}~

rem  NOTE: xFF is excluded, because it behaves like x00 in some encodings.
set ANSI_START=128
set ANSI_END=254
set ANSI=€‚ƒ„…†‡ˆ‰Š‹Œ‘’“”•–—˜™š›œŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖ×ØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğñòóôõö÷øùúûüış

rem  }}}

set MAX_BYTE=255
set xHH_LENGTH=3
set xHH_idx=-%xHH_LENGTH%

:NEXT_xHH
set /a xHH_idx+=%xHH_LENGTH%
call :SET_xHH %xHH_idx%

if "%xHH%" == "" exit /b 0

rem  TODO: replace with `findstr` and meause the running time.
if not "%xHH:~0,1%" == "x" (
  echo [ERR][%~n0] Invalid hex value at index %xHH_idx%!
  exit /b 3
)
rem  TODO: Check 1st and 2nd chars.
rem  TODO: use %xHH_LENGTH% as index.
if not "%xHH:~3,1%" == "" (
  echo [ERR][%~n0] Hex value is too long at index %xHH_idx%!
  exit /b 6
)

set /a byte=0%xHH%

if %byte% LSS 0 (
  echo [ERR][%~n0] Invalid byte value at index %xHH_idx%!
  exit / 7
)
if %byte% GTR %MAX_BYTE% (
  echo [ERR][%~n0] Invalid byte value at index %xHH_idx%!
  exit / 8
)

rem  NOTE: calc `char_idx` outside of an `if` statement.
set /a char_idx=%byte%-%ANSI_START%
if %byte% GEQ %ANSI_START% (
  if %byte% LEQ %ANSI_END% (
    call :SET_CHAR ANSI %char_idx%
    goto :WRITE_CHAR
  )
)
set /a char_idx=%byte%-%ASCII_2_START%
if %byte% GEQ %ASCII_2_START% (
  if %byte% LEQ %ASCII_2_END% (
    call :SET_CHAR ASCII_2 %char_idx%
    goto :WRITE_CHAR
  )
)
set /a char_idx=%byte%-%ASCII_1_START%
if %byte% GEQ %ASCII_1_START% (
  if %byte% LEQ %ASCII_1_END% (
    call :SET_CHAR ASCII_1 %char_idx%
    goto :WRITE_CHAR
  )
)
goto :WRITE_BYTE


:WRITE_CHAR
< NUL set /p "=%char%" >> "%outfile%"
goto :NEXT_xHH


:WRITE_BYTE
copy /b /y "%outfile%" + "%~dp0bytes\%byte%.bin" "%outfile%" > NUL
goto :NEXT_xHH


echo [ERR][%~n0] Out of the main loop!
exit /b 9
endlocal


:SET_xHH
setlocal EnableDelayedExpansion
set xHH_idx=%~1
set xHH=!hexline:~%xHH_idx%,%xHH_LENGTH%!
endlocal & (
  set xHH=%xHH%
  exit /b 0
)


:SET_CHAR
setlocal EnableDelayedExpansion
set charset_name=%~1
set char_idx=%~2
set charset=!%charset_name%!
rem  NOTE: the qoutes allow the `&` char to be handled correctly.
set "char=!charset:~%char_idx%,1!"
endlocal & (
  set "char=%char%"
  exit /b 0
)
