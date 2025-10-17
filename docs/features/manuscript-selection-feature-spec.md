# Manuscript Selection Feature Specification

## Overview

The Manuscript Selection feature provides users with a convenient way to select and navigate to different manuscripts within the Wrioter application. The feature is accessed through a "Select Manuscript" button in the vertical navigation menu.

## Feature Status

**Current Status**: 🟡 Partially Implemented
- ✅ Navigation button exists and is clickable
- ✅ Custom navigation handling implemented
- ✅ Permission bypass for all user roles
- ✅ Visual debugging elements in place
- ❌ Manuscript selection drawer not integrated
- ❌ Full workflow not complete

**Target Status**: 🟢 Fully Implemented
- Button click opens manuscript selection drawer
- Users can browse and select from available manuscripts
- Selection navigates to manuscript view
- State management maintains selected manuscript

## User Stories

### Primary User Story
**As a** user with access to multiple manuscripts  
**I want** to quickly select and switch between different manuscripts  
**So that** I can easily access the content I need to work on

### Acceptance Criteria
- [ ] I can see a "Select Manuscript" button in the navigation menu
- [ ] Clicking the button opens a manuscript selection drawer
- [ ] I can see a list of manuscripts I have access to
- [ ] I can select a manuscript from the list
- [ ] Selecting a manuscript navigates me to the manuscript view
- [ ] The selected manuscript is remembered for future sessions

### Secondary User Stories

#### User Role: Admin
**As an** admin user  
**I want** to see all manuscripts in the system  
**So that** I can manage and access any manuscript

#### User Role: Client
**As a** client user  
**I want** to see only manuscripts I own or have been granted access to  
**So that** I can work on my assigned content

#### User Role: Collaborator
**As a** collaborator  
**I want** to see manuscripts I've been invited to collaborate on  
**So that** I can contribute to shared projects

## Technical Specifications

### Architecture Overview

```
Navigation Menu (VerticalNavLink)
         ↓ (click)
Manuscript Selection Drawer
         ↓ (select)
Manuscript Store (Pinia)
         ↓ (navigate)
Manuscript View Component
```

### Component Hierarchy

```
VerticalNavMenu.vue
├── VerticalNavLink.vue (Select Manuscript button)
├── ManuscriptSelectionDrawer.vue
│   ├── ManuscriptList.vue
│   ├── ManuscriptItem.vue
│   └── DrawerControls.vue
└── ManuscriptViewMenu.vue (shown after selection)
```

### Data Flow

1. **User Action**: Click "Select Manuscript" button
2. **Event Handler**: `handleCustomClick()` in `VerticalNavLink.vue`
3. **Drawer Open**: `ManuscriptSelectionDrawer` becomes visible
4. **API Call**: Fetch manuscripts from `/api/manuscripts`
5. **User Selection**: User selects manuscript and clicks "Select"
6. **State Update**: Manuscript stored in Pinia store
7. **Navigation**: Router navigates to `/manuscripts/{id}`
8. **View Update**: Manuscript view components render

## Current Implementation

### Navigation Configuration
**File**: `resources/ts/navigation/vertical/Freynet-Gagné-menu.ts`

```typescript
{
  title: 'menu.selectManuscript',
  icon: { icon: 'bx-navigation' },
  action: 'read',
  subject: 'manuscripts',
  custom: true,  // Flag for custom handling
}
```

### Button Component
**File**: `resources/ts/@layouts/components/VerticalNavLink.vue`

**Current Behavior**:
- Detects custom navigation items
- Shows alert dialog on click
- Applies debug styling (green background, red border)
- Prevents default navigation behavior

**Expected Behavior**:
- Opens manuscript selection drawer
- Communicates with parent component
- Maintains accessibility standards

### Drawer Component
**File**: `resources/ts/components/dialogs/ManuscriptSelectionDrawer.vue`

**Current Status**: ✅ Fully implemented but not integrated

**Features**:
- Fetches manuscripts from API
- Displays loading states
- Handles empty and error states
- Allows manuscript selection
- Emits selection events

### Store Management
**File**: `resources/ts/stores/manuscript.ts`

**Current Features**:
- ✅ Manuscript list management
- ✅ Selected manuscript tracking
- ✅ API integration
- ✅ State persistence

## API Specifications

### Endpoints

#### GET /api/manuscripts
**Purpose**: Retrieve manuscripts accessible to current user

**Request**:
```http
GET /api/manuscripts
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "My Manuscript",
      "manuscript_type": "standard",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z",
      "description": "Optional description"
    }
  ]
}
```

#### GET /api/manuscripts/{id}
**Purpose**: Retrieve specific manuscript with details

