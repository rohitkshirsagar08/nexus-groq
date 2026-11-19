import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import SettingsModal from './components/SettingsModal';
import ControlDesk, { DEFAULT_PARAMS } from './components/ControlDesk';
import PromptRecipes from './components/PromptRecipes';
import {
  loadConversations, saveConversations,
  createConversation, loadTheme, saveTheme,
  loadModel, saveModel, loadApiKey, saveApiKey,
} from './utils/storage';
import { sendMessage, DEFAULT_MODEL } from './services/aiService';

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  const [theme, setTheme] = useState(() => loadTheme());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paramsOpen, setParamsOpen] = useState(true);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [apiKey, setApiKey] = useState(() => loadApiKey());
  const [conversations, setConversations] = useState(() => loadConversations());
  const [activeConvId, setActiveConvId] = useState(null);
  const [selectedModel, setSelectedModel] = useState(() => loadModel() ?? DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(null);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Persist conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Global keyboard shortcuts (⌘K for new chat)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const messages = activeConv?.messages ?? [];

  // -------------------------------------------------------------------------
  // Conversation management
  // -------------------------------------------------------------------------
  function handleNewChat() {
    setActiveConvId(null);
    setMobileSidebarOpen(false);
  }

  function handleSelectConv(id) {
    setActiveConvId(id);
    setMobileSidebarOpen(false);
  }

  function handleDeleteConv(id) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) setActiveConvId(null);
  }

  function handleClearAll() {
    setConversations([]);
    setActiveConvId(null);
    setSettingsOpen(false);
  }

  function handleClearConversation() {
    if (!activeConvId) return;
    setConversations((prev) =>
      prev.map((c) => c.id === activeConvId ? { ...c, messages: [] } : c)
    );
  }

  function handleTogglePinConv(id) {
    setConversations((prev) =>
      prev.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c)
    );
  }

  function handleRenameConv(id, newTitle) {
    if (!newTitle.trim()) return;
    setConversations((prev) =>
      prev.map((c) => c.id === id ? { ...c, title: newTitle.trim() } : c)
    );
  }

  function handleApiKeyChange(newKey) {
    setApiKey(newKey);
    saveApiKey(newKey);
  }

  // -------------------------------------------------------------------------
  // Model selection
  // -------------------------------------------------------------------------
  function handleModelSelect(modelId) {
    setSelectedModel(modelId);
    saveModel(modelId);
  }

  // -------------------------------------------------------------------------
  // Theme
  // -------------------------------------------------------------------------
  function handleThemeToggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
  }

  function handleThemeChange(t) {
    setTheme(t);
    saveTheme(t);
  }

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------
  const handleSend = useCallback(async (text) => {
    if (isLoading || !text.trim()) return;

    // Ensure there's an active conversation
    let convId = activeConvId;
    let isNew = false;
    if (!convId) {
      const newConv = createConversation(text);
      setConversations((prev) => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConvId(convId);
      isNew = true;
    }

    const userMsg = { id: generateId(), role: 'user', content: text, timestamp: Date.now() };

    // Add user message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              title: c.messages.length === 0 ? text.slice(0, 50) : c.title,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsLoading(true);

    // Placeholder assistant message (streamed into)
    const assistantMsgId = generateId();
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      meta: null,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, assistantMsg] }
          : c
      )
    );

    // Abort controller for stop button
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const history = [
        ...(isNew ? [] : (conversations.find((c) => c.id === convId)?.messages ?? [])),
        userMsg,
      ].map((m) => ({ role: m.role, content: m.content }));

      await sendMessage(
        history,
        selectedModel,
        (chunk) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, content: m.content + chunk }
                        : m
                    ),
                  }
                : c
            )
          );
        },
        controller.signal,
        params,
        apiKey,
        (meta) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMsgId ? { ...m, meta } : m
                    ),
                  }
                : c
            )
          );
        }
      );
    } catch (err) {
      if (!controller.signal.aborted) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: `⚠️ ${err.message || 'An error occurred. Please check your network or API key.'}` }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [activeConvId, apiKey, conversations, isLoading, params, selectedModel]);

  function handleStop() {
    abortRef.current?.abort();
    setIsLoading(false);
  }

  // -------------------------------------------------------------------------
  // Regenerate last response
  // -------------------------------------------------------------------------
  function handleRegenerate() {
    if (!activeConv || isLoading) return;
    const msgs = activeConv.messages;
    if (msgs.length < 2) return;

    // Find the last user message
    const lastUserIdx = [...msgs].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;
    const lastUserMsg = msgs[msgs.length - 1 - lastUserIdx];

    // Remove all messages from the last assistant response onward
    const trimmedMsgs = msgs.slice(0, msgs.length - lastUserIdx - 1);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, messages: trimmedMsgs } : c
      )
    );

    // Re-send
    handleSend(lastUserMsg.content);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-dark-950 text-gray-100'}`}>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-30 md:z-auto h-full transition-transform duration-300
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar
          conversations={conversations}
          activeConvId={activeConvId}
          hasActiveMessages={messages.length > 0}
          onNewChat={handleNewChat}
          onSelectConv={handleSelectConv}
          onDeleteConv={handleDeleteConv}
          onTogglePinConv={handleTogglePinConv}
          onRenameConv={handleRenameConv}
          onSelectPrompt={handleSend}
          onClearActiveChat={handleClearConversation}
          onClearAll={handleClearAll}
          onOpenSettings={() => setSettingsOpen(true)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onClearConversation={handleClearConversation}
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
          hasMessages={messages.length > 0}
          onMobileMenuToggle={() => setMobileSidebarOpen((v) => !v)}
          paramsOpen={paramsOpen}
          onToggleParams={() => setParamsOpen((v) => !v)}
          apiKey={apiKey}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Chat area + Control desk */}
        <div className="flex flex-1 min-h-0">
          <div className="flex flex-col flex-1 min-w-0">
            {/* Top Onboarding & Prompt Recipes */}
            <PromptRecipes onSelectRecipe={handleSend} apiKey={apiKey} />

            {/* Chat area */}
            {messages.length === 0 && !isLoading ? (
              <WelcomeScreen onSuggestion={handleSend} />
            ) : (
              <MessageList
                messages={messages}
                isLoading={isLoading}
                onRegenerate={handleRegenerate}
              />
            )}

            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              onStop={handleStop}
              disabled={false}
            />
          </div>

          {/* Control Desk panel matching Groq playground screenshot */}
          {paramsOpen && (
            <div className="hidden lg:flex">
              <ControlDesk
                selectedModel={selectedModel}
                onModelSelect={handleModelSelect}
                apiKey={apiKey}
                onApiKeyChange={handleApiKeyChange}
                params={params}
                onParamsChange={setParams}
                onResetParams={() => setParams(DEFAULT_PARAMS)}
                onClose={() => setParamsOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Settings modal */}
      {settingsOpen && (
        <SettingsModal
          theme={theme}
          onThemeChange={handleThemeChange}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          onClearAll={handleClearAll}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
