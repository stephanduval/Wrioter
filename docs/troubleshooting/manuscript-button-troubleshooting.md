# Manuscript Button Troubleshooting Guide

This guide provides solutions for common issues with the "Select Manuscript" button functionality.

## Quick Diagnosis

### Is the Button Working?
Run this quick test to determine the current state:

```bash
# 1. Start test environment
yarn dev:test:all

# 2. Run basic functionality test
yarn playwright:test tests/e2e/manuscript-button-functionality.spec.js -g "Button responds to click events"

# 3. Check for visual elements
yarn playwright:test tests/e2e/manuscript-button-functionality.spec.js -g "Button is properly styled"
```

### Expected Results
- ✅ Button visible with green background and red border
- ✅ Click shows alert: "Select Manuscript clicked! This is a custom navigation item."
- ✅ Console shows: "🖱️ Custom nav item clicked: menu.selectManuscript"

## Common Issues and Solutions

### Issue 1: Button Not Visible

#### Symptoms
- "Select Manuscript" button missing from navigation
- Navigation menu loads but button is not present
- Other navigation items work fine

#### Possible Causes
1. **Menu Configuration Missing**
2. **Permission Issues**
3. **Component Not Loaded**
4. **Translation Issues**

#### Diagnosis Steps

**Step 1: Check Menu Configuration**
```bash
# Verify menu item exists in configuration
grep -r "menu.selectManuscript" resources/ts/navigation/vertical/
```

Expected output:
```typescript
{
  title: 'menu.selectManuscript',
  icon: { icon: 'bx-navigation' },
  action: 'read',
  subject: 'manuscripts',
  custom: true,
}
```

**Step 2: Check Translation**
```bash
# Verify translation exists
grep -r "selectManuscript" resources/ts/plugins/i18n/locales/
```

Expected output:
```json
{
  "menu": {
    "selectManuscript": "Select Manuscript"
  }
}
```

**Step 3: Check Permission Bypass**
```bash
# Check VerticalNavMenu.vue for permission bypass
grep -A 5 -B 5 "menu.selectManuscript" resources/ts/layouts/components/VerticalNavMenu.vue
```

#### Solutions

**Solution 1: Fix Menu Configuration**
```typescript
// In resources/ts/navigation/vertical/Freynet-Gagné-menu.ts
{
  title: 'menu.selectManuscript',
  icon: { icon: 'bx-navigation' },
  action: 'read',
  subject: 'manuscripts',
  custom: true,  // ← This flag is crucial
}
```

**Solution 2: Add Permission Bypass**
```typescript
// In resources/ts/layouts/components/VerticalNavMenu.vue
if (item.title === 'menu.selectManuscript') {
  console.log('🔧 Select Manuscript found - bypassing permissions')
}

// Skip permission check for Select Manuscript
if (!hasPermission && item.title !== 'menu.selectManuscript') {
  return null
}
```

**Solution 3: Check Component Import**
```vue
<!-- In resources/ts/layouts/components/VerticalNavMenu.vue -->
<script setup lang="ts">
import VerticalNavLink from '@/@layouts/components/VerticalNavLink.vue'
// ... other imports
</script>
```

### Issue 2: Button Visible But Not Clickable

#### Symptoms
- Button appears in navigation
- Button has proper styling
- Click does nothing (no alert, no console messages)

#### Possible Causes
1. **Click Handler Not Bound**
2. **Custom Flag Not Set**
3. **Event Propagation Issues**
4. **JavaScript Errors**

#### Diagnosis Steps

**Step 1: Check Console for Errors**
```javascript
// Open browser console and look for errors
// Click the button and check for:
// - JavaScript errors
// - Network errors
// - Vue component errors
```

**Step 2: Verify Custom Flag**
```bash
# Check if custom flag is properly set
grep -A 10 -B 5 "custom.*true" resources/ts/navigation/vertical/Freynet-Gagné-menu.ts
```

**Step 3: Test Click Handler**
```javascript
// In browser console, test manually:
document.querySelector('[data-test-id="custom-menu-item"]').click()
```

#### Solutions

