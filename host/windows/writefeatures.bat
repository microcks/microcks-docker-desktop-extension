@ECHO OFF

:: Gets Microcks app configs (in properties format) as 2 arguments and write em to the properties file.

set CONFIG_DIR=%USERPROFILE%\.microcks-docker-desktop-extension\config
set FEATURES_PROPERTIES_FILE=%CONFIG_DIR%\features.properties

if not exist %CONFIG_DIR% mkdir %CONFIG_DIR%
set TEXT=%*
set TEXT=%TEXT:"=%
echo %TEXT% > %FEATURES_PROPERTIES_FILE%

set "COMMAND=(Get-Content %FEATURES_PROPERTIES_FILE% | out-string).replace(\"___\", \"`r`n\") | set-content -NoNewLine %FEATURES_PROPERTIES_FILE%"
powershell -command "%COMMAND%"