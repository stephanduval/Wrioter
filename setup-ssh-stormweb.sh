#!/bin/bash

# SSH Setup Script for StormWeb
# This script helps establish SSH key authentication with StormWeb server

SERVER_HOST="23.180.104.108"
SSH_USER="sduval"
SSH_PASSWORD="iGot9MS49NhVzGJQ0c4G"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}StormWeb SSH Setup${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""

# Step 1: Add server to known hosts
echo -e "${YELLOW}Step 1: Adding server to known hosts...${NC}"
ssh-keyscan -H $SERVER_HOST >> ~/.ssh/known_hosts 2>/dev/null
echo "Server added to known hosts"

# Step 2: Copy SSH key to server
echo -e "${YELLOW}Step 2: Copying SSH key to server...${NC}"
echo "You will be prompted for the password."
echo "Password is: ${SSH_PASSWORD}"
echo ""

# Use sshpass if available, otherwise use ssh-copy-id
if command -v sshpass &> /dev/null; then
    echo "Using sshpass for automatic authentication..."
    sshpass -p "$SSH_PASSWORD" ssh-copy-id -o StrictHostKeyChecking=no ${SSH_USER}@${SERVER_HOST}
else
    echo "Please enter this password when prompted: ${SSH_PASSWORD}"
    ssh-copy-id ${SSH_USER}@${SERVER_HOST}
fi

# Step 3: Test connection
echo ""
echo -e "${YELLOW}Step 3: Testing SSH connection...${NC}"
ssh -o BatchMode=yes -o ConnectTimeout=5 ${SSH_USER}@${SERVER_HOST} "echo 'SSH key authentication successful!'" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSH setup complete! You can now deploy using:${NC}"
    echo "   yarn stormweb:deploy"
    echo ""
    echo -e "${GREEN}To connect manually:${NC}"
    echo "   ssh ${SSH_USER}@${SERVER_HOST}"
else
    echo -e "${RED}⚠️  SSH key authentication test failed.${NC}"
    echo ""
    echo "Please try manual setup:"
    echo "1. Run: ssh-copy-id ${SSH_USER}@${SERVER_HOST}"
    echo "2. Enter password: ${SSH_PASSWORD}"
    echo "3. Test: ssh ${SSH_USER}@${SERVER_HOST}"
    echo ""
    echo "If you still have issues, check:"
    echo "- Is your SSH key in ~/.ssh/id_rsa.pub?"
    echo "- Is the server accepting key authentication?"
    echo "- Check CloudPanel SSH settings"
fi