**Solution 1: Fix Click Handler**
```typescript
// In resources/ts/@layouts/components/VerticalNavLink.vue
const handleCustomClick = (event: Event) => {
  console.log('🖱️ Custom nav item clicked:', props.item.title)
  event.preventDefault()
  event.stopPropagation()
  
  if (props.item.title === 'menu.selectManuscript') {
    console.log('🚀 Select Manuscript clicked!')
    alert('Select Manuscript clicked! This is a custom navigation item.')
  }
}
```

**Solution 2: Fix Event Binding**
```vue
<!-- In VerticalNavLink.vue template -->
<Component
  :is="item.to ? 'RouterLink' : 'a'"
  v-bind="item.custom ? {} : getComputedNavLinkToProp(item)"
  @click="item.custom ? handleCustomClick : undefined"
>
```

**Solution 3: Add Debug Styling**
```vue
<!-- In VerticalNavLink.vue template -->
<Component
  :style="item.custom ? 'cursor: pointer; background: lightgreen !important; border: 2px solid red !important;' : undefined"
>
```

### Issue 3: Button Clicks But No Action

#### Symptoms
- Button responds to clicks
- Console shows click messages
- Alert appears but drawer doesn't open

#### Possible Causes
1. **Drawer Not Integrated**
2. **State Management Issues**
3. **Component Communication Problems**

#### Current Expected Behavior
**Note**: This is the current expected behavior. The drawer integration is not yet complete.

The button should:
1. Show console message: "🖱️ Custom nav item clicked: menu.selectManuscript"
2. Show alert: "Select Manuscript clicked! This is a custom navigation item."
3. **Not** open a drawer (this is future functionality)

#### Solutions

**Solution 1: Confirm Current Implementation**
```typescript
// This is the current correct implementation
const handleCustomClick = (event: Event) => {
  console.log('🖱️ Custom nav item clicked:', props.item.title)
  event.preventDefault()
  event.stopPropagation()
  
  if (props.item.title === 'menu.selectManuscript') {
    console.log('🚀 Select Manuscript clicked!')
    alert('Select Manuscript clicked! This is a custom navigation item.')
  }
}
```

**Solution 2: Future Drawer Integration**
```typescript
// This is what the implementation should become:
const handleCustomClick = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  
  if (props.item.title === 'menu.selectManuscript') {
    // Open manuscript selection drawer
    isManuscriptDrawerOpen.value = true
  }
}
```

### Issue 4: Styling Issues

#### Symptoms
- Button appears but without debug styling
- No green background or red border
- Button looks like regular navigation item

#### Possible Causes
1. **CSS Not Applied**
2. **Inline Styles Overridden**
3. **Vuetify Theme Conflicts**

#### Diagnosis Steps

**Step 1: Check Element Styling**
```javascript
// In browser console:
const button = document.querySelector('text="Select Manuscript"')
console.log(window.getComputedStyle(button))
```

**Step 2: Check for Style Conflicts**
```bash
# Check for conflicting styles
grep -r "lightgreen" resources/ts/
grep -r "custom.*style" resources/ts/
```

#### Solutions

**Solution 1: Fix Inline Styles**
```vue
<!-- In VerticalNavLink.vue -->
<Component
  :style="item.custom ? 'cursor: pointer; background: lightgreen !important; border: 2px solid red !important;' : undefined"
>
```

**Solution 2: Add CSS Classes**
```vue
<!-- Alternative approach -->
<Component
  :class="{ 'custom-nav-item': item.custom }"
>
```

```scss
.custom-nav-item {
  cursor: pointer !important;
  background: lightgreen !important;
  border: 2px solid red !important;
}
```

### Issue 5: Permission Errors

#### Symptoms
- Button not visible for certain users
- Console shows permission-related errors
- Works for admin but not for client users

#### Possible Causes
1. **Permission Bypass Not Working**
2. **CASL Configuration Issues**
3. **User Role Problems**

#### Diagnosis Steps

**Step 1: Check Permission Bypass**
```bash
# Look for permission bypass code
grep -A 10 -B 5 "menu.selectManuscript" resources/ts/layouts/components/VerticalNavMenu.vue
```

