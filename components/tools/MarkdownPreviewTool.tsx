'use client';

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import {
  Bold,
  Italic,
  Heading,
  Link as LinkIcon,
  Code,
  List,
  Quote,
  Table,
  Copy,
  Check,
  Download,
  FileText,
} from 'lucide-react';

const INITIAL_MD = `# MultiZest Markdown Live Editor

Welcome to **MultiZest Markdown Live Editor**! Write on the left, preview on the right.

## ✨ Key Features
- **Instant Rendering:** Updates with every keystroke
- **GitHub Flavored Markdown:** Tables, task lists, strikethrough, and code fences
- **100% Client-Side:** Private and offline-capable

### Quick Markdown Example
| Feature | Supported | Performance |
| :--- | :--- | :--- |
| Tables | ✅ Yes | Native |
| Task lists | ✅ Yes | Fast |
| Code highlighting | ✅ Yes | In-browser |

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

\`\`\`javascript
// Example Javascript code
function calculateZest(tools) {
  return tools.map(t => t.name).join(', ');
}
\`\`\`
`;

export default function MarkdownPreviewTool() {
  const [markdown, setMarkdown] = useState<string>(INITIAL_MD);
  const [htmlOutput, setHtmlOutput] = useState<string>('');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  useEffect(() => {
    try {
      const parsed = marked.parse(markdown);
      if (typeof parsed === 'string') {
        setHtmlOutput(parsed);
      } else {
        // If marked returned a Promise in some config
        Promise.resolve(parsed).then((res) => setHtmlOutput(res));
      }
    } catch (err) {
      console.error('Markdown parse error:', err);
    }
  }, [markdown]);

  const insertSyntax = (syntax: string, placeholder = 'text') => {
    setMarkdown((prev) => `${prev}\n${syntax.replace('%s', placeholder)}`);
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch (_) {}
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (_) {}
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Formatting Toolbar */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 text-slate-700 dark:text-slate-300">
          <button
            type="button"
            onClick={() => insertSyntax('**%s**', 'Bold text')}
            title="Bold"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('*%s*', 'Italic text')}
            title="Italic"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('### %s', 'Heading 3')}
            title="Heading"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Heading className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('[%s](https://example.com)', 'Link description')}
            title="Link"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('```javascript\n// %s\n```', 'Code snippet')}
            title="Code Block"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('- Item 1\n- Item 2\n- Item 3')}
            title="List"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('> %s', 'Quote block')}
            title="Quote"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('| Column 1 | Column 2 |\n| :--- | :--- |\n| Val 1 | Val 2 |')}
            title="Table"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 inline-flex items-center gap-1 font-semibold"
          >
            {copiedMd ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>MD</span>
          </button>
          <button
            type="button"
            onClick={handleCopyHtml}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 inline-flex items-center gap-1 font-semibold"
          >
            {copiedHtml ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadMd}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1 font-semibold"
          >
            <Download className="w-3 h-3" />
            <span>.md</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor Area */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Markdown Source Editor
          </span>
          <textarea
            rows={18}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed resize-y"
          />
        </div>

        {/* Live Preview Pane */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Rendered HTML Preview
          </span>
          <div
            className="p-5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-h-[380px] max-h-[550px] overflow-auto prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: htmlOutput }}
          />
        </div>
      </div>
    </div>
  );
}
