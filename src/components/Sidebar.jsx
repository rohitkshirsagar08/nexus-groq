import { useState, useMemo } from 'react';
import {
  Plus, MessageSquare, Settings, ChevronLeft, ChevronRight,
  Trash2, Zap, Search, Eraser, Download, X, Star, Edit2,
  Check, BookOpen, Keyboard, Activity, Cpu, Sparkles
} from 'lucide-react';
import { PROMPT_TEMPLATES } from '../utils/prompts';

function groupByDate(conversations) {
  const now = Date.now();
  const oneDay = 86400000;
  const sevenDays = 7 * oneDay;
  const thirtyDays = 30 * oneDay;

  const groups = { Today: [], 'Last 7 days': [], 'Last 30 days': [], Older: [] };
  for (const conv of conversations) {
    if (conv.pinned) continue; // Pinned items shown separately
    const age = now - conv.updatedAt;
    if (age < oneDay) groups['Today'].push(conv);
    else if (age < sevenDays) groups['Last 7 days'].push(conv);
    else if (age < thirtyDays) groups['Last 30 days'].push(conv);
    else groups['Older'].push(conv);
  }
  return groups;
}

export default function Sidebar({
  conversations,
  activeConvId,
  hasActiveMessages,
  onNewChat,
  onSelectConv,
  onDeleteConv,
  onTogglePinConv,
  onRenameConv,
  onSelectPrompt,
  onClearActiveChat,
  onClearAll,
  onOpenSettings,
  collapsed,
  onToggleCollapse,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showPromptsModal, setShowPromptsModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Filter conversations by search query
  const filteredConvs = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      c.title?.toLowerCase().includes(q) ||
      c.messages?.some((m) => m.content?.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const pinnedConvs = useMemo(() => filteredConvs.filter((c) => c.pinned), [filteredConvs]);
  const groups = groupByDate(filteredConvs);

  function startRename(conv) {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  }

  function saveRename(id) {
    if (editTitle.trim()) {
      onRenameConv(id, editTitle.trim());
    }
    setEditingId(null);
  }

  // Export current conversation
  function handleExportChat() {
    const active = conversations.find((c) => c.id === activeConvId);
    if (!active || !active.messages.length) return;

    const md = `# ${active.title}\n*Exported from NexusGroq on ${new Date().toLocaleString()}*\n\n---\n\n` +
      active.messages.map((m) =>
        `### ${m.role === 'user' ? '👤 User' : '⚡ NexusGroq'}\n\n${m.content}\n`
      ).join('\n---\n\n');

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${active.title.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <aside
        className={`flex flex-col bg-dark-950 border-r border-dark-800 transition-all duration-300 ease-in-out shrink-0 select-none
          ${collapsed ? 'w-14' : 'w-64'}`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between px-3.5 py-4 border-b border-dark-800">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/30">
                <Zap size={15} className="text-white fill-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-100 text-sm tracking-tight">NexusGroq</span>
                <span className="text-[10px] text-brand-400 font-mono font-semibold">LPU</span>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center mx-auto shadow-sm shadow-brand-500/30">
              <Zap size={14} className="text-white fill-white" />
            </div>
          )}

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-dark-800 text-gray-500 hover:text-gray-300 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Expand trigger when collapsed */}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-dark-800 text-gray-500 hover:text-gray-300 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Action buttons: New Chat + Clear Chat */}
        <div className={`px-2.5 pt-3 pb-2 space-y-1.5 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          <button
            onClick={onNewChat}
            className={`${collapsed
              ? 'w-9 h-9 flex items-center justify-center rounded-lg bg-dark-850 hover:bg-dark-800 text-brand-400 hover:text-brand-300 transition-colors border border-dark-800'
              : 'w-full flex items-center justify-between px-3 py-2 rounded-xl bg-dark-900 hover:bg-dark-850 text-gray-200 hover:text-white text-xs font-semibold transition-all border border-dark-800 hover:border-dark-700 shadow-sm'
            }`}
            title="Start new conversation"
          >
            <div className="flex items-center gap-2">
              <Plus size={15} className="text-brand-400" />
              {!collapsed && <span>New chat</span>}
            </div>
            {!collapsed && (
              <kbd className="text-[10px] text-gray-500 font-mono bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">⌘K</kbd>
            )}
          </button>

          {/* Prompt Templates quick trigger */}
          <button
            onClick={() => setShowPromptsModal(true)}
            className={`${collapsed
              ? 'w-9 h-9 flex items-center justify-center rounded-lg hover:bg-dark-850 text-gray-400 hover:text-brand-400 transition-colors'
              : 'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-300 hover:text-brand-300 hover:bg-dark-900 text-xs font-medium transition-colors border border-transparent hover:border-dark-800'
            }`}
            title="Prompt Library & Templates"
          >
            <BookOpen size={14} className="text-brand-400 shrink-0" />
            {!collapsed && <span>Prompt Library</span>}
          </button>

          {/* Clear Current Chat Button */}
          {hasActiveMessages && (
            <button
              onClick={onClearActiveChat}
              className={`${collapsed
                ? 'w-9 h-9 flex items-center justify-center rounded-lg hover:bg-dark-850 text-gray-500 hover:text-red-400 transition-colors'
                : 'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors'
              }`}
              title="Clear current chat messages"
            >
              <Eraser size={14} className="text-gray-500 hover:text-red-400 shrink-0" />
              {!collapsed && <span>Clear this chat</span>}
            </button>
          )}
        </div>

        {/* Search Input (Desktop) */}
        {!collapsed && (
          <div className="px-2.5 pb-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full bg-dark-900 border border-dark-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversation history list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-4">
          {/* Pinned Conversations */}
          {!collapsed && pinnedConvs.length > 0 && (
            <div>
              <p className="text-[10px] text-brand-400 font-semibold px-2 py-1 uppercase tracking-wider flex items-center gap-1.5">
                <Star size={10} className="fill-brand-400" />
                <span>Pinned</span>
              </p>
              <ul className="space-y-0.5">
                {pinnedConvs.map((conv) => (
                  <li
                    key={conv.id}
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs
                      ${activeConvId === conv.id
                        ? 'bg-dark-850 text-gray-100 font-medium border border-dark-800'
                        : 'text-gray-300 hover:bg-dark-900 hover:text-gray-100'
                      }`}
                    onClick={() => onSelectConv(conv.id)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <Star size={12} className="shrink-0 text-brand-400 fill-brand-400" />
                      {editingId === conv.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(conv.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="bg-dark-950 border border-brand-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-full font-sans"
                        />
                      ) : (
                        <span className="truncate">{conv.title}</span>
                      )}
                    </div>

                    {editingId === conv.id ? (
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); saveRename(conv.id); }}
                          className="p-1 rounded text-brand-400 hover:bg-dark-800"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                          className="p-1 rounded text-gray-500 hover:bg-dark-800"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : hoveredId === conv.id ? (
                      <div className="flex items-center gap-0.5 shrink-0 ml-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onTogglePinConv(conv.id); }}
                          className="p-1 rounded hover:bg-dark-800 text-brand-400 transition-colors"
                          title="Unpin"
                        >
                          <Star size={11} className="fill-brand-400" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); startRename(conv); }}
                          className="p-1 rounded hover:bg-dark-800 text-gray-500 hover:text-gray-200 transition-colors"
                          title="Rename"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteConv(conv.id); }}
                          className="p-1 rounded hover:bg-dark-800 text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Date Grouped Conversations */}
          {!collapsed && Object.entries(groups).map(([label, convs]) => {
            if (convs.length === 0) return null;
            return (
              <div key={label}>
                <p className="text-[10px] text-gray-500 font-semibold px-2 py-1 uppercase tracking-wider">{label}</p>
                <ul className="space-y-0.5">
                  {convs.map((conv) => (
                    <li
                      key={conv.id}
                      onMouseEnter={() => setHoveredId(conv.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs
                        ${activeConvId === conv.id
                          ? 'bg-dark-850 text-gray-100 font-medium border border-dark-800'
                          : 'text-gray-400 hover:bg-dark-900 hover:text-gray-200'
                        }`}
                      onClick={() => onSelectConv(conv.id)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <MessageSquare size={13} className={`shrink-0 ${activeConvId === conv.id ? 'text-brand-400' : 'opacity-60'}`} />
                        {editingId === conv.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRename(conv.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            className="bg-dark-950 border border-brand-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-full font-sans"
                          />
                        ) : (
                          <span className="truncate">{conv.title}</span>
                        )}
                      </div>

                      {editingId === conv.id ? (
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); saveRename(conv.id); }}
                            className="p-1 rounded text-brand-400 hover:bg-dark-800"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                            className="p-1 rounded text-gray-500 hover:bg-dark-800"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : hoveredId === conv.id ? (
                        <div className="flex items-center gap-0.5 shrink-0 ml-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onTogglePinConv(conv.id); }}
                            className="p-1 rounded hover:bg-dark-800 text-gray-500 hover:text-brand-400 transition-colors"
                            title="Pin to top"
                          >
                            <Star size={11} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); startRename(conv); }}
                            className="p-1 rounded hover:bg-dark-800 text-gray-500 hover:text-gray-200 transition-colors"
                            title="Rename"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteConv(conv.id); }}
                            className="p-1 rounded hover:bg-dark-800 text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {!collapsed && filteredConvs.length === 0 && (
            <div className="px-3 py-8 text-center">
              <MessageSquare size={20} className="text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                {searchQuery ? 'No matching chats found' : 'No conversations yet'}
              </p>
            </div>
          )}
        </div>

        {/* LPU Telemetry Status Widget */}
        {!collapsed && (
          <div className="px-2.5 pb-1">
            <div className="p-2.5 rounded-xl bg-dark-900 border border-dark-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  <span className="text-[11px] font-semibold text-gray-300">Groq LPU Node</span>
                </div>
                <span className="text-[10px] font-mono text-brand-400 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>Latency: ~14ms</span>
                <span>Speed: 750 T/s</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Tools: Export, Clear All, Shortcuts, Settings */}
        <div className={`px-2.5 py-2.5 border-t border-dark-800 space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {/* Export active conversation */}
          {!collapsed && hasActiveMessages && (
            <button
              onClick={handleExportChat}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-dark-900 text-xs transition-colors"
              title="Export conversation as Markdown"
            >
              <Download size={13} className="text-gray-500" />
              <span>Export conversation</span>
            </button>
          )}

          {/* Keyboard Shortcuts Trigger */}
          {!collapsed && (
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-dark-900 text-xs transition-colors"
              title="View Keyboard Shortcuts"
            >
              <div className="flex items-center gap-2">
                <Keyboard size={13} className="text-gray-500" />
                <span>Shortcuts</span>
              </div>
              <kbd className="text-[9px] font-mono text-gray-500 bg-dark-800 px-1 py-0.5 rounded border border-dark-700">?</kbd>
            </button>
          )}

          {/* Clear All Chats trigger */}
          {!collapsed && conversations.length > 0 && (
            confirmClearAll ? (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs space-y-1.5">
                <p className="text-red-400 font-medium">Clear all {conversations.length} chats?</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { onClearAll(); setConfirmClearAll(false); }}
                    className="flex-1 py-1 rounded bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                  >
                    Yes, clear
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="px-2 py-1 rounded bg-dark-800 text-gray-300 hover:bg-dark-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-dark-900 text-xs transition-colors"
                title="Clear all chat history"
              >
                <Trash2 size={13} />
                <span>Clear all chats</span>
              </button>
            )
          )}

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className={`${collapsed
              ? 'w-9 h-9 flex items-center justify-center rounded-lg hover:bg-dark-850 text-gray-500 hover:text-gray-300 transition-colors'
              : 'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-dark-900 text-gray-400 hover:text-gray-200 text-xs transition-colors'
            }`}
            title="Settings"
          >
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-gray-500" />
              {!collapsed && <span>Settings</span>}
            </div>
            {!collapsed && conversations.length > 0 && (
              <span className="text-[10px] text-gray-500 font-mono">{conversations.length} chats</span>
            )}
          </button>
        </div>
      </aside>

      {/* Prompt Library Modal */}
      {showPromptsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowPromptsModal(false)}>
          <div
            className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-brand-400" />
                <h3 className="font-semibold text-gray-100 text-sm">Prompt Template Library</h3>
              </div>
              <button onClick={() => setShowPromptsModal(false)} className="text-gray-500 hover:text-gray-300">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
              {PROMPT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    onSelectPrompt(tmpl.prompt);
                    setShowPromptsModal(false);
                  }}
                  className="p-3.5 rounded-xl bg-dark-950 border border-dark-800 hover:border-brand-500/50 hover:bg-dark-850 text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-200 group-hover:text-brand-300 transition-colors">
                        {tmpl.title}
                      </span>
                      <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {tmpl.prompt}
                    </p>
                  </div>
                  <span className="text-[10px] text-brand-400 font-medium mt-2 group-hover:underline">Use prompt →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowShortcutsModal(false)}>
          <div
            className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-sm shadow-2xl p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-dark-800 mb-3">
              <div className="flex items-center gap-2">
                <Keyboard size={15} className="text-brand-400" />
                <h3 className="font-semibold text-gray-100 text-sm">Keyboard Shortcuts</h3>
              </div>
              <button onClick={() => setShowShortcutsModal(false)} className="text-gray-500 hover:text-gray-300">
                <X size={15} />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { key: 'Enter', action: 'Send message' },
                { key: 'Shift + Enter', action: 'New line in input' },
                { key: '⌘ + K', action: 'Start new chat' },
                { key: 'Esc', action: 'Close modals & panels' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between py-1 border-b border-dark-800/50">
                  <span className="text-gray-400">{action}</span>
                  <kbd className="font-mono text-gray-300 bg-dark-800 px-2 py-0.5 rounded border border-dark-700 text-[11px]">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
