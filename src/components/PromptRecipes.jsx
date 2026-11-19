import { useState } from 'react';
import { ExternalLink, Check, Sparkles, ArrowRight, BookOpen, Layers, MessageSquare } from 'lucide-react';

export const RECIPES = [
  {
    id: 'classify',
    title: 'Classify a review',
    type: 'Zero-shot',
    prompt: "Classify the sentiment of this customer review as Positive, Neutral, or Negative, and provide a 1-sentence rationale:\n\n\"The battery life easily lasts two full days of heavy use, but the screen glass seems slightly prone to micro-scratches under direct sunlight.\"",
  },
  {
    id: 'translate',
    title: 'Translate a phrase',
    type: 'One-shot',
    prompt: "Translate the following sentence into natural, idiomatic French, Spanish, and German:\n\n\"Could you please recommend a quiet café nearby where I can work for a couple of hours?\"",
  },
  {
    id: 'route',
    title: 'Route a ticket',
    type: 'Few-shot',
    prompt: "You are an automated support router. Assign each ticket to one of: [Billing], [Tech Support], or [Security].\n\nTicket: \"I received an email stating my password was changed from an unrecognized device in Munich, but I am in Tokyo.\"\n\nCategory & Urgency (Low/Medium/Critical):",
  },
];

export default function PromptRecipes({ onSelectRecipe, apiKey }) {
  const isConnected = !!(apiKey && apiKey.trim().length > 5);

  return (
    <div className="px-4 pt-3 pb-2 space-y-3 max-w-3xl mx-auto w-full">
      {/* 3-Step Groq Onboarding Header from screenshot */}
      <div className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-dark-900 border border-dark-800 text-[11px] select-none">
        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-gray-300 hover:text-brand-300 font-medium transition-colors"
        >
          <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-400 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
          <span>Get a Groq key</span>
          <ExternalLink size={10} className="text-gray-500" />
        </a>

        <div className="text-gray-600">→</div>

        <div className={`flex items-center gap-1.5 font-medium ${isConnected ? 'text-brand-400' : 'text-gray-400'}`}>
          <span className={`w-4 h-4 rounded-full ${isConnected ? 'bg-brand-500 text-dark-950' : 'bg-dark-800 text-gray-400'} font-mono text-[10px] flex items-center justify-center font-bold`}>
            {isConnected ? '✓' : '2'}
          </span>
          <span>{isConnected ? 'Key connected' : 'Connect your key'}</span>
        </div>

        <div className="text-gray-600">→</div>

        <div className="flex items-center gap-1.5 text-gray-400 font-medium">
          <span className="w-4 h-4 rounded-full bg-dark-800 text-gray-500 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
          <span>Choose model & run</span>
        </div>
      </div>

      {/* TRY A RECIPE bar matching screenshot */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 px-0.5">
          <span>Try a Recipe</span>
          <span className="text-gray-500 font-normal">Click to load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {RECIPES.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.prompt)}
              className="flex flex-col text-left p-2.5 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/50 hover:bg-dark-850 transition-all group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-semibold text-gray-200 group-hover:text-brand-300 transition-colors">
                  {recipe.title}
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-750">
                  {recipe.type}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-1 group-hover:text-gray-400">
                {recipe.prompt.slice(0, 55)}...
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
