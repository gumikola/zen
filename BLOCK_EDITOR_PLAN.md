# Notion-like Block Editor Integration Plan for Zen

## Overview
This document outlines the strategy to integrate a modern, block-based editor (similar to Notion) into Zen while maintaining markdown compatibility and backward compatibility with existing notes.

## Architecture Decision: TipTap + ProseMirror

### Why TipTap?
- **Lightweight**: ~40KB gzipped (vs ProseMirror: ~25KB, Lexical: ~80KB)
- **Preact Compatible**: Works seamlessly with the existing Preact setup
- **Markdown Native**: Built-in markdown support and export
- **Block Extensions**: Easy to create custom block types (callouts, code blocks, etc.)
- **Collaborative Ready**: Foundation for future real-time collaboration
- **Active Community**: Well-maintained with excellent documentation

### Alternative Options Comparison
| Feature | TipTap | BlockNote | Lexical | Custom |
|---------|--------|-----------|---------|--------|
| Bundle Size | Medium | Small | Large | Smallest |
| Learning Curve | Low | Very Low | Medium | High |
| Block Support | Excellent | Native | Good | Manual |
| Markdown Export | Yes | Yes | Yes | Manual |
| Maintenance | Active | Active | Facebook | High |
| Preact Support | Yes | Yes | Yes | Yes |

## Implementation Phases

### Phase 1: Setup & Infrastructure (Week 1)
- [ ] Install TipTap dependencies
- [ ] Create block editor component wrapper
- [ ] Set up markdown ↔ editor conversion utilities
- [ ] Create integration bridge with existing keyboard shortcuts

### Phase 2: Block Editor Component (Week 2)
- [ ] Build `BlockEditor.jsx` component
- [ ] Implement core blocks: paragraph, heading, list, code, quote
- [ ] Add formatting toolbar with block type selector
- [ ] Implement markdown paste/import
- [ ] Add keyboard shortcuts integration

### Phase 3: Integration (Week 3)
- [ ] Update `NotesEditor.jsx` to use new editor
- [ ] Migrate image handling to new editor
- [ ] Update keyboard shortcuts for new editor
- [ ] Add editor state management

### Phase 4: Polish & Testing (Week 4)
- [ ] Mobile optimization
- [ ] Performance testing
- [ ] Backward compatibility testing
- [ ] User feedback & iterations

### Phase 5: Advanced Features (Week 5+)
- [ ] Callout/admonition blocks
- [ ] Table improvements
- [ ] Drag & drop block reordering
- [ ] Block reference support
- [ ] AI features integration

## Dependency Management

### Dependencies to Add
```json
{
  "@tiptap/core": "^2.0.0",
  "@tiptap/pm": "^2.0.0",
  "@tiptap/starter-kit": "^2.0.0",
  "@tiptap/extension-typography": "^2.0.0",
  "@tiptap/extension-link": "^2.0.0",
  "@tiptap/extension-placeholder": "^2.0.0",
  "@tiptap/extension-image": "^2.0.0",
  "@tiptap/extension-code-block-lowlight": "^2.0.0",
  "lowlight": "^2.0.0"
}
```

### Bundle Size Impact
- Current: ~52KB JavaScript
- With TipTap: ~92KB JavaScript (+40KB)
- Acceptable trade-off for feature richness

## Data Flow

### Markdown ↔ Editor Conversion

```
Database (Markdown)
    ↓
Parse to JSON (markdownToHTML + custom parser)
    ↓
TipTap Editor State
    ↓
User edits
    ↓
Export to Markdown
    ↓
Save to Database
```

## Backward Compatibility Strategy

### Existing Notes
1. Markdown content in database remains unchanged
2. On load: Convert markdown → TipTap JSON
3. On save: Export TipTap JSON → Markdown
4. Users never see raw markdown (unless they toggle)

### Migration Path
- **Seamless**: All existing notes work immediately
- **No Data Loss**: Original markdown preserved
- **Opt-out**: Can revert to textarea with toggle (keep as fallback)

## Key Integration Points

### 1. NotesEditor.jsx Changes
```javascript
// Replace textarea with BlockEditor
// Keep all existing props and callbacks
// Maintain save/load logic
```

### 2. useMarkdownFormatter.js Changes
- Adapt to work with TipTap editor state
- Keep same API for toolbar buttons

### 3. useEditorKeyboardShortcuts.js Changes
- Extend to handle new block types
- Maintain existing shortcuts (Cmd+B, Cmd+I, etc.)
- Add new shortcuts (Cmd+Alt+1-6 for headings, etc.)

### 4. useImageUpload.js Changes
- Integrate with TipTap image handling
- Support drag-drop and paste

