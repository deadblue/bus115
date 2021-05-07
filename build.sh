#!/bin/sh

GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o src/extension/background/wasm/rsa.wasm src/wasm/main.go
