#!/bin/bash

# Sync and Clear All Servers Script
# This script syncs local changes to all three dev server instances and clears Laravel caches

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Sync & Clear Cache - All Servers${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Track overall status
sync_status=0
branch3_status=0
branch2_status=0
main_status=0

# Step 1: Sync to all three servers
echo -e "${YELLOW}🔄 Step 1: Syncing files to dev server...${NC}"
echo ""

# Sync to Branch 3
echo -e "${BLUE}Syncing to Branch 3...${NC}"
rsync -avz --exclude='.env*' --exclude='node_modules/' --exclude='vendor/' --exclude='.git/' \
    "/home/sduval/Code/Wrioter Branch 3/" \
    sduval@192.168.1.252:"/home/sduval/Code/Wrioter Branch 3/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Branch 3 synced${NC}"
else
    echo -e "${RED}❌ Branch 3 sync failed${NC}"
    sync_status=1
fi

echo ""

# Sync to Branch 2
echo -e "${BLUE}Syncing to Branch 2...${NC}"
rsync -avz --exclude='.env*' --exclude='node_modules/' --exclude='vendor/' --exclude='.git/' \
    "/home/sduval/Code/Wrioter Branch 2/" \
    sduval@192.168.1.252:"/home/sduval/Code/Wrioter Branch 2/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Branch 2 synced${NC}"
else
    echo -e "${RED}❌ Branch 2 sync failed${NC}"
    sync_status=1
fi

echo ""

# Sync to Main
echo -e "${BLUE}Syncing to Main...${NC}"
rsync -avz --exclude='.env*' --exclude='node_modules/' --exclude='vendor/' --exclude='.git/' \
    "/home/sduval/Code/Wrioter/" \
    sduval@192.168.1.252:"/home/sduval/Code/Wrioter/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Main synced${NC}"
else
    echo -e "${RED}❌ Main sync failed${NC}"
    sync_status=1
fi

if [ $sync_status -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Some syncs failed! Aborting cache clear.${NC}"
    exit 1
fi

# Step 2: Clear caches on all servers
echo ""
echo -e "${YELLOW}🧹 Step 2: Clearing Laravel caches on all servers...${NC}"
echo ""

# Function to clear caches for a given path
clear_caches() {
    local path=$1
    local name=$2

    echo -e "${YELLOW}Clearing caches for $name...${NC}"
    ssh sduval@192.168.1.252 << EOF
cd "$path"
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan event:clear
EOF

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $name cleared successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to clear caches for $name${NC}"
        return 1
    fi
}

# Clear caches for all three instances
echo -e "${BLUE}Branch 3${NC}"
clear_caches "/home/sduval/Code/Wrioter Branch 3" "Wrioter Branch 3"
branch3_status=$?

echo ""
echo -e "${BLUE}Branch 2${NC}"
clear_caches "/home/sduval/Code/Wrioter Branch 2" "Wrioter Branch 2"
branch2_status=$?

echo ""
echo -e "${BLUE}Main${NC}"
clear_caches "/home/sduval/Code/Wrioter" "Wrioter Main"
main_status=$?

# Final status report
echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Final Status Report${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

echo "Sync Status:"
echo -e "  ${GREEN}✅ All three servers synced${NC}"

echo ""
echo "Cache Clear Status:"

if [ $branch3_status -eq 0 ]; then
    echo -e "  ${GREEN}✅ Wrioter Branch 3${NC} - http://192.168.1.252:8002"
else
    echo -e "  ${RED}❌ Wrioter Branch 3${NC}"
fi

if [ $branch2_status -eq 0 ]; then
    echo -e "  ${GREEN}✅ Wrioter Branch 2${NC} - http://192.168.1.252:8001"
else
    echo -e "  ${RED}❌ Wrioter Branch 2${NC}"
fi

if [ $main_status -eq 0 ]; then
    echo -e "  ${GREEN}✅ Wrioter Main${NC} - http://192.168.1.252:8000"
else
    echo -e "  ${RED}❌ Wrioter Main${NC}"
fi

echo -e "${BLUE}════════════════════════════════════════════${NC}"

# Return success only if all cleared successfully
if [ $branch3_status -eq 0 ] && [ $branch2_status -eq 0 ] && [ $main_status -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All servers synced and reset successfully!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some servers failed to reset${NC}"
    exit 1
fi
