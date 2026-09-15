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
        className="w-full h-full p-6 sm:p-10 prose dark:prose-invert prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  // Markdown (Default)
  return (
    <div className="w-full h-full p-6 sm:p-10 prose dark:prose-invert prose-slate max-w-none prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-800 prose-headings:font-bold prose-a:text-brand-600 dark:prose-a:text-brand-400">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
