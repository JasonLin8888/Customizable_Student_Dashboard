import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileEntry {
  name: string;
  url: string;
  type: string;
}

export default function FileViewerWidget() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selected, setSelected] = useState<FileEntry | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const newEntries: FileEntry[] = Array.from(list).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...newEntries]);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    if (selected?.name === name) setSelected(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Upload area */}
      <div
        className="shrink-0 border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors mb-2"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload size={20} className="mx-auto text-gray-400 mb-1" />
        <p className="text-xs text-gray-500">Drop files or click to upload</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File list + preview pane */}
      <div className="flex flex-1 gap-2 overflow-hidden">
        {/* File list */}
        <div className="w-36 shrink-0 overflow-y-auto space-y-1">
          {files.length === 0 && (
            <p className="text-[10px] text-gray-400 text-center mt-2">No files yet</p>
          )}
          {files.map((f) => (
            <div
              key={f.name}
              onClick={() => setSelected(f)}
              className={`flex items-center gap-1 rounded p-1 cursor-pointer hover:bg-gray-50 text-[10px] group ${
                selected?.name === f.name ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
              }`}
            >
              <FileText size={12} className="shrink-0" />
              <span className="truncate flex-1">{f.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(f.name); }}
                className="opacity-0 group-hover:opacity-100 text-red-400"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden rounded border border-gray-100 bg-gray-50 flex items-center justify-center">
          {selected ? (
            selected.type === 'application/pdf' ? (
              <iframe src={selected.url} className="w-full h-full" title={selected.name} />
            ) : selected.type.startsWith('image/') ? (
              <img src={selected.url} alt={selected.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <p className="text-xs text-gray-400 p-4 text-center">
                Preview not available for this file type.<br />
                <a href={selected.url} download={selected.name} className="text-indigo-500 underline mt-1 block">
                  Download file
                </a>
              </p>
            )
          ) : (
            <p className="text-xs text-gray-400">Select a file to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
