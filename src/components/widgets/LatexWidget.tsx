import { useMemo, useState } from 'react';
import { Copy, Download } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const EXAMPLE = `\\documentclass{article}
\\usepackage{amsmath}

\\begin{document}

\\title{My Document}
\\author{Student Name}
\\maketitle

\\section{Introduction}
The quadratic formula is:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

\\section{Linear Algebra}
Let $A$ be an $n \\times n$ matrix. Then:
$$\\det(A) = \\sum_{j=1}^{n} a_{1j} C_{1j}$$

\\end{document}`;

export default function LatexWidget() {
  const [code, setCode] = useState(EXAMPLE);
  const [copied, setCopied] = useState(false);

  const compiledPreview = useMemo(() => {
    const lines = code.split('\n');
    const previewParts: string[] = [];
    let inDocument = false;

    const renderMath = (value: string, displayMode: boolean) => {
      try {
        return katex.renderToString(value, { displayMode, throwOnError: false });
      } catch {
        return `<span class="text-red-500">${value}</span>`;
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('%')) continue;
      if (trimmed.startsWith('\\begin{document}')) {
        inDocument = true;
        continue;
      }
      if (trimmed.startsWith('\\end{document}')) break;
      if (!inDocument) continue;
      if (trimmed.startsWith('\\title{')) {
        previewParts.push(`<h2 class="text-base font-semibold text-gray-900 mb-1">${trimmed.slice(7, -1)}</h2>`);
        continue;
      }
      if (trimmed.startsWith('\\author{')) {
        previewParts.push(`<p class="text-[10px] text-gray-500 mb-2">${trimmed.slice(8, -1)}</p>`);
        continue;
      }
      if (trimmed === '\\maketitle') continue;
      if (trimmed.startsWith('\\section{')) {
        previewParts.push(`<h3 class="text-sm font-semibold text-gray-800 mt-3 mb-1">${trimmed.slice(9, -1)}</h3>`);
        continue;
      }
      if (trimmed.startsWith('\\subsection{')) {
        previewParts.push(`<h4 class="text-xs font-semibold text-gray-700 mt-2 mb-1">${trimmed.slice(12, -1)}</h4>`);
        continue;
      }

      const displayMath = trimmed.match(/^\$\$(.+)\$\$$/);
      if (displayMath) {
        previewParts.push(`<div class="my-2">${renderMath(displayMath[1], true)}</div>`);
        continue;
      }

      const inlineMathText = line.replace(/\$([^$]+)\$/g, (_, math) => renderMath(math, false));
      previewParts.push(`<p class="text-[11px] leading-relaxed text-gray-700 mb-1">${inlineMathText}</p>`);
    }

    if (!previewParts.length) {
      return '<p class="text-xs text-gray-400">Nothing to preview yet.</p>';
    }

    return previewParts.join('');
  }, [code]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-2 shrink-0 border-b pb-1.5">
        <span className="text-xs font-mono text-gray-500 font-semibold">LaTeX Editor</span>
        <div className="flex-1" />
        <button onClick={copy} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <Copy size={12} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={download} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <Download size={12} />
          .tex
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1 min-h-0">
        {/* Editor */}
        <textarea
          className="h-full resize-none text-[11px] font-mono text-gray-800 bg-gray-50 rounded border border-gray-100 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 leading-relaxed"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />

        {/* Compiled preview */}
        <div className="h-full rounded border border-gray-100 bg-white overflow-auto p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Compiled Preview</p>
            <span className="text-[10px] text-gray-400">Rendered in-browser</span>
          </div>
          <div
            className="latex-preview prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: compiledPreview }}
          />
        </div>
      </div>

      <p className="shrink-0 text-[10px] text-gray-400 mt-1">
        LaTeX source editor and preview. Use <code>.tex</code> export for full document compilation.
      </p>
    </div>
  );
}
