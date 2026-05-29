/**
 * Configuration for block editor
 * Centralized settings for TipTap editor customization
 */

export const BLOCK_EDITOR_CONFIG = {
  // Image settings
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    formats: ['jpeg', 'png', 'webp', 'gif', 'svg'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
  },

  // Heading settings
  heading: {
    maxLevel: 3,
    levels: [1, 2, 3]
  },

  // Code block settings
  codeBlock: {
    languages: [
      'javascript',
      'typescript',
      'python',
      'go',
      'rust',
      'java',
      'cpp',
      'csharp',
      'ruby',
      'php',
      'sql',
      'html',
      'css',
      'xml',
      'json',
      'yaml',
      'toml',
      'bash',
      'shell',
      'makefile',
      'dockerfile',
      'plaintext'
    ],
    defaultLanguage: 'plaintext',
    highlightLineNumbers: true,
    syntaxHighlighting: true
  },

  // List settings
  list: {
    allowNesting: true,
    maxNestingLevel: 5
  },

  // Table settings
  table: {
    resizable: true,
    handleWidth: 7,
    cellMinWidth: 25,
    headerRows: 1,
    headerCols: 0,
    allowDragAndDrop: true
  },

  // Editor settings
  editor: {
    spellcheck: false,
    placeholder: 'Start writing...',
    autofocus: false,
    injectCSS: true,
    editorProps: {
      attributes: {
        class: 'block-editor-content'
      }
    }
  },

  // Features
  features: {
    markdown: true,
    collaboration: false,
    ai: true,
    mentions: false,
    emoji: false,
    slash: true,
    blockTypes: true,
    dragDrop: true,
    pasteHandling: true
  },

  // Keyboard shortcuts (custom)
  shortcuts: {
    save: { windows: 'ctrl+enter', mac: 'cmd+enter' },
    bold: { windows: 'ctrl+b', mac: 'cmd+b' },
    italic: { windows: 'ctrl+i', mac: 'cmd+i' },
    code: { windows: 'ctrl+`', mac: 'cmd+`' },
    link: { windows: 'ctrl+k', mac: 'cmd+k' },
    undo: { windows: 'ctrl+z', mac: 'cmd+z' },
    redo: { windows: 'ctrl+y', mac: 'cmd+shift+z' },
    h1: { windows: 'ctrl+alt+1', mac: 'cmd+alt+1' },
    h2: { windows: 'ctrl+alt+2', mac: 'cmd+alt+2' },
    h3: { windows: 'ctrl+alt+3', mac: 'cmd+alt+3' },
    bullet: { windows: 'ctrl+shift+8', mac: 'cmd+shift+8' },
    number: { windows: 'ctrl+shift+7', mac: 'cmd+shift+7' },
    quote: { windows: 'ctrl+shift+b', mac: 'cmd+shift+b' },
    code_block: { windows: 'ctrl+shift+`', mac: 'cmd+shift+`' },
    hr: { windows: 'ctrl+shift+-', mac: 'cmd+shift+-' }
  },

  // Appearance
  appearance: {
    theme: 'light', // light | dark | auto
    fontSize: '16px',
    lineHeight: '1.5',
    fontFamily: 'var(--font-family)',
    codeFont: 'var(--font-family-code)'
  },

  // Collaboraton settings (for future use)
  collaboration: {
    enabled: false,
    provider: null, // 'yjs', 'automerge', etc
    awareness: false,
    cursorNames: true,
    cursors: true
  }
};

/**
 * Get a specific configuration value
 */
export function getEditorConfig(path) {
  const keys = path.split('.');
  let value = BLOCK_EDITOR_CONFIG;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Merge custom configuration with defaults
 */
export function mergeEditorConfig(customConfig) {
  return deepMerge(BLOCK_EDITOR_CONFIG, customConfig);
}

function deepMerge(target, source) {
  const output = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
  }

  return output;
}

export default BLOCK_EDITOR_CONFIG;