import type { RouteRecordRaw } from 'vue-router'

const mindmapRoutes: RouteRecordRaw[] = [
  {
    path: '/mindmaps',
    name: 'mindmap-list',
    component: () => import('@/views/mindmap/MindMapList.vue'),
    meta: {
      action: 'read',
      subject: 'mindmaps',
    },
  },
  {
    path: '/mindmaps/create',
    name: 'mindmap-create',
    component: () => import('@/views/mindmap/MindMapCreate.vue'),
    meta: {
      action: 'create',
      subject: 'mindmaps',
    },
  },
  {
    path: '/mindmaps/:id',
    name: 'mindmap-view',
    component: () => import('@/views/mindmap/MindMapView.vue'),
    meta: {
      action: 'read',
      subject: 'mindmaps',
    },
  },
  {
    path: '/mindmap-explorer',
    name: 'mindmap-explorer',
    component: () => import('@/views/mindmap/MindMapExplorer.vue'),
    meta: {
      action: 'read',
      subject: 'mindmaps',
    },
  },
]

export default mindmapRoutes