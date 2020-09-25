#!/usr/bin/env bash
if [ ! -f "docker-compose.prod.yml" ];
    then echo "No 'docker-compose.prod.yml' file found in project root!";
    exit 1;
fi;

APP_ENV=prod docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build $@;