#!/bin/bash

# Script to configure PHP upload limits for Wrioter application
# This ensures file uploads work correctly (especially for Scrivener imports)

echo "==================================="
echo "PHP Upload Limits Configuration"
echo "==================================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "This script needs sudo privileges to modify PHP configuration."
    echo "Please run: sudo $0"
    exit 1
fi

# Configuration values
UPLOAD_MAX_FILESIZE="50M"
POST_MAX_SIZE="50M"
MAX_EXECUTION_TIME="300"

echo ""
echo "Setting PHP limits to:"
echo "  upload_max_filesize = $UPLOAD_MAX_FILESIZE"
echo "  post_max_size = $POST_MAX_SIZE"
echo "  max_execution_time = $MAX_EXECUTION_TIME"
echo ""

# Function to update PHP configuration
update_php_config() {
    local PHP_INI=$1
    local CONFIG_NAME=$2

    if [ -f "$PHP_INI" ]; then
        echo "Updating $CONFIG_NAME ($PHP_INI)..."

        # Backup original file
        cp "$PHP_INI" "$PHP_INI.backup.$(date +%Y%m%d_%H%M%S)"

        # Update settings
        sed -i "s/^upload_max_filesize = .*/upload_max_filesize = $UPLOAD_MAX_FILESIZE/" "$PHP_INI"
        sed -i "s/^post_max_size = .*/post_max_size = $POST_MAX_SIZE/" "$PHP_INI"
        sed -i "s/^max_execution_time = .*/max_execution_time = $MAX_EXECUTION_TIME/" "$PHP_INI"

        echo "  ✓ $CONFIG_NAME updated"
    else
        echo "  ⚠ $CONFIG_NAME not found at $PHP_INI"
    fi
}

# Update all PHP configurations
echo "Updating PHP configurations..."
echo ""

# PHP 8.3 CLI (used by artisan serve)
update_php_config "/etc/php/8.3/cli/php.ini" "PHP 8.3 CLI"

# PHP 8.3 FPM (used by Apache/Nginx)
update_php_config "/etc/php/8.3/fpm/php.ini" "PHP 8.3 FPM"

# PHP 8.2 versions (if present)
update_php_config "/etc/php/8.2/cli/php.ini" "PHP 8.2 CLI"
update_php_config "/etc/php/8.2/fpm/php.ini" "PHP 8.2 FPM"

# PHP 8.1 versions (if present)
update_php_config "/etc/php/8.1/cli/php.ini" "PHP 8.1 CLI"
update_php_config "/etc/php/8.1/fpm/php.ini" "PHP 8.1 FPM"

echo ""
echo "Restarting PHP-FPM services..."

# Restart PHP-FPM services if they exist
for VERSION in 8.3 8.2 8.1; do
    if systemctl list-units --full -all | grep -Fq "php${VERSION}-fpm.service"; then
        systemctl restart php${VERSION}-fpm
        echo "  ✓ PHP ${VERSION} FPM restarted"
    fi
done

echo ""
echo "==================================="
echo "Configuration complete!"
echo "==================================="
echo ""
echo "Verifying current PHP CLI settings:"
php -r 'echo "  upload_max_filesize: " . ini_get("upload_max_filesize") . "\n";'
php -r 'echo "  post_max_size: " . ini_get("post_max_size") . "\n";'
php -r 'echo "  max_execution_time: " . ini_get("max_execution_time") . "\n";'

echo ""
echo "Note: If using 'php artisan serve', restart it for changes to take effect."
echo ""
