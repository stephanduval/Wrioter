#!/bin/bash

# Output file
output_file="all_contents.txt"

# Clear the output file if it already exists
> "$output_file"

# Function to append file contents with a label
append_file() {
    local file="$1"
    echo "===== File: $file =====" >> "$output_file"
    cat "$file" >> "$output_file"
    echo -e "\n\n" >> "$output_file"  # Add spacing between files
}

# Step 1: Include ProjectDirectory.txt in the root directory
#if [[ -f "ProjectDirectory.txt" ]]; then
#    append_file "ProjectDirectory.txt"
#else
#    echo "Warning: ProjectDirectory.txt not found in the root directory."
#fi

# Step 2: Include all files in the specified directories
directories=(
    "app"
    "bootstrap"
    "config"
    "database"
    "routes"
    ".env"
    "vite.config.ts"
    "$HOME/Code/Sneat-Test/resources/ts/pages/apps/user"
    "$HOME/Code/Sneat-Test/resources/ts/views/apps/user"
    "$HOME/Code/Sneat-Test/resources/ts/pages/apps/companies"
    "$HOME/Code/Sneat-Test/resources/ts/views/apps/companies"
    "$HOME/Code/Sneat-Test/resources/js"
)

# Step 3: Loop through directories and append file contents
for dir in "${directories[@]}"; do
    if [[ -e "$dir" ]]; then
        if [[ -f "$dir" ]]; then
            # If it's a file, append it directly
            append_file "$dir"
        else
            # If it's a directory, find all files and append them
            find "$dir" -type f | while read -r file; do
                append_file "$file"
            done
        fi
    else
        echo "Warning: $dir does not exist."
    fi
done

echo "All contents have been written to $output_file."
