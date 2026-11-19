import { useState, useRef, useEffect } from 'react';
import { Copy, Check, RefreshCw, Zap, User, Code2 } from 'lucide-react';

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-slide-up">
      <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5">
        <Zap size={13} className="text-brand-400" />
      </div>
      <div className="ai-bubble flex items-center gap-1.5 py-3 px-4">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-dark-700 bg-dark-950">
      <div className="flex items-center justify-between px-3.5 py-2 bg-dark-900 border-b border-dark-800 text-xs text-gray-400">
        <div className="flex items-center gap-1.5 font-mono">
          <Code2 size={13} className="text-brand-400" />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-gray-200 transition-colors py-0.5 px-1.5 rounded hover:bg-dark-800"
          title="Copy code"
        >
          {copied ? <Check size={12} className="text-brand-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageBubble({ message, onCopy, onRegenerate, isLast }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  }

  function renderContent(text) {
    if (!text) return null;

    // Split on code fences ```lang\n...```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trimStart();
        const firstLineEnd = lines.indexOf('\n');
        let lang = 'code';
        let code = lines;

        if (firstLineEnd !== -1) {
          const possibleLang = lines.slice(0, firstLineEnd).trim();
          if (possibleLang && !possibleLang.includes(' ') && possibleLang.length < 20) {
            lang = possibleLang;
            code = lines.slice(firstLineEnd + 1);
          }
        }
        return <CodeBlock key={i} code={code.trimEnd()} language={lang} />;
      }

      // Inline markdown: headings, bold, inline code, lists
      const lines = part.split('\n');
      return (
        <div key={i} className="space-y-1.5">
          {lines.map((line, j) => {
            const trimmed = line.trim();

            // Headings
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={j} className="text-sm font-semibold text-gray-100 pt-2 pb-1 border-b border-dark-700/50">
                  {trimmed.replace(/^###\s+/, '')}
                </h3>
              );
            }
            if (trimmed.startsWith('#### ')) {
              return (
                <h4 key={j} className="text-xs font-semibold text-brand-300 pt-1">
                  {trimmed.replace(/^####\s+/, '')}
                </h4>
              );
            }

            // Bullet points
            const isBullet = trimmed.match(/^[-*•]\s+/);
            const isNumbered = trimmed.match(/^(\d+)\.\s+/);

            const displayLine = isBullet
              ? trimmed.replace(/^[-*•]\s+/, '')
              : isNumbered
              ? trimmed.replace(/^\d+\.\s+/, '')
              : line;

            // Inline bold and backticks
            const inlineParts = displayLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
            const parsedInline = inlineParts.map((sub, k) => {
              if (sub.startsWith('`') && sub.endsWith('`')) {
                return (
                  <code key={k} className="bg-dark-900 border border-dark-700 text-brand-300 px-1.5 py-0.5 rounded text-xs font-mono">
                    {sub.slice(1, -1)}
                  </code>
                );
              }
              if (sub.startsWith('**') && sub.endsWith('**')) {
                return <strong key={k} className="font-semibold text-gray-100">{sub.slice(2, -2)}</strong>;
              }
              return sub;
            });

            if (isBullet) {
              return (
                <div key={j} className="flex items-start gap-2 pl-1">
                  <span className="text-brand-400 font-bold leading-none mt-1">•</span>
                  <span className="flex-1">{parsedInline}</span>
                </div>
              );
            }

            if (isNumbered) {
              return (
                <div key={j} className="flex items-start gap-2 pl-1">
                  <span className="text-brand-400 font-mono text-xs mt-0.5">{isNumbered[1]}.</span>
                  <span className="flex-1">{parsedInline}</span>
                </div>
              );
            }

            if (!trimmed) {
              return <div key={j} className="h-1.5" />;
            }

            return <p key={j} className="leading-relaxed">{parsedInline}</p>;
          })}
        </div>
      );
    });
  }

  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5
        ${isUser
          ? 'bg-dark-700 border border-dark-600'
          : 'bg-brand-500/20 border border-brand-500/30'
        }`}>
        {isUser
          ? <User size={13} className="text-gray-300" />
          : <Zap size={13} className="text-brand-400" />
        }
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={isUser ? 'user-bubble' : 'ai-bubble'}>
          {renderContent(message.content)}
        </div>

        {/* AI response details: Groq metrics + copy + regenerate */}
        {!isUser && (
          <div className="flex items-center gap-2 pt-0.5 px-1">
            {message.meta && (
              <span className="text-[11px] font-mono text-brand-400/90 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap size={10} className="text-brand-400" />
                {message.meta.tokensPerSecond} T/s · {message.meta.duration}s
                {message.meta.isLive ? ' · Live Groq' : ''}
              </span>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-dark-800 transition-colors"
              title="Copy response"
            >
              {copied ? <Check size={11} className="text-brand-400" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-dark-800 transition-colors"
                title="Regenerate response"
              >
                <RefreshCw size={11} />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessageList({ messages, isLoading, onRegenerate }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) return null;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg, i) => (
          <div key={msg.id} className="group">
            <MessageBubble
              message={msg}
              isLast={i === messages.length - 1 && msg.role === 'assistant'}
              onRegenerate={onRegenerate}
            />
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
