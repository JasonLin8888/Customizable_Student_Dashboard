import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface MindNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export default function MindMapWidget() {
  const [nodes, setNodes] = useState<MindNode[]>([
    { id: 'root', label: 'My Mind Map', x: 160, y: 120, color: '#6366f1' },
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addNode = () => {
    const color = COLORS[nodes.length % COLORS.length];
    const newNode: MindNode = {
      id: uid(),
      label: 'New Node',
      x: 80 + Math.random() * 200,
      y: 60 + Math.random() * 160,
      color,
    };
    setNodes((n) => [...n, newNode]);
    if (selected) {
      setConnections((c) => [...c, { from: selected, to: newNode.id }]);
    }
  };

  const removeSelected = () => {
    if (!selected || selected === 'root') return;
    setNodes((n) => n.filter((nd) => nd.id !== selected));
    setConnections((c) => c.filter((conn) => conn.from !== selected && conn.to !== selected));
    setSelected(null);
  };

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (connecting) {
      if (connecting !== id) {
        setConnections((c) => {
          const exists = c.some((conn) => conn.from === connecting && conn.to === id);
          return exists ? c : [...c, { from: connecting, to: id }];
        });
      }
      setConnecting(null);
      return;
    }
    setSelected(id);
    const rect = containerRef.current!.getBoundingClientRect();
    const node = nodes.find((n) => n.id === id)!;
    dragging.current = { id, ox: e.clientX - rect.left - node.x, oy: e.clientY - rect.top - node.y };
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - dragging.current.ox;
    const y = e.clientY - rect.top - dragging.current.oy;
    const { id } = dragging.current;
    setNodes((n) => n.map((nd) => (nd.id === id ? { ...nd, x, y } : nd)));
  }, []);

  const onMouseUp = () => { dragging.current = null; };

  const getNodeCenter = (id: string) => {
    const nd = nodes.find((n) => n.id === id);
    return nd ? { x: nd.x + 48, y: nd.y + 16 } : { x: 0, y: 0 };
  };

  const updateLabel = (id: string, label: string) =>
    setNodes((n) => n.map((nd) => (nd.id === id ? { ...nd, label } : nd)));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-2 shrink-0 border-b pb-1.5">
        <button
          onClick={addNode}
          className="flex items-center gap-1 text-xs bg-indigo-500 text-white rounded px-2 py-0.5 hover:bg-indigo-600"
        >
          <Plus size={12} /> Node
        </button>
        <button
          onClick={() => setConnecting(selected)}
          disabled={!selected}
          className={`flex items-center gap-1 text-xs rounded px-2 py-0.5 border ${
            connecting ? 'bg-green-100 border-green-400 text-green-700' : 'text-gray-500 border-gray-200 hover:bg-gray-100'
          } disabled:opacity-40`}
          title="Click here then click another node to connect"
        >
          <ArrowRight size={12} /> {connecting ? 'Click a node…' : 'Connect'}
        </button>
        <button
          onClick={removeSelected}
          disabled={!selected || selected === 'root'}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded bg-gray-50 border border-gray-100 cursor-default select-none"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={() => { setSelected(null); setConnecting(null); }}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((conn, i) => {
            const from = getNodeCenter(conn.from);
            const to = getNodeCenter(conn.to);
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="#d1d5db"
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#d1d5db" />
            </marker>
          </defs>
        </svg>

        {/* Nodes */}
        {nodes.map((nd) => (
          <div
            key={nd.id}
            style={{ left: nd.x, top: nd.y, borderColor: nd.color, zIndex: selected === nd.id ? 10 : 1 }}
            className={`absolute rounded-lg border-2 bg-white shadow-sm cursor-grab active:cursor-grabbing px-2 py-1 min-w-[80px] text-center ${
              selected === nd.id ? 'ring-2 ring-offset-1' : ''
            }`}
            onMouseDown={(e) => onMouseDown(e, nd.id)}
          >
            <input
              className="text-[11px] font-medium bg-transparent text-center w-full focus:outline-none"
              style={{ color: nd.color }}
              value={nd.label}
              onChange={(e) => updateLabel(nd.id, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
        ))}
      </div>

      <p className="shrink-0 text-[10px] text-gray-400 mt-1">
        Drag nodes · Select + Connect to link · Double-click labels to rename
      </p>
    </div>
  );
}
