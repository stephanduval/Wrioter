import type { RouteRecordRaw } from 'vue-router'

type RouteRecordInfo = RouteRecordRaw & {
  name: string
}

declare interface RouteNamedMap {
  'dashboards-crm': RouteRecordInfo
  'access-control': RouteRecordInfo
  'dashboards-analytics': RouteRecordInfo
  // ... other routes ...
} 
