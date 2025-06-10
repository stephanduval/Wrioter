# Front-end Documentation and Translations

## Vertical Navigation Menu Structure and Translations

The vertical navigation menu in the application is implemented using a modular TypeScript-based system with a specific translation structure. The navigation structure is defined in the `resources/ts/navigation/vertical` directory.

### Navigation Files Organization

- `index.ts`: The main entry point that exports the combined navigation items
- `Freynet-Gagné-menu.ts`: The primary menu configuration file containing the main navigation structure
- Other menu files (currently commented out but available for future use):
  - `apps-and-pages.ts`
  - `charts.ts`
  - `dashboard.ts`
  - `forms.ts`
  - `others.ts`
  - `ui-elements.ts`

### Menu Structure and Translation Keys

The navigation menu uses a specific translation key structure to ensure consistency and prevent translation errors. Each menu item's title must follow these rules:

1. **Single-Level Key Structure**
   - All menu translation keys must use a single-level structure under the 'menu' namespace
   - Example: `menu.userManagement`, `menu.companyList`, `menu.projects`
   - ❌ Avoid nested keys like `menu.manuscripts.new` or `menu.scrivener.import`
   - ✅ Use flattened keys like `menu.manuscriptNew` or `menu.scrivenerImport`

2. **Translation Key Format**
   ```typescript
   // Correct format
   {
     title: 'menu.userManagement',    // Single-level key
     icon: { icon: 'bx-user' },
     to: 'apps-user-list',
     action: 'read',
     subject: 'admin',
   }

   // Incorrect format (avoid this)
   {
     title: 'menu.manuscripts.new',   // Nested key - can cause translation issues
     icon: { icon: 'bx-plus' },
     to: 'manuscripts-new',
   }
   ```

3. **Required Translation Keys**
   All menu items must have corresponding translations in both locale files:
   ```json
   // en.json and fr.json
   {
     "menu": {
       "heading": "Freynet-Gagné",
       "userManagement": "User Management",      // English
       "companyList": "Company List",
       "projects": "Projects",
       "messages": "Messages",
       "manuscripts": "Manuscripts",
       "manuscriptNew": "New Manuscript",        // Note: single-level key
       "manuscriptList": "All Manuscripts",
       "scrivener": "Scrivener",
       "scrivenerImport": "Import from Scrivener"
     }
   }
   ```

### Common Translation Issues and Solutions

1. **Missing Translation Keys**
   - Error: `[intlify] Not found 'menu.manuscripts.new' key in 'en' locale messages`
   - Solution: Use single-level keys and ensure translations exist in both locale files

2. **Nested Key Structure**
   - Problem: Nested keys like `menu.manuscripts.new` can cause translation loading issues
   - Solution: Flatten the keys to `menu.manuscriptNew`

3. **Translation Loading**
   - Ensure translations are loaded before menu rendering
   - Use consistent key structure across all menu items
   - Verify translations in both locale files (en.json and fr.json)

### Current Menu Sections with Translation Keys

1. **Main Menu Section**
   ```typescript
   {
     title: 'menu.userManagement',    // User Management
     title: 'menu.companyList',       // Company List
     title: 'menu.projects',          // Projects
     title: 'menu.messages',          // Messages
   }
   ```

2. **Manuscript Section**
   ```typescript
   {
     title: 'menu.manuscriptNew',     // New Manuscript
     title: 'menu.manuscriptList',    // Manuscript List
   }
   ```

3. **Scrivener Section**
   ```typescript
   {
     title: 'menu.scrivenerImport',   // Import Scrivener File
   }
   ```

### Best Practices for Menu Translations

1. **Key Naming**
   - Use camelCase for multi-word keys
   - Keep keys under the 'menu' namespace
   - Use descriptive but concise key names
   - Maintain consistency across all menu items

2. **Translation Management**
   - Add new translations to both locale files simultaneously
   - Test translations in both languages
   - Verify all menu items have corresponding translations
   - Use the Vue devtools i18n plugin to debug translation issues

3. **Adding New Menu Items**
   ```typescript
   // 1. Add the menu item with a single-level translation key
   {
     title: 'menu.newFeature',        // Use single-level key
     icon: { icon: 'bx-icon' },
     to: 'new-feature-route',
   }

   // 2. Add translations to both locale files
   // en.json
   {
     "menu": {
       "newFeature": "New Feature"
     }
   }
   // fr.json
   {
     "menu": {
       "newFeature": "Nouvelle Fonctionnalité"
     }
   }
   ```

4. **Troubleshooting**
   - If translations are not found, check:
     1. Key structure (should be single-level)
     2. Presence in both locale files
     3. Correct namespace ('menu.')
     4. No typos in key names
   - Use Vue devtools to inspect i18n state
   - Verify translation loading order

// ... rest of the existing documentation ... 
