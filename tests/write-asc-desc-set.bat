@echo off
setlocal

rem  --------------------------------------------------------------------------
rem  Writes the ordered set (ascending and descending) of the entire hex
rem  triplets range.
rem  --------------------------------------------------------------------------

rem [x00 .. xFF, xFF .. x00]
set HEXLINE=x00x01x02x03x04x05x06x07x08x09x0Ax0Bx0Cx0Dx0Ex0Fx10x11x12x13x14x15
set HEXLINE=%HEXLINE%x16x17x18x19x1Ax1Bx1Cx1Dx1Ex1Fx20x21x22x23x24x25x26x27x28
set HEXLINE=%HEXLINE%x29x2Ax2Bx2Cx2Dx2Ex2Fx30x31x32x33x34x35x36x37x38x39x3Ax3B
set HEXLINE=%HEXLINE%x3Cx3Dx3Ex3Fx40x41x42x43x44x45x46x47x48x49x4Ax4Bx4Cx4Dx4E
set HEXLINE=%HEXLINE%x4Fx50x51x52x53x54x55x56x57x58x59x5Ax5Bx5Cx5Dx5Ex5Fx60x61
set HEXLINE=%HEXLINE%x62x63x64x65x66x67x68x69x6Ax6Bx6Cx6Dx6Ex6Fx70x71x72x73x74
set HEXLINE=%HEXLINE%x75x76x77x78x79x7Ax7Bx7Cx7Dx7Ex7Fx80x81x82x83x84x85x86x87
set HEXLINE=%HEXLINE%x88x89x8Ax8Bx8Cx8Dx8Ex8Fx90x91x92x93x94x95x96x97x98x99x9A
set HEXLINE=%HEXLINE%x9Bx9Cx9Dx9Ex9FxA0xA1xA2xA3xA4xA5xA6xA7xA8xA9xAAxABxACxAD
set HEXLINE=%HEXLINE%xAExAFxB0xB1xB2xB3xB4xB5xB6xB7xB8xB9xBAxBBxBCxBDxBExBFxC0
set HEXLINE=%HEXLINE%xC1xC2xC3xC4xC5xC6xC7xC8xC9xCAxCBxCCxCDxCExCFxD0xD1xD2xD3
set HEXLINE=%HEXLINE%xD4xD5xD6xD7xD8xD9xDAxDBxDCxDDxDExDFxE0xE1xE2xE3xE4xE5xE6
set HEXLINE=%HEXLINE%xE7xE8xE9xEAxEBxECxEDxEExEFxF0xF1xF2xF3xF4xF5xF6xF7xF8xF9
set HEXLINE=%HEXLINE%xFAxFBxFCxFDxFExFFxFFxFExFDxFCxFBxFAxF9xF8xF7xF6xF5xF4xF3
set HEXLINE=%HEXLINE%xF2xF1xF0xEFxEExEDxECxEBxEAxE9xE8xE7xE6xE5xE4xE3xE2xE1xE0
set HEXLINE=%HEXLINE%xDFxDExDDxDCxDBxDAxD9xD8xD7xD6xD5xD4xD3xD2xD1xD0xCFxCExCD
set HEXLINE=%HEXLINE%xCCxCBxCAxC9xC8xC7xC6xC5xC4xC3xC2xC1xC0xBFxBExBDxBCxBBxBA
set HEXLINE=%HEXLINE%xB9xB8xB7xB6xB5xB4xB3xB2xB1xB0xAFxAExADxACxABxAAxA9xA8xA7
set HEXLINE=%HEXLINE%xA6xA5xA4xA3xA2xA1xA0x9Fx9Ex9Dx9Cx9Bx9Ax99x98x97x96x95x94
set HEXLINE=%HEXLINE%x93x92x91x90x8Fx8Ex8Dx8Cx8Bx8Ax89x88x87x86x85x84x83x82x81
set HEXLINE=%HEXLINE%x80x7Fx7Ex7Dx7Cx7Bx7Ax79x78x77x76x75x74x73x72x71x70x6Fx6E
set HEXLINE=%HEXLINE%x6Dx6Cx6Bx6Ax69x68x67x66x65x64x63x62x61x60x5Fx5Ex5Dx5Cx5B
set HEXLINE=%HEXLINE%x5Ax59x58x57x56x55x54x53x52x51x50x4Fx4Ex4Dx4Cx4Bx4Ax49x48
set HEXLINE=%HEXLINE%x47x46x45x44x43x42x41x40x3Fx3Ex3Dx3Cx3Bx3Ax39x38x37x36x35
set HEXLINE=%HEXLINE%x34x33x32x31x30x2Fx2Ex2Dx2Cx2Bx2Ax29x28x27x26x25x24x23x22
set HEXLINE=%HEXLINE%x21x20x1Fx1Ex1Dx1Cx1Bx1Ax19x18x17x16x15x14x13x12x11x10x0F
set HEXLINE=%HEXLINE%x0Ex0Dx0Cx0Bx0Ax09x08x07x06x05x04x03x02x01x00

rem  The %name% of this script is expected to be "write-%test_name%".
set name=%~n0
set test_name=%name:~6%
call "%~dp0write" %HEXLINE% %test_name% && exit /b 0 || exit /b 1

endlocal