**Request**:
```http
GET /api/manuscripts/1?with=items
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": {
    "id": 1,
    "title": "My Manuscript",
    "manuscript_type": "standard",
    "items": [
      {
        "id": 1,
        "title": "Chapter 1",
        "type": "text",
        "content": "..."
      }
    ]
  }
}
```

### Error Handling

#### 403 Forbidden
User doesn't have permission to access manuscript

#### 404 Not Found
Manuscript doesn't exist

#### 500 Internal Server Error
Server error occurred

## User Interface Specifications

### Navigation Button

**Visual Design**:
- Icon: `bx-navigation` (Navigation/compass icon)
- Text: "Select Manuscript"
- Position: Vertical navigation menu under "Manuscript View" section
- Styling: Standard navigation item styling + debug elements

**Interactions**:
- Hover: Standard navigation hover effect
- Click: Opens manuscript selection drawer
- Keyboard: Tab-accessible, Enter to activate

### Manuscript Selection Drawer

**Layout**:
- Type: Navigation drawer (temporary)
- Width: 500px
- Position: Left side
- Overlay: Semi-transparent background

**Content Structure**:
```
┌─────────────────────────────────────────────────┐
│ Select Manuscript                         [×]   │
├─────────────────────────────────────────────────┤
│ [Loading...]                                    │
│ OR                                              │
│ ○ Standard Manuscript 1                        │
│ ○ Scrivener Project                            │
│ ● Selected Manuscript                    [📄]   │
├─────────────────────────────────────────────────┤
│                              [Cancel] [Select] │
└─────────────────────────────────────────────────┘
```

**States**:
- Loading: Progress indicator with "Loading manuscripts..."
- Empty: Message "No manuscripts found" with icon
- Error: Alert with error message
- Success: List of manuscripts with radio buttons

**Controls**:
- Cancel: Close drawer without selection
- Select: Confirm selection and navigate (disabled if no selection)
- Close (×): Same as Cancel

### Manuscript List Items

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ [📄] Manuscript Title                      ( )  │
│      Standard Manuscript • Updated Jan 1        │
└─────────────────────────────────────────────────┘
```

**Information Displayed**:
- Icon: Document icon for standard, folder icon for Scrivener
- Title: Manuscript title
- Type: "Standard Manuscript" or "Scrivener Import"
- Updated: Last updated date
- Selection: Radio button for selection

**Interactions**:
- Click anywhere: Select manuscript
- Radio button: Select manuscript
- Visual feedback: Highlight selected item

## State Management

### Pinia Store: `useManuscriptStore`

#### State Properties
```typescript
interface ManuscriptState {
  manuscripts: Manuscript[]           // All fetched manuscripts
  currentManuscript: Manuscript | null    // Currently viewed manuscript
  selectedManuscriptId: number | null     // Selected manuscript ID
  loading: boolean                    // Loading state
  error: string | null               // Error message
}
```

#### Actions
- `fetchManuscripts()`: Load manuscripts from API
- `fetchManuscript(id)`: Load specific manuscript
- `selectManuscript(manuscript)`: Set selected manuscript
- `clearSelection()`: Clear selected manuscript
- `$reset()`: Reset store to initial state

#### Getters
- `selectedManuscript`: Get currently selected manuscript
- `hasSelectedManuscript`: Check if manuscript is selected

### State Persistence

**Local Storage**:
- Key: `wrioter.selectedManuscriptId`
- Value: Selected manuscript ID
- Purpose: Remember selection across sessions

**Session Storage**:
- Key: `wrioter.manuscriptCache`
- Value: Cached manuscript data
- Purpose: Avoid redundant API calls

## Routing

### Routes
- `/manuscripts/{id}`: Manuscript view page
- `/manuscripts/{id}/files`: Manuscript files view
- `/manuscripts/{id}/snapshots`: Manuscript snapshots view

### Navigation Guard
```typescript
router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/manuscripts/')) {
    // Ensure manuscript is loaded
    const manuscriptStore = useManuscriptStore()
    const manuscriptId = parseInt(to.params.id)
    
    if (!manuscriptStore.currentManuscript || 
        manuscriptStore.currentManuscript.id !== manuscriptId) {
      manuscriptStore.fetchManuscript(manuscriptId)
    }
  }
  next()
})
```

## Permissions and Security

### Permission Matrix

| User Role | View Own | View Others | Select Any | Create New |
|-----------|----------|-------------|------------|------------|
| Admin     | ✅       | ✅          | ✅         | ✅         |
| Client    | ✅       | ❌          | ❌         | ✅         |
| Collaborator | ✅    | ✅*         | ✅*        | ❌         |

*Only for manuscripts they have been granted access to

### Security Considerations

1. **API Authorization**: All manuscript endpoints require authentication
2. **Data Filtering**: Backend filters manuscripts based on user permissions
3. **Client-Side Validation**: Additional permission checks in components
4. **CSRF Protection**: All API calls include CSRF tokens

## Performance Requirements

### Loading Performance
- **Button Appearance**: < 2 seconds on page load
- **Drawer Opening**: < 200ms after click
- **Manuscript List**: < 1 second to load
- **Navigation**: < 500ms to manuscript view

### Memory Usage
- **Manuscript Cache**: Maximum 100 manuscripts in memory
- **Component Cleanup**: Proper cleanup on route changes
- **Event Listeners**: Remove listeners on component unmount

### Network Optimization
- **Pagination**: Load manuscripts in batches of 20
- **Caching**: Cache manuscript list for 5 minutes
- **Lazy Loading**: Load manuscript content on demand

## Accessibility Requirements

### WCAG 2.1 Compliance

#### Level A Requirements
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Alternative text for icons
- ✅ Proper heading structure

#### Level AA Requirements
- ✅ Color contrast ratios (4.5:1 minimum)
- ✅ Resize text up to 200%
- ✅ Focus visible on all interactive elements
- ✅ Meaningful sequence of content

### Screen Reader Support
- ARIA labels for all interactive elements
- Role attributes for custom components
- Live regions for dynamic content updates
- Proper form labeling

### Keyboard Navigation
- Tab order follows logical flow
- Enter key activates buttons
- Escape key closes drawer
- Arrow keys navigate within lists

## Testing Strategy

### Test Pyramid

#### Unit Tests (40%)
- Component logic testing
- Store function testing
- Utility function testing
- Mock all external dependencies

#### Integration Tests (40%)
- Component interaction testing
- API integration testing
- Store-component integration
- User workflow testing

#### End-to-End Tests (20%)
- Full user scenarios
- Cross-browser testing
- Performance testing
- Visual regression testing

### Test Coverage Requirements
- **Minimum Coverage**: 80% line coverage
- **Branch Coverage**: 75% branch coverage
- **Function Coverage**: 90% function coverage

### Test Data Requirements
- At least 3 test manuscripts per user type
- Both standard and Scrivener manuscript types
- Edge cases: empty lists, error states, slow responses

## Deployment Requirements

### Environment Configuration
```env
# Feature flags
MANUSCRIPT_SELECTION_ENABLED=true
MANUSCRIPT_CACHE_TTL=300

