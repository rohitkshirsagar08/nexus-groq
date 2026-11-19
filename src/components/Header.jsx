import { Menu, Sun, Moon, Trash2, Zap, SlidersHorizontal, Key } from 'lucide-react';
import ModelSelector from './ModelSelector';

export default function Header({
  theme,
  onThemeToggle,
  onClearConversation,
  selectedModel,
  onModelSelect,
  hasMessages,
  onMobileMenuToggle,
  paramsOpen,
  onToggleParams,
  apiKey,
  onOpenSettings,
}) {
  const isConnected = !!(apiKey && apiKey.trim().length > 5);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-950 shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-dark-800 text-gray-500 hover:text-gray-300 transition-colors"
          title="Menu"
        >
          <Menu size={18} />
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-gray-100">NexusGroq</span>
        </div>

        <ModelSelector selectedModel={selectedModel} onSelect={onModelSelect} />

        {/* Engine status indicator */}
        <button
          onClick={onOpenSettings}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            isConnected
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-400 hover:bg-brand-500/20'
              : 'bg-dark-850 border-dark-700 text-gray-400 hover:text-gray-200 hover:border-dark-600'
          }`}
          title={isConnected ? 'Connected to live Groq API' : 'Click to configure Groq API Key'}
        >
          <Zap size={11} className={isConnected ? 'text-brand-400 fill-brand-400' : 'text-gray-500'} />
          <span>{isConnected ? 'Groq Live' : 'Smart Engine'}</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        {hasMessages && (
          <button
            onClick={onClearConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-dark-800 transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={14} />
            <span className="hidden sm:block">Clear</span>
          </button>
        )}

        {/* Control desk toggle */}
        <button
          onClick={onToggleParams}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${paramsOpen
              ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
              : 'text-gray-500 hover:text-gray-300 hover:bg-dark-800'
            }`}
          title="Toggle Control Desk"
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:block">Control desk</span>
        </button>

        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-dark-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
