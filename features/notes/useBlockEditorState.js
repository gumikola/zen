/**
 * Custom hook for managing block editor state
 * Handles editor initialization, updates, and markdown conversion
 */

import { useState, useRef, useCallback, useEffect } from '../../assets/preact.esm.js';
import markdownToTiptap from './utils/markdownToTiptap.js';
import tiptapToMarkdown from './utils/tiptapToMarkdown.js';

export default function useBlockEditorState(initialMarkdown) {
  const [editorState, setEditorState] = useState(null);
  const [markdown, setMarkdown] = useState(initialMarkdown || '');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef(null);

  // Initialize editor state from markdown
  useEffect(() => {
    if (initialMarkdown !== undefined) {
      const tiptapJson = markdownToTiptap(initialMarkdown);
      setEditorState(tiptapJson);
      setMarkdown(initialMarkdown);
      setIsDirty(false);
    }
  }, [initialMarkdown]);

  // Handle editor content changes
  const handleEditorUpdate = useCallback((newState) => {
    setEditorState(newState);
    const newMarkdown = tiptapToMarkdown(newState);
    setMarkdown(newMarkdown);
    setIsDirty(true);
  }, []);

  // Convert editor state to markdown for saving
  const getMarkdownContent = useCallback(() => {
    if (!editorState) return '';
    return tiptapToMarkdown(editorState);
  }, [editorState]);

  // Load markdown into editor
  const loadMarkdown = useCallback((markdownContent) => {
    const tiptapJson = markdownToTiptap(markdownContent);
    setEditorState(tiptapJson);
    setMarkdown(markdownContent);
    setIsDirty(false);
  }, []);

  // Reset editor to initial state
  const resetEditor = useCallback(() => {
    const tiptapJson = markdownToTiptap(initialMarkdown);
    setEditorState(tiptapJson);
    setMarkdown(initialMarkdown);
    setIsDirty(false);
  }, [initialMarkdown]);

  // Mark as saved
  const markAsSaved = useCallback(() => {
    setIsDirty(false);
  }, []);

  // Insert content at current cursor position
  const insertContent = useCallback((content) => {
    if (editorRef.current && editorRef.current.editor) {
      editorRef.current.editor.commands.insertContent(content);
    }
  }, []);

  // Apply formatting to selected text
  const applyFormatting = useCallback((format, attrs = {}) => {
    if (editorRef.current && editorRef.current.editor) {
      const editor = editorRef.current.editor;

      switch (format) {
        case 'bold':
          editor.commands.toggleBold();
          break;
        case 'italic':
          editor.commands.toggleItalic();
          break;
        case 'code':
          editor.commands.toggleCode();
          break;
        case 'strikethrough':
          editor.commands.toggleStrike();
          break;
        case 'h1':
          editor.commands.toggleHeading({ level: 1 });
          break;
        case 'h2':
          editor.commands.toggleHeading({ level: 2 });
          break;
        case 'h3':
          editor.commands.toggleHeading({ level: 3 });
          break;
        case 'bulletList':
          editor.commands.toggleBulletList();
          break;
        case 'orderedList':
          editor.commands.toggleOrderedList();
          break;
        case 'blockquote':
          editor.commands.toggleBlockquote();
          break;
        case 'codeBlock':
          editor.commands.toggleCodeBlock({ language: attrs.language || 'plaintext' });
          break;
        case 'link':
          editor.commands.setLink({ href: attrs.href });
          break;
        default:
          break;
      }
    }
  }, []);

  // Check if specific format is active
  const isFormatActive = useCallback((format) => {
    if (!editorRef.current || !editorRef.current.editor) return false;
    const editor = editorRef.current.editor;

    switch (format) {
      case 'bold':
        return editor.isActive('bold');
      case 'italic':
        return editor.isActive('italic');
      case 'code':
        return editor.isActive('code');
      case 'strikethrough':
        return editor.isActive('strike');
      case 'h1':
        return editor.isActive('heading', { level: 1 });
      case 'h2':
        return editor.isActive('heading', { level: 2 });
      case 'h3':
        return editor.isActive('heading', { level: 3 });
      case 'bulletList':
        return editor.isActive('bulletList');
      case 'orderedList':
        return editor.isActive('orderedList');
      case 'blockquote':
        return editor.isActive('blockquote');
      case 'codeBlock':
        return editor.isActive('codeBlock');
      default:
        return false;
    }
  }, []);

  return {
    editorState,
    markdown,
    isDirty,
    isSaving,
    editorRef,
    handleEditorUpdate,
    getMarkdownContent,
    loadMarkdown,
    resetEditor,
    markAsSaved,
    insertContent,
    applyFormatting,
    isFormatActive,
    setIsSaving
  };
}

export { useBlockEditorState };