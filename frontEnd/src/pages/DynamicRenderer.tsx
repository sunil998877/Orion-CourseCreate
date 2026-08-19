import React from 'react';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export const DynamicRenderer: React.FC<ContentRendererProps> = ({ content, className = '' }) => {
  const detectContentType = (text: string): 'markdown' | 'json' | 'code' | 'plain' => {
    const trimmed = (text || '').trim();
    // Check for JSON
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);

        return 'json';
      } catch {
        // Not valid JSON, continue checking
      }
    }

    // Check for code patterns
    if (trimmed.includes('```') ||
      /^(function|const|let|var|class|import|export|def|public|private|protected)/m.test(trimmed) ||
      /^\s*(#include|#define|using namespace)/m.test(trimmed) ||
      /^\s*(<\?php|<?=)/m.test(trimmed)) {
      return 'code';
    }


    if (/^#{1,6}\s/.test(trimmed) ||
      /\*\*.*\*\*/.test(trimmed) ||
      /^\d+\.\s/m.test(trimmed) ||
      /^[-*+]\s/m.test(trimmed) ||
      /`.*`/.test(trimmed) ||
      /\[.*\]\(.*\)/.test(trimmed)) {
      return 'markdown';
    }

    return 'plain';
  };

  const renderJSON = (jsonString: string): JSX.Element => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);

      return (
        <div className="mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 font-mono border-b border-gray-200 rounded-t-lg">
              JSON
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm font-mono text-gray-800">
                {formatted}
              </code>
            </pre>
          </div>
        </div>
      );
    } catch {
      return renderPlainText(jsonString);
    }
  };

  const renderCode = (codeString: string): JSX.Element => {
    // Detect language based on content
    const detectLanguage = (code: string): string => {
      if (code.includes('function') || code.includes('const ') || code.includes('=>')) return 'javascript';
      if (code.includes('def ') || code.includes('import ') || code.includes('print(')) return 'python';
      if (code.includes('#include') || code.includes('int main')) return 'cpp';
      if (code.includes('public class') || code.includes('System.out')) return 'java';
      if (code.includes('<?php') || code.includes('echo ')) return 'php';
      if (code.includes('<html') || code.includes('<div')) return 'html';
      if (code.includes('SELECT') || code.includes('FROM')) return 'sql';
      return 'text';
    };

    const language = detectLanguage(codeString);

    return (
      <div className="mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
          <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 font-mono border-b border-gray-200 rounded-t-lg">
            {language}
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm font-mono text-gray-800 whitespace-pre">
              {codeString}
            </code>
          </pre>
        </div>
      </div>
    );
  };

  const renderPlainText = (text: string): JSX.Element => {
    return (
      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    );
  };

  const parseMarkdown = (text: string): JSX.Element[] => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: { type: 'ordered' | 'unordered'; items: string[] } | null = null;
    let codeBlock: { language: string; code: string[] } | null = null;
    let key = 0;

    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'ordered') {
          elements.push(
            <ol key={key++} className="list-decimal list-inside mb-4 space-y-1 ml-4">
              {currentList.items.map((item, idx) => (
                <li key={idx} className="text-gray-800 leading-relaxed">
                  {parseInlineMarkdown(item)}
                </li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={key++} className="list-disc list-inside mb-4 space-y-1 ml-4">
              {currentList.items.map((item, idx) => (
                <li key={idx} className="text-gray-800 leading-relaxed">
                  {parseInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
        }
        currentList = null;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlock) {
        elements.push(
          <div key={key++} className="mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
              {codeBlock.language && (
                <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 font-mono border-b border-gray-200 rounded-t-lg">
                  {codeBlock.language}
                </div>
              )}
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono text-gray-800">
                  {codeBlock.code.join('\n')}
                </code>
              </pre>
            </div>
          </div>
        );
        codeBlock = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (codeBlock) {
          flushCodeBlock();
        } else {
          flushList();
          const language = trimmedLine.slice(3).trim();
          codeBlock = { language, code: [] };
        }
        continue;
      }

      if (codeBlock) {
        codeBlock.code.push(line);
        continue;
      }

      // Handle empty lines
      if (!trimmedLine) {
        flushList();
        elements.push(<div key={key++} className="mb-2"></div>);
        continue;
      }

      // Handle headings
      if (trimmedLine.startsWith('#')) {
        flushList();
        const level = trimmedLine.match(/^#+/)?.[0].length || 1;
        const text = trimmedLine.replace(/^#+\s*/, '');

        const headingClasses = {
          1: 'text-3xl font-bold text-gray-900 mb-6 mt-8',
          2: 'text-2xl font-bold text-gray-900 mb-4 mt-6',
          3: 'text-xl font-semibold text-gray-900 mb-3 mt-5',
          4: 'text-lg font-semibold text-gray-900 mb-2 mt-4',
          5: 'text-base font-semibold text-gray-900 mb-2 mt-3',
          6: 'text-sm font-semibold text-gray-900 mb-2 mt-3'
        };

        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        elements.push(
          <HeadingTag key={key++} className={headingClasses[Math.min(level, 6) as keyof typeof headingClasses]}>
            {parseInlineMarkdown(text)}
          </HeadingTag>
        );
        continue;
      }

      // Handle blockquotes
      if (trimmedLine.startsWith('>')) {
        flushList();
        const quoteText = trimmedLine.replace(/^>\s*/, '');
        elements.push(
          <blockquote key={key++} className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700">
            {parseInlineMarkdown(quoteText)}
          </blockquote>
        );
        continue;
      }

      // Handle ordered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        const itemText = trimmedLine.replace(/^\d+\.\s/, '');
        if (!currentList || currentList.type !== 'ordered') {
          flushList();
          currentList = { type: 'ordered', items: [] };
        }
        currentList.items.push(itemText);
        continue;
      }

      // Handle unordered lists
      if (/^[-*+]\s/.test(trimmedLine)) {
        const itemText = trimmedLine.replace(/^[-*+]\s/, '');
        if (!currentList || currentList.type !== 'unordered') {
          flushList();
          currentList = { type: 'unordered', items: [] };
        }
        currentList.items.push(itemText);
        continue;
      }

      // Handle regular paragraphs
      flushList();
      elements.push(
        <p key={key++} className="text-gray-800 leading-relaxed mb-4">
          {parseInlineMarkdown(trimmedLine)}
        </p>
      );
    }

    flushList();
    flushCodeBlock();
    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Handle bold text
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Handle italic text
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Handle strikethrough
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Handle links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Parse the HTML-like string into React elements
    const parts = text.split(/(<[^>]+>[^<]*<\/[^>]+>|<[^>]+\/>)/g);

    return parts.map((part, index) => {
      if (part.startsWith('<code>') && part.endsWith('</code>')) {
        const content = part.replace(/<\/?code>/g, '');
        return (
          <code key={index} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600">
            {content}
          </code>
        );
      }

      if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
        const content = part.replace(/<\/?strong>/g, '');
        return <strong key={index} className="font-semibold text-gray-900">{content}</strong>;
      }

      if (part.startsWith('<em>') && part.endsWith('</em>')) {
        const content = part.replace(/<\/?em>/g, '');
        return <em key={index} className="italic">{content}</em>;
      }

      if (part.startsWith('<del>') && part.endsWith('</del>')) {
        const content = part.replace(/<\/?del>/g, '');
        return <del key={index} className="line-through text-gray-500">{content}</del>;
      }

      if (part.startsWith('<a ')) {
        const href = part.match(/href="([^"]+)"/)?.[1] || '';
        const content = part.replace(/<a[^>]*>([^<]*)<\/a>/, '$1');
        return (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline">
            {content}
          </a>
        );
      }

      return part;
    });
  };

  const contentType = detectContentType(content);

  return (
    <div className={`max-w-none ${className}`}>
      {contentType === 'json' && renderJSON(content)}
      {contentType === 'code' && renderCode(content)}
      {contentType === 'markdown' && (
        <div className="space-y-1">
          {parseMarkdown(content)}
        </div>
      )}
      {contentType === 'plain' && renderPlainText(content)}
    </div>
  );
};