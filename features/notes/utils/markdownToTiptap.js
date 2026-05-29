/**
 * Convert markdown content to TipTap JSON format
 * Maintains backward compatibility with existing markdown notes
 */

import { marked } from '../../commons/utils/marked.js';

export function markdownToTiptap(markdown) {
  if (!markdown || markdown.trim() === '') {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: []
        }
      ]
    };
  }

  const tokens = marked.lexer(markdown);
  const content = [];

  for (const token of tokens) {
    const block = tokenToBlock(token);
    if (block) {
      content.push(block);
    }
  }

  if (content.length === 0) {
    content.push({
      type: 'paragraph',
      content: []
    });
  }

  return {
    type: 'doc',
    content
  };
}

function tokenToBlock(token) {
  switch (token.type) {
    case 'heading':
      return {
        type: 'heading',
        attrs: { level: token.depth },
        content: parseInlineContent(token.text)
      };

    case 'paragraph':
      return {
        type: 'paragraph',
        content: parseInlineContent(token.text)
      };

    case 'list':
      return {
        type: token.ordered ? 'orderedList' : 'bulletList',
        content: token.items.map(item => ({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: parseInlineContent(item.text)
          }]
        }))
      };

    case 'code':
      return {
        type: 'codeBlock',
        attrs: { language: token.lang || 'plaintext' },
        content: [{
          type: 'text',
          text: token.text
        }]
      };

    case 'blockquote':
      return {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: parseInlineContent(token.text)
          }
        ]
      };

    case 'hr':
      return {
        type: 'horizontalRule'
      };

    case 'table':
      return {
        type: 'table',
        content: [
          {
            type: 'tableHeader',
            content: token.header.map(cell => ({
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{
                type: 'paragraph',
                content: parseInlineContent(cell)
              }]
            }))
          },
          ...token.rows.map(row => ({
            type: 'tableRow',
            content: row.map(cell => ({
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{
                type: 'paragraph',
                content: parseInlineContent(cell)
              }]
            }))
          }))
        ]
      };

    default:
      return null;
  }
}

function parseInlineContent(text) {
  // Simple inline parsing for bold, italic, code, links
  const content = [];
  let currentIndex = 0;

  // Pattern matches: **text**, *text*, `code`, [link](url)
  const patterns = [
    { regex: /\*\*(.+?)\*\*/, mark: 'bold' },
    { regex: /\*(.+?)\*/, mark: 'italic' },
    { regex: /~~(.+?)~~/, mark: 'strike' },
    { regex: /`(.+?)`/, mark: 'code' },
    { regex: /\[(.+?)\]\((.+?)\)/, mark: 'link' }
  ];

  let match;
  let lastIndex = 0;

  // Simple greedy match for formatting
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
  const matches = [];

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      full: match[0],
      content: match[1] || match[2] || match[3] || match[4] || match[5],
      type: match[1] ? 'bold' : match[2] ? 'italic' : match[3] ? 'strike' : match[4] ? 'code' : 'link',
      href: match[6] || null
    });
  }

  // Add text before first match
  if (matches.length > 0 && matches[0].start > 0) {
    content.push({
      type: 'text',
      text: text.substring(0, matches[0].start)
    });
  }

  // Add matches with formatting
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const node = {
      type: 'text',
      text: m.content,
      marks: []
    };

    if (m.type === 'bold') {
      node.marks.push({ type: 'bold' });
    } else if (m.type === 'italic') {
      node.marks.push({ type: 'italic' });
    } else if (m.type === 'strike') {
      node.marks.push({ type: 'strike' });
    } else if (m.type === 'code') {
      node.marks.push({ type: 'code' });
    } else if (m.type === 'link') {
      node.marks.push({ type: 'link', attrs: { href: m.href } });
    }

    content.push(node);

    // Add text between matches
    const nextMatch = matches[i + 1];
    if (nextMatch && m.end < nextMatch.start) {
      content.push({
        type: 'text',
        text: text.substring(m.end, nextMatch.start)
      });
    }
  }

  // Add remaining text
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    if (lastMatch.end < text.length) {
      content.push({
        type: 'text',
        text: text.substring(lastMatch.end)
      });
    }
  } else {
    // No matches, just return plain text
    content.push({
      type: 'text',
      text: text
    });
  }

  return content.length > 0 ? content : [{ type: 'text', text: '' }];
}

export default markdownToTiptap;