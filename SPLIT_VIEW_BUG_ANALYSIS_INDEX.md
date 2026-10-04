# Split View Folder Loading Bug - Complete Analysis Index

## Quick Navigation

This directory contains a comprehensive analysis of the split view folder loading bug where both panes update when clicking a folder in the navigation.

### Start Here

1. **ANALYSIS_SUMMARY.md** (5 min read) - Executive summary with quick reference table
2. **DATA_FLOW_ANALYSIS.md** (10 min read) - Complete problem explanation with code examples

### Deep Dive

3. **DATA_FLOW_DIAGRAM.md** (8 min read) - Visual flowcharts and state diagrams
4. **FILES_INVOLVED.md** (12 min read) - Breakdown of each file's role and responsibility

### Implementation

5. **IMPLEMENTATION_GUIDE.md** (15 min read) - Step-by-step fix instructions with testing strategy

---

## Document Overview

### ANALYSIS_SUMMARY.md
**Quick Reference Document**

Contains:
- One-sentence problem statement
- 3-part root cause analysis
- Before/after state architecture
- Timeline and complexity estimates
- Q&A section
- Key code locations table

Best for: Getting a quick understanding, presenting to team

---

### DATA_FLOW_ANALYSIS.md
**Detailed Technical Explanation**

Contains:
- Entry point analysis (handleNodeClick)
- Each method call in the chain
- The critical watcher breakdown
- Global state problem identification
- Architecture mismatch explanation
- Recommended fix with code examples
- Summary of why both panes update

Best for: Understanding the exact flow, debugging, technical discussion

---

### DATA_FLOW_DIAGRAM.md
**Visual Flowcharts and Diagrams**

Contains:
- Current buggy architecture ASCII diagram
- Problem flow diagram with component boxes
- Component hierarchy tree
- State isolation comparisons
- "What should happen" vs "what actually happens"
- State flow for fixed architecture
- Code locations summary table
- Critical functions highlighted

Best for: Visual learners, presentations, architecture discussions

---

### FILES_INVOLVED.md
**File-by-File Breakdown**

Contains:
- 6 main files involved with their roles:
  - DynamicManuscriptNavigation.vue
  - pane.ts (PaneStore)
  - FolderView.vue
  - folderView.ts (FolderViewStore)
  - SimpleSplitWrapper.vue
  - PaneWrapper.vue
- For each file: path, role, key code, problems, what's missing
- Data flow sequence diagram
- Required changes by file (diff-style)
- Architecture implications

Best for: Planning implementation, code review, understanding each file's responsibility

---

### IMPLEMENTATION_GUIDE.md
**Step-by-Step Fix Instructions**

Contains:
- Executive summary
- 11 detailed implementation steps with code examples:
  1. Update PaneStore Interface
  2. Add loadFolderForPane() Action
  3. Update setPaneFolder()
  4. Export New Function
  5. Update DynamicManuscriptNavigation.vue
  6. Remove Problematic Watcher
  7. Update getPaneItems()
  8. Add getPaneFolder()
  9. Update Template
  10. Handle Pane Cleanup
  11. Update $reset()
- Testing strategy with 4 test cases
- Debugging tips
- Potential issues and solutions
- Verification checklist
- Rollback plan

Best for: Actually implementing the fix, testing, debugging

---

## Problem Summary

When a folder is clicked in the navigation tree while in split view mode:
1. Only the active pane should update
2. But BOTH panes update to show the same content
3. This breaks the split view feature for comparing different folders

### Root Cause
All panes read folder content from a shared global `folderViewStore.folderItems` array. A watcher in FolderView.vue detects when the active pane's folderId changes and loads that folder to the GLOBAL store, affecting both panes.

### Solution
Move folder content caching from global `folderViewStore` to per-pane `folderData` in `paneStore`. Each pane becomes independent.

---

## Files Modified

| File | Changes | Impact |
|------|---------|--------|
| `/resources/ts/stores/pane.ts` | Add folderData interface, loadFolderForPane() action, update exports | Per-pane folder caching |
| `/resources/ts/components/manuscript/DynamicManuscriptNavigation.vue` | Add loadFolderForPane() call in handleNodeClick() | Load folders per-pane |
| `/resources/ts/components/folder/FolderView.vue` | Remove watcher (lines 427-440), update getPaneItems(), add getPaneFolder(), update template | Use per-pane data instead of global |

---

