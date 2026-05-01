import type { GeneratedPost } from "./types";

const KEY = "post_history_v1";

export function loadHistory(): GeneratedPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GeneratedPost[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(posts: GeneratedPost[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event("history:changed"));
}

export function addToHistory(post: GeneratedPost): void {
  const all = loadHistory();
  saveHistory([post, ...all.filter((p) => p.id !== post.id)].slice(0, 50));
}

export function removeFromHistory(id: string): void {
  saveHistory(loadHistory().filter((p) => p.id !== id));
}

export function clearHistory(): void {
  saveHistory([]);
}
