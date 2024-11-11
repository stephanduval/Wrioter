#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(dirname "$(realpath "$0")")"

# Path to the emailconverter .jar file
CONVERTER_JAR="$SCRIPT_DIR/emailconverter-3.0.0-all.jar"

# Loop through all .eml files in the directory
for eml_file in "$SCRIPT_DIR"/*.eml; do
    if [[ -f "$eml_file" ]]; then
        # Define the output PDF file path
        output_pdf="${eml_file%.eml}.pdf"
        
        # Convert the .eml file to PDF
        java -jar "$CONVERTER_JAR" -o "$output_pdf" "$eml_file"
        
        # Check if the conversion was successful
        if [[ $? -eq 0 ]]; then
            echo "Successfully converted $eml_file to $output_pdf"
        else
            echo "Failed to convert $eml_file"
        fi
    fi
done
					
