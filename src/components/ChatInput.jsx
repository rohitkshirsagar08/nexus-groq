import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Paperclip, Mic, Square, Play, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function ChatInput({ onSend, isLoading, onStop, disabled }) {
  const [value, setValue] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 220) + 'px';
  }, [value]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
  }

  function handleAttachment() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.txt,.md,.js,.py,.ts';
    input.click();
  }

  function handleMic() {
    alert('Voice input is ready for Web Speech API integration.');
  }

  // Token estimate heuristic (~4 characters per token)
  const tokenEstimate = useMemo(() => {
    if (!value) return 0;
    return Math.max(1, Math.ceil(value.trim().length / 4));
  }, [value]);

  // Prompt heuristic analysis (zero-shot, constraints, etc.)
  const analysis = useMemo(() => {
    const lower = value.toLowerCase();
    const hasConstraint = lower.includes('under') || lower.includes('limit') || lower.includes('words') || lower.includes('format') || lower.includes('json');
    const exampleCount = (value.match(/example|input:|output:|for instance/gi) || []).length;

    let shotType = 'ZERO-SHOT';
    if (exampleCount === 1) shotType = 'ONE-SHOT';
    if (exampleCount > 1) shotType = 'FEW-SHOT';

    return {
      shotType,
      exampleCount,
      hasConstraint,
    };
  }, [value]);

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Input Card Container */}
        <div className="relative bg-dark-900 border border-dark-750 focus-within:border-brand-500/60 rounded-2xl shadow-xl transition-all">
          {/* Header Bar matching screenshot */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[11px] font-mono border-b border-dark-800/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
              User Prompt
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">
                ~ {tokenEstimate} tokens · estimate
              </span>
              {value.length > 20 && (
                <button
                  type="button"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="text-[10px] text-brand-400 hover:text-brand-300 font-mono flex items-center gap-1"
                >
                  <span>Analysis</span>
                  {showAnalysis ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              )}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Explain how a language model turns a question into an answer. Use a concrete example, and keep the explanation under 100 words..."
            rows={2}
            disabled={disabled}
            className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm text-gray-100 placeholder-gray-500 resize-none focus:outline-none leading-relaxed max-h-[220px] overflow-y-auto"
          />

          {/* Bottom Toolbar matching screenshot */}
          <div className="px-3 pb-2.5 pt-1 flex items-center justify-between border-t border-dark-800/40">
            <div className="flex items-center gap-1">
              <button
                onClick={handleAttachment}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-dark-800 transition-colors"
                title="Attach file"
              >
                <Paperclip size={15} />
              </button>
              <button
                onClick={handleMic}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-dark-800 transition-colors"
                title="Voice input"
              >
                <Mic size={15} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-gray-500 select-none hidden sm:inline-flex items-center gap-1">
                <kbd className="bg-dark-800 px-1 py-0.5 rounded border border-dark-700 text-[10px]">⌘</kbd>
                <kbd className="bg-dark-800 px-1 py-0.5 rounded border border-dark-700 text-[10px]">↵</kbd>
                <span>to submit</span>
              </span>

              {isLoading ? (
                <button
                  onClick={onStop}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-200 font-medium text-xs transition-colors"
                  title="Stop generation"
                >
                  <Square size={13} className="text-red-400" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    canSend
                      ? 'bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold shadow-md shadow-brand-500/25 active:scale-95'
                      : 'bg-dark-800 text-gray-600 cursor-not-allowed'
                  }`}
                  title="Run prompt"
                >
                  <Play size={12} className={canSend ? 'fill-dark-950' : 'text-gray-600'} />
                  <span>Run prompt</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Prompt Analysis Heuristic Card matching screenshot */}
        {showAnalysis && value.length > 10 && (
          <div className="p-3 rounded-xl bg-dark-900 border border-dark-800 text-xs space-y-2 animate-slide-up">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-200">Prompt analysis</span>
                <span className="text-gray-500">• Local heuristic</span>
              </div>
              <span className="font-mono text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded font-bold">
                {analysis.shotType} · {analysis.exampleCount} examples
              </span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              {analysis.exampleCount === 0
                ? 'Your prompt gives the model a task without a worked example. Add one example to lock in the output format.'
                : 'Your prompt includes worked examples, guiding the model with few-shot demonstration.'}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {analysis.hasConstraint && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-brand-300 border border-dark-700">
                  Explicit constraints
                </span>
              )}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-gray-400 border border-dark-700">
                Detection details
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-gray-400 border border-dark-700">
                Verify with the model
              </span>
            </div>
          </div>
        )}

        {/* Subtitle / note */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 font-mono">
          <span className="flex items-center gap-1">
            <span className="text-gray-600">⇄</span>
            <span>The full conversation is re-sent on every turn.</span>
          </span>
          <span className="text-gray-400 hidden sm:inline">
            Usage counts against your own Groq account.
          </span>
        </div>
      </div>
    </div>
  );
}
