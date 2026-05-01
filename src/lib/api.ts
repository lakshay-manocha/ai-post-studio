import axios from "axios";
import { runMockGeneration, type StepEvent } from "./mock-generator";
import type { GenerateOptions, GeneratedPost } from "./types";

// Flip to false once your LangGraph backend is live.
export const USE_MOCK = true;

export function getApiBase(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("api_base_url") ?? "";
}

export const api = axios.create();
api.interceptors.request.use((config) => {
  const base = getApiBase();
  if (base) config.baseURL = base;
  return config;
});

export async function generatePost(
  opts: GenerateOptions,
  onStep: (e: StepEvent) => void,
): Promise<GeneratedPost> {
  if (USE_MOCK || !getApiBase()) {
    return runMockGeneration(opts, onStep);
  }
  const { data } = await api.post<GeneratedPost>("/generate-post", opts);
  return data;
}

export async function fetchHistory(): Promise<GeneratedPost[]> {
  if (USE_MOCK || !getApiBase()) return [];
  const { data } = await api.get<GeneratedPost[]>("/history");
  return data;
}

export async function deletePost(id: string): Promise<void> {
  if (USE_MOCK || !getApiBase()) return;
  await api.delete(`/post/${id}`);
}
