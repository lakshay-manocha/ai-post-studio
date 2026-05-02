import type { GeneratedPost } from "./types";

export const USE_MOCK_PUBLISHER = true;

export type Platform = "linkedin-profile" | "linkedin-company";

export interface ScheduledPost {
  id: string;
  post: GeneratedPost;
  scheduledFor: number; // epoch ms
  platform: Platform;
  status: "pending" | "published" | "failed";
  publishedAt?: number;
  error?: string;
}

export interface PublishedPost {
  id: string;
  post: GeneratedPost;
  platform: Platform;
  publishedAt: number;
}

const SCHEDULED_KEY = "scheduled_posts_v1";
const PUBLISHED_KEY = "published_posts_v1";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(`${key}:changed`));
}

export function getScheduledPosts(): ScheduledPost[] {
  return read<ScheduledPost>(SCHEDULED_KEY).sort((a, b) => a.scheduledFor - b.scheduledFor);
}

export function getPublishedPosts(): PublishedPost[] {
  return read<PublishedPost>(PUBLISHED_KEY).sort((a, b) => b.publishedAt - a.publishedAt);
}

export function removeScheduled(id: string) {
  write(SCHEDULED_KEY, read<ScheduledPost>(SCHEDULED_KEY).filter((s) => s.id !== id));
}

function setScheduled(items: ScheduledPost[]) {
  write(SCHEDULED_KEY, items);
}

export async function publishNow(
  post: GeneratedPost,
  platform: Platform = "linkedin-profile",
): Promise<PublishedPost> {
  if (!USE_MOCK_PUBLISHER) {
    // Real backend would go here:
    // await api.post("/publish", { post, platform });
  }
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 1200));

  const record: PublishedPost = {
    id: `pub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    post,
    platform,
    publishedAt: Date.now(),
  };
  const all = read<PublishedPost>(PUBLISHED_KEY);
  write(PUBLISHED_KEY, [record, ...all]);
  console.info("[publisher] published", record);
  return record;
}

export function schedulePost(
  post: GeneratedPost,
  scheduledFor: number,
  platform: Platform = "linkedin-profile",
): ScheduledPost {
  const record: ScheduledPost = {
    id: `sch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    post,
    scheduledFor,
    platform,
    status: "pending",
  };
  setScheduled([...read<ScheduledPost>(SCHEDULED_KEY), record]);
  console.info("[publisher] scheduled", record);
  return record;
}

// Background worker — runs every 10s, publishes due posts.
let workerStarted = false;
export function startScheduler() {
  if (workerStarted || typeof window === "undefined") return;
  workerStarted = true;
  const tick = async () => {
    const now = Date.now();
    const all = read<ScheduledPost>(SCHEDULED_KEY);
    const due = all.filter((s) => s.status === "pending" && s.scheduledFor <= now);
    if (due.length === 0) return;
    for (const item of due) {
      try {
        await publishNow(item.post, item.platform);
        item.status = "published";
        item.publishedAt = Date.now();
      } catch (e) {
        item.status = "failed";
        item.error = e instanceof Error ? e.message : "Unknown error";
      }
    }
    setScheduled(all);
  };
  // Initial run + interval
  void tick();
  window.setInterval(() => void tick(), 10_000);
}
