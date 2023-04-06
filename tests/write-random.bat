@echo off
setlocal

rem  --------------------------------------------------------------------------
rem  Writes hexline of %BYTECOUNT% random triplets in range
rem  [%MIN_BYTE% .. %MAX_BYTE%].
rem
rem  NOTE: Uses the `random-hexline.bat` generator, which limits %BYTECOUNT%
rem  to 2000. It is also rather slow. But it is more native and can work when
rem  MS JScript does not.
rem  --------------------------------------------------------------------------

set BYTECOUNT=512
set MIN_BYTE=0
set MAX_BYTE=255

set root=%~dp0

set generate_hexline="%root%random-hexline" %bytecount% %min_byte% %max_byte%
for /f %%i in ('call %generate_hexline%') do set hexline=%%i

rem  The %name% of this script is expected to be "write-%test_name%".
set name=%~n0
set test_name=%name:~6%
call "%root%write" %hexline% %test_name% && exit /b 0 || exit /b 1

endlocal
