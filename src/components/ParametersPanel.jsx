import { useState } from 'react';
import {
  Thermometer, Hash, Sliders, MessageSquareText,
  RotateCcw, ChevronDown, ChevronUp, Zap, Info,
  ToggleLeft, ToggleRight
} from 'lucide-react';

const DEFAULT_PARAMS = {
  temperature: 1.0,
  maxTokens: 1024,
  topP: 1.0,
  stream: true,
  systemPrompt: '',
};

function SliderParam({ label, value, min, max, step, onChange, description, icon: Icon }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={13} className="text-brand-400" />}
          <span className="text-xs font-medium text-gray-300">{label}</span>
          <div className="group relative">
            <Info size={11} className="text-gray-600 cursor-help" />
            <div className="hidden group-hover:block absolute left-5 bottom-0 z-50 w-48 bg-dark-800 border border-dark-700 rounded-lg p-2 text-xs text-gray-400 shadow-xl">
              {description}
            </div>
          </div>
        </div>
        <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
          {Number(value).toFixed(step < 1 ? 2 : 0)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #22c55e ${pct}%, #343a40 ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-700">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function ParametersPanel({ params, onChange, onReset }) {
  const [systemExpanded, setSystemExpanded] = useState(false);

  function set(key, val) {
    onChange({ ...params, [key]: val });
  }

  return (
    <aside className="w-72 shrink-0 bg-dark-950 border-l border-dark-800 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-dark-800">
        <div className="flex items-center gap-2">
          <Sliders size={15} className="text-brand-400" />
          <span className="text-sm font-semibold text-gray-200">Parameters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 px-2 py-1 rounded hover:bg-dark-800 transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>

      <div className="flex-1 p-4 space-y-5">
        {/* Stream toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-dark-800">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-brand-400" />
            <div>
              <p className="text-xs font-medium text-gray-200">Streaming</p>
              <p className="text-xs text-gray-600 mt-0.5">Real-time token output</p>
            </div>
          </div>
          <button
            onClick={() => set('stream', !params.stream)}
            className="transition-colors"
            title={params.stream ? 'Disable streaming' : 'Enable streaming'}
          >
            {params.stream
              ? <ToggleRight size={22} className="text-brand-400" />
              : <ToggleLeft size={22} className="text-gray-600" />
            }
          </button>
        </div>

        {/* Temperature */}
        <SliderParam
          label="Temperature"
          value={params.temperature}
          min={0}
          max={2}
          step={0.01}
          onChange={(v) => set('temperature', v)}
          description="Controls randomness. Lower = more deterministic, Higher = more creative."
          icon={Thermometer}
        />

        {/* Top-P */}
        <SliderParam
          label="Top-P"
          value={params.topP}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => set('topP', v)}
          description="Nucleus sampling. Only tokens comprising the top P probability mass are considered."
          icon={Sliders}
        />

        {/* Max Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Hash size={13} className="text-brand-400" />
              <span className="text-xs font-medium text-gray-300">Max Tokens</span>
              <div className="group relative">
                <Info size={11} className="text-gray-600 cursor-help" />
                <div className="hidden group-hover:block absolute left-5 bottom-0 z-50 w-48 bg-dark-800 border border-dark-700 rounded-lg p-2 text-xs text-gray-400 shadow-xl">
                  Maximum number of tokens to generate in the response.
                </div>
              </div>
            </div>
          </div>
          <input
            type="number"
            min={1}
            max={32768}
            value={params.maxTokens}
            onChange={(e) => set('maxTokens', Math.max(1, Math.min(32768, Number(e.target.value))))}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-gray-100 font-mono focus:outline-none focus:border-brand-500/60 transition-colors"
          />
          <div className="flex gap-2">
            {[256, 1024, 4096, 8192].map((v) => (
              <button
                key={v}
                onClick={() => set('maxTokens', v)}
                className={`flex-1 py-1 rounded text-xs font-medium transition-colors
                  ${params.maxTokens === v
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    : 'bg-dark-800 text-gray-500 hover:text-gray-300 border border-dark-700'
                  }`}
              >
                {v >= 1000 ? `${v / 1024}k` : v}
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <button
            onClick={() => setSystemExpanded((v) => !v)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-1.5">
              <MessageSquareText size={13} className="text-brand-400" />
              <span className="text-xs font-medium text-gray-300">System Prompt</span>
              {params.systemPrompt && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
              )}
            </div>
            {systemExpanded
              ? <ChevronUp size={13} className="text-gray-500" />
              : <ChevronDown size={13} className="text-gray-500" />
            }
          </button>
          {systemExpanded && (
            <div className="space-y-2">
              <textarea
                value={params.systemPrompt}
                onChange={(e) => set('systemPrompt', e.target.value)}
                placeholder="You are a helpful assistant..."
                rows={5}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2.5 text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-500/60 resize-none transition-colors leading-relaxed"
              />
              {params.systemPrompt && (
                <button
                  onClick={() => set('systemPrompt', '')}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                >
                  Clear prompt
                </button>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dark-800" />

        {/* Summary card */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-3 space-y-1.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Active Config</p>
          {[
            { label: 'Temperature', val: params.temperature.toFixed(2) },
            { label: 'Top-P', val: params.topP.toFixed(2) },
            { label: 'Max Tokens', val: params.maxTokens.toLocaleString() },
            { label: 'Stream', val: params.stream ? 'On' : 'Off' },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{label}</span>
              <span className="text-xs font-mono text-gray-400">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: 2px solid #0d0f10;
          box-shadow: 0 0 0 1px #22c55e40;
        }
        input[type='range']::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: 2px solid #0d0f10;
        }
      `}</style>
    </aside>
  );
}

export { DEFAULT_PARAMS };
