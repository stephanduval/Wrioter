#!/bin/bash

# Get the directory of the current script
BASE_DIR="$(dirname "$(realpath "$0")")"

# Define the output file
OUTPUT_PDF="$BASE_DIR/merged_output.pdf"

# Merge all PDF files in the directory into a single PDF
pdftk "$BASE_DIR"/*.pdf cat output "$OUTPUT_PDF"

echo "All PDFs in $BASE_DIR have been merged into $OUTPUT_PDF"
