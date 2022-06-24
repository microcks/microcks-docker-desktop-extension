@ECHO OFF

:: Gets Microcks app configs (in properties format) as 2 arguments and write em to the properties file.

set CONFIG_DIR=%USERPROFILE%\.microcks-docker-desktop-extension\configs
set APPLICATION_PROPERTIES_FILE=%CONFIG_DIR%\application.properties
set FEATURES_PROPERTIES_FILE=%CONFIG_DIR%\features.properties

echo %1 > %APPLICATION_PROPERTIES_FILE%
echo %2 > %FEATURES_PROPERTIES_FILE%