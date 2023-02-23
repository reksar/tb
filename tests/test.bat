@echo off
call "%~dp0clean"
call "%~dp0write-all-sorted",
call "%~dp0write-random-ascii",
call "%~dp0write-random-ansi",
call "%~dp0write-random-any",
call "%~dp0write-random-unprintable"
cscript /nologo "%~dp0check-result.js"
