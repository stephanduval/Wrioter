# Manuscript Navigation Design System

## 🎨 **Design Overview**

The Dynamic Manuscript Navigation System follows a comprehensive design system that ensures consistency, accessibility, and optimal user experience across all manuscript organization features. This document defines the visual language, interaction patterns, and design principles for the navigation system.

## 🎯 **Design Principles**

### **1. Hierarchical Clarity**
- Clear visual hierarchy through indentation and typography
- Consistent visual cues for different content types
- Logical organization that matches user mental models

### **2. Progressive Disclosure**
- Show essential information immediately
- Reveal details on demand through expansion and interaction
- Minimize cognitive load while maintaining access to functionality

### **3. Responsive Adaptability**
- Seamless experience across desktop, tablet, and mobile
- Context-aware interface that adapts to screen size
- Touch-friendly interactions on mobile devices

### **4. Accessibility First**
- WCAG 2.1 AA compliance throughout
- Keyboard navigation for all interactions
- Screen reader optimization with proper ARIA labels

### **5. Performance Consciousness**
- Smooth animations and transitions
- Efficient rendering for large manuscript structures
- Immediate feedback for all user actions

## 🎨 **Visual Design System**

### **Color Palette**

#### **Primary Navigation Colors**
```scss
// Manuscript header colors
$manuscript-header-bg: rgb(var(--v-theme-surface-bright));
$manuscript-header-text: rgb(var(--v-theme-on-surface));
$manuscript-title-color: rgb(var(--v-theme-primary));

// Tree navigation colors
$tree-background: rgb(var(--v-theme-surface));
$tree-item-hover: rgb(var(--v-theme-surface-variant));
$tree-item-selected: rgb(var(--v-theme-primary-container));
$tree-item-selected-text: rgb(var(--v-theme-on-primary-container));

// Status indicator colors
$status-draft: rgb(var(--v-theme-surface-variant));
$status-in-progress: rgb(var(--v-theme-warning));
$status-completed: rgb(var(--v-theme-success));
$status-archived: rgb(var(--v-theme-error));

// Hierarchy guide colors
$hierarchy-line: rgb(var(--v-theme-outline-variant));
$hierarchy-line-opacity: 0.3;
```

#### **Content Type Colors**
```scss
// Icon colors for different content types
$type-folder: rgb(var(--v-theme-warning));        // Amber/Yellow
$type-text: rgb(var(--v-theme-primary));          // Blue
$type-research: rgb(var(--v-theme-info));         // Light Blue
$type-character: rgb(var(--v-theme-success));     // Green
$type-mindmap: rgb(var(--v-theme-purple));        // Purple
$type-image: rgb(var(--v-theme-pink));            // Pink
$type-file: rgb(var(--v-theme-grey));             // Grey
$type-link: rgb(var(--v-theme-cyan));             // Cyan
$type-collection: rgb(var(--v-theme-deep-purple)); // Deep Purple
```

### **Typography System**

#### **Manuscript Header Typography**
```scss
.manuscript-title {
  font-family: var(--v-theme-font-family);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.manuscript-meta {
  font-family: var(--v-theme-font-family);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
  opacity: 0.8;
}
```

#### **Tree Node Typography**
```scss
.node-title {
  font-family: var(--v-theme-font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.005em;
}

.node-metadata {
  font-family: var(--v-theme-font-family);
  font-size: 11px;
  font-weight: 400;
  line-height: 1.1;
  opacity: 0.7;
}

.status-text {
  font-family: var(--v-theme-font-family);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}
```

#### **Search and Filter Typography**
```scss
.search-input {
  font-family: var(--v-theme-font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
}

.filter-label {
  font-family: var(--v-theme-font-family);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
}
```

### **Spacing System**

#### **Layout Spacing**
```scss
// Component spacing
$nav-header-padding: 16px;
$nav-section-padding: 8px 16px;
$tree-container-padding: 8px 0;

// Node spacing
$node-height: 32px;
$node-padding-vertical: 4px;
$node-padding-horizontal: 8px;
$node-indent-base: 16px;
$node-indent-step: 20px;

// Icon spacing
$icon-margin-right: 8px;
$expansion-toggle-size: 20px;
$expansion-toggle-margin: 4px;

// Metadata spacing
$metadata-gap: 6px;
$metadata-margin-top: 2px;
```

