# Drag-and-Drop Quick Reference

## When to Use Which API?

### Use Folder Reorder API

```typescript
import { reorderFolderItems } from '@/api/folders'

// ✅ Use when:
// - Items stay in same folder
// - Simple list reordering
// - Corkboard, Manuscript, Outline views

const operations = items.map((item, index) => ({
  item_id: item.id,
  order: index
}))

await reorderFolderItems(folderId, operations)
```

**Endpoint**: `POST /api/folders/{folderId}/reorder`

---

### Use Item Reorder API

```typescript
import { useManuscriptStore } from '@/stores/manuscript'

const manuscriptStore = useManuscriptStore()

// ✅ Use when:
// - Moving between folders
// - Changing parent_id
// - Vertical Navigation tree

await manuscriptStore.reorderItem({
  sourceItemId: 123,
  targetItemId: 456,
  position: 'above', // or 'below' or 'inside'
  manuscriptId: selectedManuscriptId
})
```

**Endpoint**: `POST /api/manuscripts/{manuscriptId}/items/reorder`

---

## Frontend Implementation

### In Your Component

```vue
<template>
  <div
    draggable="true"
    @dragstart="handleDragStart($event)"
    @dragend="handleDragEnd"
    @dragover.prevent="handleDragOver($event, 'above')"
    @drop="handleDrop($event, 'above')"
  >
    Your content
  </div>
</template>

<script setup lang="ts">
import { useDragAndDrop } from '@/composables/useDragAndDrop'

const {
  isDragging,
  handleDragStart: dragStart,
  handleDragEnd: dragEnd,
  handleDragOver: dragOver,
  handleDrop: drop
} = useDragAndDrop()

const handleDragStart = (event: DragEvent) => {
  dragStart(event, {
    id: item.id,
    itemId: item.id,
    type: item.type,
    title: item.title
  })
}

const handleDragEnd = () => {
  dragEnd()
}

const handleDragOver = (event: DragEvent, position: 'above' | 'below' | 'inside') => {
  dragOver(event, item.id, position, {
    allowInside: item.type === 'folder',
    preventSelf: true
  })
}

const handleDrop = async (event: DragEvent, position: 'above' | 'below' | 'inside') => {
  const result = drop(event, item.id, item.itemId, position)
  if (result) {
    // Call appropriate API here
  }
}
</script>
```

---

## Decision Tree

```
Is the item moving to a different folder?
│
├─ YES → Use Item Reorder API
│         (POST /api/manuscripts/{id}/items/reorder)
│
└─ NO → Use Folder Reorder API
        (POST /api/folders/{id}/reorder)
```

---

## API Request Formats

### Folder Reorder API

```json
POST /api/folders/123/reorder

{
  "items": [
    { "item_id": 456, "order": 0 },
    { "item_id": 789, "order": 1 },
    { "item_id": 101, "order": 2 }
  ]
}
```

**Updates**: `item_order` only

---

### Item Reorder API

```json
POST /api/manuscripts/10/items/reorder

{
  "source_item_id": 456,
  "target_item_id": 789,
  "position": "above"
}
```

**Updates**: `item_order` AND `parent_id`

---

## Common Patterns

### Corkboard Reorder

```typescript
// User drags card to new position
const handleCardDrop = async (draggedCard, dropIndex) => {
  // Reorder items array
  const reordered = [...items]
  const draggedIndex = items.findIndex(i => i.id === draggedCard.id)
  reordered.splice(draggedIndex, 1)
  reordered.splice(dropIndex, 0, draggedCard)

  // Convert to API format
  const operations = reordered.map((item, index) => ({
    item_id: item.id,
    order: index
  }))

  // Call Folder API
  await reorderFolderItems(folderId, operations)

  // Reload data
  emit('itemsReordered')
}
```

---

### Vertical Nav Reorder

```typescript
// User drags tree node to new location
const handleNodeDrop = async (data) => {
  // Call Item API
  await manuscriptStore.reorderItem({
    sourceItemId: data.sourceItemId,
    targetItemId: data.targetItemId,
    position: data.position,
    manuscriptId: selectedManuscriptId
  })

  // Reload tree
  await manuscriptStore.fetchManuscriptItems(selectedManuscriptId)
}
```

---

## Styling

### CSS Classes

```scss
// Draggable element
[draggable="true"] {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

// While dragging
.is-dragging {
  opacity: 0.4;
  cursor: grabbing;
}

// Drop zones
.drop-zone {
  height: 4px;

  &::before {
    content: '';
    height: 2px;
    background: rgb(var(--v-theme-primary));
    position: absolute;
    left: 0;
    right: 0;
  }
}

// Drop target (folders)
.drop-target {
  background: rgba(var(--v-theme-primary), 0.15);
  border: 2px dashed rgb(var(--v-theme-primary));
}
```

---

## Error Handling

```typescript
try {
  await reorderFolderItems(folderId, operations)
  // Success - reload data
  emit('itemsReordered')
} catch (error) {
  console.error('Reorder failed:', error)
  // Show notification
  toast.error('Failed to reorder items')
  // Optionally revert UI changes
}
```

---

## Files to Reference

### Frontend
- `resources/ts/composables/useDragAndDrop.ts` - Shared composable
- `resources/ts/api/folders.ts` - Folder API client
- `resources/ts/stores/manuscript.ts` - Item reorder method

### Backend
- `app/Http/Controllers/FolderController.php` - Folder reorder
- `app/Http/Controllers/ItemController.php` - Item reorder
- `routes/api.php` - API routes

### Documentation
- `docs/features/drag-and-drop-unified.md` - Full guide
- `docs/features/DRAG_DROP_SUMMARY.md` - Implementation summary

---

## Quick Checklist

When implementing drag-and-drop:

- [ ] Import `useDragAndDrop` composable
- [ ] Add `draggable="true"` to element
- [ ] Implement drag event handlers
- [ ] Determine which API to use (Folder vs Item)
- [ ] Call appropriate API on drop
- [ ] Reload data after successful reorder
- [ ] Add error handling
- [ ] Style drag feedback (opacity, cursor, drop zones)
- [ ] Test with different scenarios

---

## Need More Help?

See the full documentation:
- [Unified Drag-and-Drop System](./drag-and-drop-unified.md)
