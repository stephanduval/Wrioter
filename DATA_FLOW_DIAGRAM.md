# Data Flow Diagram: Split View Folder Loading Issue

## Current (Buggy) Architecture

```
Navigation Tree (DynamicManuscriptNavigation)
    |
    | User clicks folder
    v
handleNodeClick(folderId)
    |
    +---> paneStore.setPaneFolder(activePaneId, folderId)
    |         |
    |         v
    |     paneStore.activePane.folderId = folderId
    |     paneStore.activePaneId = "pane-1"
    |     
    |     (Pane State)
    |     pane-1: { folderId: 123, ... }
    |     pane-2: { folderId: null, ... }
    |
    v
FolderView.vue mounts
    |
    +---> Watcher on activePane?.folderId
    |         |
    |         | Detects change to activePane.folderId
    |         v
    |     folderViewStore.loadFolder(newFolderId)
    |         |
    |         v
    |     Call API: GET /folders/123/contents
    |         |
    |         v
    |     folderViewStore.currentFolderId = 123
    |     folderViewStore.folderItems = [...]  <-- GLOBAL STATE!
    |     folderViewStore.currentFolder = { ... }
    |
    v
Both panes render via getPaneItems()
    |
    +---> Pane 1: getPaneItems("pane-1")
    |         |
    |         | Returns: folderViewStore.folderItems (GLOBAL)
    |         v
    |     Renders items from folder 123
    |
    +---> Pane 2: getPaneItems("pane-2")
             |
             | Returns: folderViewStore.folderItems (GLOBAL)
             v
         ALSO Renders items from folder 123 ❌ BUG!


RESULT: Both panes show the same folder content
```

---

## Problem Flow Diagram

```
                    ┌─────────────────────────┐
                    │  Navigation (DynamicNav)│
                    └────────────┬─────────────┘
                                 │
                                 │ User clicks folder
                                 v
                    ┌─────────────────────────┐
                    │ handleNodeClick(folder) │
                    └────────────┬─────────────┘
                                 │
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    v                         v
           ┌──────────────────┐      ┌──────────────────┐
           │  paneStore       │      │ folderViewStore  │
           ├──────────────────┤      ├──────────────────┤
           │ pane-1:          │      │ currentFolderId: │
           │   folderId: 123  │      │   123 ??? ❌     │
           │ pane-2:          │      │ folderItems: [...│
           │   folderId: null │      │ currentFolder: { │
           └────────┬─────────┘      └────────┬─────────┘
                    │                        │
                    │ Change detected        │ Called globally
                    │ via watcher            │ for ALL panes
                    v                        v
           ┌──────────────────────────────────────┐
           │  FolderView watcher triggers         │
           │  watch(() => activePane?.folderId)  │
           │  Calls folderViewStore.loadFolder()  │
           └────────────┬─────────────────────────┘
                        │
                        v
              ┌──────────────────────────────┐
              │ folderViewStore.folderItems ◄─────┐
              │ Now contains 123's items    │     │
              └────────────┬─────────────────┘     │
                           │                       │
                   ┌───────┴────────┐              │
                   │                │              │
                   v                v              │
           ┌──────────────┐  ┌──────────────┐    │
           │ Pane 1       │  │ Pane 2       │    │
           │ Renders:     │  │ Renders:     │    │
           │ folderItems  │  │ folderItems  │ (both panes
           │ (folder 123) │  │ (folder 123) │  read same
           └──────────────┘  └──────────────┘  global!)
                   │                │
                   └────────┬────────┘
                            v
                   ❌ Both show same content
```

---

## Component Hierarchy - Split View

```
FolderView.vue
├── Props: folderId (the main folder being viewed)
│
├── Watch: activePane?.folderId  ← WATCHES PANE STORE (NOT PROP!)
│   └─> Calls folderViewStore.loadFolder()  ← GLOBAL UPDATE
│
└── Split View Template
    └── SimpleSplitWrapper
        └── Slot: pane (renders for each paneId)
            ├── Pane 1
            │   └── PaneWrapper (paneId="pane-1")
            │       └── Component (ManuscriptView, etc.)
            │           ├── Props: :items="getPaneItems('pane-1')"
            │           │           ↓
            │           │           folderViewStore.folderItems (GLOBAL)
            │           │
            │           └── Renders Folder 123's items
            │
            └── Pane 2
                └── PaneWrapper (paneId="pane-2")
                    └── Component (ManuscriptView, etc.)
                        ├── Props: :items="getPaneItems('pane-2')"
                        │           ↓
                        │           folderViewStore.folderItems (GLOBAL - SAME!)
                        │
                        └── Also Renders Folder 123's items ❌
```