## File Structure

```
features/notes/
├── NotesEditor.jsx (modified)
├── NotesEditor.css (enhanced)
├── BlockEditor.jsx (new)
├── BlockEditor.css (new)
├── useMarkdownFormatter.js (modified)
├── useEditorKeyboardShortcuts.js (modified)
├── useImageUpload.js (modified)
├── useBlockEditorState.js (new)
├── utils/
│   ├── markdownToTiptap.js (new)
│   ├── tiptapToMarkdown.js (new)
│   └── blockEditorConfig.js (new)
```

## Feature Roadmap

### MVP (Minimum Viable Product)
- Basic block types (paragraph, heading 1-3, bullet list, numbered list)
- Formatting (bold, italic, strikethrough, code, link)
- Code blocks with syntax highlighting
- Block quotes
- Tables
- Images with captions
- Task lists

### Phase 2 (Enhanced)
- Callout/admonition blocks
- Image gallery
- Collaborative cursors (foundation)
- Drag-drop block reordering
- Block nesting improvements
- AI-powered block suggestions

### Phase 3 (Advanced)
- Database blocks (embed notes)
- Template variables
- Slash commands (Notion-like)
- Block duplication/copy
- Block locking
- Comments/collaboration

## Performance Considerations

### Bundle Size
- Split TipTap into separate chunks
- Lazy load advanced features
- Tree-shake unused extensions

### Runtime Performance
- Virtual scrolling for long documents
- Debounced saves
- Efficient re-renders with memoization

### Memory Usage
- Keep existing markdown parsing optimized
- Clean up unused TipTap instances

## Testing Strategy

### Unit Tests
- Markdown → TipTap → Markdown roundtrip
- Keyboard shortcuts in new editor
- Image upload handling

### Integration Tests
- Create, edit, save notes with new editor
- Switch between notes
- Load existing markdown notes

### E2E Tests
- Full user workflows (create note → format → save)
- Mobile responsiveness
- Offline functionality

## Rollout Plan

### Internal Testing
1. Feature branch with complete implementation
2. Test with real notes
3. Verify backward compatibility

### Beta Release
1. Add feature flag: `BLOCK_EDITOR_ENABLED`
2. Allow users to opt-in
3. Collect feedback

### Full Release
1. Make default editor (with fallback to textarea)
2. Document changes
3. Monitor for issues

## Configuration Management

```javascript
// blockEditorConfig.js
export const BLOCK_EDITOR_CONFIG = {
  maxImageSize: 10 * 1024 * 1024, // 10MB
  imageFormats: ['jpeg', 'png', 'webp', 'gif'],
  maxHeadingLevel: 3,
  codeLanguages: [
    'javascript', 'python', 'go', 'rust', 'typescript',
    'sql', 'html', 'css', 'json', 'yaml', 'bash'
  ],
  enableCollaborative: false, // Future
  enableAI: true, // If INTELLIGENCE_ENABLED
}
```

## Security Considerations

### XSS Prevention
- TipTap uses sanitized DOM
- Markdown parser filters malicious content
- Validate all user-submitted content

### Database Integrity
- Keep markdown as source of truth
- Validate before saving
- Audit trail for changes (future)

## Success Metrics

- [ ] Editor loads in < 2s
- [ ] Save operation < 500ms
- [ ] 0 data loss from migration
- [ ] Backward compatible with 100% of existing notes
- [ ] User satisfaction > 4/5 stars
- [ ] No critical bugs in first month

## Timeline

- **Week 1**: Setup, dependencies, utilities
- **Week 2**: Core block editor component
- **Week 3**: Integration with NotesEditor
- **Week 4**: Testing, polish, documentation
- **Week 5+**: Advanced features and refinements

## Future Enhancements

1. **Real-time Collaboration**: Use TipTap's awareness protocol
2. **AI Integration**: Smart block suggestions using zen-intelligence
3. **Custom Blocks**: User-defined block types
4. **Version History**: Track block-level changes
5. **Notion API Compatibility**: Export/import Notion databases
6. **Canvas Integration**: Drag blocks to spatial canvas

## Questions & Considerations

1. **Should we replace textarea entirely?** Yes, with fallback option
2. **Keep markdown export?** Yes, always
3. **Support collaborative editing?** Build foundation, enable later
4. **Mobile optimization priority?** High (matches existing UX)
5. **Keyboard-first experience?** Maintain current level

## References

- TipTap Documentation: https://tiptap.dev
- ProseMirror Guide: https://prosemirror.net/docs/guide/
- Markdown Spec: https://spec.commonmark.org
- Notion Editor Inspiration: https://www.notion.so
