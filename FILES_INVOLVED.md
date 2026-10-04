# Files Involved in the Data Flow Issue

## Summary of Files and Their Roles

### 1. DynamicManuscriptNavigation.vue
**Path:** `/resources/ts/components/manuscript/DynamicManuscriptNavigation.vue`

**Role:** Entry point for folder click handling

**Key Code (lines 243-259):**
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

**Problem:** Calls `setPaneFolder()` which only sets the `folderId` on the pane state. It doesn't load the actual folder content.

**What It Should Do:** Either:
1. Call a new `loadFolderForPane()` action, OR
2. Call `folderViewStore.loadFolder()` BUT ensure it's scoped to the specific pane

---

### 2. pane.ts (PaneStore)
**Path:** `/resources/ts/stores/pane.ts`

**Role:** Manages individual pane state

**Key Interface (lines 24-43):**
```typescript
export interface PaneState {
  id: string
  viewMode: PaneViewMode
  folderId?: number
  editingItemId?: number
  selectedItemIds: Set<number>
  focusedItemId?: number
  viewSettings: PaneViewSettings
  isActive: boolean
  isLoading: boolean
  error?: string
}
```

**Problem:** No `folderData` property to cache folder contents per pane.

**Key Function (lines 173-183):**
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

**Problem:** Only sets `folderId`, doesn't load folder data. The corresponding folder contents are loaded in FolderView via a watcher that calls the global store.

**What's Missing:**
1. `folderData` property in `PaneState` interface
2. `loadFolderForPane(paneId, folderId)` action
3. Update `setPaneFolder()` to call the new action

---

### 3. FolderView.vue
**Path:** `/resources/ts/components/folder/FolderView.vue`

**Role:** Container component that manages folder views and split view rendering

**Props (lines 217-219):**
```typescript
const props = defineProps<{
  folderId: number
}>()
```

**Stores Used (lines 229-241):**
```typescript
const folderViewStore = useFolderViewStore()
const paneStore = usePaneStore()

const {
  currentViewMode,
  currentFolder,
  folderItems,
  isLoading,
  error,
  itemCount,
  splitEnabled,
  currentSplitLayout
} = storeToRefs(folderViewStore)
```

**PROBLEM:** All references to `folderItems`, `currentFolder`, `currentViewMode` come from the GLOBAL `folderViewStore`.

**Critical Watcher (lines 427-440):**
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

**PROBLEM #1:** Watches `activePane?.folderId` (a property of ONE pane)
**PROBLEM #2:** But calls `folderViewStore.loadFolder()` which affects ALL panes globally
**PROBLEM #3:** The watcher compares with `props.folderId` but then ignores it and loads to global store

**Template Code (lines 190-197):**
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

**PROBLEM:** All panes get `:folder="currentFolder"` and `:items="getPaneItems(paneId)"` which returns global data.

**getPaneItems Function (lines 265-275):**
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

**PROBLEM:** Returns `folderItems.value` (GLOBAL) for all panes, not pane-specific data.

---

### 4. folderView.ts (FolderViewStore)
**Path:** `/resources/ts/stores/folderView.ts`

**Role:** Global state for folder viewing

**State (lines 65-81):**
```typescript
const currentViewMode = ref<ViewMode>('corkboard')
const currentFolderId = ref<number | null>(null)
const currentFolder = ref<FolderData | null>(null)
const folderItems = ref<FolderItem[]>([])
const viewPreferences = ref<Map<number, ViewPreference>>(new Map())

const isLoading = ref(false)
const error = ref<string | null>(null)

// Split view state
const splitEnabled = ref(false)
const splitLayouts = ref<{...}>({})
```

**PROBLEM:** All state is GLOBAL and shared by all panes.

**loadFolder Function (lines 121-157):**
```typescript
async function loadFolder(folderId: number, viewMode: ViewMode = currentViewMode.value) {
  try {
    isLoading.value = true
    error.value = null
    currentFolderId.value = folderId

    console.log(`Loading folder ${folderId} in ${viewMode} view mode`)

    const response = await $api(`/folders/${folderId}/contents`, {
      params: { view_mode: viewMode }
    })

    currentFolder.value = response.folder
    folderItems.value = response.items || []  // <-- GLOBAL ARRAY!

    // ... rest of function
  } catch (err: any) {
    console.error('Failed to load folder:', err)
    error.value = err.message || 'Failed to load folder contents'
    throw err
  } finally {
    isLoading.value = false
  }
}
```

**PROBLEM:** Updates global `folderItems` array that all panes read from.

---

### 5. SimpleSplitWrapper.vue
**Path:** `/resources/ts/components/splitView/SimpleSplitWrapper.vue`

**Role:** Renders the split pane layout

**Mount Hook (lines 68-71):**
```typescript
onMounted(() => {
  console.log('[SimpleSplitWrapper] Initializing pane states')
  paneStore.initializeDefaultPanes()
})
```

**Slot Usage (lines 181-182):**
```vue
<slot name="pane" :pane-id="paneId" :index="index" />
```

**Role:** Creates panes via `initializeDefaultPanes()` which creates `pane-1` and `pane-2` with initial state.

---

### 6. PaneWrapper.vue
**Path:** `/resources/ts/components/splitView/PaneWrapper.vue`

**Role:** Individual pane container with controls

**Props (lines 194-196):**
```typescript
const props = defineProps<{
  paneId: string
}>()
```

**Get Pane State (line 208):**
```typescript
const paneState = computed(() => paneStore.getPane(props.paneId))
```

**Role:** Each pane gets its state from `paneStore.getPane(paneId)`, but the actual **content** comes from the global `folderViewStore`.

---

## Data Flow Sequence

```
1. User clicks folder in DynamicManuscriptNavigation
   ↓
2. handleNodeClick() calls paneStore.setPaneFolder(activePaneId, folderId)
   ↓
3. paneStore.pane-1.folderId = folderId (only pane-1 updated)
   ↓
4. FolderView.vue watcher detects activePane?.folderId changed
   ↓
5. Watcher calls folderViewStore.loadFolder(folderId)
   ↓
6. folderViewStore.folderItems = [...] (GLOBAL UPDATE - affects all panes!)
   ↓
7. Both Pane 1 and Pane 2 call getPaneItems()
   ↓
8. Both get folderViewStore.folderItems (same global array)
   ↓
9. Both panes render same content ❌
```

---

## Required Changes by File

### pane.ts
```diff
+ Add folderData to PaneState interface
+ Add loadFolderForPane() action
- Modify setPaneFolder() to call loadFolderForPane()
```

### DynamicManuscriptNavigation.vue
```diff
+ Keep setPaneFolder() call OR replace with paneStore.loadFolderForPane()
```

### FolderView.vue
```diff
- Remove watcher on activePane?.folderId (lines 427-440)
- Update getPaneItems() to return pane.folderData.items
- Update getCurrentFolder() to return pane.folderData.folder
- Remove dependency on global folderViewStore for content
```

### folderView.ts
```diff
- Keep or refactor to be used for preferences/metadata only
- Remove folderItems if moving to per-pane loading
```

---

## Architecture Implications

The current architecture treats:
- **FolderViewStore** = Single global view state
- **FolderView component** = Single folder viewer container
- **Split panes** = Two views of the same folder (works for single-folder viewing)

The new architecture should treat:
- **PaneStore** = Per-pane state including folder viewing data
- **FolderView component** = Coordinator that renders multiple independent pane views
- **Split panes** = Independent viewers, each with own folder context

This is similar to how IDE split editors work (VS Code, IntelliJ) where each pane maintains independent file/folder viewing context.

