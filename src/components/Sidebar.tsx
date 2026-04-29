import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Edit2,
  Copy,
  Trash2,
} from 'lucide-react';
import type { DashboardPage } from '../types';
import { useDashboardStore } from '../store/dashboardStore';

interface PageRowProps {
  page: DashboardPage;
  active: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
}

function PageRow({ page, active, onSelect, onDuplicate, onRemove, onRename }: PageRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(page.name);

  const commit = () => { onRename(draft); setEditing(false); };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors border ${
        active
          ? 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-sm'
          : 'text-gray-600 border-transparent hover:bg-gray-100 hover:border-gray-200'
      }`}
    >
      {editing ? (
        <input
          autoFocus
          className="flex-1 min-w-0 text-sm bg-transparent outline-none border-b border-indigo-400"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 min-w-0 text-sm font-medium truncate"
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
        >
          {page.name}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        className="opacity-90 text-gray-400 hover:text-indigo-600 transition-colors p-1"
        title="Rename page"
      >
        <Edit2 size={13} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
        className="opacity-90 text-gray-400 hover:text-indigo-600 transition-colors p-1"
        title="Duplicate page"
      >
        <Copy size={13} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-90 text-gray-400 hover:text-red-500 transition-colors p-1"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

interface Props {
  onDuplicatePage: (page: DashboardPage) => void;
}

export default function Sidebar({ onDuplicatePage }: Props) {
  const { pages, activePageId, addPage, removePage, setActivePage, renamePage } = useDashboardStore();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">StudySpace</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="pt-2">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pages</p>
          <div className="space-y-1">
            {pages.map((page) => (
              <PageRow
                key={page.id}
                page={page}
                active={page.id === activePageId}
                onSelect={() => setActivePage(page.id)}
                onDuplicate={() => onDuplicatePage(page)}
                onRemove={() => removePage(page.id)}
                onRename={(name) => renamePage(page.id, name)}
              />
            ))}
          </div>
          <button
            onClick={() => addPage(`Page ${pages.length + 1}`)}
            className="w-full mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium py-2 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            + Add Page
          </button>
        </div>
      </nav>
    </aside>
  );
}
