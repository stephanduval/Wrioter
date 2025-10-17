#!/bin/bash

# Script to check if server is properly configured for Wrioter
# Run this to verify PHP settings before deployment

echo "======================================"
echo "Wrioter Server Configuration Check"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any issues found
ISSUES_FOUND=0

# Function to check PHP setting
check_php_setting() {
    local SETTING=$1
    local EXPECTED=$2
    local ACTUAL=$(php -r "echo ini_get('$SETTING');")

    # Convert to bytes for comparison
    expected_bytes=$(echo $EXPECTED | sed 's/M/*1048576/' | bc 2>/dev/null || echo 0)
    actual_bytes=$(echo $ACTUAL | sed 's/M/*1048576/' | bc 2>/dev/null || echo 0)

    if [ "$actual_bytes" -ge "$expected_bytes" ] || [ "$ACTUAL" = "$EXPECTED" ]; then
        echo -e "${GREEN}✓${NC} $SETTING: $ACTUAL (OK)"
    else
        echo -e "${RED}✗${NC} $SETTING: $ACTUAL (Expected: $EXPECTED)"
        ISSUES_FOUND=1
    fi
}

echo "Checking PHP Configuration..."
echo "------------------------------"

# Check PHP version
PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
echo "PHP Version: $PHP_VERSION"

# Check required PHP settings
check_php_setting "upload_max_filesize" "50M"
check_php_setting "post_max_size" "50M"
check_php_setting "max_execution_time" "300"

echo ""
echo "Checking Laravel Environment..."
echo "------------------------------"

if [ -f ".env" ]; then
    # Check APP_URL
    APP_URL=$(grep "^APP_URL=" .env | cut -d '=' -f 2)
    if [ -n "$APP_URL" ]; then
        echo -e "${GREEN}✓${NC} APP_URL is set: $APP_URL"
    else
        echo -e "${RED}✗${NC} APP_URL is not set"
        ISSUES_FOUND=1
    fi

    # Check SESSION_DOMAIN
    SESSION_DOMAIN=$(grep "^SESSION_DOMAIN=" .env | cut -d '=' -f 2)
    if [ "$SESSION_DOMAIN" != "null" ] && [ -n "$SESSION_DOMAIN" ]; then
        echo -e "${GREEN}✓${NC} SESSION_DOMAIN is set: $SESSION_DOMAIN"
    else
        echo -e "${YELLOW}⚠${NC} SESSION_DOMAIN is not set (may cause auth issues)"
    fi

    # Check SANCTUM_STATEFUL_DOMAINS
    SANCTUM_DOMAINS=$(grep "^SANCTUM_STATEFUL_DOMAINS=" .env | cut -d '=' -f 2)
    if [ -n "$SANCTUM_DOMAINS" ]; then
        echo -e "${GREEN}✓${NC} SANCTUM_STATEFUL_DOMAINS is set"
    else
        echo -e "${YELLOW}⚠${NC} SANCTUM_STATEFUL_DOMAINS is not set (may cause auth issues)"
    fi
else
    echo -e "${RED}✗${NC} .env file not found!"
    ISSUES_FOUND=1
fi

echo ""
echo "Checking File Permissions..."
echo "------------------------------"

# Check storage directory
if [ -w "storage" ] && [ -w "storage/logs" ]; then
    echo -e "${GREEN}✓${NC} Storage directory is writable"
else
    echo -e "${RED}✗${NC} Storage directory is not writable"
    ISSUES_FOUND=1
fi

# Check bootstrap/cache directory
if [ -w "bootstrap/cache" ]; then
    echo -e "${GREEN}✓${NC} Bootstrap cache directory is writable"
else
    echo -e "${RED}✗${NC} Bootstrap cache directory is not writable"
    ISSUES_FOUND=1
fi

echo ""
echo "======================================"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "Server is properly configured for Wrioter."
else
    echo -e "${RED}✗ Issues found!${NC}"
    echo ""
    echo "To fix PHP settings, run:"
    echo "  sudo ./scripts/setup-php-limits.sh"
    echo ""
    echo "For detailed requirements, see:"
    echo "  docs/SERVER-REQUIREMENTS.md"
    exit 1
fi

echo "======================================