**Step 2: Test with Different Users**
```bash
# Test with different user roles
yarn playwright:test tests/e2e/manuscript-button-functionality.spec.js -g "Client user can see"
```

#### Solutions

**Solution 1: Add Permission Bypass**
```typescript
// In VerticalNavMenu.vue
const hasPermission = can(item.action, item.subject)

// BYPASS PERMISSION CHECK FOR SELECT MANUSCRIPT
if (item.title === 'menu.selectManuscript') {
  console.log('🔧 Select Manuscript found - bypassing permissions')
}

if (!hasPermission && item.title !== 'menu.selectManuscript') {
  return null
}
```

**Solution 2: Check CASL Configuration**
```typescript
// Verify CASL is properly configured
// Check resources/ts/plugins/casl/index.ts
```

### Issue 6: Test Failures

#### Symptoms
- Automated tests fail
- Button appears in manual testing but fails in tests
- Intermittent test failures

#### Possible Causes
1. **Timing Issues**
2. **Test Environment Problems**
3. **Selector Issues**

#### Diagnosis Steps

**Step 1: Run Tests with Debug**
```bash
# Run tests with visual output
yarn playwright:test tests/e2e/manuscript-button-functionality.spec.js --headed --debug
```

**Step 2: Check Test Environment**
```bash
# Verify test environment is running
yarn dev:test:all
yarn db:fresh:test
```

**Step 3: Check Selectors**
```bash
# Test selectors manually
yarn playwright:test tests/e2e/manuscript-button-functionality.spec.js -g "Debug"
```

#### Solutions

**Solution 1: Fix Timing Issues**
```typescript
// Add proper waits in tests
await page.waitForLoadState('networkidle')
await expect(selectManuscriptButton).toBeVisible({ timeout: 5000 })
```

**Solution 2: Improve Selectors**
```typescript
// Use more specific selectors
const selectManuscriptButton = page.locator('[data-test-id="custom-menu-item"]')
// OR
const selectManuscriptButton = page.locator('text="Select Manuscript"').first()
```

**Solution 3: Add Debug Information**
```typescript
// Add debug information to tests
const debugInfo = await page.evaluate(() => {
  return {
    navItems: Array.from(document.querySelectorAll('.v-list-item .nav-item-title'))
      .map(el => el.textContent),
    selectManuscriptElements: Array.from(document.querySelectorAll('*'))
      .filter(el => el.textContent && el.textContent.includes('Select Manuscript'))
  }
})
console.log('Debug info:', debugInfo)
```

## Environment-Specific Issues

### Development Environment

#### Common Issues
1. **Hot Reload Problems**: Component changes not reflecting
2. **Cache Issues**: Old component versions cached
3. **Module Resolution**: Import paths not working

#### Solutions
```bash
# Clear development cache
rm -rf node_modules/.cache
rm -rf .vite

# Restart development server
yarn dev:test:all
```

### Test Environment

#### Common Issues
1. **Database State**: Test data not seeded properly
2. **API Mocking**: Mock responses not working
3. **Component Mounting**: Vue components not mounting in tests

#### Solutions
```bash
# Reset test database
yarn db:fresh:test

# Clear test cache
yarn playwright:test --clear-cache

# Run tests with full output
yarn playwright:test --reporter=html
```

### Production Environment

#### Common Issues
1. **Build Issues**: Component not built correctly
2. **Asset Loading**: Static assets not loading
3. **Performance**: Slow loading times

#### Solutions
```bash
# Rebuild assets
yarn build

# Check build output
ls -la public/build/

# Test production build locally
yarn serve
```

## Debugging Tools

### Browser DevTools

#### Console Commands
```javascript
// Check Vue component state
$0.__vueParentComponent

// Check Pinia store
window.__vue_app__.config.globalProperties.$pinia.state.value

// Check component props
$0.__vueParentComponent.props

// Check event listeners
getEventListeners($0)
```

#### Network Tab
- Monitor API calls to `/api/manuscripts`
- Check for 404 or 500 errors
- Verify authentication headers

### Vue DevTools