## Key Insights

### Architecture Problem
```
BEFORE (Broken):
  folderViewStore (Global) ← All panes read from here
  paneStore (Per-pane) ← State but no data
  
AFTER (Fixed):
  paneStore (Per-pane) ← State AND folder data
  folderViewStore (Global) ← Only preferences/settings
```

### The Critical Watcher
Lines 427-440 in FolderView.vue watch `activePane?.folderId` (ONE pane) but call `folderViewStore.loadFolder()` (GLOBAL effect). This is the mechanism that causes the bug.

### The Missing Link
`paneStore.setPaneFolder()` only sets the folder ID, doesn't load the folder contents. The contents come from FolderView's watcher calling the global store.

---

## Timeline

| Phase | Time | Tasks |
|-------|------|-------|
| Analysis & Review | 30 min | Read docs, understand flow, plan implementation |
| Implementation | 90 min | Make changes to 3 files, ~50 lines total |
| Testing | 30 min | Run test cases, verify pane independence |
| Review & Polish | 30 min | Fix issues, update docs, create PR |
| **Total** | **~3 hours** | Complete fix ready for production |

---

## How to Use This Analysis

### For Understanding the Bug
1. Read ANALYSIS_SUMMARY.md (5 min)
2. Read DATA_FLOW_ANALYSIS.md (10 min)
3. Look at DATA_FLOW_DIAGRAM.md (5 min)
4. You now understand the problem

### For Implementing the Fix
1. Read ANALYSIS_SUMMARY.md for context
2. Follow IMPLEMENTATION_GUIDE.md step-by-step
3. Use FILES_INVOLVED.md as reference during implementation
4. Use testing section from IMPLEMENTATION_GUIDE.md to verify

### For Code Review
1. Use FILES_INVOLVED.md to understand each file's changes
2. Verify against IMPLEMENTATION_GUIDE.md steps
3. Check console logs mentioned in testing section
4. Ensure all points in verification checklist are met

### For Team Discussion
1. Present ANALYSIS_SUMMARY.md quick reference
2. Use DATA_FLOW_DIAGRAM.md for visual explanation
3. Show before/after architecture comparison
4. Discuss estimated timeline and impact

---

## All Documents

```
1. ANALYSIS_SUMMARY.md              - Executive summary (START HERE)
2. DATA_FLOW_ANALYSIS.md            - Detailed technical explanation
3. DATA_FLOW_DIAGRAM.md             - Visual diagrams and flowcharts
4. FILES_INVOLVED.md                - File-by-file breakdown
5. IMPLEMENTATION_GUIDE.md          - Step-by-step fix instructions
6. SPLIT_VIEW_BUG_ANALYSIS_INDEX.md - This file
```

---

## Related Files in Codebase

### Source Files (To Be Modified)
- `/resources/ts/stores/pane.ts`
- `/resources/ts/components/manuscript/DynamicManuscriptNavigation.vue`
- `/resources/ts/components/folder/FolderView.vue`

### Referenced Files (Reference Only)
- `/resources/ts/stores/folderView.ts`
- `/resources/ts/components/splitView/SimpleSplitWrapper.vue`
- `/resources/ts/components/splitView/PaneWrapper.vue`

---

## Key Takeaways

1. **The Bug:** Both panes update simultaneously instead of independently
2. **The Cause:** Shared global state + problematic watcher
3. **The Fix:** Per-pane folder caching in paneStore
4. **The Impact:** Split view becomes functional for true multi-folder viewing
5. **The Work:** ~3 hours for experienced developer, ~50 lines changed

---

## Next Action Items

- [ ] Read ANALYSIS_SUMMARY.md
- [ ] Read DATA_FLOW_ANALYSIS.md
- [ ] Review implementation with team
- [ ] Follow IMPLEMENTATION_GUIDE.md
- [ ] Execute test cases
- [ ] Create pull request
- [ ] Update architecture documentation

---

## Support References

For understanding Vue 3 composition API concepts used:
- Stores (Pinia): State management
- Reactive refs: Reactive data properties
- Watchers: Reactive side effects
- Computed: Derived state
- Props: Component communication

For understanding the architectural pattern:
- Per-instance state vs global state
- State isolation
- Component composition
- Store design patterns

---

**Analysis Created:** October 20, 2025
**Status:** Ready for implementation
**Complexity:** Medium
**Estimated Fix Time:** 2-3 hours

