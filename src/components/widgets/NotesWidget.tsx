import { useState } from 'react';
import { Bold, Italic, List, Heading2, Type } from 'lucide-react';

export default function NotesWidget() {
  const [content, setContent] = useState(
    '# My Notes\n\nStart writing here...\n\n- Item 1\n- Item 2\n',
  );
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const insertText = (before: string, after = '') => {
    const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = before + selected + after;
    setContent(content.slice(0, start) + replacement + content.slice(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Very lightweight markdown → HTML (headings, bold, italic, lists)
  const renderMarkdown = (md: string) =>
    md
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br/>');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-2 shrink-0 border-b pb-1">
        <ToolBtn title="Heading" onClick={() => insertText('## ')}>
          <Heading2 size={13} />
        </ToolBtn>
        <ToolBtn title="Body text" onClick={() => insertText('')}>
          <Type size={13} />
        </ToolBtn>
        <ToolBtn title="Bold" onClick={() => insertText('**', '**')}>
          <Bold size={13} />
        </ToolBtn>
        <ToolBtn title="Italic" onClick={() => insertText('*', '*')}>
          <Italic size={13} />
        </ToolBtn>
        <ToolBtn title="List item" onClick={() => insertText('- ')}>
          <List size={13} />
        </ToolBtn>
        <div className="flex-1" />
        <button
          onClick={() => setMode(m => m === 'edit' ? 'preview' : 'edit')}
          className="text-[10px] border rounded px-2 py-0.5 text-gray-500 hover:bg-gray-100"
        >
          {mode === 'edit' ? 'Preview' : 'Edit'}
        </button>
      </div>

      {/* Editor / Preview */}
      {mode === 'edit' ? (
        <textarea
          id="notes-textarea"
          className="flex-1 resize-none border-0 outline-none text-sm text-gray-700 leading-relaxed font-mono"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing…"
        />
      ) : (
        <div
          className="flex-1 overflow-y-auto text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      )}
    </div>
  );
}

function ToolBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
    >
      {children}
    </button>
  );
}
