// Frontend style resolution logic
interface StyleResolutionOptions {
  useRawContent: boolean;
  useItemStyles: boolean;
  useManuscriptStyles: boolean;
}

class StyleResolver {
  async resolveStyles(itemId: number, manuscriptId: number, options: StyleResolutionOptions) {
    const styles = [];
    
    // 1. Manuscript styles (highest priority if enabled)
    if (options.useManuscriptStyles) {
      // Check for manuscript-level overrides
      const manuscriptOverride = await this.getManuscriptStyleOverride(manuscriptId, itemId);
      if (manuscriptOverride) {
        styles.push(manuscriptOverride);
      }
      
      // Get manuscript-specific style applications
      const manuscriptStyles = await this.getManuscriptStyleApplications(manuscriptId, itemId);
      styles.push(...manuscriptStyles);
    }
    
    // 2. Item-specific styles (if enabled)
    if (options.useItemStyles) {
      const itemStyles = await this.getItemStyleApplications(itemId);
      styles.push(...itemStyles);
    }
    
    // 3. Raw content (if enabled)
    if (options.useRawContent) {
      const rawContent = await this.getRawContent(itemId);
      return this.parseRawContentStyles(rawContent);
    }
    
    return this.mergeStyles(styles);
  }
}


// Frontend style resolution logic
interface StyleResolutionOptions {
  useRawContent: boolean;
  useItemStyles: boolean;
  useManuscriptStyles: boolean;
}

class StyleResolver {
  async resolveStyles(itemId: number, manuscriptId: number, options: StyleResolutionOptions) {
    const styles = [];
    
    // 1. Manuscript styles (highest priority if enabled)
    if (options.useManuscriptStyles) {
      // Check for manuscript-level overrides
      const manuscriptOverride = await this.getManuscriptStyleOverride(manuscriptId, itemId);
      if (manuscriptOverride) {
        styles.push(manuscriptOverride);
      }
      
      // Get manuscript-specific style applications
      const manuscriptStyles = await this.getManuscriptStyleApplications(manuscriptId, itemId);
      styles.push(...manuscriptStyles);
    }
    
    // 2. Item-specific styles (if enabled)
    if (options.useItemStyles) {
      const itemStyles = await this.getItemStyleApplications(itemId);
      styles.push(...itemStyles);
    }
    
    // 3. Raw content (if enabled)
    if (options.useRawContent) {
      const rawContent = await this.getRawContent(itemId);
      return this.parseRawContentStyles(rawContent);
    }
    
    return this.mergeStyles(styles);
  }
}
