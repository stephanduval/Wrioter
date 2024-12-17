#!/bin/bash

# Script to package Laravel project folders into a single zip file

# Set the output zip filename with a timestamp
ZIP_NAME="project_backup_$(date +%Y%m%d%H%M%S).zip"

# Temporary directory to hold build folder contents
TMP_DIR="./build_tmp"

# Ensure a clean start
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"

# Zip the required folders and files
zip -r "$ZIP_NAME" \
    app \
    bootstrap \
    config \
    database \
    public \
    routes \
    storage \
    resources/views \
    vendor \
    -x "storage/logs/*" "storage/framework/cache/*"  # Exclude unnecessary storage files

# Add the build folder contents (now in the temp directory) to the root of the zip
(cd "$TMP_DIR" && zip -r "../$ZIP_NAME" .)

# Cleanup temporary directory
rm -rf "$TMP_DIR"

# Completion message
echo "Project successfully packaged into $ZIP_NAME"
