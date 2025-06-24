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

# Add to bash
if [ -f ~/.bashrc ]; then
    echo "" >> ~/.bashrc
    echo "# Auto notification sound on command completion" >> ~/.bashrc
    echo "play_notification() {" >> ~/.bashrc
    echo "    if command -v paplay &> /dev/null; then" >> ~/.bashrc
    echo "        paplay /usr/share/sounds/alsa/Front_Left.wav 2>/dev/null || echo -e '\a'" >> ~/.bashrc
    echo "    else" >> ~/.bashrc
    echo "        echo -e '\a'" >> ~/.bashrc
    echo "    fi" >> ~/.bashrc
    echo "}" >> ~/.bashrc
    echo "PROMPT_COMMAND=\"play_notification\"" >> ~/.bashrc
    echo "Added notification to ~/.bashrc"
fi

# Add to zsh
if [ -f ~/.zshrc ]; then
    echo "" >> ~/.zshrc
    echo "# Auto notification sound on command completion" >> ~/.zshrc
    echo "play_notification() {" >> ~/.zshrc
    echo "    if command -v paplay &> /dev/null; then" >> ~/.zshrc
    echo "        paplay /usr/share/sounds/alsa/Front_Left.wav 2>/dev/null || echo -e '\a'" >> ~/.zshrc
    echo "    else" >> ~/.zshrc
    echo "        echo -e '\a'" >> ~/.zshrc
    echo "    fi" >> ~/.zshrc
    echo "}" >> ~/.zshrc
    echo "precmd() { play_notification }" >> ~/.zshrc
    echo "Added notification to ~/.zshrc"
fi

echo "Restart your terminal or run 'source ~/.bashrc' or 'source ~/.zshrc' to activate"