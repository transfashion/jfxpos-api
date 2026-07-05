#!/bin/bash

# Load PORT from .env file or default to 3000
if [ -f .env ]; then
  PORT=$(grep -E '^PORT=' .env | cut -d= -f2 | tr -d '"'\'' ')
fi
PORT=${PORT:-3000}

echo "Checking port $PORT..."

# Find PID using the port
PID=$(lsof -t -i :$PORT 2>/dev/null)

if [ -n "$PID" ]; then
  echo "Port $PORT is already in use by PID $PID. Terminating process..."
  kill -9 $PID
  sleep 1
else
  echo "Port $PORT is free."
fi

echo "Starting service..."
node src/app.js
