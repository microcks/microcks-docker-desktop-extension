#!/bin/bash

# Prepare the required folders for storing microcks config and data.

HOME_DIR=~/.microcks-docker-desktop-extension
CONF_DIR=$HOME_DIR/config
DATA_DIR=$HOME_DIR/data

mkdir -p $HOME_DIR
mkdir -p $CONF_DIR
mkdir -p $DATA_DIR