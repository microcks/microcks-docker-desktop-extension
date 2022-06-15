#!/bin/bash

# Gets Microcks configuration (in JSON format) as an argument and writes it to the configuration file.

HOME_DIR=~/.microcks-docker-desktop-extension
CONF_FILE=$HOME_DIR/microcks-docker-desktop-extension.conf

printf $1 > $CONFIG_FILE