# Unified Drag-and-Drop System

## Overview

Wrioter implements drag-and-drop reordering in two contexts:
1. **Folder/Corkboard Views** - Simple reordering within a folder
2. **Vertical Navigation Tree** - Complex reordering with folder hierarchy changes

Both use a shared frontend composable but different backend APIs optimized for their use cases.

---

## Architecture

### Frontend: Shared Composable

**File**: `resources/ts/composables/useDragAndDrop.ts`

All drag-and-drop UI components use this composable for consistent behavior:

```typescript
import { useDragAndDrop } from '@/composables/useDragAndDrop'

const {
  isDragging,
  draggingId,
  dropPosition,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop
} = useDragAndDrop()
```

**Features**:
- Consistent drag state management
- Visual feedback (drop zones, hover states)
- Drag data serialization
- Self-drop prevention
- Position detection (above/below/inside)

---

## Backend: Two Specialized APIs

### 1. Folder Reorder API (Simple)

**Endpoint**: `POST /api/folders/{folderId}/reorder`

**Controller**: `FolderController::reorder()`

**Use Case**: Reordering items within the same folder (no parent change)

**Request**:
```json
{
  "items": [
    { "item_id": 123, "order": 0 },
    { "item_id": 456, "order": 1 },
    { "item_id": 789, "order": 2 }
  ]
}
```

**Database Updates**:
- Updates `items.item_order` for all items
- Parent (`items.parent_id`) stays the same
- Atomic transaction

**Used By**:
- ✅ Corkboard View
- ✅ Manuscript View
- ✅ Outline View

---

### 2. Item Reorder API (Complex)

**Endpoint**: `POST /api/manuscripts/{manuscriptId}/items/reorder`

**Controller**: `ItemController::reorder()`

**Use Case**: Moving items between folders AND reordering

**Request**:
```json
{
  "source_item_id": 123,
  "target_item_id": 456,
  "position": "above" | "below" | "inside"
}
```

**Database Updates**:
- Updates `items.parent_id` (can change folders)
- Updates `items.item_order` for affected items
- Recalculates order for all siblings
- Atomic transaction

**Used By**:
- ✅ Vertical Navigation Tree

---

## When to Use Which API?

### Use **Folder Reorder API** when:
- ❌ Items stay in same folder
- ✅ Simple drag-and-drop within a list
- ✅ All items have same parent_id
- ✅ You have the complete new order

**Example**: Drag card #3 to position #1 in corkboard

### Use **Item Reorder API** when:
- ✅ Items can move between folders
- ✅ Parent folder can change
- ✅ Hierarchical tree structure
- ✅ Position relative to target (above/below/inside)

**Example**: Drag "Chapter 1" into "Part 2" folder in navigation tree

---

## Implementation Comparison

### Corkboard/Folder Views

```typescript
// Calculate new order for all items
const reorderedItems = [...items].map((item, index) => ({
  item_id: item.id,
  order: index
}))

// Call simple folder reorder
await reorderFolderItems(folderId, reorderedItems)

// Reload folder contents
emit('itemsReordered')
```

**Pros**:
- Fast: Single API call with complete order
- Simple: No complex position logic
- Predictable: Entire list reordered at once

**Cons**:
- Can't change parent folder
- Requires recalculating entire list

---

### Vertical Navigation Tree

```typescript
// User drops item relative to target
const dropResult = handleDrop(event, targetId, targetItemId, 'above')

// Call complex item reorder
await manuscriptStore.reorderItem({
  sourceItemId: dropResult.sourceItemId,
  targetItemId: dropResult.targetItemId,
  position: dropResult.position,
  manuscriptId: selectedManuscriptId
})

// Reload navigation tree
await manuscriptStore.fetchManuscriptItems(selectedManuscriptId)
```

**Pros**:
- Can move between folders (change parent_id)
- Intuitive position-based logic
- Handles complex hierarchy

**Cons**:
- More complex backend logic
- Requires sibling order recalculation
- Single item moved at a time

---

## Database Schema

### items table

```sql
CREATE TABLE items (
  id BIGINT UNSIGNED PRIMARY KEY,
  parent_id BIGINT UNSIGNED NULL,    -- Folder hierarchy
  item_order INT NOT NULL DEFAULT 0, -- Order within parent
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(191),
  type ENUM('folder', 'text', ...),
  -- ... other columns
  KEY idx_parent_order (parent_id, item_order)
);
```

**Key Points**:
- `parent_id`: NULL = root level, otherwise folder ID
- `item_order`: Position within parent (0, 1, 2, ...)
- Index on `(parent_id, item_order)` for fast sorting

### Queries

```php
// Get items in folder, sorted by order
Item::where('parent_id', $folderId)
    ->orderBy('item_order', 'asc')
    ->get();
```

---

## Frontend Component Usage

### TreeNode (Vertical Nav)

