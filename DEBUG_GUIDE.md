# Select Manuscript Button Debug Guide

## Current Status
I've added extensive debug logging to identify why the "Select Manuscript" button isn't working. The application has been rebuilt with debug code.

## How to Debug

### Step 1: Open Browser Console
1. Open your browser (Chrome/Firefox/Safari)
2. Navigate to your application
3. Press F12 or right-click and select "Inspect"
4. Go to the "Console" tab

### Step 2: Look for Debug Output
When the page loads, you should see extensive console output like:

```
=== MENU TRANSLATION DEBUG ===
Processing menu item 0: {heading: "menu.heading"}
Processing menu item 1: {title: "menu.adminDashboard", action: "read", subject: "admin"}
...
Processing menu item X: {title: "menu.selectManuscript", action: "read", subject: "manuscripts", custom: true}
```

### Step 3: Find the Select Manuscript Item
Look specifically for these log entries:
- `*** SELECT MANUSCRIPT PERMISSION DEBUG ***`
- `*** SELECT MANUSCRIPT TRANSLATION ***`
- `=== SELECT MANUSCRIPT ITEM FOUND IN FINAL MENU ===`

### Step 4: Check Template Rendering
When you see the Select Manuscript button on the page, look for:
- `=== TEMPLATE ANALYSIS ===`
- `*** CUSTOM ITEM FOUND ***`

### Step 5: Test the Click
1. Click the "Select Manuscript" button
2. Look for: `=== CLICK HANDLER FIRED ===`

## Expected Debug Output

### If Working Correctly:
```
=== MENU TRANSLATION DEBUG ===
Processing menu item X: {title: "menu.selectManuscript", action: "read", subject: "manuscripts", custom: true}
*** SELECT MANUSCRIPT PERMISSION DEBUG ***
Action: read
Subject: manuscripts
Has permission: true
Custom flag: true
*** SELECT MANUSCRIPT TRANSLATION ***
=== SELECT MANUSCRIPT ITEM FOUND IN FINAL MENU === {title: "Select Manuscript", custom: true}
=== TEMPLATE ANALYSIS ===
Item title: Select Manuscript
Item custom: true
Will render branch: custom
*** CUSTOM ITEM FOUND *** Select Manuscript
[CLICK] === CLICK HANDLER FIRED ===
*** OPENING MANUSCRIPT SELECTION DRAWER ***
```

### If Failing Due to Permissions:
```
Processing menu item X: {title: "menu.selectManuscript", action: "read", subject: "manuscripts", custom: true}
*** SELECT MANUSCRIPT PERMISSION DEBUG ***
Action: read
Subject: manuscripts
Has permission: false
-> FILTERED OUT due to permissions: menu.selectManuscript
```

### If Failing Due to Template Rendering:
```
=== TEMPLATE ANALYSIS ===
Item title: Select Manuscript
Item custom: undefined (or false)
Will render branch: regular
```

## Visual Debugging
The Select Manuscript button should now have:
- **Green background** if it's rendered as a custom item
- **Red border** to make it easily identifiable
- **Pointer cursor** when hovering

## What to Report Back
Please copy and paste:
1. All console output related to "SELECT MANUSCRIPT"
2. Whether you see the green background and red border on the button
3. Whether clicking the button produces any console output

This will tell me exactly where the issue is occurring.