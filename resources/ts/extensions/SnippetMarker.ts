import { Mark, mergeAttributes } from '@tiptap/core'

export interface SnippetMarkerOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    snippetMarker: {
      /**
       * Set a snippet marker
       */
      setSnippetMarker: (attributes: { snippetId: number; markerId: string }) => ReturnType
      /**
       * Toggle a snippet marker
       */
      toggleSnippetMarker: (attributes: { snippetId: number; markerId: string }) => ReturnType
      /**
       * Unset a snippet marker
       */
      unsetSnippetMarker: () => ReturnType
    }
  }
}

export const SnippetMarker = Mark.create<SnippetMarkerOptions>({
  name: 'snippetMarker',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'snippet-marker',
      },
    }
  },

  addAttributes() {
    return {
      'data-snippet-id': {
        default: null,
        parseHTML: element => element.getAttribute('data-snippet-id'),
        renderHTML: attributes => {
          if (!attributes['data-snippet-id']) {
            return {}
          }
          return { 'data-snippet-id': attributes['data-snippet-id'] }
        },
      },
      'data-marker-id': {
        default: null,
        parseHTML: element => element.getAttribute('data-marker-id'),
        renderHTML: attributes => {
          if (!attributes['data-marker-id']) {
            return {}
          }
          return { 'data-marker-id': attributes['data-marker-id'] }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-snippet-marker]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-snippet-marker': 'true',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setSnippetMarker:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, {
            'data-snippet-id': attributes.snippetId,
            'data-marker-id': attributes.markerId,
          })
        },
      toggleSnippetMarker:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, {
            'data-snippet-id': attributes.snippetId,
            'data-marker-id': attributes.markerId,
          })
        },
      unsetSnippetMarker:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

export default SnippetMarker
