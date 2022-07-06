@ECHO OFF

:: Prepare the required folders for storing microcks config and data.

set HOME_DIR=%USERPROFILE%\.microcks-docker-desktop-extension
set CONF_DIR=%HOME_DIR%\config
set DATA_DIR=%HOME_DIR%\data

if not exist %HOME_DIR% mkdir %HOME_DIR%
if not exist %CONF_DIR% mkdir %CONF_DIR%
if not exist %DATA_DIR% mkdir %DATA_DIR%