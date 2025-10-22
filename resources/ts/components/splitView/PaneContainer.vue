<template>
  <div class="pane-container">
    <!-- Pane Header -->
    <div class="pane-header">
      <TabBar
        :tabs="pane.tabs"
        :active-tab-id="pane.activeTabId"
        @select="$emit('tab-select', $event)"
        @close="$emit('tab-close', $event)"
        @drag-start="$emit('tab-drag-start', $event)"
        @drag-end="$emit('tab-drag-end')"
        @drop="handleTabDrop"
      />

      <div class="pane-actions">
        <VBtn
          icon
          size="x-small"
          variant="text"
          @click.stop="showSplitMenu = !showSplitMenu"
        >
          <VIcon size="small">mdi-view-split-vertical</VIcon>
        </VBtn>

        <VBtn
          icon
          size="x-small"
          variant="text"
          @click.stop="$emit('close')"
        >
          <VIcon size="small">mdi-close</VIcon>
        </VBtn>

        <VMenu v-model="showSplitMenu" :close-on-content-click="true">
          <template #activator="{ props }">
            <div v-bind="props"></div>
          </template>
          <VList density="compact">
            <VListItem @click="$emit('split', 'vertical')">
              <template #prepend>
                <VIcon>mdi-view-split-vertical</VIcon>
              </template>
              <VListItemTitle>Split Vertical</VListItemTitle>
            </VListItem>
            <VListItem @click="$emit('split', 'horizontal')">
              <template #prepend>
                <VIcon>mdi-view-split-horizontal</VIcon>
              </template>
              <VListItemTitle>Split Horizontal</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </div>
    </div>

    <!-- Pane Content -->
    <div class="pane-content">
      <template v-if="activeTab">
        <component
          :is="getViewComponent(activeTab.type)"
          :key="activeTab.id"
          :item-id="activeTab.itemId"
          :folder-id="activeTab.folderId"
          :view-state="activeTab.viewState"
          @update:dirty="updateTabDirty(activeTab.id, $event)"
          @update:title="updateTabTitle(activeTab.id, $event)"
          @update:view-state="updateTabViewState(activeTab.id, $event)"
        />
      </template>

      <div v-else class="pane-empty">
        <VIcon size="48" color="grey">mdi-tab</VIcon>
        <p>No tab open</p>
        <VBtn @click="openNewTab" color="primary" variant="tonal">
          Open Document
        </VBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import type { Pane, Tab } from '@/types/splitView'
import TabBar from './TabBar.vue'
import ItemEditor from '@/components/manuscript/ItemEditor.vue'
import ManuscriptView from '@/components/manuscript/ManuscriptView.vue'
import CorkboardView from '@/components/corkboard/CorkboardView.vue'
import OutlineView from '@/components/outline/OutlineView.vue'
import MindMapView from '@/components/mindmap/MindMapView.vue'
import ItemView from '@/components/item/ItemView.vue'

const props = defineProps<{
  pane: Pane
}>()

const emit = defineEmits<{
  close: []
  split: [direction: 'horizontal' | 'vertical']
  'tab-add': [itemId: string]
  'tab-close': [tabId: string]
  'tab-select': [tabId: string]
  'tab-drag-start': [tabId: string]
  'tab-drag-end': []
  'tab-drop': [paneId: string, index: number]
}>()

const showSplitMenu = ref(false)

const activeTab = computed(() =>
  props.pane.tabs.find(t => t.id === props.pane.activeTabId)
)

// Component mapping
const viewComponents = shallowRef({
  editor: ItemEditor,
  manuscript: ManuscriptView,
  corkboard: CorkboardView,
  outline: OutlineView,
  mindmap: MindMapView,
  item: ItemView
})

function getViewComponent(type: string) {
  return viewComponents.value[type as keyof typeof viewComponents.value] || ItemEditor
}

// Tab updates
function updateTabDirty(tabId: string, isDirty: boolean) {
  const tab = props.pane.tabs.find(t => t.id === tabId)
  if (tab) {
    tab.isDirty = isDirty
  }
}

function updateTabTitle(tabId: string, title: string) {
  const tab = props.pane.tabs.find(t => t.id === tabId)
  if (tab) {
    tab.title = title
  }
}

function updateTabViewState(tabId: string, viewState: any) {
  const tab = props.pane.tabs.find(t => t.id === tabId)
  if (tab) {
    tab.viewState = { ...tab.viewState, ...viewState }
  }
}

function handleTabDrop(event: DragEvent) {
  // Calculate drop index based on mouse position
  const tabBar = event.currentTarget as HTMLElement
  const tabs = tabBar.querySelectorAll('.tab')
  let dropIndex = tabs.length

  tabs.forEach((tab, index) => {
    const rect = tab.getBoundingClientRect()
    if (event.clientX < rect.left + rect.width / 2) {
      dropIndex = Math.min(dropIndex, index)
    }
  })

  emit('tab-drop', props.pane.id, dropIndex)
}

function openNewTab() {
  // Open file selector dialog
  // For now, emit a placeholder
  emit('tab-add', 'new-item')
}
</script>

<style lang="scss" scoped>
.pane-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgb(var(--v-theme-surface));
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  min-height: 36px;
}

.pane-actions {
  display: flex;
  align-items: center;
  padding: 0 4px;
  gap: 4px;
}

.pane-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.pane-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: rgba(var(--v-theme-on-surface), 0.6);

  p {
    margin: 0;
  }
}
</style>
