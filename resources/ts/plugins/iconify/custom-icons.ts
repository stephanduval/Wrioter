/**
 * Curated icon registry for the "Customize Icon" picker.
 *
 * ── HOW TO ADD ICONS ────────────────────────────────────────────────────────
 *
 *   Adding a bx-* icon (BoxIcons) — NO rebuild needed:
 *     1. Browse https://icon-sets.iconify.design/bx/ and find a name
 *     2. Add `'bx-that-name'` to the appropriate category below
 *     3. Reload the app — the picker reads from this file directly
 *
 *   Adding an icon from mdi / fa / tabler — REQUIRES rebuild:
 *     1. Add `'mdi-that-name'` (etc.) to a category below
 *     2. Also add `'mdi:that-name'` to the `icons:` array in build-icons.ts
 *        (only bx is bundled in full; other sets are tree-shaken)
 *     3. Run `yarn build:icons` to regenerate icons.css
 *
 * ── HOW TO REMOVE ICONS ─────────────────────────────────────────────────────
 *
 *   1. Delete the entry from the category below
 *   2. If the icon was from mdi/fa/tabler, also remove it from build-icons.ts
 *      and run `yarn build:icons` (bx icons can stay bundled — no harm)
 *   3. Items already referencing a removed icon fall back to the type-based
 *      default via getIconName() in TreeNode.vue, so existing data stays valid.
 *
 * ── CATEGORY RULES ──────────────────────────────────────────────────────────
 *
 *   - Keep categories focused — users browse by intent, not by icon set
 *   - Aim for 20–60 icons per category. More than that overwhelms the picker
 *   - Prefer bx- (BoxIcons) for consistency — it's the default icon set in Wrioter
 */

export interface IconCategory {
  id: string
  label: string
  icons: string[]  // Full icon names including prefix, e.g. 'bx-folder'
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    id: 'documents',
    label: 'Documents',
    icons: [
      'bx-file', 'bx-file-blank', 'bx-book', 'bx-book-open', 'bx-book-bookmark',
      'bx-notepad', 'bx-note', 'bx-pencil', 'bx-edit', 'bx-edit-alt',
      'bx-paragraph', 'bx-text', 'bx-spreadsheet', 'bx-receipt', 'bx-news',
    ],
  },
  {
    id: 'folders',
    label: 'Folders',
    icons: [
      'bx-folder', 'bx-folder-open', 'bx-folder-plus', 'bx-folder-minus',
      'bx-archive', 'bx-box', 'bx-package', 'bx-collection',
    ],
  },
  {
    id: 'people',
    label: 'People',
    icons: [
      'bx-user', 'bx-user-circle', 'bx-user-pin', 'bx-user-voice',
      'bx-group', 'bx-male', 'bx-female', 'bx-crown', 'bx-mask', 'bx-ghost',
      'bx-child', 'bx-face', 'bx-run', 'bx-walk',
    ],
  },
  {
    id: 'places',
    label: 'Places',
    icons: [
      'bx-map', 'bx-map-pin', 'bx-map-alt', 'bx-world', 'bx-globe',
      'bx-home', 'bx-home-alt', 'bx-building', 'bx-building-house', 'bx-store',
      'bx-tree', 'bx-landscape', 'bx-mountain', 'bx-compass',
    ],
  },
  {
    id: 'objects',
    label: 'Objects',
    icons: [
      'bx-key', 'bx-lock', 'bx-lock-open', 'bx-bookmark', 'bx-bookmark-alt',
      'bx-tag', 'bx-tag-alt', 'bx-coin', 'bx-diamond', 'bx-gift',
      'bx-briefcase', 'bx-camera', 'bx-image', 'bx-music', 'bx-film',
      'bx-phone', 'bx-envelope', 'bx-shield', 'bx-trophy', 'bx-medal',
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols',
    icons: [
      'bx-star', 'bx-heart', 'bx-flag', 'bx-bell', 'bx-bulb',
      'bx-fire', 'bx-bolt', 'bx-leaf', 'bx-sun', 'bx-moon',
      'bx-check-circle', 'bx-x-circle', 'bx-info-circle', 'bx-question-mark',
      'bx-plus-circle', 'bx-minus-circle', 'bx-radio-circle', 'bx-target-lock',
    ],
  },
  {
    id: 'time',
    label: 'Time',
    icons: [
      'bx-time', 'bx-time-five', 'bx-calendar', 'bx-calendar-alt',
      'bx-calendar-event', 'bx-calendar-star', 'bx-hourglass', 'bx-alarm',
      'bx-stopwatch', 'bx-history',
    ],
  },
  {
    id: 'arrows',
    label: 'Arrows & Flow',
    icons: [
      'bx-right-arrow-alt', 'bx-left-arrow-alt', 'bx-up-arrow-alt', 'bx-down-arrow-alt',
      'bx-right-arrow-circle', 'bx-left-arrow-circle',
      'bx-transfer', 'bx-refresh', 'bx-redo', 'bx-undo',
      'bx-git-branch', 'bx-git-merge', 'bx-sitemap', 'bx-network-chart',
    ],
  },
]

/**
 * Flat list of all curated icons, derived from categories. Handy for search.
 */
export const ALL_CURATED_ICONS: string[] = ICON_CATEGORIES.flatMap(c => c.icons)

/**
 * Default color palette shown beside the color wheel. Users can still pick any hex.
 */
export const DEFAULT_COLOR_PALETTE: string[] = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#9E9E9E', '#607D8B', '#000000',
]
