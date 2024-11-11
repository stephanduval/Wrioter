#!/bin/bash

# Ensure ImageMagick and pdftk are installed
if ! command -v convert &> /dev/null || ! command -v pdftk &> /dev/null; then
    echo "convert (ImageMagick) and/or pdftk could not be found, please install them first."
    exit 1
fi

# Directory containing the PDF files (same as the script's directory)
PDF_DIR="$(dirname "$(realpath "$0")")"

# Function to create a watermark PDF
create_watermark() {
    local watermark_text="$1"
    local watermark_pdf="$2"

    # Create a temporary watermark image with 20% opacity
    convert -size 500x500 xc:none -gravity center -pointsize 48 -fill "rgba(128,128,128,0.3)" -annotate 45 "$watermark_text" watermark.png

    # Convert the watermark image to a PDF
    convert watermark.png "$watermark_pdf"

    # Remove the temporary watermark image
    rm watermark.png
}

# Loop through each PDF file in the directory
for pdf_file in "$PDF_DIR"/*.pdf; do
    # Get the base name of the file without the extension
    base_name=$(basename "$pdf_file" .pdf)
    
    # Define the watermark PDF path
    watermark_pdf="$PDF_DIR/watermark_$base_name.pdf"
    
    # Create the watermark PDF with the base name as the watermark text
    create_watermark "$base_name" "$watermark_pdf"
    
    # Define output PDF file path
    output_pdf="$PDF_DIR/${base_name}_watermarked.pdf"
    
    # Apply the watermark
    pdftk "$pdf_file" stamp "$watermark_pdf" output "$output_pdf"
    
    # Clean up the temporary watermark PDF
    rm "$watermark_pdf"
    
    echo "Added watermark to $pdf_file and saved as $output_pdf"
done

