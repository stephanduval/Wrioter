#!/bin/bash

# Step 1: Concatenate all files into a single text file
find app bootstrap config database routes .env vite.config.ts \
    ~/Code/Sneat-Test/resources/ts/pages/apps/user \
    ~/Code/Sneat-Test/resources/ts/views/apps/user \
    ~/Code/Sneat-Test/resources/ts/pages/apps/companies \
    ~/Code/Sneat-Test/resources/ts/views/apps/companies \
    ~/Code/Sneat-Test/resources/js \
    -type f -exec cat {} + > all_contents.txt

# Step 2: Convert the text file to a PDF (optional)
pandoc all_contents.txt -o all_contents.pdf

# Step 3: Compare the sizes of the text file and the PDF
txt_size=$(du -h all_contents.txt | awk '{print $1}')
pdf_size=$(du -h all_contents.pdf | awk '{print $1}')

echo "Text file size: $txt_size"
echo "PDF file size: $pdf_size"

# Step 4: Decide which file to keep based on size
if [[ $(echo "$txt_size < $pdf_size" | bc) -eq 1 ]]; then
    echo "Text file is smaller. Keeping all_contents.txt"
    rm all_contents.pdf
else
    echo "PDF file is smaller. Keeping all_contents.pdf"
    rm all_contents.txt
fi