```vue
<template>
  <div
    draggable="true"
    @dragstart="handleDragStart($event, { id: node.id, itemId: node.itemId })"
    @dragend="handleDragEnd"
    @dragover.prevent="handleDragOver($event, node.id, 'inside', { allowInside: hasChildren })"
    @drop="onDrop"
  >
    <!-- Drop zones -->
    <div v-if="showDropZoneAbove" class="drop-zone drop-zone-above" />

    <!-- Node content -->
    <div class="node-content">{{ node.title }}</div>

    <div v-if="showDropZoneBelow" class="drop-zone drop-zone-below" />
  </div>
</template>

<script setup>
import { useDragAndDrop } from '@/composables/useDragAndDrop'

const { handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useDragAndDrop()

const onDrop = async (event) => {
  const result = handleDrop(event, node.id, node.itemId, 'above')
  if (result) {
    emit('node-drop', result)
  }
}
</script>
```

### CorkboardCard

```vue
<template>
  <VCard
    draggable="true"
    @dragstart="handleDragStart($event, { id: card.id, itemId: card.id })"
    @dragend="handleDragEnd"
    @dragover.prevent="handleDragOver($event, card.id, 'above')"
  >
    {{ card.title }}
  </VCard>
</template>

<script setup>
import { useDragAndDrop } from '@/composables/useDragAndDrop'

const { handleDragStart, handleDragEnd, handleDragOver } = useDragAndDrop()
</script>
```

---

## Visual Feedback

### CSS Classes

Both systems use consistent CSS classes:

```scss
// Dragging state
.is-dragging {
  opacity: 0.4;
  cursor: grabbing;
}

// Drop zones
.drop-zone {
  height: 4px;
  position: relative;

  &::before {
    content: '';
    height: 2px;
    background: rgb(var(--v-theme-primary));
    position: absolute;
    left: 0;
    right: 0;
  }
}

// Drop target (for folders)
.drop-target {
  background: rgba(var(--v-theme-primary), 0.15);
  border: 2px dashed rgb(var(--v-theme-primary));
}

// Cursor states
[draggable="true"] {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
```

---

## Error Handling

### Frontend

```typescript
try {
  await reorderFolderItems(folderId, items)
  // Success - reload data
  emit('itemsReordered')
} catch (error) {
  console.error('Reorder failed:', error)
  // Show user notification
  toast.error('Failed to reorder items')
  // Optionally revert UI
}
```

### Backend

Both APIs use database transactions:

```php
DB::beginTransaction();

try {
  // Update items...
  DB::commit();

  return response()->json(['success' => true]);
} catch (\Exception $e) {
  DB::rollBack();
  Log::error('Reorder failed', ['error' => $e->getMessage()]);

  return response()->json([
    'error' => 'Failed to reorder items'
  ], 500);
}
```

---

## Testing Checklist

### Folder Reorder API

- [ ] Reorder items in corkboard view
- [ ] Reorder items in manuscript view
- [ ] Reorder items in outline view
- [ ] Verify `item_order` updates correctly
- [ ] Test with empty folder
- [ ] Test authorization (unauthorized user)
- [ ] Test with non-existent folder
- [ ] Verify transaction rollback on error

### Item Reorder API

- [ ] Move item above another item
- [ ] Move item below another item
- [ ] Move item inside folder
- [ ] Move item from folder to root
- [ ] Move item between folders
- [ ] Verify `parent_id` changes correctly
- [ ] Verify `item_order` recalculates for siblings
- [ ] Test with nested folders (3+ levels)
- [ ] Test authorization (unauthorized manuscript)
- [ ] Verify transaction rollback on error

---

## Migration Notes

If you previously had duplicate/competing APIs:

1. **Keep both APIs** - they serve different purposes
2. **Use `useDragAndDrop()` composable** - unified frontend logic
3. **Route `/api/folders/{id}/reorder`** → Folder/Corkboard views
4. **Route `/api/manuscripts/{id}/items/reorder`** → Navigation tree
5. **Update documentation** - clarify when to use each API

---

## Future Improvements

### Potential Enhancements

1. **Optimistic UI Updates**
   - Update UI immediately, revert on error
   - Improves perceived performance

2. **Batch Operations**
   - Support moving multiple items at once in navigation tree
   - Currently only single-item moves

3. **Undo/Redo**
   - Track reorder history
   - Allow users to undo accidental moves

4. **Keyboard Navigation**
   - Arrow keys + Ctrl to reorder
   - Accessibility improvement

5. **Touch/Mobile Support**
   - Long-press to initiate drag
   - Mobile-friendly drop zones

---

## See Also

- [Corkboard Feature Documentation](./corkboard-feature.md)
- [Vertical Navigation Documentation](./dynamic-manuscript-navigation.md)
- [Database Schema](../database/schemas/current_tables.txt)
- [API Endpoints](../api/endpoints.md)
