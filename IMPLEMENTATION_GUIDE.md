# Implementation Guide: Fix for Split View Folder Loading

## Executive Summary

**Problem:** When clicking a folder in split view, both panes update to show the same content instead of only the active pane updating.

**Root Cause:** The global `folderViewStore` maintains shared folder state (`folderItems`, `currentFolder`) that all panes read from. A watcher in FolderView.vue triggers a global folder load when any pane's `folderId` changes.

**Solution:** Move folder content caching from the global `folderViewStore` to individual `PaneState` objects in `paneStore`, making each pane independent.

---

## Step-by-Step Implementation

### Step 1: Update PaneStore Interface

**File:** `/resources/ts/stores/pane.ts`

**Changes:**

1. Add FolderData interface at the top:
```typescript
export interface FolderData {
  id: number
  title: string
  items: FolderItem[]
  viewMode: ViewMode
}

export interface FolderItem {
  id: number
  title: string
  type: string
  synopsis?: string
  content?: string
  excerpt?: string
  word_count?: number
  item_order?: number
  metadata?: any
  include_in_compile?: boolean
  updated_at: string
}

// Import ViewMode from folderView.ts
export type ViewMode = 'manuscript' | 'corkboard' | 'outline'
```

2. Update PaneState interface (around line 24):
```typescript
export interface PaneState {
  id: string
  viewMode: PaneViewMode

  // Content context
  folderId?: number
  editingItemId?: number
  
  // NEW: Per-pane folder data cache
  folderData?: FolderData  // ← ADD THIS
  
  // Selection state
  selectedItemIds: Set<number>
  focusedItemId?: number

  // View configuration
  viewSettings: PaneViewSettings

  // UI state
  isActive: boolean
  isLoading: boolean
  error?: string
}
```

---

### Step 2: Add loadFolderForPane() Action

**File:** `/resources/ts/stores/pane.ts`

**Location:** After `setPaneFolder()` function (around line 184)

**New Function:**

```typescript
/**
 * Load folder contents specifically for a pane
 */
async function loadFolderForPane(paneId: string, folderId: number, viewMode: ViewMode = 'manuscript') {
  const pane = panes.value.get(paneId)
  if (!pane) return

  pane.isLoading = true
  pane.error = undefined

  try {
    console.log(`[PaneStore] Loading folder ${folderId} for pane ${paneId} in ${viewMode} mode`)

    // Fetch folder contents
    const response = await $api(`/folders/${folderId}/contents`, {
      params: { view_mode: viewMode }
    })

    // Cache folder data in pane state
    pane.folderData = {
      id: response.folder.id,
      title: response.folder.title,
      items: response.items || [],
      viewMode: viewMode
    }

    console.log(`[PaneStore] Loaded ${pane.folderData.items.length} items for pane ${paneId}`)
  } catch (err: any) {
    console.error(`Failed to load folder for pane ${paneId}:`, err)
    pane.error = err.message || 'Failed to load folder contents'
    throw err
  } finally {
    pane.isLoading = false
  }
}
```

---

### Step 3: Update setPaneFolder()

**File:** `/resources/ts/stores/pane.ts`

**Location:** Lines 173-183

**Current Code:**
```typescript
function setPaneFolder(paneId: string, folderId: number) {
  const pane = panes.value.get(paneId)
  if (!pane) return

  pane.folderId = folderId
  pane.selectedItemIds.clear()
  pane.focusedItemId = undefined

  console.log(`[PaneStore] Pane ${paneId} folder set to: ${folderId}`)
}
```

**Updated Code:**
```typescript
function setPaneFolder(paneId: string, folderId: number) {
  const pane = panes.value.get(paneId)
  if (!pane) return

  pane.folderId = folderId
  pane.selectedItemIds.clear()
  pane.focusedItemId = undefined
  
  // Clear old folder data when changing folders
  pane.folderData = undefined

  console.log(`[PaneStore] Pane ${paneId} folder set to: ${folderId}`)
}
```

---

### Step 4: Export New Function

**File:** `/resources/ts/stores/pane.ts`

**Location:** Return statement at end of store (around line 345)

**Add to return object:**
```typescript
return {
  // ... existing exports ...
  
  // NEW:
  loadFolderForPane,
  
  // ... rest of exports ...
}
```

---

### Step 5: Update DynamicManuscriptNavigation.vue

**File:** `/resources/ts/components/manuscript/DynamicManuscriptNavigation.vue`

**Location:** Lines 243-259 in handleNodeClick()

