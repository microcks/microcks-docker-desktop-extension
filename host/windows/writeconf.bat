@ECHO OFF

:: Gets Microcks configuration (in JSON format) as an argument and writes it to the configuration file.

set HOME_DIR=%USERPROFILE%\.microcks-docker-desktop-extension
set CONF_FILE=%HOME_DIR%\microcks-docker-desktop-extension.conf

if not exist %HOME_DIR% mkdir %HOME_DIR%
echo %* > %CONF_FILE%