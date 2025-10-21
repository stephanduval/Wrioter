#!/bin/bash
# Three-way sync using Unison (if installed) or fallback to rsync
# Unison handles conflicts and bidirectional sync better than rsync

# Configuration
MAIN_DOCS="/home/sduval/Code/Wrioter/docs"
BRANCH2_DOCS="/home/sduval/Code/Wrioter Branch 2/docs"
BRANCH3_DOCS="/home/sduval/Code/Wrioter Branch 3/docs"

# Unison profile directory
UNISON_DIR="$HOME/.unison"
mkdir -p "$UNISON_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if unison is installed
check_unison() {
    if command -v unison &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Create Unison profiles for three-way sync
create_unison_profiles() {
    # Profile for Main ↔ Branch2
    cat > "$UNISON_DIR/docs-main-branch2.prf" << EOF
# Unison profile for Main ↔ Branch 2 docs sync
root = $MAIN_DOCS
root = $BRANCH2_DOCS

# Sync all markdown files
path = .

# Ignore patterns
ignore = Name {.git}
ignore = Name {*.swp}
ignore = Name {*.tmp}
ignore = Name {.DS_Store}

# Prefer newer files in conflicts
prefer = newer

# Sync times
times = true

# Don't ask for confirmation for non-conflicts
auto = true

# Batch mode (no interaction)
batch = true

# Log actions
log = true
EOF

    # Profile for Main ↔ Branch3
    cat > "$UNISON_DIR/docs-main-branch3.prf" << EOF
# Unison profile for Main ↔ Branch 3 docs sync
root = $MAIN_DOCS
root = $BRANCH3_DOCS

# Sync all markdown files
path = .

# Ignore patterns
ignore = Name {.git}
ignore = Name {*.swp}
ignore = Name {*.tmp}
ignore = Name {.DS_Store}

# Prefer newer files in conflicts
prefer = newer

# Sync times
times = true

# Don't ask for confirmation for non-conflicts
auto = true

# Batch mode (no interaction)
batch = true

# Log actions
log = true
EOF

    # Profile for Branch2 ↔ Branch3
    cat > "$UNISON_DIR/docs-branch2-branch3.prf" << EOF
# Unison profile for Branch 2 ↔ Branch 3 docs sync
root = $BRANCH2_DOCS
root = $BRANCH3_DOCS

# Sync all markdown files
path = .

# Ignore patterns
ignore = Name {.git}
ignore = Name {*.swp}
ignore = Name {*.tmp}
ignore = Name {.DS_Store}

# Prefer newer files in conflicts
prefer = newer

# Sync times
times = true

# Don't ask for confirmation for non-conflicts
auto = true

# Batch mode (no interaction)
batch = true

# Log actions
log = true
EOF
}

# Run Unison three-way sync
unison_sync() {
    echo -e "${YELLOW}Running Unison three-way sync...${NC}"

    # Create/update profiles
    create_unison_profiles

    # Run syncs
    echo -e "${BLUE}Syncing Main ↔ Branch 2...${NC}"
    unison docs-main-branch2 -silent

    echo -e "${BLUE}Syncing Main ↔ Branch 3...${NC}"
    unison docs-main-branch3 -silent

    echo -e "${BLUE}Syncing Branch 2 ↔ Branch 3...${NC}"
    unison docs-branch2-branch3 -silent

    # Run once more to ensure full propagation
    echo -e "${BLUE}Final sync pass...${NC}"
    unison docs-main-branch2 -silent
    unison docs-main-branch3 -silent

    echo -e "${GREEN}✓ Unison sync complete!${NC}"
}

# Fallback rsync-based three-way sync
rsync_three_way() {
    echo -e "${YELLOW}Using rsync for three-way sync (unison not found)...${NC}"

    # Use modification time to determine newest
    RSYNC_OPTS="-av --update --recursive"

    # First pass: sync newest to all
    echo -e "${BLUE}Pass 1: Main → Branches${NC}"
    rsync $RSYNC_OPTS "$MAIN_DOCS/" "$BRANCH2_DOCS/"
    rsync $RSYNC_OPTS "$MAIN_DOCS/" "$BRANCH3_DOCS/"

    echo -e "${BLUE}Pass 2: Branch 2 → Others${NC}"
    rsync $RSYNC_OPTS "$BRANCH2_DOCS/" "$MAIN_DOCS/"
    rsync $RSYNC_OPTS "$BRANCH2_DOCS/" "$BRANCH3_DOCS/"

    echo -e "${BLUE}Pass 3: Branch 3 → Others${NC}"
    rsync $RSYNC_OPTS "$BRANCH3_DOCS/" "$MAIN_DOCS/"
    rsync $RSYNC_OPTS "$BRANCH3_DOCS/" "$BRANCH2_DOCS/"

    echo -e "${GREEN}✓ Rsync three-way sync complete!${NC}"
}

# Install unison if requested
install_unison() {
    echo -e "${YELLOW}Installing Unison...${NC}"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install unison
        else
            echo -e "${RED}Homebrew not found. Install it first or use: sudo port install unison${NC}"
        fi
    else
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y unison
        elif command -v yum &> /dev/null; then
            sudo yum install -y unison
        else
            echo -e "${RED}Package manager not found. Install unison manually.${NC}"
        fi
    fi
}

# Show detailed status
show_detailed_status() {
    echo -e "${YELLOW}=== Documentation Sync Status ===${NC}"
    echo ""

    for dir in "$MAIN_DOCS" "$BRANCH2_DOCS" "$BRANCH3_DOCS"; do
        if [ -d "$dir" ]; then
            local NAME=$(basename "$(dirname "$dir")")
            if [[ "$dir" == *"Wrioter/docs" ]]; then
                NAME="Main"
            elif [[ "$dir" == *"Branch 2"* ]]; then
                NAME="Branch 2"
            elif [[ "$dir" == *"Branch 3"* ]]; then
                NAME="Branch 3"
            fi

            echo -e "${BLUE}$NAME:${NC}"
            echo "  Path: $dir"
            echo -n "  Files: "
            find "$dir" -name "*.md" -type f 2>/dev/null | wc -l
            echo -n "  Directories: "
            find "$dir" -type d 2>/dev/null | wc -l
            echo -n "  Total size: "
            du -sh "$dir" 2>/dev/null | cut -f1
            echo -n "  Latest change: "
            find "$dir" -type f -name "*.md" -printf '%TY-%Tm-%Td %TH:%TM:%TS %p\n' 2>/dev/null | sort -r | head -1 | cut -d' ' -f1-2
            echo ""
        else
            echo -e "${RED}$dir not found${NC}"
        fi
    done
}

# Main execution
echo -e "${GREEN}=== Advanced Three-Way Documentation Sync ===${NC}"
echo ""

case "$1" in
    "sync")
        if check_unison; then
            unison_sync
        else
            echo -e "${YELLOW}Unison not found, falling back to rsync${NC}"
            rsync_three_way
        fi
        ;;
    "sync-rsync")
        rsync_three_way
        ;;
    "sync-unison")
        if check_unison; then
            unison_sync
        else
            echo -e "${RED}Unison is not installed${NC}"
            echo "Run: $0 install-unison"
            exit 1
        fi
        ;;
    "status")
        show_detailed_status
        ;;
    "install-unison")
        install_unison
        ;;
    "watch")
        echo "Starting watch mode (sync every 30 seconds)..."
        echo "Press Ctrl+C to stop"
        while true; do
            clear
            echo -e "${BLUE}[$(date '+%H:%M:%S')] Running sync...${NC}"
            if check_unison; then
                unison_sync
            else
                rsync_three_way
            fi
            sleep 30
        done
        ;;
    *)
        echo "Usage: $0 {sync|sync-rsync|sync-unison|status|install-unison|watch}"
        echo ""
        echo "Commands:"
        echo "  sync          - Auto-detect and use best sync method"
        echo "  sync-rsync    - Force rsync three-way sync"
        echo "  sync-unison   - Force unison sync (better conflict handling)"
        echo "  status        - Show detailed status of all folders"
        echo "  install-unison - Install unison for better sync"
        echo "  watch         - Continuous sync every 30 seconds"
        echo ""
        echo "Current sync method: $(check_unison && echo "Unison (optimal)" || echo "rsync (basic)")"
        echo ""
        echo "Benefits of Unison over rsync:"
        echo "  • True bidirectional sync"
        echo "  • Better conflict detection"
        echo "  • Atomic updates"
        echo "  • Remembers sync state"
        ;;
esac