# API configuration
MANUSCRIPT_API_TIMEOUT=30000
MANUSCRIPT_API_RETRIES=3
```

### Database Requirements
- Manuscripts table with proper indexes
- User permissions properly configured
- Migration scripts for schema changes

### Monitoring and Observability
- Track manuscript selection events
- Monitor API response times
- Alert on error rates > 5%
- Track user engagement metrics

## Future Enhancements

### Phase 2 Features
- [ ] Manuscript search and filtering
- [ ] Recent manuscripts shortcut
- [ ] Manuscript favorites/bookmarks
- [ ] Bulk manuscript operations

### Phase 3 Features
- [ ] Manuscript sharing and collaboration
- [ ] Manuscript templates
- [ ] Advanced sorting options
- [ ] Manuscript preview in drawer

### Technical Improvements
- [ ] Virtual scrolling for large lists
- [ ] Optimistic updates
- [ ] Offline support
- [ ] PWA integration

## Risk Assessment

### Technical Risks
- **API Performance**: Large manuscript lists may cause slow loading
- **Memory Usage**: Caching too many manuscripts may impact performance
- **Browser Compatibility**: Complex drawer interactions may not work in older browsers

### User Experience Risks
- **Confusing Navigation**: Users may not understand the selection process
- **Data Loss**: Navigation away from manuscript might lose unsaved changes
- **Permission Confusion**: Users may not understand why they can't see certain manuscripts

### Mitigation Strategies
- Implement pagination for large lists
- Add loading states and progress indicators
- Provide clear error messages and recovery options
- Include comprehensive user documentation

## Success Metrics

### User Engagement
- **Usage Rate**: % of users who use manuscript selection feature
- **Time to Select**: Average time from click to manuscript selection
- **Error Rate**: % of selection attempts that result in errors
- **User Satisfaction**: User feedback scores

### Technical Metrics
- **API Response Time**: Average response time for manuscript API
- **Error Rate**: % of API calls that result in errors
- **Cache Hit Rate**: % of requests served from cache
- **Page Load Time**: Time to load manuscript selection interface

### Business Metrics
- **User Retention**: Impact on user retention rates
- **Feature Adoption**: % of users who regularly use the feature
- **Support Tickets**: Reduction in support tickets related to manuscript access

---

*This specification is a living document and will be updated as the feature evolves. Last updated: 2025-07-08*