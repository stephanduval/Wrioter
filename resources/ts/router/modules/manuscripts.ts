import type { RouteRecordRaw } from 'vue-router'

const manuscriptsRoutes: RouteRecordRaw[] = [
  {
    path: '/manuscripts',
    name: 'manuscripts-list',
    component: () => import('@/views/manuscripts/ManuscriptsList.vue'),
    meta: {
      action: 'read',
      subject: 'projects',
    },
  },
  {
    path: '/manuscripts/chapters',
    name: 'manuscripts-chapters',
    component: () => import('@/views/manuscripts/ChaptersList.vue'),
    meta: {
      action: 'read',
      subject: 'projects',
    },
  },
  {
    path: '/manuscripts/scenes',
    name: 'manuscripts-scenes',
    component: () => import('@/views/manuscripts/ScenesList.vue'),
    meta: {
      action: 'read',
      subject: 'projects',
    },
  },
  {
    path: '/manuscripts/characters',
    name: 'manuscripts-characters',
    component: () => import('@/views/manuscripts/CharactersList.vue'),
    meta: {
      action: 'read',
      subject: 'projects',
    },
  },
  {
    path: '/manuscripts/locations',
    name: 'manuscripts-locations',
    component: () => import('@/views/manuscripts/LocationsList.vue'),
    meta: {
      action: 'read',
      subject: 'projects',
    },
  },
  {
    path: '/manuscripts/research',
    name: 'manuscripts-research',
    component: () => import('@/views/manuscripts/ResearchList.vue'),
    meta: {
      action: 'read',
      subject: 'projects',
    },
  },
]

export default manuscriptsRoutes 
