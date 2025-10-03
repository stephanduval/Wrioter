#!/bin/bash

# SSH Key Setup Script for StormWeb
# This script sets up SSH key authentication

echo "Setting up SSH key authentication for StormWeb server..."
echo "Server: 23.180.104.108"
echo "User: sduval"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    sudo apt-get update
    sudo apt-get install -y sshpass
fi

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa.pub ]; then
    echo "No SSH key found. Generating one..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
fi

echo "Your SSH public key is:"
cat ~/.ssh/id_rsa.pub
echo ""

echo "Attempting to copy SSH key to server..."
echo "You'll be prompted for the password: fFX7UehrvJMbiX9b2ox2"
echo ""

# Try with sshpass
sshpass -p "fFX7UehrvJMbiX9b2ox2" ssh-copy-id -o StrictHostKeyChecking=no sduval@23.180.104.108

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH key successfully copied!"
    echo "Testing connection..."
    ssh sduval@23.180.104.108 "echo '✅ SSH key authentication working!'"
else
    echo ""
    echo "❌ Automated copy failed. Trying manual method..."
    echo ""
    echo "Please run this command manually:"
    echo "ssh-copy-id sduval@23.180.104.108"
    echo ""
    echo "When prompted, enter password: fFX7UehrvJMbiX9b2ox2"
    echo ""
    echo "Alternative: If that doesn't work, manually add this key to the server:"
    echo "1. SSH into the server with password"
    echo "2. Run: mkdir -p ~/.ssh && chmod 700 ~/.ssh"
    echo "3. Add the following to ~/.ssh/authorized_keys:"
    cat ~/.ssh/id_rsa.pub
fi