---

## State Isolation Problem

### What Should Happen (Per-Pane State)

```
User Action: Click Folder 123
    ↓
paneStore.pane-1: { folderId: 123, folderData: { items: [...] } }
paneStore.pane-2: { folderId: 99, folderData: { items: [...] } }  ← Independent!
    ↓
Pane 1 renders: folderData from pane-1 (Folder 123)
Pane 2 renders: folderData from pane-2 (Folder 99)  ← Different content
```

### What Actually Happens (Global State)

```
User Action: Click Folder 123
    ↓
paneStore.pane-1.folderId = 123
paneStore.pane-2.folderId = null (unchanged)
    ↓
watcher sees pane-1.folderId changed
    ↓
folderViewStore.loadFolder(123)  ← GLOBAL UPDATE
    ↓
folderViewStore.folderItems = [items from folder 123]
    ↓
paneStore.pane-2 still has folderId: null, BUT pane2 still
gets folderViewStore.folderItems (because getPaneItems always
returns global folderItems)
    ↓
Pane 1 AND Pane 2 both render: items from folder 123 ❌
```

---

## Fix Flow: Per-Pane State

```
Navigation (DynamicNav)
    |
    | User clicks folder 123
    v
handleNodeClick(123)
    |
    | Load folder SPECIFICALLY for active pane
    v
paneStore.loadFolderForPane("pane-1", 123)
    |
    | New action (not yet implemented)
    v
paneStore.pane-1: {
    folderId: 123,
    folderData: {  ← NEW: Per-pane data cache
        items: [...],
        folder: { ... }
    }
}
paneStore.pane-2: {
    folderId: 99,
    folderData: {
        items: [...],  ← Different items!
        folder: { ... }
    }
}
    |
    v
FolderView renders both panes
    |
    +---> getPaneItems("pane-1")
    |         Returns: pane-1.folderData.items (folder 123)
    |
    +---> getPaneItems("pane-2")
              Returns: pane-2.folderData.items (folder 99)
    |
    v
✓ Each pane shows its own folder content!
```

---

## Code Locations Summary

| Issue | Location | Lines | Problem |
|-------|----------|-------|---------|
| Entry point | DynamicManuscriptNavigation.vue | 243-252 | Calls `setPaneFolder()` which only updates pane ID, not folder data |
| Pane state update | pane.ts | 173-183 | `setPaneFolder()` only sets `folderId`, doesn't load data |
| Problematic watcher | FolderView.vue | 427-440 | Watches `activePane?.folderId` and calls global `folderViewStore.loadFolder()` |
| Global state | folderView.ts | 121-157 | `loadFolder()` updates global `folderItems` shared by all panes |
| Data sharing | FolderView.vue | 265-275 | `getPaneItems()` returns global `folderViewStore.folderItems` for all panes |
| Template binding | FolderView.vue | 190-197 | Passes `folderItems` (global) to child components |

---

## Critical Functions

### 1. paneStore.setPaneFolder() [INCOMPLETE]
```typescript
// Current: Only sets folderId, doesn't load data
function setPaneFolder(paneId: string, folderId: number) {
  const pane = panes.value.get(paneId)
  if (!pane) return
  pane.folderId = folderId  // ← Missing: actual folder content loading
  pane.selectedItemIds.clear()
  pane.focusedItemId = undefined
}
```

### 2. FolderView Watcher [WRONG DEPENDENCY]
```typescript
// Current: Watches global activePane, loads for all panes
watch(() => {
  const activePane = paneStore.activePane  // ← Watching GLOBAL active pane
  return activePane?.folderId
}, async (newFolderId) => {
  await folderViewStore.loadFolder(newFolderId)  // ← GLOBAL load
})
```

### 3. getPaneItems() [RETURNS GLOBAL DATA]
```typescript
// Current: All panes get same data
function getPaneItems(paneId: string) {
  const pane = paneStore.getPane(paneId)
  // ... edit mode check ...
  return folderItems.value  // ← Same for all panes!
}
```

---

## Key Insight

The architecture confuses:
- **FolderView** (the container component) with **Individual panes** (view instances)
- **Global folder state** (folderViewStore) with **Per-pane folder viewing**

Each pane needs its own folder viewing state, not a shared global state.

