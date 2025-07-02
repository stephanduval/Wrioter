# Frontend Architecture

## Overview
The Wrioter frontend is a Vue.js 3 single-page application (SPA) built with TypeScript, providing a modern and responsive user interface for manuscript management.

## Technology Stack

### Core Technologies
- **Vue.js 3.4+**: Progressive JavaScript framework
- **TypeScript 5+**: Type-safe development
- **Vite 5+**: Next-generation build tool
- **Pinia**: State management
- **Vue Router 4**: Client-side routing

### UI Framework
- **Base Template**: Sneat Admin Template
- **CSS Framework**: Tailwind CSS (via Sneat)
- **Component Library**: Custom + Sneat components
- **Icons**: Material Design Icons

## Project Structure

```
resources/
├── ts/                         # TypeScript source
│   ├── @core/                  # Core utilities (Sneat)
│   ├── @layouts/               # Layout components
│   ├── components/             # Shared components
│   ├── composables/            # Vue composables
│   ├── layouts/                # Page layouts
│   ├── navigation/             # Navigation config
│   ├── pages/                  # Route pages
│   ├── plugins/                # Vue plugins
│   │   ├── casl/              # Authorization
│   │   └── axios/             # HTTP client
│   ├── router/                 # Route definitions
│   ├── stores/                 # Pinia stores
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
├── styles/                     # Global styles
└── views/                      # Blade templates
```

## Key Components

### Main Application Entry
- `resources/ts/main.ts`: Application bootstrap
- `resources/ts/App.vue`: Root component

### Routing
```typescript
// resources/ts/router/index.ts
const routes = [
  {
    path: '/manuscripts',
    component: () => import('@/pages/manuscripts/index.vue'),
    meta: { requiresAuth: true }
  }
]
```

### State Management (Pinia)
```typescript
// resources/ts/stores/manuscript.ts
export const useManuscriptStore = defineStore('manuscript', () => {
  const manuscripts = ref<Manuscript[]>([])
  const currentManuscript = ref<Manuscript | null>(null)
  
  // Actions
  async function fetchManuscripts() {
    const { data } = await api.get('/manuscripts')
    manuscripts.value = data.data
  }
  
  return { manuscripts, currentManuscript, fetchManuscripts }
})
```

### API Integration
```typescript
// resources/ts/composables/useApi.ts
export function useApi() {
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  return { api }
}
```

## Component Architecture

### Component Types

1. **Page Components** (`pages/`)
   - Route-level components
   - Handle data fetching
   - Compose smaller components

2. **Layout Components** (`layouts/`)
   - App shells
   - Navigation bars
   - Sidebars

3. **Feature Components** (`components/`)
   - Reusable UI pieces
   - Self-contained functionality
   - Props-based configuration

4. **Base Components** (`@core/components/`)
   - Atomic UI elements
   - Highly reusable
   - Style variations

### Component Patterns

#### Composition API
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useManuscriptStore } from '@/stores/manuscript'

const store = useManuscriptStore()
const search = ref('')

const filteredManuscripts = computed(() => 
  store.manuscripts.filter(m => 
    m.title.includes(search.value)
  )
)

