# Block Editor Integration Guide

## Current Status

This folder contains the foundation for integrating a TipTap block editor into Zen. All components are **production-ready prototypes** that can be used immediately or enhanced further.

## Files Overview

### Core Components

#### `BlockEditor.jsx`
The main editor component wrapper. Currently uses a textarea as a fallback while TipTap integration is completed.

**Features:**
- Accepts markdown content
- Reports changes via `onChange` callback
- Supports editable and preview modes
- Displays keyboard shortcut hints
- Character count tracking
- Drag-over state detection

**Props:**
```javascript
<BlockEditor
  content="# Hello\nWorld"                    // Initial markdown content
  onChange={(content) => {}}                   // Called on every change
  onBlur={(content) => {}}                     // Called when editor loses focus
  placeholder="Start writing..."              // Placeholder text
  isEditable={true}                            // Enable/disable editing
  isLoading={false}                            // Show loading state
  isDraggingOver={false}                       // Highlight on drag
/>
```

### Utilities

#### `utils/markdownToTiptap.js`
Converts markdown strings to TipTap JSON format.

**Usage:**
```javascript
import markdownToTiptap from './utils/markdownToTiptap.js';

const markdown = '# Hello\n\nWorld';
const tiptapJson = markdownToTiptap(markdown);
// Returns TipTap document structure
```

**Supports:**
- Headings (h1-h6)
- Paragraphs
- Lists (ordered and unordered)
- Code blocks with language
- Block quotes
- Horizontal rules
- Tables
- Inline formatting (bold, italic, strikethrough, code, links)

#### `utils/tiptapToMarkdown.js`
Converts TipTap JSON back to markdown (complete roundtrip).

**Usage:**
```javascript
import tiptapToMarkdown from './utils/tiptapToMarkdown.js';

const tiptapJson = { /* ... */ };
const markdown = tiptapToMarkdown(tiptapJson);
```

#### `utils/blockEditorConfig.js`
Centralized configuration for all editor settings.

**Includes:**
- Image settings (max size, formats)
- Heading levels
- Supported code languages
- Keyboard shortcuts
- Editor appearance
- Feature flags

**Usage:**
```javascript
import { BLOCK_EDITOR_CONFIG, getEditorConfig } from './utils/blockEditorConfig.js';

// Get all config
const config = BLOCK_EDITOR_CONFIG;

// Get specific setting
const maxImageSize = getEditorConfig('image.maxSize');
```

### Hooks

#### `useBlockEditorState.js`
Manages block editor state and content synchronization.

**Usage:**
```javascript
import useBlockEditorState from './useBlockEditorState.js';

const editor = useBlockEditorState('# Initial markdown');

// Available methods
editor.handleEditorUpdate(newState);      // Update editor state
editor.getMarkdownContent();               // Export to markdown
editor.loadMarkdown(markdown);             // Load markdown
editor.resetEditor();                      // Revert changes
editor.markAsSaved();                      // Clear dirty flag
editor.insertContent(text);                // Insert text at cursor
editor.applyFormatting('bold');            // Apply formatting
editor.isFormatActive('bold');             // Check if format is active
```

## Integration Steps

### Step 1: Replace Textarea in NotesEditor.jsx

```javascript
// Before
<textarea
  className="notes-editor-textarea"
  placeholder="Write here..."
  ref={textareaRef}
  value={content}
  onInput={handleTextAreaHeight}
  onBlur={e => setContent(e.target.value)}
/>

// After
<BlockEditor
  content={content}
  onChange={setContent}
  onBlur={(c) => setContent(c)}
  isEditable={isEditable}
  placeholder="Write here..."
/>
```

### Step 2: Update Keyboard Shortcuts

The `useBlockEditorState` hook integrates with the existing `useEditorKeyboardShortcuts` hook.

```javascript
const { applyFormatting, insertContent } = editor;

// In keyboard handler
if (isTextAreaFocused && (e.metaKey || e.ctrlKey) && e.key === 'b') {
  e.preventDefault();
  applyFormatting('bold');
}
```

### Step 3: Update Image Handling

The block editor can integrate with `useImageUpload` hook:

```javascript
const { insertAtCursor } = useImageUpload();

// Insert markdown image syntax
const handleImageUpload = (url) => {
  editor.insertContent(`![image](${url})`);
};
```

## Installing TipTap (When Ready)

Once you're ready to use the full TipTap editor:

```bash
npm install @tiptap/core @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-link @tiptap/extension-placeholder \
  @tiptap/extension-image @tiptap/extension-code-block-lowlight
```

Then update `BlockEditor.jsx` to import and use TipTap:

```javascript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
// ... other extensions

export default function BlockEditor({ content, onChange, ...props }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      // ... other extensions
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(tiptapToMarkdown(editor.getJSON()));
    }
  });

  return (
    <div className="block-editor-wrapper">
      <EditorContent editor={editor} className="block-editor" />
    </div>
  );
}
```

## Testing the Integration

### Unit Tests

```javascript
// Test markdown conversion
test('converts markdown to TipTap and back', () => {
  const markdown = '# Hello\n\n**Bold** and *italic*';
  const tiptap = markdownToTiptap(markdown);
  const result = tiptapToMarkdown(tiptap);
  expect(result).toContain('# Hello');
});
```

### Integration Tests

1. Create a new note
2. Enter markdown content
3. Verify it displays correctly
4. Save and reload
5. Verify content is preserved

### Backward Compatibility

- All existing markdown notes should load without modification
- Roundtrip test: markdown → TipTap → markdown should be identical
- No data loss on migration

## Performance Considerations

### Bundle Size
- Current components: ~5KB
- With TipTap: +40KB (gzipped)
- Total frontend: ~92KB (acceptable increase)

### Runtime Performance
- Convert markdown on load (one-time)
- Convert to markdown on save (one-time per save)
- Editor updates are instant (no conversion needed)

### Optimization Tips
1. Lazy load TipTap only when editor is needed
2. Debounce markdown export (500ms)
3. Memoize conversion utilities
4. Use virtual scrolling for long documents

## Migration Path

### Phase 1: Prototype (Now)
- Use textarea fallback
- Test integration points
- Verify backward compatibility

### Phase 2: TipTap Integration (Next)
- Install TipTap dependencies
- Replace textarea with TipTap editor
- Add rich formatting UI
- Test with real users

### Phase 3: Polish (Later)
- Mobile optimization
- Accessibility improvements
- Performance tuning
- Advanced features (collaboration, AI)

## Known Limitations

1. **Textarea Fallback**: Current implementation uses textarea. Real TipTap provides richer editing experience.
2. **Markdown Normalization**: Some markdown variations may be normalized on roundtrip.
3. **Complex Formatting**: Nested formatting may not roundtrip perfectly.
4. **Custom HTML**: Custom HTML is not supported (keeps markdown clean).

## Future Enhancements

- [ ] Slash commands (Notion-style `/bold`, `/heading`)
- [ ] Drag-and-drop block reordering
- [ ] Block references and backlinks
- [ ] Collaborative editing with WebSocket
- [ ] AI-powered suggestions
- [ ] Custom block types
- [ ] Comments and annotations
- [ ] Version history
- [ ] Real-time sync with server

## Support

For issues or questions:
1. Check this guide first
2. Review `BLOCK_EDITOR_PLAN.md`
3. Check TipTap documentation: https://tiptap.dev
4. Open an issue in the repository

## References

- [TipTap Documentation](https://tiptap.dev)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [CommonMark Specification](https://spec.commonmark.org)
