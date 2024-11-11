#!/bin/bash

# Get the directory of the current script
BASE_DIR="$(dirname "$(realpath "$0")")"

# Define actual directory paths
PDF_DIR="$BASE_DIR"
OCR_DIR="$BASE_DIR/ocr_files"

# Create OCR directory if it doesn't exist
mkdir -p "$OCR_DIR"

echo "Looking for PDF files in $PDF_DIR"

# Loop through all PDF files in the directory
for pdf in "$PDF_DIR"/*.pdf; do
    if [[ ! -f "$pdf" ]]; then
        echo "No PDF files found in $PDF_DIR"
        exit 1
    fi

    # Get the base name of the file
    base_name=$(basename "$pdf" .pdf)
    echo "Processing $pdf"
    # Perform OCR and save to OCR directory
    pdfsandwich -o "$OCR_DIR/${base_name}_ocr.pdf" "$pdf"
done
