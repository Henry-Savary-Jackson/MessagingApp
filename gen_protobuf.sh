#!/bin/bash

cd frontend

./node_modules/.bin/pbjs -t static-module -w commonjs -o src/utils/protocol/messages.js ../messages.proto

cd ..

protoc --java_out=./src/main/java messages.proto