import { Zap, Code2, Cpu, Atom, Calculator } from 'lucide-react';

const SUGGESTIONS = [
  { icon: <Cpu size={16} />, text: 'What makes Groq LPUs so fast?' },
  { icon: <Code2 size={16} />, text: 'Reverse a string in Python & JavaScript' },
  { icon: <Atom size={16} />, text: 'What is photosynthesis and its chemical equation?' },
  { icon: <Calculator size={16} />, text: 'Calculate 125 * 38 and show the math' },
];

export default function WelcomeScreen({ onSuggestion }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 animate-fade-in">
      {/* Logo */}
      <div className="w-14 h-14 bg-brand-500/15 border border-brand-500/25 rounded-2xl flex items-center justify-center mb-5">
        <Zap size={28} className="text-brand-400" />
      </div>

      <h1 className="text-2xl font-semibold text-gray-100 mb-2 text-center tracking-tight">
        What can I help you with today?
      </h1>
      <p className="text-sm text-gray-400 mb-8 text-center max-w-md">
        Ask any question, code snippet, math problem, or concept. Stream responses at Groq speed.
      </p>

      {/* Suggestion chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.text)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-900 border border-dark-700/80 hover:border-brand-500/50 hover:bg-dark-850 text-gray-300 hover:text-white text-xs sm:text-sm text-left transition-all group"
          >
            <span className="text-brand-400 group-hover:text-brand-300 shrink-0 p-1.5 rounded-lg bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors">
              {s.icon}
            </span>
            <span className="leading-snug">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
