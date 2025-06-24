#!/bin/bash

# Function to play notification sound
play_notification() {
    if command -v paplay &> /dev/null; then
        paplay /usr/share/sounds/alsa/Front_Left.wav 2>/dev/null || echo -e '\a'
    elif command -v aplay &> /dev/null; then
        aplay /usr/share/sounds/alsa/Front_Left.wav 2>/dev/null || echo -e '\a'
    elif command -v afplay &> /dev/null; then  # macOS
        afplay /System/Library/Sounds/Glass.aiff 2>/dev/null || echo -e '\a'
    else
        echo -e '\a'  # Terminal bell as fallback
    fi
}

# Run the command
if [ $# -eq 0 ]; then
    claude
    exit_code=$?
else
    "$@"
    exit_code=$?
fi

# Play notification when done
play_notification

exit $exit_code