#### **Responsive Spacing**
```scss
// Mobile adjustments
@media (max-width: 768px) {
  $nav-header-padding: 12px;
  $node-height: 44px;
  $node-padding-vertical: 8px;
  $node-indent-step: 16px;
}

// Tablet adjustments
@media (max-width: 1024px) {
  $nav-header-padding: 14px;
  $node-height: 36px;
  $node-padding-vertical: 6px;
  $node-indent-step: 18px;
}
```

### **Icon System**

#### **Content Type Icons**
```typescript
const CONTENT_TYPE_ICONS = {
  // Primary content types
  folder: 'bx-folder',
  text: 'bx-file-doc',
  research: 'bx-search-alt',
  character: 'bx-user',
  mindmap: 'bx-network-chart',

  // Media types
  image: 'bx-image',
  file: 'bx-file',
  link: 'bx-link',

  // Special types
  collection: 'bx-collection',
  binder: 'bx-book',
  search: 'bx-search',

  // Status and utility icons
  expand: 'bx-chevron-right',
  collapse: 'bx-chevron-down',
  comment: 'bx-comment',
  compile: 'bx-check-circle',
  no_compile: 'bx-x-circle',

  // Actions
  add: 'bx-plus',
  edit: 'bx-edit',
  delete: 'bx-trash',
  move: 'bx-move',
  duplicate: 'bx-copy'
} as const
```

#### **Icon Sizing**
```scss
// Icon sizes for different contexts
$icon-size-small: 12px;   // Metadata indicators
$icon-size-normal: 16px;  // Tree nodes, buttons
$icon-size-large: 20px;   // Header elements
$icon-size-xlarge: 24px;  // Manuscript icon

// Responsive icon sizing
@media (max-width: 768px) {
  $icon-size-normal: 18px;
  $icon-size-large: 22px;
  $icon-size-xlarge: 26px;
}
```

## 🎭 **Interaction Design**

### **Hover States**

#### **Tree Node Hover**
```scss
.tree-node {
  .node-content {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: $tree-item-hover;

      .expansion-toggle {
        opacity: 1;
        background-color: rgba(var(--v-theme-surface-bright), 0.5);
      }

      .node-metadata {
        opacity: 1;
      }
    }
  }
}
```

#### **Button Hover**
```scss
.nav-button {
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}
```

### **Selection States**

#### **Active Node Selection**
```scss
.tree-node {
  &.is-selected {
    .node-content {
      background-color: $tree-item-selected;
      color: $tree-item-selected-text;

      .node-icon {
        color: currentColor;
      }

      .status-indicator {
        .status-dot {
          border: 2px solid currentColor;
        }
      }
    }
  }
}
```

### **Focus States**

#### **Keyboard Navigation Focus**
```scss
.tree-node {
  .node-content {
    &:focus {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
      border-radius: 4px;
    }
  }
}

.search-input {
  &:focus {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 1px;
  }
}
```

### **Loading States**

#### **Tree Loading Animation**
```scss
.tree-node {
  &.is-loading {
    position: relative;
    opacity: 0.6;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(var(--v-theme-primary), 0.1) 50%,
        transparent 100%
      );
      animation: loading-shimmer 1.5s infinite;
    }
  }
}

@keyframes loading-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

#### **Search Loading State**
```scss
.search-section {
  &.is-loading {
    .search-input {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 12px;
        width: 16px;
        height: 16px;
        border: 2px solid rgb(var(--v-theme-primary));
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        transform: translateY(-50%);
      }
    }
  }
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}
```

### **Drag and Drop States**

#### **Dragging State**
```scss
.tree-node {
  &.is-dragging {
    opacity: 0.4;
    transform: rotate(2deg);
    z-index: 1000;
    pointer-events: none;
  }

  &.is-drag-over {
    background-color: rgba(var(--v-theme-primary), 0.1);
    border: 2px dashed rgb(var(--v-theme-primary));
    border-radius: 4px;
  }

  &.can-drop-inside {
    .node-content {
      background-color: rgba(var(--v-theme-success), 0.1);
      border-left: 4px solid rgb(var(--v-theme-success));
    }
  }

  &.can-drop-before {
    border-top: 2px solid rgb(var(--v-theme-primary));
  }

  &.can-drop-after {
    border-bottom: 2px solid rgb(var(--v-theme-primary));
  }
}
```

## 📱 **Responsive Design System**

### **Breakpoint Strategy**

```scss
// Breakpoint definitions
$breakpoint-mobile: 768px;
$breakpoint-tablet: 1024px;
$breakpoint-desktop: 1200px;

