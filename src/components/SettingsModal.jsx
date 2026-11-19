import { useState } from 'react';
import { X, Moon, Sun, Trash2, Key, ExternalLink, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function SettingsModal({
  theme,
  onThemeChange,
  apiKey,
  onApiKeyChange,
  onClearAll,
  onClose,
}) {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  function handleSaveKey(e) {
    e.preventDefault();
    onApiKeyChange(tempKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  }

  function handleRemoveKey() {
    setTempKey('');
    onApiKeyChange('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  }

  const isConnected = !!(apiKey && apiKey.trim().length > 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-100">Settings</h2>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              isConnected
                ? 'bg-brand-500/15 border-brand-500/30 text-brand-400'
                : 'bg-dark-800 border-dark-700 text-gray-400'
            }`}>
              {isConnected ? '⚡ Groq Connected' : '⚡ Smart Demo Engine'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-800 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Groq API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key size={15} className="text-brand-400" />
                <label className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                  Groq Cloud API Key
                </label>
              </div>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 hover:underline"
              >
                <span>Get free API key</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Add your Groq API key to stream live answers at 500+ tokens/sec directly from Groq LPUs. Stored only in your local browser storage.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-2.5">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-gray-100 font-mono placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ShieldCheck size={13} className="text-brand-400" />
                  <span>Kept private in localStorage</span>
                </div>
                <div className="flex gap-2">
                  {apiKey && (
                    <button
                      type="button"
                      onClick={handleRemoveKey}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dark-700 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                    >
                      Remove Key
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5 transition-colors"
                  >
                    {savedSuccess ? <Check size={13} /> : null}
                    <span>{savedSuccess ? 'Saved!' : 'Save Key'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-dark-800" />

          {/* Theme */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Appearance</p>
            <div className="flex gap-2">
              <button
                onClick={() => onThemeChange('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors
                  ${theme === 'dark'
                    ? 'bg-brand-500/15 border-brand-500/50 text-brand-300'
                    : 'border-dark-700 text-gray-400 hover:border-dark-600 hover:text-gray-200'
                  }`}
              >
                <Moon size={15} />
                Dark
              </button>
              <button
                onClick={() => onThemeChange('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors
                  ${theme === 'light'
                    ? 'bg-brand-500/15 border-brand-500/50 text-brand-300'
                    : 'border-dark-700 text-gray-400 hover:border-dark-600 hover:text-gray-200'
                  }`}
              >
                <Sun size={15} />
                Light
              </button>
            </div>
          </div>

          <div className="border-t border-dark-800" />

          {/* Data */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Data & Storage</p>
            <button
              onClick={onClearAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
            >
              <Trash2 size={15} />
              Clear all chat history
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
