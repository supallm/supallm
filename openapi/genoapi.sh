#!/bin/sh
set -e

mkdir -p gen

oapi-codegen --config=./config-types.yaml ./spec.yaml
oapi-codegen --config=./config-server.yaml ./spec.yaml
