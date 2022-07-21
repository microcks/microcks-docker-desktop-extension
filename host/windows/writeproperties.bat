@ECHO OFF

:: Gets Microcks app configs (in properties format) as 2 arguments and write em to the properties file.

set CONFIG_DIR=%USERPROFILE%\.microcks-docker-desktop-extension\config
set APPLICATION_PROPERTIES_FILE=%CONFIG_DIR%\application.properties
set FEATURES_PROPERTIES_FILE=%CONFIG_DIR%\features.properties

copy %~dp0\application.properties %APPLICATION_PROPERTIES_FILE%
copy %~dp0\features.properties %FEATURES_PROPERTIES_FILE%