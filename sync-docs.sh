#!/bin/bash
# Sync documentation between main Wrioter and branches
# This script maintains common docs while preserving branch-specific documentation

# Configuration
MAIN_DOCS="/home/sduval/Code/Wrioter/docs"
BRANCH2_DOCS="/home/sduval/Code/Wrioter Branch 2/docs"
BRANCH3_DOCS="/home/sduval/Code/Wrioter Branch 3/docs"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to sync docs
sync_docs() {
    local SOURCE=$1
    local DEST=$2
    local BRANCH_NAME=$3

    echo -e "${YELLOW}Syncing docs to ${BRANCH_NAME}...${NC}"

    # Create dest if doesn't exist
    mkdir -p "$DEST"

    # Common documentation that should be synced
    COMMON_DOCS=(
        "README.md"
        "LLM_GUIDE.md"
        "api/"
        "architecture/"
        "database/"
        "deployment/"
        "development/"
        "frontend/"
        "modules/"
        "testing/"
        "troubleshooting/"
        "ui-ux/"
    )

    # Branch-specific docs that should NOT be overwritten
    BRANCH_SPECIFIC=(
        "*branch*.md"
        "*BRANCH*.md"
        "SPLIT_VIEW_REFACTORING.md"  # Currently active in Branch 2
        "VIEW_SYSTEM_ARCHITECTURE.md" # Created in Branch 2
    )

    # Sync common docs
    for doc in "${COMMON_DOCS[@]}"; do
        if [ -e "$SOURCE/$doc" ]; then
            echo "  Syncing: $doc"
            rsync -av --delete \
                --exclude="*.swp" \
                --exclude="*.tmp" \
                "$SOURCE/$doc" "$DEST/"
        fi
    done

    echo -e "${GREEN}✓ Synced to ${BRANCH_NAME}${NC}"
}

# Function to list branch-specific docs
list_branch_specific() {
    local BRANCH_DOCS=$1
    local BRANCH_NAME=$2

    echo -e "\n${YELLOW}Branch-specific docs in ${BRANCH_NAME}:${NC}"

    # Find docs that exist in branch but not in main
    if [ -d "$BRANCH_DOCS" ]; then
        find "$BRANCH_DOCS" -maxdepth 1 -name "*.md" -type f | while read file; do
            basename_file=$(basename "$file")
            if [ ! -f "$MAIN_DOCS/$basename_file" ]; then
                echo "  - $basename_file (branch-specific)"
            fi
        done
    fi
}

# Main execution
echo -e "${GREEN}=== Documentation Sync Tool ===${NC}"
echo ""

# Check if main docs exist
if [ ! -d "$MAIN_DOCS" ]; then
    echo -e "${RED}Error: Main docs directory not found at $MAIN_DOCS${NC}"
    exit 1
fi

# Parse command line arguments
case "$1" in
    "to-branches")
        echo "Syncing from main Wrioter to all branches..."
        sync_docs "$MAIN_DOCS" "$BRANCH2_DOCS" "Branch 2"
        sync_docs "$MAIN_DOCS" "$BRANCH3_DOCS" "Branch 3"
        ;;
    "from-branch2")
        echo "Syncing from Branch 2 to main (careful!)..."
        read -p "This will update main docs. Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sync_docs "$BRANCH2_DOCS" "$MAIN_DOCS" "Main"
        fi
        ;;
    "from-branch3")
        echo "Syncing from Branch 3 to main (careful!)..."
        read -p "This will update main docs. Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sync_docs "$BRANCH3_DOCS" "$MAIN_DOCS" "Main"
        fi
        ;;
    "status")
        echo "Documentation status:"
        list_branch_specific "$BRANCH2_DOCS" "Branch 2"
        list_branch_specific "$BRANCH3_DOCS" "Branch 3"
        ;;
    *)
        echo "Usage: $0 {to-branches|from-branch2|from-branch3|status}"
        echo ""
        echo "  to-branches   - Sync common docs from main to all branches"
        echo "  from-branch2  - Sync docs from Branch 2 back to main"
        echo "  from-branch3  - Sync docs from Branch 3 back to main"
        echo "  status        - Show branch-specific documentation"
        echo ""
        echo "Example workflow:"
        echo "  1. Update docs in main Wrioter"
        echo "  2. Run: $0 to-branches"
        echo "  3. Branch-specific docs are preserved"
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"