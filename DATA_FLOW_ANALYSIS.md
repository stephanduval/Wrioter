# Data Flow Analysis: Why Both Panes Update When Folder is Clicked

## Problem Summary
When a folder is clicked in the navigation tree, both panes in split view update to show the same content, instead of only the active pane updating.

---

## 1. Entry Point: handleNodeClick in DynamicManuscriptNavigation.vue

**File:** `/resources/ts/components/manuscript/DynamicManuscriptNavigation.vue` (lines 223-266)

```typescript
const handleNodeClick = (nodeId: string) => {
  navigationStore.selectNode(nodeId)
  const node = manuscriptStore.findNodeById(nodeId)
  
  if (node) {
    // For folders...
    if (node.type === 'folder') {
      const folderViewStore = useFolderViewStore()
      const paneStore = usePaneStore()

      if (folderViewStore.splitEnabled && paneStore.activePaneId) {
        // Split view: Update active pane to show this folder's content
        console.log(`[Nav] Loading folder ${node.itemId} in active pane ${paneStore.activePaneId}`)
        paneStore.setPaneFolder(paneStore.activePaneId, node.itemId)  // <-- KEY CALL

        // Switch pane to a view mode (not edit)
        const currentPane = paneStore.getPane(paneStore.activePaneId)
        if (currentPane?.viewMode === 'edit') {
          paneStore.updatePaneMode(paneStore.activePaneId, 'manuscript')
        }
      }
    }
  }
}
```

**What happens:**
- `paneStore.setPaneFolder(activePaneId, folderId)` is called to update only the active pane's folder

---

## 2. Pane Store Update: setPaneFolder() in pane.ts

**File:** `/resources/ts/stores/pane.ts` (lines 173-183)

```typescript
function setPaneFolder(paneId: string, folderId: number) {
  const pane = panes.value.get(paneId)
  if (!pane) return

  pane.folderId = folderId  // <-- Updates pane.folderId
  pane.selectedItemIds.clear()
  pane.focusedItemId = undefined

  console.log(`[PaneStore] Pane ${paneId} folder set to: ${folderId}`)
}
```

**What happens:**
- Only updates the specific pane's `folderId`
- This change triggers reactivity in FolderView.vue watchers

---

## 3. The Critical Watcher: FolderView.vue (lines 427-440)

**File:** `/resources/ts/components/folder/FolderView.vue` (lines 427-440)

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
    await folderViewStore.loadFolder(newFolderId)  // <-- PROBLEM HERE!
  }
})
```

**THE ISSUE:** This watcher watches `activePane?.folderId` (NOT the prop `folderId`), and when ANY pane's folder changes, it calls `folderViewStore.loadFolder()` globally.

---

## 4. The Root Cause: folderViewStore.loadFolder() in folderView.ts

**File:** `/resources/ts/stores/folderView.ts` (lines 121-157)

```typescript
async function loadFolder(folderId: number, viewMode: ViewMode = currentViewMode.value) {
  try {
    isLoading.value = true
    error.value = null
    currentFolderId.value = folderId  // <-- GLOBAL STATE!

    console.log(`Loading folder ${folderId} in ${viewMode} view mode`)

    // Fetch folder contents with view mode optimization
    const response = await $api(`/folders/${folderId}/contents`, {
      params: { view_mode: viewMode }
    })

    console.log('Folder contents loaded:', response)

    currentFolder.value = response.folder
    folderItems.value = response.items || []  // <-- SHARED BETWEEN PANES!

    // Load user preferences for this folder
    if (response.view_preferences) {
      viewPreferences.value.set(folderId, response.view_preferences)

      // Set view mode from preferences if different
      if (response.view_preferences.view_mode !== viewMode) {
        currentViewMode.value = response.view_preferences.view_mode
      }
    }

    console.log(`Loaded ${folderItems.value.length} items in ${viewMode} view`)
  } catch (err: any) {
    console.error('Failed to load folder:', err)
    error.value = err.message || 'Failed to load folder contents'
    throw err
  } finally {
    isLoading.value = false
  }
}
```

**PROBLEM IDENTIFIED:** 
- `folderViewStore` maintains **GLOBAL** state (`currentFolderId`, `folderItems`, `currentFolder`)
- All panes share this same store instance
- When `loadFolder()` is called, it updates **GLOBAL** `folderItems` array
- Both panes render from the same `folderItems` array

---

## 5. Data Flow in FolderView.vue Template

**File:** `/resources/ts/components/folder/FolderView.vue` (lines 152-198)

```vue
<!-- Regular View Mode (no split) -->
<template v-else-if="!splitEnabled">
  <ManuscriptView
    v-if="currentViewMode === 'manuscript'"
    :folder-id="folderId"
    :folder="currentFolder"
    :items="folderItems"  <!-- SHARED GLOBAL STATE -->
  />
  <!-- ... -->
</template>

<!-- Split View Mode -->
<SimpleSplitWrapper
  v-else-if="splitEnabled && currentSplitLayout"
  :layout="currentSplitLayout"
  class="split-view-container"
