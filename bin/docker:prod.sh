#!/usr/bin/env bash
if [ ! -f "docker-compose.yml" ];
    then echo "No 'docker-compose.yml' file found in project root!";
    exit 1;
fi;

APP_ENV=production docker-compose -f docker-compose.yml up --build $@;