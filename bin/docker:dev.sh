#!/usr/bin/env bash
if [ ! -f "docker-compose.dev.yml" ];
    then echo "No 'docker-compose.dev.yml' file found in project root!";
    exit 1;
fi;

APP_ENV=dev docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build --remove-orphans $@;