#### Key Areas to Check
1. **Component Tree**: Verify component hierarchy
2. **Pinia Store**: Check manuscript store state
3. **Events**: Monitor component events
4. **Performance**: Check component render times

### Playwright DevTools

#### Debug Commands
```bash
# Run tests with debug mode
yarn playwright:test --debug

# Run tests with UI
yarn playwright:test --ui

# Generate test report
yarn playwright:test --reporter=html
yarn playwright show-report
```

## Log Analysis

### Application Logs

#### Laravel Logs
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Check test environment logs
tail -f storage/logs/testing.log

# Search for specific errors
grep -i "manuscript" storage/logs/laravel.log
```

#### JavaScript Console Logs
Look for these specific messages:

**Success Messages**:
- `🖱️ Custom nav item clicked: menu.selectManuscript`
- `🚀 Select Manuscript clicked!`
- `🔧 Select Manuscript found - bypassing permissions`

**Error Messages**:
- `❌ Click not handled for: [item.title]`
- `TypeError: Cannot read property`
- `ReferenceError: [variable] is not defined`

### Test Logs

#### Playwright Logs
```bash
# View test results
yarn playwright show-report

# Check for specific test failures
yarn playwright:test --reporter=json | jq '.suites[].specs[].tests[] | select(.status == "failed")'
```

## Performance Troubleshooting

### Slow Button Response

#### Symptoms
- Button takes time to respond to clicks
- Page feels sluggish
- Long loading times

#### Solutions
```typescript
// Add performance monitoring
const startTime = performance.now()
// ... button click logic
const endTime = performance.now()
console.log(`Button response time: ${endTime - startTime}ms`)
```

### Memory Issues

#### Symptoms
- Browser becomes unresponsive
- Page crashes
- Memory warnings in console

#### Solutions
```typescript
// Add memory monitoring
const memoryUsage = performance.memory
console.log('Memory usage:', memoryUsage)

// Proper cleanup
onUnmounted(() => {
  // Clean up event listeners
  // Clear timers
  // Remove references
})
```

## Advanced Debugging

### Custom Debug Mode

Add this to your Vue component for detailed debugging:

```typescript
// In VerticalNavLink.vue
const DEBUG_MODE = import.meta.env.DEV

const handleCustomClick = (event: Event) => {
  if (DEBUG_MODE) {
    console.group('🔍 Debug: Custom Click Handler')
    console.log('Event:', event)
    console.log('Item:', props.item)
    console.log('Custom flag:', props.item.custom)
    console.log('Title:', props.item.title)
    console.groupEnd()
  }
  
  // ... rest of handler
}
```

### Network Debugging

Monitor API calls:

```typescript
// Add network monitoring
const originalFetch = window.fetch
window.fetch = async (...args) => {
  console.log('📡 API Call:', args[0])
  const response = await originalFetch(...args)
  console.log('📡 API Response:', response.status)
  return response
}
```

### Component State Debugging

```typescript
// Add state debugging
watch(() => props.item, (newItem) => {
  console.log('📊 Item changed:', newItem)
}, { deep: true })
```

## Getting Help

### Internal Resources
1. **Documentation**: Check `/docs/` folder for additional guides
2. **Tests**: Look at existing tests for expected behavior
3. **Code Comments**: Review inline comments in components

### External Resources
1. **Vue 3 Documentation**: https://v3.vuejs.org/
2. **Vuetify Documentation**: https://vuetifyjs.com/
3. **Playwright Documentation**: https://playwright.dev/
4. **Pinia Documentation**: https://pinia.vuejs.org/

### Creating Bug Reports

When reporting issues, include:

1. **Environment Information**
   - Operating System
   - Browser version
   - Node.js version
   - Package versions

2. **Steps to Reproduce**
   - Exact steps taken
   - Expected behavior
   - Actual behavior

3. **Debug Information**
   - Console logs
   - Network requests
   - Error messages
   - Screenshots/videos

4. **Test Results**
   - Which tests pass/fail
   - Test output logs
   - Configuration used

---

*This troubleshooting guide is maintained as part of the Wrioter project documentation. Last updated: 2025-07-08*