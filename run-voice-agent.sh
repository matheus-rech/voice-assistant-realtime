#!/bin/bash

# Get the room name from the command line argument or use a default
ROOM_NAME=${1:-"test-room"}

echo "Starting voice assistant agent for room: $ROOM_NAME using new method"

# Run the new agent builder script
node scripts/build-and-run-agent.js $ROOM_NAME