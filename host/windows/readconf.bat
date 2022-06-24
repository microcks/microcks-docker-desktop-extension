@ECHO OFF

:: Prints the extension configuration to stdout (in JSON format).

set HOME_DIR=%USERPROFILE%\.microcks-docker-desktop-extension
set CONF_FILE=%HOME_DIR%\microcks-docker-desktop-extension.conf

type %CONF_FILE%