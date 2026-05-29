/**
 * Block Editor Component
 * A Notion-like block editor built with TipTap
 * Provides rich editing experience while maintaining markdown compatibility
 */

import { h } from '../../assets/preact.esm.js';
import { useState, useEffect, useRef } from '../../assets/preact.esm.js';
import './BlockEditor.css';

/**
 * NOTE: This is a prototype/template component.
 * Full TipTap integration requires:
 * 1. npm install @tiptap/core @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
 * 2. Import TipTap components once available
 * 3. Configure extensions in blockEditorConfig.js
 */

export default function BlockEditor({
  content = '',
  onChange = () => {},
  onBlur = () => {},
  placeholder = 'Start writing...',
  isEditable = true,
  isLoading = false,
  isDraggingOver = false
}) {
  const contentRef = useRef(null);
  const [internalContent, setInternalContent] = useState(content);

  useEffect(() => {
    setInternalContent(content);
  }, [content]);

  const handleInput = (e) => {
    const newContent = e.target.value;
    setInternalContent(newContent);
    onChange(newContent);
  };

  const handleBlur = (e) => {
    onBlur(e.target.value);
  };

  // Placeholder component for future TipTap integration
  const renderPlaceholder = () => {
    if (internalContent.trim() === '' && isEditable) {
      return (
        <div className="block-editor-placeholder">
          {placeholder}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="block-editor block-editor-loading">
        <div className="block-editor-loading-spinner"></div>
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className={`block-editor-wrapper ${isDraggingOver ? 'dragover' : ''}`}>
      <div className="block-editor-container">
        {isEditable ? (
          <div className="block-editor">
            {renderPlaceholder()}
            <textarea
              ref={contentRef}
              className="block-editor-textarea"
              value={internalContent}
              onInput={handleInput}
              onBlur={handleBlur}
              spellCheck="false"
              disabled={!isEditable}
            />
            <div className="block-editor-hints">
              <span className="hint-key">Cmd/Ctrl</span>
              <span className="hint-text">+ B</span>
              <span className="hint-text">Bold</span>
              <span className="hint-key">Cmd/Ctrl</span>
              <span className="hint-text">+ I</span>
              <span className="hint-text">Italic</span>
              <span className="hint-key">Cmd/Ctrl</span>
              <span className="hint-text">+ Enter</span>
              <span className="hint-text">Save</span>
            </div>
          </div>
        ) : (
          <div className="block-editor-preview">
            <div className="block-editor-content">
              {internalContent || placeholder}
            </div>
          </div>
        )}
      </div>
      <div className="block-editor-status">
        {internalContent.length > 0 && (
          <span className="editor-stats">
            {internalContent.length} characters
          </span>
        )}
      </div>
    </div>
  );
}

export { BlockEditor };