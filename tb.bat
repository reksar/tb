@echo off
rem  --------------------------------------------------------------------------
rem  Translates {hexline} to bytes and *appends* them to {outfile}:
rem
rem    tb {hexline} {outfile}
rem
rem    tb x00x46x6Fx6FxFF file.bin
rem
rem  This is a port of UNIX-like `echo -n -e '\x00\x46\x6F\x6F\xFF' > file.bin`
rem  for Windows.
rem
rem  The main idea is to use `copy /b <byte>.bin + {outfile} {outfile}` for
rem  appending a byte to {outfile}. This requires an "alphabet" of bin files,
rem  where each file contains one specific byte value in range [0x00..0xFF].
rem  So the bin "alphabet" should consist of 256 files. To reduce the number of
rem  these files and, perhaps, to improve performance, there are some
rem  *charsets* used to write a byte value represented as a char when possible.
rem
rem  NOTE: it is recommended to edit this file using a single-byte encoding to
rem  prevent the `ANSI` var value from being incorrectly encoded.
rem  --------------------------------------------------------------------------

setlocal DisableDelayedExpansion

set hexline=%~1
set outfile=%~2
if "%hexline%" == "" exit /b 1
if "%outfile%" == "" exit /b 2

set /a MAX_BYTE=255
set /a xHH_LENGTH=3


rem  --- Charsets {{{
rem
rem  For writing most byte values as a text char with `:WRITE_CHAR` method,
rem  that is more efficient than `:WRITE_BYTE`.
rem
rem  The ASCII `"` and `=` chars cannot be written with `:WRITE_CHAR` method,
rem  so we split the printable ASCII charset by these chars into two parts,
rem  that can be written with `:WRITE_CHAR` method. Other printable ASCII chars
rem  will be written with `:WRITE_BYTE` method.
rem
rem  NOTE: some chars in the `ASCII_1` and `ASCII_2` values are escaped, but
rem  the escape chars are not included in the total length.

set DIGITS=0123456789
set LATIN_UPPER=ABCDEFGHIJKLMNOPQRSTUVWXYZ
set LATIN_LOWER=abcdefghijklmnopqrstuvwxyz

set /a ASCII_1_START=35
set /a ASCII_1_END=60
set ASCII_1=#$%%^&'()*+,-./%DIGITS%:;^<

set /a ASCII_2_START=62
set /a ASCII_2_END=126
set ASCII_2=^>?@%LATIN_UPPER%[\]^^_`%LATIN_LOWER%{^|}~

rem  NOTE: 0xFF is excluded, because it behaves like 0x00 in some encodings.
set /a ANSI_START=128
set /a ANSI_END=254
set ANSI=€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþ
rem  }}}


rem  --- Translate hexline to bytes {{{
set bytes=
set /a bytecount=0
set /a xHH_idx=-%xHH_LENGTH%

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


rem  --- Write bytes {{{
:WRITE_BYTES
if not exist "%outfile%" type NUL > "%outfile%"
set /a byte_idx=0

:NEXT_BYTE
set /a byte_idx+=1

setlocal EnableDelayedExpansion
set /a byte=!bytes[%byte_idx%]!
endlocal & set /a byte=%byte%

rem  NOTE: set `charset_name` and `char_idx` outside of an `if` statement.

set charset_name=ANSI
set /a char_idx=%byte%-%ANSI_START%
if %byte% GEQ %ANSI_START% (
  if %byte% LEQ %ANSI_END% (
    goto :WRITE_CHAR
  )
)
set charset_name=ASCII_2
set /a char_idx=%byte%-%ASCII_2_START%
if %byte% GEQ %ASCII_2_START% (
  if %byte% LEQ %ASCII_2_END% (
    goto :WRITE_CHAR
  )
)
set charset_name=ASCII_1
set /a char_idx=%byte%-%ASCII_1_START%
if %byte% GEQ %ASCII_1_START% (
  if %byte% LEQ %ASCII_1_END% (
    goto :WRITE_CHAR
  )
)

:WRITE_BYTE
copy /b /y "%outfile%" + "%~dp0bytes\%byte%.bin" "%outfile%" > NUL
goto :WRITTEN

:WRITE_CHAR
setlocal EnableDelayedExpansion
set charset=!%charset_name%!
rem  NOTE: the qoutes allow the `&` char to be handled correctly.
set "char=!charset:~%char_idx%,1!"
endlocal & set "char=%char%"
< NUL set /p "=%char%" >> "%outfile%"

:WRITTEN
if %byte_idx% LSS %bytecount% goto :NEXT_BYTE
rem  }}}


exit /b 0
endlocal
