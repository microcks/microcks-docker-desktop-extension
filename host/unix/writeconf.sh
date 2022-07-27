#!/bin/bash

# Gets Microcks configuration (in JSON format) as an argument and writes it to the configuration file.

HOME_DIR=~/.microcks-docker-desktop-extension
CONFIG_FILE=$HOME_DIR/microcks-docker-desktop-extension.conf

echo "$1" > $CONFIG_FILE