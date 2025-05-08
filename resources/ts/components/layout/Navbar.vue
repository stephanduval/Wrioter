<script setup lang="ts">
import NavbarLanguageSwitcher from './NavbarLanguageSwitcher.vue';
// ... existing imports ...

// ... rest of your existing script
</script>

<template>
  <VAppBar>
    <!-- ... existing navbar content ... -->
    
    <VSpacer />
    
    <!-- Add the language switcher before other navbar items -->
    <NavbarLanguageSwitcher class="me-2" />
    
    <!-- ... rest of your navbar items ... -->
  </VAppBar>
</template> 
