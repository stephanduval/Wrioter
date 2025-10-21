<template>
  <div
    class="tab-bar"
    @dragover.prevent
    @drop="handleDrop"
  >
    <div
      class="tab-scroll-container"
      ref="scrollContainer"
      @wheel.prevent="handleWheel"
    >
      <div class="tabs-wrapper">
        <TabComponent
          v-for="(tab, index) in tabs"
          :key="tab.id"
          :tab="tab"
          :is-active="tab.id === activeTabId"
          :is-dragging="isDraggingTab === tab.id"
          @select="$emit('select', tab.id)"
          @close="$emit('close', tab.id)"
          @drag-start="handleDragStart(tab.id)"
          @drag-end="handleDragEnd"
          @contextmenu="showTabMenu(tab, $event)"
        />

        <div class="tab-add-button" @click="$emit('add-tab')">
          <VIcon size="small">mdi-plus</VIcon>
        </div>
      </div>
    </div>

    <!-- Tab Context Menu -->
    <VMenu
      v-model="showContextMenu"
      :location="menuLocation"
      absolute
    >
      <template #activator="{ props }">
        <div v-bind="props" style="display: none;"></div>
      </template>
      <VList density="compact">
        <VListItem @click="closeTab(contextTab)">
          <template #prepend>
            <VIcon>mdi-close</VIcon>
          </template>
          <VListItemTitle>Close</VListItemTitle>
        </VListItem>

        <VListItem @click="closeOtherTabs(contextTab)">
          <VListItemTitle>Close Others</VListItemTitle>
        </VListItem>

        <VListItem @click="closeTabsToRight(contextTab)">
          <VListItemTitle>Close to the Right</VListItemTitle>
        </VListItem>

        <VDivider />

        <VListItem @click="pinTab(contextTab)">
          <template #prepend>
            <VIcon>{{ contextTab?.isPinned ? 'mdi-pin-off' : 'mdi-pin' }}</VIcon>
          </template>
          <VListItemTitle>
            {{ contextTab?.isPinned ? 'Unpin' : 'Pin' }}
          </VListItemTitle>
        </VListItem>

        <VListItem @click="duplicateTab(contextTab)">
          <template #prepend>
            <VIcon>mdi-content-duplicate</VIcon>
          </template>
          <VListItemTitle>Duplicate</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Tab } from '@/types/splitView'
import TabComponent from './Tab.vue'

const props = defineProps<{
  tabs: Tab[]
  activeTabId: string | null
}>()

const emit = defineEmits<{
  select: [tabId: string]
  close: [tabId: string]
  'add-tab': []
  'drag-start': [tabId: string]
  'drag-end': []
  drop: [event: DragEvent]
}>()

const scrollContainer = ref<HTMLElement>()
const isDraggingTab = ref<string | null>(null)
const showContextMenu = ref(false)
const contextTab = ref<Tab | null>(null)
const menuLocation = ref<string>('bottom')

// Horizontal scroll with mouse wheel
function handleWheel(event: WheelEvent) {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += event.deltaY
  }
}

// Drag and drop
function handleDragStart(tabId: string) {
  isDraggingTab.value = tabId
  emit('drag-start', tabId)
}

function handleDragEnd() {
  isDraggingTab.value = null
  emit('drag-end')
}

function handleDrop(event: DragEvent) {
  emit('drop', event)
}

// Context menu
function showTabMenu(tab: Tab, event: MouseEvent) {
  event.preventDefault()
  contextTab.value = tab
  showContextMenu.value = true
}

// Tab actions
function closeTab(tab: Tab | null) {
  if (tab) {
    emit('close', tab.id)
  }
}

function closeOtherTabs(tab: Tab | null) {
  if (tab) {
    props.tabs.forEach(t => {
      if (t.id !== tab.id && !t.isPinned) {
        emit('close', t.id)
      }
    })
  }
}

function closeTabsToRight(tab: Tab | null) {
  if (tab) {
    const tabIndex = props.tabs.findIndex(t => t.id === tab.id)
    for (let i = tabIndex + 1; i < props.tabs.length; i++) {
      if (!props.tabs[i].isPinned) {
        emit('close', props.tabs[i].id)
      }
    }
  }
}

function pinTab(tab: Tab | null) {
  if (tab) {
    tab.isPinned = !tab.isPinned
  }
}

function duplicateTab(tab: Tab | null) {
  if (tab) {
    // Emit duplicate event to parent
    emit('add-tab')
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  display: flex;
  align-items: center;
  height: 36px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  user-select: none;
}

.tab-scroll-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tabs-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 4px;
}

.tab-add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.08);
  }
}
</style>
