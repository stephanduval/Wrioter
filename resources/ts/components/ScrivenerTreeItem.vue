<template>
  <div class="scrivener-tree-item">
    <!-- Current Item -->
    <div class="tree-item-content" :class="{ 'has-children': children.length > 0 }">
      <!-- Indentation -->
      <span class="tree-indent">
        <span v-for="i in level" :key="i" class="indent-line">│&nbsp;&nbsp;</span>
      </span>
      
      <!-- Expand/Collapse Toggle -->
      <span class="tree-toggle" @click="toggleExpanded" v-if="children.length > 0">
        <VIcon 
          :icon="expanded ? 'bx-minus' : 'bx-plus'" 
          size="16" 
          class="toggle-icon"
        />
      </span>
      <span v-else class="tree-toggle-placeholder">
        <span class="branch-char">├─</span>
      </span>
      
      <!-- Item Icon -->
      <VIcon :icon="getItemIcon(item)" :color="getItemColor(item)" size="18" class="me-2" />
      
      <!-- Item Title -->
      <span class="tree-item-title">{{ item.title || 'Untitled' }}</span>
      
      <!-- Item Metadata -->
      <div class="tree-item-metadata">
        <VChip 
          v-if="item.folder_type" 
          size="x-small" 
          variant="outlined" 
          class="ms-2"
        >
          {{ item.folder_type }}
        </VChip>
        
        <VChip 
          v-if="item.word_count > 0" 
          size="x-small" 
          color="info" 
          variant="tonal" 
          class="ms-1"
        >
          {{ item.word_count }}w
        </VChip>
        
        <VChip 
          v-if="item.include_in_compile" 
          size="x-small" 
          color="success" 
          variant="tonal" 
          class="ms-1"
        >
          Compile
        </VChip>
        
        <VChip 
          v-if="item.label" 
          size="x-small" 
          variant="tonal" 
          class="ms-1"
          :style="{ backgroundColor: item.label_color }"
        >
          {{ item.label }}
        </VChip>
        
        <VChip 
          v-if="item.status" 
          size="x-small" 
          variant="outlined" 
          class="ms-1"
          :style="{ borderColor: item.status_color }"
        >
          {{ item.status }}
        </VChip>
      </div>
    </div>
    
    <!-- Detailed Info (if enabled) -->
    <div v-if="detailed && expanded && (item.synopsis || item.notes)" class="tree-item-details">
      <div class="details-indent">
        <span v-for="i in level + 1" :key="i" class="indent-line">│&nbsp;&nbsp;</span>
      </div>
      <div class="details-content">
        <div v-if="item.synopsis" class="synopsis">
          <VIcon icon="bx-file-doc" size="14" class="me-1" />
          <span class="text-caption">Synopsis:</span>
          <span class="text-body-2">{{ item.synopsis }}</span>
        </div>
        <div v-if="item.notes" class="notes mt-1">
          <VIcon icon="bx-note" size="14" class="me-1" />
          <span class="text-caption">Notes:</span>
          <span class="text-body-2">{{ item.notes }}</span>
        </div>
      </div>
    </div>
    
    <!-- Children -->
    <div v-if="expanded && children.length > 0" class="tree-children">
      <ScrivenerTreeItem
        v-for="child in children"
        :key="child.id"
        :item="child"
        :children="getChildren(child)"
        :detailed="detailed"
        :level="level + 1"
        :manuscript-items="manuscriptItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  item: any
  children: any[]
  detailed?: boolean
  level: number
  manuscriptItems?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  detailed: false,
  manuscriptItems: () => []
})

// State
const expanded = ref(true) // Default to expanded

// Helper functions
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const getChildren = (parentItem: any): any[] => {
  return props.manuscriptItems.filter(item => item.parent_id === parentItem.id)
}

const getItemIcon = (item: any) => {
  if (item.folder_type) {
    const icons: any = {
      'chapter': 'bx-book-bookmark',
      'scene': 'bx-file-doc',
      'character': 'bx-user',
      'location': 'bx-map',
      'research': 'bx-search-alt',
      'folder': 'bx-folder',
      'part': 'bx-book-content',
      'section': 'bx-bookmark'
    }
    return icons[item.folder_type] || 'bx-file'
  }
  
  const typeIcons: any = {
    'text': 'bx-file-doc',
    'folder': 'bx-folder',
    'image': 'bx-image',
    'file': 'bx-file'
  }
  return typeIcons[item.type] || 'bx-file'
}

const getItemColor = (item: any) => {
  if (item.folder_type) {
    const colors: any = {
      'chapter': 'primary',
      'scene': 'info',
      'character': 'success',
      'location': 'warning',
      'research': 'secondary',
      'folder': 'default',
      'part': 'primary',
      'section': 'info'
    }
    return colors[item.folder_type] || 'default'
  }
  
  return 'default'
}
</script>

<style scoped>
.scrivener-tree-item {
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.tree-item-content {
  display: flex;
  align-items: center;
  padding: 2px 0;
  position: relative;
}

.tree-item-content:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.tree-indent {
  color: rgba(var(--v-theme-on-surface), 0.3);
  user-select: none;
}

.indent-line {
  display: inline-block;
  width: 16px;
}

.tree-toggle {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 4px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.tree-toggle:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
}

.tree-toggle-placeholder {
  display: inline-block;
  width: 20px;
  margin-right: 4px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.3);
  user-select: none;
}

.branch-char {
  font-size: 12px;
}

.tree-item-title {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  margin-right: 8px;
}

.tree-item-metadata {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tree-item-details {
  display: flex;
  margin-top: 4px;
  margin-bottom: 4px;
}

.details-indent {
  color: rgba(var(--v-theme-on-surface), 0.3);
  user-select: none;
}

.details-content {
  background-color: rgba(var(--v-theme-surface), 0.5);
  border-radius: 4px;
  padding: 8px;
  margin-left: 8px;
  flex: 1;
}

.synopsis, .notes {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.synopsis .text-body-2,
.notes .text-body-2 {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.tree-children {
  margin-left: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tree-item-metadata {
    flex-wrap: wrap;
  }
  
  .tree-item-content {
    flex-wrap: wrap;
  }
  
  .tree-item-title {
    min-width: 0;
    flex: 1;
  }
}
</style>