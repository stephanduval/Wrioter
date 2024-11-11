#!/bin/bash

# Ensure ImageMagick, pdftk, and Ghostscript are installed
if ! command -v convert &> /dev/null || ! command -v pdftk &> /dev/null || ! command -v gs &> /dev/null; then
    echo "convert (ImageMagick), pdftk, and/or gs (Ghostscript) could not be found, please install them first."
    exit 1
fi

# Directory containing the PDF files (same as the script's directory)
PDF_DIR="$(dirname "$(realpath "$0")")"

# Function to create a watermark PDF
create_watermark() {
    local watermark_text="$1"
    local watermark_pdf="$2"

    # Create a temporary watermark image with 20% opacity
    convert -size 500x500 xc:none -gravity center -pointsize 48 -fill "rgba(128,128,128,0.2)" -annotate 45 "$watermark_text" watermark.png

    # Convert the watermark image to a PDF
    convert watermark.png "$watermark_pdf"

    # Remove the temporary watermark image
    rm watermark.png
}

# Function to create a title page PDF
create_title_page() {
    local title_text="$1"
    local pages="$2"
    local title_pdf="$3"

    # Create a title page with 40-point font and number of pages below
    convert -size 595x842 xc:white -gravity center -pointsize 40 -fill black -annotate +0-100 "$title_text" -pointsize 24 -annotate +0+40 "Pages: $pages" title.png

    # Convert the title page image to a PDF
    convert title.png "$title_pdf"

    # Remove the temporary title page image
    rm title.png
}

# Function to add headers and footers to a PDF
add_headers_footers() {
    local input_pdf="$1"
    local output_pdf="$2"
    local header_footer_text="$3"

    enscript -B -o - <<< "$header_footer_text" | ps2pdf - header_footer.pdf
    pdftk "$input_pdf" background header_footer.pdf output "$output_pdf"
    rm header_footer.pdf
}

# Loop through each PDF file in the directory
for pdf_file in "$PDF_DIR"/*.pdf; do
    # Get the base name of the file without the extension
    base_name=$(basename "$pdf_file" .pdf)
    
    # Define the watermark PDF path
    watermark_pdf="$PDF_DIR/watermark_$base_name.pdf"
    
    # Create the watermark PDF with the base name as the watermark text
    create_watermark "$base_name" "$watermark_pdf"

    # Count the number of pages in the PDF
    num_pages=$(pdftk "$pdf_file" dump_data | grep NumberOfPages | awk '{print $2}')
    
    # Define the title page PDF path
    title_pdf="$PDF_DIR/title_$base_name.pdf"
    
    # Create the title page PDF with the base name as the title text and number of pages
    create_title_page "$base_name" "$num_pages" "$title_pdf"
    
    # Define intermediate PDF paths
    pdf_with_title="$PDF_DIR/${base_name}_with_title.pdf"
    pdf_with_headers_footers="$PDF_DIR/${base_name}_with_headers_footers.pdf"
    
    # Add the title page to the PDF
    pdftk "$title_pdf" "$pdf_file" cat output "$pdf_with_title"
    
    # Add headers and footers to the PDF
    add_headers_footers "$pdf_with_title" "$pdf_with_headers_footers" "$base_name - Page [Page #]"
    
    # Define output PDF file path
    output_pdf="$PDF_DIR/${base_name}_final.pdf"
    
    # Apply the watermark
    pdftk "$pdf_with_headers_footers" stamp "$watermark_pdf" output "$output_pdf"
    
    # Clean up the temporary PDFs
    rm "$watermark_pdf" "$title_pdf" "$pdf_with_title" "$pdf_with_headers_footers"
    
    echo "Processed $pdf_file and saved as $output_pdf"
done

