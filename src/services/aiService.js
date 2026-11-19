/**
 * AI API Service with Groq Cloud Integration & Smart Question Answering
 *
 * Supports:
 * 1. Direct Groq Cloud API streaming with real tokens/sec and latency metrics.
 * 2. Smart local query answering when running in offline/demo mode.
 * 3. System prompt, temperature, top_p, max_tokens, and stop sequences.
 */

import { generateSmartAnswer } from './smartResponder';

export const AVAILABLE_MODELS = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'LLaMA 3.3 70B',
    description: 'Groq flagship · fast reasoning for complex tasks. Access verified on connect.',
    badge: 'Flagship',
    context: '131,072 context',
    tags: ['131,072 context', 'Reasoning', 'JSON', 'LPU Speed'],
  },
  {
    id: 'gpt-oss-20b',
    name: 'GPT-OSS 20B',
    description: 'Fast reasoning for everyday experiments. Access is checked when you connect.',
    badge: 'Popular',
    context: '131,072 context',
    tags: ['131,072 context', 'Reasoning', 'Web search', 'JSON'],
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'LLaMA 3.1 8B',
    description: 'Ultra-fast low-latency inference · 800+ tokens/sec.',
    badge: '800+ T/s',
    context: '131,072 context',
    tags: ['131,072 context', 'Ultra-fast', 'JSON'],
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 70B',
    description: 'State of the art reasoning & logic on Groq LPUs.',
    badge: 'Reasoning',
    context: '131,072 context',
    tags: ['131,072 context', 'Chain-of-thought', 'Math & Code'],
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8×7B',
    description: 'High throughput Mixture-of-Experts with 32k context.',
    badge: '32k',
    context: '32,768 context',
    tags: ['32,768 context', 'Multilingual', 'Code'],
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B',
    description: 'Google open weights running at hardware limit on Groq.',
    badge: 'Google',
    context: '8,192 context',
    tags: ['8,192 context', 'Efficient', 'Instruct'],
  },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;

/**
 * Stream a smart offline answer with simulated Groq-like speed metrics
 */
async function* streamSmartResponse(lastQuery, params, onMeta, model) {
  const startTime = performance.now();
  const answer = generateSmartAnswer(lastQuery, params);
  const words = answer.split(' ');
  let tokenCount = 0;

  // Tiny latency delay to feel natural
  await new Promise((r) => setTimeout(r, 90));

  for (let i = 0; i < words.length; i++) {
    const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
    tokenCount += Math.max(1, Math.round(words[i].length / 4));
    yield chunk;

    const elapsedSec = (performance.now() - startTime) / 1000;
    const tps = elapsedSec > 0 ? (tokenCount / elapsedSec).toFixed(1) : '520';

    if (onMeta) {
      onMeta({
        tokens: tokenCount,
        duration: elapsedSec.toFixed(2),
        tokensPerSecond: tps,
        model: model,
        isLive: false,
      });
    }

    // High throughput simulation (200-500 t/s feel)
    const baseDelay = params?.stream === false ? 0 : 8 + Math.random() * 10;
    await new Promise((r) => setTimeout(r, baseDelay));
  }
}

/**
 * Stream from the real Groq Cloud API
 */
async function streamGroqAPI(messages, model, apiKey, params, onChunk, onMeta, signal) {
  const startTime = performance.now();
  const formattedMessages = [];

  if (params?.systemPrompt?.trim()) {
    formattedMessages.push({ role: 'system', content: params.systemPrompt.trim() });
  }

  formattedMessages.push(
    ...messages.map((m) => ({ role: m.role, content: m.content }))
  );

  const payload = {
    model: model || DEFAULT_MODEL,
    messages: formattedMessages,
    temperature: params?.temperature ?? 0.7,
    top_p: params?.topP ?? 1.0,
    max_tokens: params?.maxTokens ?? 1024,
    stream: true,
  };

  if (params?.stopSequences && params.stopSequences.length > 0) {
    payload.stop = params.stopSequences;
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text();
    let msg = `Groq API Error (${response.status}): `;
    try {
      const errJson = JSON.parse(errText);
      msg += errJson.error?.message || errText;
    } catch {
      msg += errText;
    }
    throw new Error(msg);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let full = '';
  let tokenCount = 0;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') break;

      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            tokenCount += 1;
            onChunk(delta);

            const elapsedSec = (performance.now() - startTime) / 1000;
            const tps = elapsedSec > 0 ? (tokenCount / elapsedSec).toFixed(1) : '600';

            if (onMeta) {
              onMeta({
                tokens: tokenCount,
                duration: elapsedSec.toFixed(2),
                tokensPerSecond: tps,
                model: model,
                isLive: true,
              });
            }
          }
        } catch (e) {
          // ignore chunk parse errors
        }
      }
    }
  }

  return full;
}

/**
 * Main sendMessage function
 */
export async function sendMessage(messages, model, onChunk, signal, params = {}, apiKey = '', onMeta = null) {
  const lastUserMessage = messages[messages.length - 1]?.content ?? '';

  // 1. If Groq API Key is provided, use real Groq API
  if (apiKey && apiKey.trim().length > 5) {
    return await streamGroqAPI(messages, model, apiKey, params, onChunk, onMeta, signal);
  }

  // 2. Otherwise use smart question-answering engine with instant streaming
  let full = '';
  for await (const chunk of streamSmartResponse(lastUserMessage, params, onMeta, model)) {
    if (signal?.aborted) break;
    onChunk(chunk);
    full += chunk;
  }
  return full.trim();
}
