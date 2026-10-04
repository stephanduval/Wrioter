# Split View Folder Loading Bug: Complete Analysis Summary

## Quick Reference

| Item | Value |
|------|-------|
| **Bug Type** | Architecture/State Management |
| **Severity** | High - Core feature broken |
| **Affected Feature** | Split view pane isolation |
| **Root Cause** | Global folder state shared across panes |
| **Fix Complexity** | Medium - Requires state restructuring |
| **Estimated Dev Time** | 2-3 hours |
| **Files Modified** | 3 files |
| **Lines Changed** | ~50 lines |

---

## The Problem in One Sentence

When clicking a folder in split view, both panes update to show the same content instead of only the active pane updating, because all panes read from a shared global `folderViewStore` state.

---

## Complete Data Flow

### Trigger
User clicks folder in DynamicManuscriptNavigation tree

### Current (Buggy) Flow
```
1. handleNodeClick(folder123)
   ↓
2. paneStore.setPaneFolder("pane-1", 123)
   → Only pane-1.folderId = 123
   ↓
3. FolderView.vue watcher on activePane?.folderId fires
   ↓
4. Calls folderViewStore.loadFolder(123) [GLOBAL]
   ↓
5. folderViewStore.folderItems = [items from folder 123]
   ↓
6. getPaneItems("pane-1") → folderViewStore.folderItems
7. getPaneItems("pane-2") → folderViewStore.folderItems (SAME!)
   ↓
8. Both panes render same items ❌
```

### What Should Happen (Fixed)
```
1. handleNodeClick(folder123)
   ↓
2. paneStore.setPaneFolder("pane-1", 123)
   ↓
3. paneStore.loadFolderForPane("pane-1", 123) [NEW]
   ↓
4. pane-1.folderData = { items: [...], ... }
   ↓
5. getPaneItems("pane-1") → pane-1.folderData.items
6. getPaneItems("pane-2") → pane-2.folderData.items (different if pane-2 has different folder)
   ↓
7. Each pane renders independent content ✓
```

---

## Root Cause Analysis

### Three-Part Problem

#### 1. Shared Global State
```typescript
// folderView.ts
const currentFolderId = ref<number | null>(null)
const folderItems = ref<FolderItem[]>([])  // GLOBAL - all panes read this
const currentFolder = ref<FolderData | null>(null)
```

#### 2. Incomplete Pane State
```typescript
// pane.ts - PaneState only has:
export interface PaneState {
  folderId?: number  // ONLY stores the ID
  // ❌ Missing: actual folder data (items, folder metadata)
}
```

#### 3. Problematic Watcher
```typescript
// FolderView.vue - Watches ONE pane but affects ALL panes
watch(() => {
  const activePane = paneStore.activePane  // Watches only the ACTIVE pane
  return activePane?.folderId
}, async (newFolderId) => {
  await folderViewStore.loadFolder(newFolderId)  // BUT loads to GLOBAL state
})
```

---

## Key Code Locations

| File | Line | Issue | Type |
|------|------|-------|------|
| pane.ts | 24-43 | Missing folderData in interface | Design |
| pane.ts | 173-183 | setPaneFolder() incomplete | Implementation |
| DynamicManuscriptNavigation.vue | 243-259 | Doesn't load folder data | Usage |
| FolderView.vue | 427-440 | Watcher calls global load | Architecture |
| FolderView.vue | 265-275 | getPaneItems() returns global data | Implementation |
| folderView.ts | 121-157 | loadFolder() updates global state | Design |

---

## Impact Analysis

### What Works Correctly
- Pane state (viewMode, selections, settings) per pane
- Pane activation/focus
- Pane UI controls
- Watcher detection mechanism

### What's Broken
- Each pane's folder content is NOT independent
- Both panes always show same folder content
- Folder clicking affects both panes simultaneously
- Cannot view different folders in different panes

### Cascading Effects
1. Split view feature essentially broken for actual content viewing
2. Users can't compare different folders side-by-side
3. Navigation integration with split view doesn't work as expected
4. Performance hit from unneeded synchronization

---

## Solution Architecture

### State Organization (Before vs After)

**BEFORE (Broken):**
```
folderViewStore (Global)
  ├─ currentFolderId: 123
  ├─ folderItems: [...]
  ├─ currentFolder: {...}
  
paneStore
  ├─ pane-1: { folderId: 123, ... }
  ├─ pane-2: { folderId: 99, ... }
  
Issue: Both panes read from global folderItems
```

**AFTER (Fixed):**
```
paneStore
  ├─ pane-1: { 
  │   folderId: 123, 
  │   folderData: { items: [...], ... }  // NEW
  │ }
  ├─ pane-2: { 
  │   folderId: 99, 
  │   folderData: { items: [...], ... }  // NEW
  │ }

folderViewStore (Global)
  ├─ preferences, layouts, settings only
  ├─ currentFolderId, folderItems REMOVED (moved to panes)
  
Result: Each pane reads from its own folderData
```

