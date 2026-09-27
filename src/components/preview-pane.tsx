import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export interface PreviewPaneProps {
  content: string;
  format?: 'markdown' | 'html' | 'custom';
  className?: string;
}

export function PreviewPane({ content, format = 'markdown', className = '' }: PreviewPaneProps) {
  if (format === 'html') {
    return (
      <div className={`prose prose-slate dark:prose-invert max-w-none p-6 ${className}`}>
        <div 
          className="w-full h-full prose-headings:font-semibold prose-a:text-indigo-400"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
    );
  }

  // Markdown (Default) with strict math delimiter parsing: singleDollar disabled
  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none p-6 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollar: false }]]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default PreviewPane;
