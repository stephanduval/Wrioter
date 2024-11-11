#!/bin/bash

# Ensure pdftk is installed
if ! command -v pdftk &> /dev/null
then
    echo "pdftk could not be found, please install it first."
    exit
fi

# Directory containing the PDF files (same as the script's directory)
PDF_DIR="$(dirname "$(realpath "$0")")"

# Loop through each PDF file in the directory
for pdf_file in "$PDF_DIR"/*.pdf; do
    # Get the base name of the file without the extension
    base_name=$(basename "$pdf_file" .pdf)
    
    # Get the total number of pages in the PDF
    total_pages=$(pdftk "$pdf_file" dump_data | grep NumberOfPages | awk '{print $2}')
    
    # Calculate the midpoint
    midpoint=$(( (total_pages + 1) / 2 ))
    
    # Define output PDF file paths
    output_pdf_part1="$PDF_DIR/${base_name}_part1.pdf"
    output_pdf_part2="$PDF_DIR/${base_name}_part2.pdf"
    
    # Split the PDF into two halves
    pdftk "$pdf_file" cat 1-$midpoint output "$output_pdf_part1"
    pdftk "$pdf_file" cat $((midpoint + 1))-end output "$output_pdf_part2"
    
    echo "Split $pdf_file into $output_pdf_part1 and $output_pdf_part2"
done

