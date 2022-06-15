#!/bin/bash

# Gets Microcks app configs (in properties format) as 2 arguments and write em to the properties file.

CONFIG_DIR=~/.microcks-docker-desktop-extension/config
APPLICATION_PROPERTIES_FILE=$CONFIG_DIR/application.properties
FEATURES_PROPERTIES_FILE=$CONFIG_DIR/features.properties

printf $1 > $APPLICATION_PROPERTIES_FILE
printf $2 > $FEATURES_PROPERTIES_FILE