onMounted(() => {
  store.fetchManuscripts()
})
</script>
```

#### Props & Events
```vue
<script setup lang="ts">
interface Props {
  manuscript: Manuscript
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const emit = defineEmits<{
  update: [manuscript: Manuscript]
  delete: [id: number]
}>()
</script>
```

## Authorization (CASL)

### Setup
```typescript
// resources/ts/plugins/casl/index.ts
export const ability = new Ability()

export function updateAbility(permissions: Permission[]) {
  ability.update(permissions.map(p => ({
    action: p.action,
    subject: p.subject
  })))
}
```

### Usage in Components
```vue
<template>
  <button v-if="can('create', 'manuscripts')">
    Create Manuscript
  </button>
</template>

<script setup lang="ts">
import { useAbility } from '@casl/vue'

const { can } = useAbility()
</script>
```

## Navigation System

### Key Navigation Files
- **`/resources/ts/@layouts/components/VerticalNavLink.vue`** - Renders individual navigation items (this is the actual component used)
- **`/resources/ts/navigation/vertical/Freynet-Gagné-menu.ts`** - Menu configuration and structure
- **`/resources/ts/layouts/components/DefaultLayoutWithVerticalNav.vue`** - Main layout wrapper

⚠️ **Important**: The app uses the `@layouts` system. The `VerticalNavMenu.vue` file in `/resources/ts/layouts/components/` is NOT used.

### Menu Configuration
```typescript
// resources/ts/navigation/vertical/Freynet-Gagné-menu.ts
export default [
  {
    title: 'menu.manuscripts',
    to: '/manuscripts',
    icon: { icon: 'bx-file' },
    action: 'read',
    subject: 'manuscripts'
  },
  // Custom navigation items (no routing, custom click handlers)
  {
    title: 'menu.selectManuscript',
    icon: { icon: 'bx-navigation' },
    action: 'read',
    subject: 'manuscripts',
    custom: true  // Enables custom click handling
  }
]
```

### Custom Navigation Items
Items with `custom: true` are handled differently by `VerticalNavLink.vue`:
- Bypass normal routing behavior
- Use custom click handlers instead of navigation
- Can bypass permission checks if needed
- Useful for drawer/modal triggers

### Dynamic Menu Filtering
Routes and menu items are automatically filtered based on user permissions using CASL.

## Form Handling

### Validation
```typescript
import { useForm } from 'vee-validate'
import * as yup from 'yup'

const schema = yup.object({
  title: yup.string().required().min(3),
  content: yup.string().required()
})

const { errors, handleSubmit } = useForm({
  validationSchema: schema
})
```

### File Uploads
```vue
<script setup lang="ts">
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  return data
}
</script>
```

## Error Handling

### Global Error Handler
```typescript
// resources/ts/plugins/axios/index.ts
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      router.push('/login')
    }
    
    useToast().error(error.response?.data?.message || 'An error occurred')
    return Promise.reject(error)
  }
)
```

### Component Error Boundaries
```vue
<template>
  <div v-if="error" class="error">
    {{ error.message }}
  </div>
  <div v-else>
    <!-- Component content -->
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false
})
</script>
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load routes
{
  path: '/manuscripts',
  component: () => import('@/pages/manuscripts/index.vue')
}
```

### Component Lazy Loading
```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const HeavyEditor = defineAsyncComponent(() => 
  import('@/components/HeavyEditor.vue')
)
</script>
```

### Memoization
```typescript
import { computed, unref } from 'vue'

const expensiveComputation = computed(() => {
  return manuscripts.value.reduce((acc, m) => {
    // Heavy computation
  }, 0)
})
```

## Build Configuration

### Vite Config
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/resources/ts'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@core']
        }
      }
    }
  }
})
```

### Environment Variables
```typescript
// .env.development
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Wrioter

// Usage
const apiUrl = import.meta.env.VITE_API_URL
```

## Testing

### Unit Tests (Vitest)
```typescript
import { mount } from '@vue/test-utils'
import ManuscriptCard from '@/components/ManuscriptCard.vue'

describe('ManuscriptCard', () => {
  it('displays manuscript title', () => {
    const wrapper = mount(ManuscriptCard, {
      props: {
        manuscript: { title: 'Test Novel' }
      }
    })
    
    expect(wrapper.text()).toContain('Test Novel')
  })
})
```

### E2E Tests (Cypress)
```typescript
describe('Manuscript Management', () => {
  it('creates a new manuscript', () => {
    cy.visit('/manuscripts')
    cy.contains('Create').click()
    cy.get('[data-test="title"]').type('New Novel')
    cy.get('[data-test="submit"]').click()
    cy.contains('New Novel').should('exist')
  })
})
```

## Development Workflow

### Local Development
```bash
# Start dev server
yarn dev

# Type checking
yarn type-check

# Linting
yarn lint

# Build for production
yarn build
```

### Hot Module Replacement
Vite provides instant HMR for a smooth development experience.

### Vue DevTools
Install Vue DevTools browser extension for component inspection and state debugging.