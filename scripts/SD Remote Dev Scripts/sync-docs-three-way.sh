#!/bin/bash
# Three-way documentation sync between Wrioter, Branch 2, and Branch 3
# Uses timestamps and checksums to determine the most recent version

# Configuration
MAIN_DOCS="/home/sduval/Code/Wrioter/docs"
BRANCH2_DOCS="/home/sduval/Code/Wrioter Branch 2/docs"
BRANCH3_DOCS="/home/sduval/Code/Wrioter Branch 3/docs"

# Sync state directory (stores last sync info)
SYNC_STATE="/home/sduval/Code/Remote Dev Server/.doc-sync-state"
mkdir -p "$SYNC_STATE"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to get file modification time
get_mtime() {
    stat -c %Y "$1" 2>/dev/null || echo "0"
}

# Function to get file checksum
get_checksum() {
    if [ -f "$1" ]; then
        md5sum "$1" | cut -d' ' -f1
    else
        echo "none"
    fi
}

# Function to find newest version of a file
find_newest_file() {
    local FILE_PATH=$1
    local MAIN_FILE="$MAIN_DOCS/$FILE_PATH"
    local BRANCH2_FILE="$BRANCH2_DOCS/$FILE_PATH"
    local BRANCH3_FILE="$BRANCH3_DOCS/$FILE_PATH"

    local MAIN_TIME=$(get_mtime "$MAIN_FILE")
    local BRANCH2_TIME=$(get_mtime "$BRANCH2_FILE")
    local BRANCH3_TIME=$(get_mtime "$BRANCH3_FILE")

    local NEWEST_TIME=$MAIN_TIME
    local NEWEST_SOURCE="main"
    local NEWEST_FILE="$MAIN_FILE"

    if [ "$BRANCH2_TIME" -gt "$NEWEST_TIME" ]; then
        NEWEST_TIME=$BRANCH2_TIME
        NEWEST_SOURCE="branch2"
        NEWEST_FILE="$BRANCH2_FILE"
    fi

    if [ "$BRANCH3_TIME" -gt "$NEWEST_TIME" ]; then
        NEWEST_TIME=$BRANCH3_TIME
        NEWEST_SOURCE="branch3"
        NEWEST_FILE="$BRANCH3_FILE"
    fi

    echo "$NEWEST_SOURCE:$NEWEST_FILE"
}

# Function to sync a single file to all locations
sync_file_three_way() {
    local FILE_PATH=$1
    local RESULT=$(find_newest_file "$FILE_PATH")
    local SOURCE=$(echo "$RESULT" | cut -d':' -f1)
    local SOURCE_FILE=$(echo "$RESULT" | cut -d':' -f2-)

    if [ ! -f "$SOURCE_FILE" ]; then
        return
    fi

    local MAIN_FILE="$MAIN_DOCS/$FILE_PATH"
    local BRANCH2_FILE="$BRANCH2_DOCS/$FILE_PATH"
    local BRANCH3_FILE="$BRANCH3_DOCS/$FILE_PATH"

    # Get checksums
    local SOURCE_CHECKSUM=$(get_checksum "$SOURCE_FILE")
    local MAIN_CHECKSUM=$(get_checksum "$MAIN_FILE")
    local BRANCH2_CHECKSUM=$(get_checksum "$BRANCH2_FILE")
    local BRANCH3_CHECKSUM=$(get_checksum "$BRANCH3_FILE")

    local UPDATED=false

    # Copy to main if needed
    if [ "$SOURCE" != "main" ] && [ "$SOURCE_CHECKSUM" != "$MAIN_CHECKSUM" ]; then
        mkdir -p "$(dirname "$MAIN_FILE")"
        cp -p "$SOURCE_FILE" "$MAIN_FILE"
        echo -e "  ${BLUE}↔${NC} $FILE_PATH: ${GREEN}$SOURCE → main${NC}"
        UPDATED=true
    fi

    # Copy to branch2 if needed
    if [ "$SOURCE" != "branch2" ] && [ "$SOURCE_CHECKSUM" != "$BRANCH2_CHECKSUM" ]; then
        mkdir -p "$(dirname "$BRANCH2_FILE")"
        cp -p "$SOURCE_FILE" "$BRANCH2_FILE"
        echo -e "  ${BLUE}↔${NC} $FILE_PATH: ${GREEN}$SOURCE → branch2${NC}"
        UPDATED=true
    fi

    # Copy to branch3 if needed
    if [ "$SOURCE" != "branch3" ] && [ "$SOURCE_CHECKSUM" != "$BRANCH3_CHECKSUM" ]; then
        mkdir -p "$(dirname "$BRANCH3_FILE")"
        cp -p "$SOURCE_FILE" "$BRANCH3_FILE"
        echo -e "  ${BLUE}↔${NC} $FILE_PATH: ${GREEN}$SOURCE → branch3${NC}"
        UPDATED=true
    fi

    if [ "$UPDATED" = false ]; then
        echo -e "  ${GREEN}✓${NC} $FILE_PATH: already synced"
    fi
}

