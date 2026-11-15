@echo off
set SCRIPT_DIR=%~dp0
if exist "%SCRIPT_DIR%volt-charge\run.bat" (
    call "%SCRIPT_DIR%volt-charge\run.bat"
) else (
    call "%SCRIPT_DIR%run.bat"
)