**Current Code:**
```typescript
if (node.type === 'folder') {
  const folderViewStore = useFolderViewStore()
  const paneStore = usePaneStore()

  if (folderViewStore.splitEnabled && paneStore.activePaneId) {
    // Split view: Update active pane to show this folder's content
    console.log(`[Nav] Loading folder ${node.itemId} in active pane ${paneStore.activePaneId}`)
    paneStore.setPaneFolder(paneStore.activePaneId, node.itemId)

    // Switch pane to a view mode (not edit)
    const currentPane = paneStore.getPane(paneStore.activePaneId)
    if (currentPane?.viewMode === 'edit') {
      paneStore.updatePaneMode(paneStore.activePaneId, 'manuscript')
    }
  }
}
```

**Updated Code:**
```typescript
if (node.type === 'folder') {
  const folderViewStore = useFolderViewStore()
  const paneStore = usePaneStore()

  if (folderViewStore.splitEnabled && paneStore.activePaneId) {
    // Split view: Load folder specifically for this pane
    const activePaneId = paneStore.activePaneId
    console.log(`[Nav] Loading folder ${node.itemId} in active pane ${activePaneId}`)
    
    // Load folder for this pane
    paneStore.setPaneFolder(activePaneId, node.itemId)
    
    // Load folder contents for this pane specifically
    paneStore.loadFolderForPane(activePaneId, node.itemId, 'manuscript')

    // Switch pane to a view mode (not edit)
    const currentPane = paneStore.getPane(activePaneId)
    if (currentPane?.viewMode === 'edit') {
      paneStore.updatePaneMode(activePaneId, 'manuscript')
    }
  }
}
```

---

### Step 6: Update FolderView.vue - Remove Problematic Watcher

**File:** `/resources/ts/components/folder/FolderView.vue`

**Location:** Lines 427-440

**Delete this entire watcher:**
```typescript
// Watch for active pane folder changes
watch(() => {
  const activePane = paneStore.activePane
  return activePane?.folderId
}, async (newFolderId) => {
  // When active pane's folder changes, load that folder's content
  if (newFolderId && newFolderId !== props.folderId) {
    console.log(`[FolderView] Active pane folder changed to ${newFolderId}, loading...`)
    // Note: This might need routing logic or we need to support
    // loading different folders in different panes
    // For now, we'll reload with the new folder ID
    await folderViewStore.loadFolder(newFolderId)
  }
})
```

---

### Step 7: Update FolderView.vue - getPaneItems()

**File:** `/resources/ts/components/folder/FolderView.vue`

**Location:** Lines 265-275

**Current Code:**
```typescript
function getPaneItems(paneId: string) {
  const pane = paneStore.getPane(paneId)

  // For edit mode, we might want to filter to just the editing item
  if (pane?.viewMode === 'edit' && pane.editingItemId) {
    return folderItems.value.filter(item => item.id === pane.editingItemId)
  }

  // For other modes, return all items (they'll handle their own filtering based on selection)
  return folderItems.value
}
```

**Updated Code:**
```typescript
function getPaneItems(paneId: string) {
  const pane = paneStore.getPane(paneId)
  if (!pane) return []

  // For edit mode, filter to just the editing item
  if (pane.viewMode === 'edit' && pane.editingItemId) {
    return pane.folderData?.items.filter(item => item.id === pane.editingItemId) || []
  }

  // For other modes, return items from this pane's folder data
  return pane.folderData?.items || []
}
```

---

### Step 8: Update FolderView.vue - Add getPaneFolder()

**File:** `/resources/ts/components/folder/FolderView.vue`

**Location:** After getPaneItems() function

**New Function:**
```typescript
function getPaneFolder(paneId: string) {
  const pane = paneStore.getPane(paneId)
  if (!pane?.folderData) return null
  
  return {
    id: pane.folderData.id,
    title: pane.folderData.title,
    type: 'folder' as const
  }
}
```

---

### Step 9: Update FolderView.vue - Template

**File:** `/resources/ts/components/folder/FolderView.vue`

**Location:** Lines 190-197 (inside SimpleSplitWrapper template)

**Current Code:**
```vue
<component
  :is="getPaneComponent(paneId)"
  :folder-id="folderId"
  :folder="currentFolder"
  :items="getPaneItems(paneId)"
  :pane-id="paneId"
  :item-id="getPaneEditingItemId(paneId)"
/>
```

**Updated Code:**
```vue
<component
  :is="getPaneComponent(paneId)"
  :folder-id="getPaneFolder(paneId)?.id || folderId"
  :folder="getPaneFolder(paneId) || currentFolder"
  :items="getPaneItems(paneId)"
  :pane-id="paneId"
  :item-id="getPaneEditingItemId(paneId)"
/>
```

