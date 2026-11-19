/**
 * Local storage utilities for chat history persistence.
 */

const STORAGE_KEY = 'nexusai_conversations';
const THEME_KEY = 'nexusai_theme';
const MODEL_KEY = 'nexusai_model';
const API_KEY_KEY = 'nexusai_groq_api_key';

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Quota exceeded — silently ignore
  }
}

export function createConversation(firstMessage = '') {
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: firstMessage ? firstMessage.slice(0, 50) : 'New conversation',
    messages: [],
    model: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) ?? 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

// ---------------------------------------------------------------------------
// Model preference
// ---------------------------------------------------------------------------

export function loadModel() {
  return localStorage.getItem(MODEL_KEY) ?? null;
}

export function saveModel(modelId) {
  localStorage.setItem(MODEL_KEY, modelId);
}

// ---------------------------------------------------------------------------
// Groq API Key (stored locally in user's browser only)
// ---------------------------------------------------------------------------

export function loadApiKey() {
  return localStorage.getItem(API_KEY_KEY) ?? '';
}

export function saveApiKey(key) {
  if (key) {
    localStorage.setItem(API_KEY_KEY, key);
  } else {
    localStorage.removeItem(API_KEY_KEY);
  }
}
