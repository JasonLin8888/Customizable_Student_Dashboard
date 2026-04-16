import { useState } from 'react';
import { Copy, Download } from 'lucide-react';

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

      {/* Editor */}
      <textarea
        className="flex-1 resize-none text-[11px] font-mono text-gray-800 bg-gray-50 rounded border border-gray-100 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 leading-relaxed"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />

      <p className="shrink-0 text-[10px] text-gray-400 mt-1">
        LaTeX source editor — download <code>.tex</code> to compile with Overleaf or a local engine.
      </p>
    </div>
  );
}
