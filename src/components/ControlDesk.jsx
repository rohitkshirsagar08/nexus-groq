import { useState } from 'react';
import {
  Sliders, Key, ExternalLink, Eye, EyeOff, Check, X,
  ChevronDown, ChevronRight, Zap, Info, ShieldCheck,
  RotateCcw, Sparkles
} from 'lucide-react';
import { AVAILABLE_MODELS } from '../services/aiService';

export const DEFAULT_PARAMS = {
  temperature: 0.7,
  topP: 1.0,
  maxTokens: 1024,
  stream: true,
  systemPrompt: '',
  stopSequences: [],
  preset: 'Balanced',
};

export default function ControlDesk({
  selectedModel,
  onModelSelect,
  apiKey,
  onApiKeyChange,
  params,
  onParamsChange,
  onResetParams,
  onClose,
}) {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customModelOpen, setCustomModelOpen] = useState(false);
  const [customModelInput, setCustomModelInput] = useState('');
  const [systemPromptOpen, setSystemPromptOpen] = useState(false);
  const [stopSeqInput, setStopSeqInput] = useState('');

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel,
    description: 'Custom Groq model configured by user.',
    tags: ['Custom Model', 'Direct LPU', 'Groq API'],
  };

  const isConnected = !!(apiKey && apiKey.trim().length > 5);

  function handleConnectKey(e) {
    e?.preventDefault();
    onApiKeyChange(tempKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  }

  function handleClearKey() {
    setTempKey('');
    onApiKeyChange('');
  }

  function applyPreset(preset) {
    if (preset === 'Precise') {
      onParamsChange({ ...params, temperature: 0.2, topP: 0.9, preset: 'Precise' });
    } else if (preset === 'Balanced') {
      onParamsChange({ ...params, temperature: 0.7, topP: 1.0, preset: 'Balanced' });
    } else if (preset === 'Creative') {
      onParamsChange({ ...params, temperature: 1.2, topP: 1.0, preset: 'Creative' });
    }
  }

  function handleAddStopSeq(e) {
    if (e.key === 'Enter' && stopSeqInput.trim()) {
      e.preventDefault();
      const seq = stopSeqInput.trim();
      if (!params.stopSequences?.includes(seq)) {
        onParamsChange({
          ...params,
          stopSequences: [...(params.stopSequences || []), seq],
        });
      }
      setStopSeqInput('');
    }
  }

  function handleRemoveStopSeq(seqToRemove) {
    onParamsChange({
      ...params,
      stopSequences: (params.stopSequences || []).filter((s) => s !== seqToRemove),
    });
  }

  return (
    <aside className="w-80 shrink-0 bg-dark-950 border-l border-dark-800 flex flex-col h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-dark-800 bg-dark-950 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Sliders size={14} />
          </div>
          <span className="text-sm font-semibold text-gray-200 tracking-tight">Control desk</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onResetParams}
            className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-dark-850 transition-colors"
            title="Reset parameters to default"
          >
            <RotateCcw size={13} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-dark-850 transition-colors"
              title="Close panel"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* =========================================================================
            1. MODEL ENGINE
           ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Model Engine</span>
            <span className="text-[10px] font-mono font-medium text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">STARTER LIST</span>
          </div>

          {/* Model selector dropdown */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => onModelSelect(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 hover:border-dark-600 rounded-xl px-3 py-2 text-xs text-gray-100 font-semibold focus:outline-none focus:border-brand-500 appearance-none cursor-pointer pr-8"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-dark-900 text-gray-100">
                  {m.name} ({m.badge || 'Fast'})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            {currentModel.description}
          </p>

          {/* Custom Model ID Accordion */}
          <div>
            <button
              onClick={() => setCustomModelOpen(!customModelOpen)}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-brand-300 transition-colors"
            >
              {customModelOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              <span>Custom model ID</span>
            </button>

            {customModelOpen && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    placeholder="e.g. llama-3.3-70b-specdec"
                    className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-2.5 py-1 text-xs text-gray-100 font-mono focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => {
                      if (customModelInput.trim()) {
                        onModelSelect(customModelInput.trim());
                        setCustomModelInput('');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-200 font-medium"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Model feature tags */}
          <div className="flex flex-wrap gap-1 pt-1">
            {(currentModel.tags || ['131,072 context', 'Reasoning', 'JSON']).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 border border-dark-800 text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-dark-800" />

        {/* =========================================================================
            2. API CONNECTION
           ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">API Connection</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-brand-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className={`text-[10px] font-medium font-mono ${isConnected ? 'text-brand-400' : 'text-amber-400'}`}>
                {isConnected ? '• Connected' : '• Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-200">Groq API key</label>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-0.5 hover:underline"
            >
              <span>Get key</span>
              <ExternalLink size={10} />
            </a>
          </div>

          <form onSubmit={handleConnectKey} className="space-y-2">
            <div className="relative">
              <Key size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showKey ? 'text' : 'password'}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Enter your Groq key..."
                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-8 pr-16 py-2 text-xs font-mono text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-gray-500 hover:text-gray-300"
                  title={showKey ? 'Hide' : 'Show'}
                >
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 rounded bg-brand-500 hover:bg-brand-600 text-white font-semibold text-[11px] transition-colors"
                >
                  {savedSuccess ? '✓' : 'Connect'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-brand-500 cursor-pointer" />
                <span>Remember in this tab</span>
              </label>

              {apiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  Clear key
                </button>
              )}
            </div>
          </form>

          {/* Privacy note matching screenshot */}
          <div className="p-2.5 rounded-xl bg-dark-900 border border-dark-800 text-[10px] text-gray-400 leading-relaxed">
            This site has no server. Your key and prompts go from your browser straight to Groq. No analytics, no third-party scripts.
            <div className="text-gray-500 mt-1">Usage counts against your own Groq account.</div>
          </div>
        </div>

        <div className="border-t border-dark-800" />

        {/* =========================================================================
            3. PARAMETERS
           ========================================================================= */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Parameters</span>
            <Sliders size={12} className="text-gray-500" />
          </div>

          {/* Presets: Precise / Balanced / Creative */}
          <div className="flex rounded-lg bg-dark-900 p-0.5 border border-dark-800">
            {['Precise', 'Balanced', 'Creative'].map((p) => {
              const active = params.preset === p;
              return (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`flex-1 py-1 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-dark-800 text-brand-300 font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-gray-300 font-medium">Temperature</span>
                <Info size={11} className="text-gray-600" />
              </div>
              <input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={params.temperature}
                onChange={(e) => onParamsChange({ ...params, temperature: parseFloat(e.target.value) || 0, preset: null })}
                className="w-14 bg-dark-900 border border-dark-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-gray-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={params.temperature}
              onChange={(e) => onParamsChange({ ...params, temperature: parseFloat(e.target.value), preset: null })}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e ${(params.temperature / 2) * 100}%, #343a40 ${(params.temperature / 2) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Top P Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-gray-300 font-medium">Top P</span>
                <Info size={11} className="text-gray-600" />
              </div>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={params.topP}
                onChange={(e) => onParamsChange({ ...params, topP: parseFloat(e.target.value) || 0, preset: null })}
                className="w-14 bg-dark-900 border border-dark-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-gray-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={params.topP}
              onChange={(e) => onParamsChange({ ...params, topP: parseFloat(e.target.value), preset: null })}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e ${params.topP * 100}%, #343a40 ${params.topP * 100}%)`,
              }}
            />
          </div>

          {/* Max Completion Tokens */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-gray-300 font-medium">Max completion tokens</span>
                <Info size={11} className="text-gray-600" />
              </div>
              <input
                type="number"
                min={1}
                max={32768}
                value={params.maxTokens}
                onChange={(e) => onParamsChange({ ...params, maxTokens: parseInt(e.target.value) || 1024 })}
                className="w-20 bg-dark-900 border border-dark-700 rounded px-2 py-0.5 text-right font-mono text-xs text-gray-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              The completion budget includes thinking tokens.
            </p>
          </div>

          {/* Stop Sequences Tag Input */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="text-gray-300 font-medium">Stop sequences</span>
              <Info size={11} className="text-gray-600" />
            </div>
            <input
              type="text"
              value={stopSeqInput}
              onChange={(e) => setStopSeqInput(e.target.value)}
              onKeyDown={handleAddStopSeq}
              placeholder="Type sequence & press Enter"
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-2.5 py-1 text-xs text-gray-200 font-mono focus:outline-none focus:border-brand-500"
            />
            {params.stopSequences && params.stopSequences.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {params.stopSequences.map((seq, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-dark-800 border border-dark-700 text-[10px] font-mono text-brand-300"
                  >
                    <span>{seq}</span>
                    <button onClick={() => handleRemoveStopSeq(seq)} className="text-gray-500 hover:text-red-400">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* System Prompt Box */}
          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => setSystemPromptOpen(!systemPromptOpen)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-gray-300 font-medium">System Prompt</span>
              {systemPromptOpen ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
            </button>
            {systemPromptOpen && (
              <textarea
                value={params.systemPrompt}
                onChange={(e) => onParamsChange({ ...params, systemPrompt: e.target.value })}
                placeholder="Custom persona, instructions, or format constraints..."
                rows={3}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none font-sans"
              />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