// Layout modes per breakpoint
.manuscript-navigation {
  // Desktop (default)
  .navigation-mode {
    display: flex;
    flex-direction: column;
    width: 320px;
    min-width: 280px;
    max-width: 400px;
  }

  // Tablet
  @media (max-width: $breakpoint-tablet) {
    .navigation-mode {
      width: 280px;
      min-width: 260px;
      max-width: 320px;
    }

    .node-metadata {
      display: none; // Hide detailed metadata on tablet
    }
  }

  // Mobile
  @media (max-width: $breakpoint-mobile) {
    .navigation-mode {
      width: 100%;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
    }

    .manuscript-header {
      position: sticky;
      top: 0;
      background: rgb(var(--v-theme-surface));
      z-index: 10;
    }

    .node-content {
      min-height: 44px; // Larger touch targets
      padding: 8px 12px;
    }

    .expansion-toggle {
      width: 32px;
      height: 32px;
    }
  }
}
```

### **Touch Optimization**

#### **Mobile Gestures**
```scss
.tree-node {
  @media (max-width: $breakpoint-mobile) {
    .node-content {
      // Larger touch targets
      min-height: 44px;
      padding: 8px 12px;

      // Touch feedback
      &:active {
        background-color: rgba(var(--v-theme-primary), 0.1);
        transform: scale(0.98);
      }
    }

    // Swipe indicators for mobile actions
    &.swipe-left {
      transform: translateX(-80px);

      &::after {
        content: 'Edit';
        position: absolute;
        right: -80px;
        top: 0;
        bottom: 0;
        width: 80px;
        background: rgb(var(--v-theme-info));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
    }

    &.swipe-right {
      transform: translateX(80px);

      &::before {
        content: 'Delete';
        position: absolute;
        left: -80px;
        top: 0;
        bottom: 0;
        width: 80px;
        background: rgb(var(--v-theme-error));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
    }
  }
}
```

## 🎯 **Accessibility Design**

### **Color Contrast Requirements**

```scss
// Ensure WCAG AA compliance (4.5:1 ratio minimum)
.manuscript-navigation {
  // Text contrast validation
  .node-title {
    color: rgb(var(--v-theme-on-surface)); // Ensures 4.5:1 on surface
  }

  .node-metadata {
    color: rgb(var(--v-theme-on-surface-variant)); // Ensures 3:1 for large text
  }

  // Interactive element contrast
  .node-content:focus {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  // Status indicators must meet contrast requirements
  .status-dot {
    border: 1px solid rgb(var(--v-theme-outline));

    &.status-draft {
      background: rgb(var(--v-theme-surface-variant));
      // Validates to 3:1 contrast
    }
  }
}
```

### **Screen Reader Optimization**

#### **ARIA Labels and Roles**
```html
<!-- Tree structure with proper ARIA -->
<div
  role="tree"
  aria-label="Manuscript Navigation"
  class="navigation-tree"
>
  <div
    role="treeitem"
    :aria-expanded="isExpanded"
    :aria-selected="isSelected"
    :aria-level="level + 1"
    :aria-label="getAriaLabel(node)"
    :aria-describedby="`node-meta-${node.id}`"
    tabindex="0"
    class="tree-node"
  >
    <div class="node-content">
      <!-- Visual content -->
    </div>

    <!-- Hidden metadata for screen readers -->
    <div
      :id="`node-meta-${node.id}`"
      class="sr-only"
    >
      {{ getScreenReaderDescription(node) }}
    </div>
  </div>
</div>
```

#### **Keyboard Navigation Support**
```typescript
// Keyboard navigation implementation
const handleKeydown = (event: KeyboardEvent, nodeId: string) => {
  switch (event.key) {
    case 'ArrowDown':
      focusNextNode(nodeId)
      event.preventDefault()
      break

    case 'ArrowUp':
      focusPreviousNode(nodeId)
      event.preventDefault()
      break

    case 'ArrowRight':
      if (hasChildren(nodeId)) {
        if (!isExpanded(nodeId)) {
          expandNode(nodeId)
        } else {
          focusFirstChild(nodeId)
        }
      }
      event.preventDefault()
      break

    case 'ArrowLeft':
      if (isExpanded(nodeId)) {
        collapseNode(nodeId)
      } else {
        focusParentNode(nodeId)
      }
      event.preventDefault()
      break

    case 'Enter':
    case ' ':
      selectNode(nodeId)
      event.preventDefault()
      break

    case 'Home':
      focusFirstNode()
      event.preventDefault()
      break

    case 'End':
      focusLastNode()
      event.preventDefault()
      break
  }
}
```

### **Focus Management**

```scss
// Focus indicators that meet accessibility standards
.tree-node {
  .node-content {
    &:focus {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
      border-radius: 4px;

      // Ensure focus is visible in high contrast mode
      @media (prefers-contrast: high) {
        outline: 3px solid currentColor;
      }
    }

    &:focus:not(:focus-visible) {
      outline: none; // Hide focus for mouse users
    }
  }
}

// Skip links for keyboard navigation
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 6px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  padding: 8px;
  border-radius: 4px;
  text-decoration: none;
  z-index: 1000;

  &:focus {
    top: 6px;
  }
}
```

## 🌟 **Animation System**

### **Micro-Interactions**

#### **Expansion Animation**
```scss
.child-nodes {
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.expanding {
    animation: expand-down 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.collapsing {
    animation: collapse-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes expand-down {
  from {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    max-height: 1000px;
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes collapse-up {
  from {
    max-height: 1000px;
    opacity: 1;
    transform: translateY(0);
  }
  to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
  }
}
```

#### **Search Result Highlighting**
```scss
.search-highlight {
  background: rgba(var(--v-theme-warning), 0.3);
  border-radius: 2px;
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0%, 100% {
    background: rgba(var(--v-theme-warning), 0.3);
  }
  50% {
    background: rgba(var(--v-theme-warning), 0.6);
  }
}
```

#### **Status Change Animation**
```scss
.status-dot {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &.status-changing {
    animation: status-pulse 0.6s ease-in-out;
  }
}

@keyframes status-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
    box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.3);
  }
}
```

### **Page Transitions**

#### **Navigation Appearance**
```scss
.dynamic-manuscript-navigation {
  &.nav-enter-active {
    animation: slide-in-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.nav-leave-active {
    animation: slide-out-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}
```

## 🎨 **Dark Mode Support**

### **Theme Variables**

```scss
// Light theme (default)
:root {
  --nav-bg: #{rgb(var(--v-theme-surface))};
  --nav-text: #{rgb(var(--v-theme-on-surface))};
  --nav-border: #{rgb(var(--v-theme-outline-variant))};
  --nav-hover: #{rgb(var(--v-theme-surface-variant))};
  --nav-selected: #{rgb(var(--v-theme-primary-container))};
}

// Dark theme
[data-theme="dark"] {
  --nav-bg: #{rgb(var(--v-theme-surface))};
  --nav-text: #{rgb(var(--v-theme-on-surface))};
  --nav-border: #{rgb(var(--v-theme-outline))};
  --nav-hover: #{rgb(var(--v-theme-surface-bright))};
  --nav-selected: #{rgb(var(--v-theme-primary-container))};
}

// High contrast mode
@media (prefers-contrast: high) {
  :root {
    --nav-border: #{rgb(var(--v-theme-outline))};
  }

  .tree-node {
    .node-content {
      border: 1px solid transparent;

      &:focus {
        border-color: currentColor;
      }
    }
  }
}
```

## 📐 **Layout System**

### **Grid Structure**

```scss
.manuscript-navigation-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;

  .navigation-header {
    grid-row: 1;
    padding: $nav-header-padding;
    border-bottom: 1px solid var(--nav-border);
  }

  .navigation-content {
    grid-row: 2;
    overflow-y: auto;

    .search-section {
      padding: $nav-section-padding;
      border-bottom: 1px solid var(--nav-border);
    }

    .tree-container {
      padding: $tree-container-padding;
    }
  }

  .navigation-footer {
    grid-row: 3;
    padding: $nav-section-padding;
    border-top: 1px solid var(--nav-border);
    background: var(--nav-bg);
  }
}
```

### **Component Composition**

```scss
// Base component sizing
.manuscript-navigation {
  // Default desktop width
  width: 320px;
  min-width: 280px;
  max-width: 400px;

  // Responsive sizing
  @container (max-width: 280px) {
    .node-metadata {
      display: none;
    }

    .manuscript-meta {
      font-size: 11px;
    }
  }

  @container (min-width: 400px) {
    .node-content {
      padding-right: 16px;
    }

    .quick-actions {
      gap: 8px;
    }
  }
}
```

This comprehensive design system provides the foundation for creating a consistent, accessible, and visually appealing manuscript navigation experience that scales across all devices and usage contexts.

---

*This design system document serves as the single source of truth for all visual and interaction design decisions in the manuscript navigation system. It should be referenced by developers, designers, and QA teams throughout implementation.*

**Document Version**: 1.0
**Last Updated**: January 2025
**Next Review**: March 2025
**Maintainer**: Design Team