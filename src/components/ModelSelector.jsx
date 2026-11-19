import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap, Check } from 'lucide-react';
import { AVAILABLE_MODELS } from '../services/aiService';

export default function ModelSelector({ selectedModel, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const model = AVAILABLE_MODELS.find((m) => m.id === selectedModel) ?? AVAILABLE_MODELS[0];

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 text-sm text-gray-300 hover:text-gray-100 transition-colors"
      >
        <Zap size={13} className="text-brand-400" />
        <span className="font-medium">{model.name}</span>
        {model.badge && (
          <span className="text-xs bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded font-medium">{model.badge}</span>
        )}
        <ChevronDown size={13} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-64 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-2 space-y-0.5">
            {AVAILABLE_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => { onSelect(m.id); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors
                  ${m.id === selectedModel
                    ? 'bg-brand-500/15 text-brand-300'
                    : 'text-gray-300 hover:bg-dark-800 hover:text-gray-100'
                  }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 font-medium">
                    {m.name}
                    {m.badge && (
                      <span className="text-xs bg-dark-700 text-gray-400 px-1.5 py-0.5 rounded">{m.badge}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
                </div>
                {m.id === selectedModel && <Check size={14} className="text-brand-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
