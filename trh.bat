:: Translates bytes from a %hexline% to %outfile%, for example:
::
::   trh "0x800xA00xFA" "file.bin"
::
:: A %hexline% must be a chain of "0xHH" values, where `H` is an uppercase hex
:: digit. All values must be in range [0x80..0xFF].

:: FIXME: issues with 0xFD and 0xFF.

@echo off

chcp 437 >NUL

set hexline=%~1
set outfile=%~2

:: NOTE: the max length of the `cmd /c` arg is 253 chars, so total length of
:: %hexline% and %outfile% must be not exceed ~230 chars!
forfiles /p "%~dp0." /m "%~nx0" /c "cmd /c <NUL set/p=%hexline%>>\"%outfile%\""
