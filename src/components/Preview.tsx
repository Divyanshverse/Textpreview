import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface PreviewProps {
  content: string;
  format: 'markdown' | 'html' | 'custom';
}

export function Preview({ content, format }: PreviewProps) {
  if (format === 'html') {
    return (
      <div 
        className="w-full h-full prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-indigo-400"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  // Markdown (Default)
  return (
    <div className="w-full h-full prose prose-invert max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-200 prose-pre:rounded-lg prose-pre:border prose-pre:border-slate-800 prose-blockquote:border-l-2 prose-blockquote:border-indigo-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-headings:font-semibold prose-a:text-indigo-400 prose-code:font-mono">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
