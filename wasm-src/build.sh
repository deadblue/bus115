#!/bin/sh

GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o background/wasm/ras.wasm main.go