>
  <template #pane="{ paneId, index }">
    <PaneWrapper
      :pane-id="paneId"
      @view-mode-change="handlePaneViewModeChange(paneId, $event)"
    >
      <!-- Render view based on pane's specific view mode -->
      <component
        :is="getPaneComponent(paneId)"
        :folder-id="folderId"
        :folder="currentFolder"
        :items="getPaneItems(paneId)"  <!-- SHARED GLOBAL STATE -->
        :pane-id="paneId"
        :item-id="getPaneEditingItemId(paneId)"
      />
    </PaneWrapper>
  </template>
</SimpleSplitWrapper>
```

**Issue in getPaneItems():**

```typescript
function getPaneItems(paneId: string) {
  const pane = paneStore.getPane(paneId)

  // For edit mode, we might want to filter to just the editing item
  if (pane?.viewMode === 'edit' && pane.editingItemId) {
    return folderItems.value.filter(item => item.id === pane.editingItemId)
  }

  // For other modes, return all items (they'll handle their own filtering based on selection)
  return folderItems.value  // <-- RETURNS GLOBAL ARRAY FOR BOTH PANES
}
```

Both panes receive the **same** `folderItems.value` array from the global `folderViewStore`.

---

## 6. Why It Happens: Reactive Cascade

```
User clicks folder in navigation
    ↓
handleNodeClick(nodeId) executes
    ↓
paneStore.setPaneFolder(activePaneId, folderId)
    ↓
activePane.folderId changes
    ↓
Watcher on activePane?.folderId triggers
    ↓
folderViewStore.loadFolder(newFolderId) called GLOBALLY
    ↓
folderViewStore.folderItems = [...] (GLOBAL STATE UPDATED)
    ↓
Both panes are reactively observing folderViewStore
    ↓
Both panes re-render with same folderItems array
    ↓
RESULT: Both panes show same folder content
```

---

## 7. Root Architecture Problem

The issue stems from a **architectural mismatch**:

| Component | State Model | Should Be |
|-----------|------------|-----------|
| **folderViewStore** | Global singleton | Per-pane state |
| **folderItems** | Shared across all panes | Pane-specific |
| **currentFolderId** | Global | Per-pane |
| **currentFolder** | Global | Per-pane |
| **Watcher location** | FolderView component | Pane-level component |

---

## 8. The Fix Needed

### Option A: Make folderViewStore Pane-Aware (RECOMMENDED)

**Store the folder contents per-pane in `paneStore`:**

```typescript
// In pane.ts - Add folder cache
export interface PaneState {
  id: string
  viewMode: PaneViewMode
  folderId?: number
  editingItemId?: number
  
  // NEW: Per-pane folder data
  folderData?: {
    id: number
    title: string
    items: FolderItem[]
    viewMode: ViewMode
  }
  
  selectedItemIds: Set<number>
  focusedItemId?: number
  viewSettings: PaneViewSettings
  isActive: boolean
  isLoading: boolean
  error?: string
}
```

**Changes required:**

1. **PaneStore** - Add action to load folder data per pane:
```typescript
async function loadFolderForPane(paneId: string, folderId: number) {
  const pane = panes.value.get(paneId)
  if (!pane) return

  pane.isLoading = true
  try {
    const response = await $api(`/folders/${folderId}/contents`, {
      params: { view_mode: pane.viewMode }
    })
    
    pane.folderData = {
      id: response.folder.id,
      title: response.folder.title,
      items: response.items || [],
      viewMode: pane.viewMode
    }
  } finally {
    pane.isLoading = false
  }
}
```

2. **DynamicManuscriptNavigation.vue** - Call pane-specific load:
```typescript
const handleNodeClick = (nodeId: string) => {
  // ... existing code ...
  if (node.type === 'folder') {
    if (folderViewStore.splitEnabled && paneStore.activePaneId) {
      // Load folder specifically for THIS pane
      paneStore.loadFolderForPane(paneStore.activePaneId, node.itemId)
      paneStore.setActivePane(paneStore.activePaneId)
    }
  }
}
```

3. **FolderView.vue** - Get items from pane instead of global store:
```typescript
function getPaneItems(paneId: string) {
  const pane = paneStore.getPane(paneId)
  return pane?.folderData?.items || []
}

function getCurrentFolder(paneId: string) {
  const pane = paneStore.getPane(paneId)
  if (!pane?.folderData) return null
  return {
    id: pane.folderData.id,
    title: pane.folderData.title
  }
}
```

4. **Remove problematic watcher** from FolderView.vue (lines 427-440)

### Option B: Keep Global Store but Add Pane Filtering

Store which pane requested the folder, and only update that pane:
```typescript
// This is less clean but requires fewer changes
const lastRequestedPaneId = ref<string | null>(null)

function getPaneItems(paneId: string) {
  // Only return items if this pane requested them
  if (lastRequestedPaneId.value !== paneId) {
    return []
  }
  return folderItems.value
}
```

---

## Summary

**The bug:** The global `folderViewStore` maintains shared state that all panes draw from. When a folder is loaded for one pane, the global `folderItems` is updated, affecting both panes.

**The fix:** Move folder content caching to the `paneStore` so each pane has independent folder data. This requires:
1. Adding `folderData` to `PaneState` interface
2. Adding `loadFolderForPane()` action to paneStore
3. Updating navigation click handler to use pane-specific loading
4. Updating FolderView to render from pane-specific data
5. Removing the problematic watcher on `activePane?.folderId`

