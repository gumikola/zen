/**
 * Convert TipTap JSON format back to markdown
 * Ensures complete roundtrip compatibility
 */

export function tiptapToMarkdown(doc) {
  if (!doc || !doc.content || doc.content.length === 0) {
    return '';
  }

  return doc.content.map(node => nodeToMarkdown(node)).join('\n');
}

function nodeToMarkdown(node) {
  if (!node) return '';

  switch (node.type) {
    case 'paragraph':
      return inlineContentToMarkdown(node.content);

    case 'heading':
      const hashes = '#'.repeat(node.attrs?.level || 1);
      return `${hashes} ${inlineContentToMarkdown(node.content)}`;

    case 'bulletList':
      return node.content
        .map(item => listItemToMarkdown(item, false))
        .join('\n');

    case 'orderedList':
      return node.content
        .map((item, index) => listItemToMarkdown(item, true, index + 1))
        .join('\n');

    case 'codeBlock':
      const lang = node.attrs?.language || '';
      return `\`\`\`${lang}\n${node.content?.map(c => c.text || '').join('')}\n\`\`\``;

    case 'blockquote':
      const quoteContent = node.content
        ?.map(n => nodeToMarkdown(n))
        .join('\n')
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n');
      return quoteContent || '>';

    case 'horizontalRule':
      return '---';

    case 'table':
      return tableToMarkdown(node);

    case 'image':
      const alt = node.attrs?.alt || '';
      const src = node.attrs?.src || '';
      const title = node.attrs?.title || '';
      return `![${alt}](${src}${title ? ` "${title}"` : ''})`;

    case 'doc':
      return node.content.map(n => nodeToMarkdown(n)).join('\n');

    default:
      return '';
  }
}

function listItemToMarkdown(item, isOrdered = false, index = 1) {
  const prefix = isOrdered ? `${index}. ` : '- ';
  const content = item.content
    ?.map(node => {
      if (node.type === 'paragraph') {
        return inlineContentToMarkdown(node.content);
      }
      return nodeToMarkdown(node);
    })
    .join('\n');

  return prefix + content;
}

function tableToMarkdown(table) {
  const rows = [];
  let headerIndex = -1;

  for (let i = 0; i < table.content.length; i++) {
    const row = table.content[i];
    const cells = row.content
      ?.map(cell => {
        const content = cell.content
          ?.map(node => inlineContentToMarkdown(node.content || []))
          .join('');
        return content || '';
      })
      .join(' | ');

    rows.push(`| ${cells} |`);

    if (row.type === 'tableHeader') {
      headerIndex = i;
      const separators = row.content
        .map(() => '---')
        .join(' | ');
      rows.push(`| ${separators} |`);
    }
  }

  return rows.join('\n');
}

function inlineContentToMarkdown(content) {
  if (!content || !Array.isArray(content)) {
    return '';
  }

  return content
    .map(node => {
      if (!node) return '';

      const text = node.text || '';
      const marks = node.marks || [];

      let result = text;

      // Apply marks in order
      for (const mark of marks) {
        switch (mark.type) {
          case 'bold':
            result = `**${result}**`;
            break;
          case 'italic':
            result = `*${result}*`;
            break;
          case 'strike':
            result = `~~${result}~~`;
            break;
          case 'code':
            result = `\`${result}\``;
            break;
          case 'link':
            result = `[${result}](${mark.attrs?.href || '#'})`;
            break;
          default:
            break;
        }
      }

      return result;
    })
    .join('');
}

export default tiptapToMarkdown;