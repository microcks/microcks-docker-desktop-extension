@ECHO OFF

:: Gets Microcks app configs (in properties format) as 2 arguments and write em to the properties file.

set CONFIG_DIR=%USERPROFILE%\.microcks-docker-desktop-extension\config
set APPLICATION_PROPERTIES_FILE=%CONFIG_DIR%\application.properties

if not exist %CONFIG_DIR% mkdir %CONFIG_DIR%
set TEXT=%*
set TEXT=%TEXT:"=%
echo %TEXT% > %APPLICATION_PROPERTIES_FILE%

set "COMMAND=(Get-Content %APPLICATION_PROPERTIES_FILE% | out-string).replace(\"___\", \"`r`n\") | set-content -NoNewLine %APPLICATION_PROPERTIES_FILE%"
powershell -command "%COMMAND%"