# Function to perform three-way sync
three_way_sync() {
    echo -e "${YELLOW}Performing three-way sync...${NC}"
    echo ""

    # Collect all unique files from all three locations
    TEMP_FILE=$(mktemp)

    # Find all .md files and directories in all three locations
    (cd "$MAIN_DOCS" 2>/dev/null && find . -type f -name "*.md" -o -type d) > "$TEMP_FILE"
    (cd "$BRANCH2_DOCS" 2>/dev/null && find . -type f -name "*.md" -o -type d) >> "$TEMP_FILE"
    (cd "$BRANCH3_DOCS" 2>/dev/null && find . -type f -name "*.md" -o -type d) >> "$TEMP_FILE"

    # Get unique file paths
    sort -u "$TEMP_FILE" | sed 's|^\./||' | while read FILE_PATH; do
        if [[ "$FILE_PATH" == *".md" ]]; then
            sync_file_three_way "$FILE_PATH"
        fi
    done

    rm -f "$TEMP_FILE"
}

# Function to show sync status
show_status() {
    echo -e "${YELLOW}Documentation Status:${NC}"
    echo ""

    echo -e "${BLUE}Main Wrioter:${NC}"
    if [ -d "$MAIN_DOCS" ]; then
        local COUNT=$(find "$MAIN_DOCS" -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  Total .md files: $COUNT"
        echo "  Last modified: $(date -r "$MAIN_DOCS" '+%Y-%m-%d %H:%M:%S')"
    else
        echo "  ${RED}Directory not found${NC}"
    fi

    echo ""
    echo -e "${BLUE}Branch 2:${NC}"
    if [ -d "$BRANCH2_DOCS" ]; then
        local COUNT=$(find "$BRANCH2_DOCS" -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  Total .md files: $COUNT"
        echo "  Last modified: $(date -r "$BRANCH2_DOCS" '+%Y-%m-%d %H:%M:%S')"
        # Show branch-specific files
        echo "  Branch-specific files:"
        find "$BRANCH2_DOCS" -maxdepth 1 -name "*.md" -type f | while read file; do
            basename_file=$(basename "$file")
            if [ ! -f "$MAIN_DOCS/$basename_file" ]; then
                echo "    - $basename_file"
            fi
        done
    else
        echo "  ${RED}Directory not found${NC}"
    fi

    echo ""
    echo -e "${BLUE}Branch 3:${NC}"
    if [ -d "$BRANCH3_DOCS" ]; then
        local COUNT=$(find "$BRANCH3_DOCS" -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  Total .md files: $COUNT"
        echo "  Last modified: $(date -r "$BRANCH3_DOCS" '+%Y-%m-%d %H:%M:%S')"
        # Show branch-specific files
        echo "  Branch-specific files:"
        find "$BRANCH3_DOCS" -maxdepth 1 -name "*.md" -type f | while read file; do
            basename_file=$(basename "$file")
            if [ ! -f "$MAIN_DOCS/$basename_file" ]; then
                echo "    - $basename_file"
            fi
        done
    else
        echo "  ${RED}Directory not found${NC}"
    fi
}

# Function for dry run
dry_run() {
    echo -e "${YELLOW}Dry run - showing what would be synced:${NC}"
    echo ""

    TEMP_FILE=$(mktemp)
    (cd "$MAIN_DOCS" 2>/dev/null && find . -type f -name "*.md") > "$TEMP_FILE"
    (cd "$BRANCH2_DOCS" 2>/dev/null && find . -type f -name "*.md") >> "$TEMP_FILE"
    (cd "$BRANCH3_DOCS" 2>/dev/null && find . -type f -name "*.md") >> "$TEMP_FILE"

    sort -u "$TEMP_FILE" | sed 's|^\./||' | while read FILE_PATH; do
        local RESULT=$(find_newest_file "$FILE_PATH")
        local SOURCE=$(echo "$RESULT" | cut -d':' -f1)
        local SOURCE_FILE=$(echo "$RESULT" | cut -d':' -f2-)

        if [ -f "$SOURCE_FILE" ]; then
            local SOURCE_CHECKSUM=$(get_checksum "$SOURCE_FILE")
            local NEEDS_UPDATE=false
            local TARGETS=""

            if [ "$SOURCE" != "main" ]; then
                local MAIN_CHECKSUM=$(get_checksum "$MAIN_DOCS/$FILE_PATH")
                if [ "$SOURCE_CHECKSUM" != "$MAIN_CHECKSUM" ]; then
                    TARGETS="main "
                    NEEDS_UPDATE=true
                fi
            fi

            if [ "$SOURCE" != "branch2" ]; then
                local BRANCH2_CHECKSUM=$(get_checksum "$BRANCH2_DOCS/$FILE_PATH")
                if [ "$SOURCE_CHECKSUM" != "$BRANCH2_CHECKSUM" ]; then
                    TARGETS="${TARGETS}branch2 "
                    NEEDS_UPDATE=true
                fi
            fi

            if [ "$SOURCE" != "branch3" ]; then
                local BRANCH3_CHECKSUM=$(get_checksum "$BRANCH3_DOCS/$FILE_PATH")
                if [ "$SOURCE_CHECKSUM" != "$BRANCH3_CHECKSUM" ]; then
                    TARGETS="${TARGETS}branch3 "
                    NEEDS_UPDATE=true
                fi
            fi

            if [ "$NEEDS_UPDATE" = true ]; then
                echo -e "  Would sync: $FILE_PATH (${GREEN}$SOURCE${NC} → $TARGETS)"
            fi
        fi
    done

    rm -f "$TEMP_FILE"
}

# Main execution
echo -e "${GREEN}=== Three-Way Documentation Sync Tool ===${NC}"
echo ""

# Parse command line arguments
case "$1" in
    "sync")
        three_way_sync
        echo ""
        echo -e "${GREEN}✓ Three-way sync complete!${NC}"
        ;;
    "status")
        show_status
        ;;
    "dry-run")
        dry_run
        ;;
    "watch")
        # Continuous sync mode - watches for changes
        echo "Watching for changes (Ctrl+C to stop)..."
        echo ""
        while true; do
            three_way_sync
            echo ""
            echo -e "${BLUE}Waiting 30 seconds before next sync...${NC}"
            sleep 30
        done
        ;;
    *)
        echo "Usage: $0 {sync|status|dry-run|watch}"
        echo ""
        echo "  sync     - Perform three-way sync (newest file wins)"
        echo "  status   - Show current status of all three doc folders"
        echo "  dry-run  - Show what would be synced without making changes"
        echo "  watch    - Continuous sync every 30 seconds"
        echo ""
        echo "How it works:"
        echo "  • Compares files across all three locations"
        echo "  • The newest version (by modification time) wins"
        echo "  • Only copies if content actually differs (checksum comparison)"
        echo "  • Preserves branch-specific files"
        echo ""
        echo "Current paths:"
        echo "  Main:     $MAIN_DOCS"
        echo "  Branch 2: $BRANCH2_DOCS"
        echo "  Branch 3: $BRANCH3_DOCS"
        ;;
esac