---

## Implementation Steps (Summary)

1. **pane.ts**
   - Add `folderData` property to `PaneState`
   - Add `loadFolderForPane()` action
   - Export new function

2. **DynamicManuscriptNavigation.vue**
   - Add `await paneStore.loadFolderForPane()` call

3. **FolderView.vue**
   - Delete lines 427-440 (problematic watcher)
   - Update `getPaneItems()` to use `pane.folderData.items`
   - Add `getPaneFolder()` function
   - Update template to use per-pane data

---

## Testing Verification

### Critical Test Cases
1. Click folder in pane-1 → only pane-1 updates
2. Activate pane-2, click different folder → pane-2 updates independently
3. Both panes show different content simultaneously
4. View modes per pane don't interfere
5. Selections per pane remain independent

### Success Criteria
- Each pane has independent folder context
- Console logs show correct pane IDs
- No console errors
- Performance comparable to before

---

## Files to Create This Analysis

These documents have been created:

1. **DATA_FLOW_ANALYSIS.md** - Detailed problem explanation
2. **DATA_FLOW_DIAGRAM.md** - Visual flowcharts and diagrams
3. **FILES_INVOLVED.md** - Breakdown of each file's role
4. **IMPLEMENTATION_GUIDE.md** - Step-by-step fix instructions
5. **ANALYSIS_SUMMARY.md** - This document

---

## Technical Debt

### Items to Address Later
1. folderViewStore cleanup - potentially unused after fix
2. Performance optimization - cache management for pane folder data
3. Memory usage - consider cache eviction strategy
4. Testing - add integration tests for pane independence
5. Documentation - update architecture docs

---

## Developer Notes

### Why This Bug Exists
The split view feature was added to an existing folder view system that assumed single global state. The watcher bridges the pane store and folder store but creates an unintended coupling where all panes share data.

### Similar Patterns to Avoid
- Don't watch global store properties from component/pane level
- Don't have per-instance state depend on global state without explicit filtering
- Always consider multi-instance scenarios when designing stores

### Best Practices Violated
- Principle of least privilege - panes have access to global state they don't need
- Separation of concerns - FolderView mixes pane rendering with global state management
- Single responsibility - folderViewStore tries to manage multiple concerns

---

## References

- [PaneStore:](/resources/ts/stores/pane.ts) Per-pane state management
- [FolderViewStore:](/resources/ts/stores/folderView.ts) Global folder viewing state
- [FolderView.vue:](/resources/ts/components/folder/FolderView.vue) Container component
- [DynamicManuscriptNavigation.vue:](/resources/ts/components/manuscript/DynamicManuscriptNavigation.vue) Navigation entry point
- [SimpleSplitWrapper.vue:](/resources/ts/components/splitView/SimpleSplitWrapper.vue) Split layout renderer
- [PaneWrapper.vue:](/resources/ts/components/splitView/PaneWrapper.vue) Individual pane wrapper

---

## Next Steps

1. Review this analysis with team
2. Get approval for architecture changes
3. Implement changes using IMPLEMENTATION_GUIDE.md
4. Test with TEST_CASES from IMPLEMENTATION_GUIDE
5. Create PR with all 3 modified files
6. Update related documentation

---

## Questions Answered by This Analysis

**Q: Why do both panes show the same content?**
A: Because they read from the same global `folderViewStore.folderItems` array.

**Q: Where does the global state get updated?**
A: In the FolderView.vue watcher (line 427-440) which calls `folderViewStore.loadFolder()`.

**Q: Why does the watcher trigger for both panes?**
A: It watches `activePane?.folderId` which is ONE pane, but the load affects ALL panes because it's global.

**Q: How should panes be independent?**
A: Each pane should cache its own folder data in the paneStore, not share from folderViewStore.

**Q: What's the minimum fix?**
A: Add `folderData` to paneStore, load folders per-pane, and remove the problematic watcher.

---

## Estimated Timeline

| Task | Time | Complexity |
|------|------|-----------|
| Understanding (this analysis) | 30 min | Medium |
| Implementation | 90 min | Medium |
| Testing | 30 min | Low |
| Code review fixes | 30 min | Low |
| Documentation updates | 15 min | Low |
| **Total** | **~3 hours** | **Medium** |

---

## Author Notes

This analysis traces a complete data flow through multiple Vue 3 / Pinia store interactions. The core issue is an architectural mismatch between the global folder state and per-pane display context. The fix is straightforward but requires careful attention to state isolation and component reactivity.