---

### Step 10: Handle Pane Cleanup

**File:** `/resources/ts/stores/pane.ts`

**Location:** In `clearAllPanes()` function

**Current Code:**
```typescript
function clearAllPanes() {
  panes.value.clear()
  activePaneId.value = null
  console.log('[PaneStore] Cleared all panes')
}
```

**Updated Code (no changes needed, but verify cleanup works):**

The function already clears all panes, so `folderData` will be cleaned up automatically.

---

### Step 11: Update $reset() if needed

**File:** `/resources/ts/stores/pane.ts`

**Location:** $reset() function (around line 341)

**Current Code:**
```typescript
function $reset() {
  clearAllPanes()
}
```

**No changes needed** - this already works correctly.

---

## Testing Strategy

### Test Case 1: Single Pane Load
```
1. Enable split view
2. Click folder A in navigation
3. Pane 1 should load folder A
4. Pane 2 should remain empty or unchanged
✓ PASS if only active pane updates
```

### Test Case 2: Switch Between Panes
```
1. Click folder A in pane-1
2. Click on pane-2 to activate it
3. Click folder B in navigation
4. Pane-1 should show folder A
5. Pane-2 should show folder B
✓ PASS if each pane maintains independent state
```

### Test Case 3: View Mode Per Pane
```
1. Load folder A in pane-1
2. Switch pane-1 to manuscript view
3. Load folder A in pane-2
4. Switch pane-2 to corkboard view
5. Pane-1 should show manuscript view
6. Pane-2 should show corkboard view
✓ PASS if view modes don't interfere
```

### Test Case 4: Selection Independence
```
1. Load folder in pane-1, select item A
2. Load different folder in pane-2, select item B
3. Verify pane-1 selection shows item A
4. Verify pane-2 selection shows item B
✓ PASS if selections are independent
```

---

## Debugging Tips

### Console Logs to Monitor
```javascript
// In paneStore
console.log(`[PaneStore] Loaded folder for pane ${paneId}`)

// In DynamicManuscriptNavigation  
console.log(`[Nav] Loading folder ${node.itemId} in active pane ${activePaneId}`)
```

### Check Pane State in DevTools
```javascript
// In browser console
import { usePaneStore } from '@/stores/pane'
const paneStore = usePaneStore()
console.log(paneStore.allPanes)
// Look for pane-1 and pane-2 with different folderData
```

### Verify Store References
```javascript
// Each pane should have independent folderData
paneStore.panes.get('pane-1').folderData
paneStore.panes.get('pane-2').folderData

// These should be different objects if loading different folders
```

---

## Potential Issues and Solutions

### Issue 1: Pane state not persisting
**Cause:** folderData cleared prematurely
**Solution:** Check that `onBeforeUnmount` in FolderView doesn't clear pane store

### Issue 2: Both panes still showing same content
**Cause:** getPaneItems() still returning global folderItems
**Solution:** Verify getPaneItems() is returning `pane.folderData?.items`

### Issue 3: Performance degradation with many folders
**Cause:** Each pane caching folder data
**Solution:** Consider adding cache invalidation or maxAge for old pane data

### Issue 4: Memory usage increasing
**Cause:** folderData accumulating in panes
**Solution:** Clear folderData when pane is removed or when switching folders

---

## Files to Modify (Summary)

1. **pane.ts** - Add interface, action, and exports
2. **DynamicManuscriptNavigation.vue** - Call new loadFolderForPane()
3. **FolderView.vue** - Remove watcher, update getPaneItems(), add getPaneFolder()

---

## Verification Checklist

- [ ] PaneState interface has folderData property
- [ ] loadFolderForPane() action exists and is exported
- [ ] DynamicManuscriptNavigation calls loadFolderForPane()
- [ ] Watcher removed from FolderView (lines 427-440)
- [ ] getPaneItems() returns pane.folderData?.items
- [ ] getPaneFolder() function added
- [ ] Template updated to use getPaneFolder()
- [ ] No TypeScript errors
- [ ] Split view toggle and rendering still works
- [ ] Different folders load in different panes
- [ ] Console logs show correct pane IDs loading
- [ ] Each pane maintains independent state

---

## Rollback Plan

If issues arise, revert these files:
1. `resources/ts/stores/pane.ts`
2. `resources/ts/components/manuscript/DynamicManuscriptNavigation.vue`
3. `resources/ts/components/folder/FolderView.vue`

The watcher (which will be removed) can be restored to re-enable global loading if needed.

