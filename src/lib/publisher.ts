import type {
  GeneratedPost,
  LinkedInAuth,
  LinkedInScope,
  LinkedInTarget,
} from "./types";

export const USE_MOCK_PUBLISHER = true;

// ── Storage keys ────────────────────────────────────────────────────────
const SCHEDULED_KEY = "scheduled_posts_v2";
const PUBLISHED_KEY = "published_posts_v2";
const AUTH_KEY = "linkedin_auth_v1";

// ── Records ─────────────────────────────────────────────────────────────

export interface ScheduledPost {
  id: string;
  post: GeneratedPost;
  target: LinkedInTarget;
  /** access_token snapshot taken at scheduling time (real backend would store a ref) */
  user_id: string;
  scheduledFor: number;
  status: "pending" | "published" | "failed";
  publishedAt?: number;
  error?: string;
}

export interface PublishedPost {
  id: string;
  post: GeneratedPost;
  target: LinkedInTarget;
  user_id: string;
  publishedAt: number;
}

// ── Local auth store (frontend mock — real app keeps tokens server-side) ──

export function getStoredAuth(): LinkedInAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as LinkedInAuth) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: LinkedInAuth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event(`${AUTH_KEY}:changed`));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event(`${AUTH_KEY}:changed`));
}

// ── Helpers ─────────────────────────────────────────────────────────────

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

function maskToken(t: string): string {
  if (t.length <= 8) return "••••";
  return `${t.slice(0, 4)}…${t.slice(-4)}`;
}

/**
 * Parse a LinkedIn URL into a tentative URN.
 * - https://www.linkedin.com/in/<slug>/      → urn:li:person:<slug>
 * - https://www.linkedin.com/company/<slug>/ → urn:li:organization:<slug>
 *
 * In production the slug would be exchanged for a real numeric ID via the
 * LinkedIn API. For mock UI purposes the slug is sufficient.
 */
export function resolveUrnFromUrl(url: string): {
  destination: "personal" | "company";
  urn: string;
} | null {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("linkedin.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "in" && parts[1]) {
      return { destination: "personal", urn: `urn:li:person:${parts[1]}` };
    }
    if ((parts[0] === "company" || parts[0] === "school") && parts[1]) {
      return { destination: "company", urn: `urn:li:organization:${parts[1]}` };
    }
    return null;
  } catch {
    return null;
  }
}

/** Required scope for a given destination kind. */
function requiredScope(target: LinkedInTarget): LinkedInScope {
  return target.destination === "personal" ? "w_member_social" : "w_organization_social";
}

// ── Validation ──────────────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validatePublishRequest(
  target: LinkedInTarget,
  auth: LinkedInAuth | null,
): ValidationResult {
  const errors: string[] = [];

  if (!auth?.access_token) errors.push("Missing access_token. Connect LinkedIn in Settings.");
  if (!auth?.user_id) errors.push("Missing user_id. Connect LinkedIn in Settings.");

  const hasPerson = !!target.linkedin_person_urn;
  const hasOrg = !!target.linkedin_organization_urn;
  if (!hasPerson && !hasOrg) errors.push("No URN provided. Select a destination.");
  if (hasPerson && hasOrg) errors.push("Provide exactly one URN, not both.");
  if (!target.target_page_url?.trim()) errors.push("LinkedIn page URL is required.");

  if (auth) {
    const need = requiredScope(target);
    if (!auth.scopes.includes(need)) {
      errors.push(`Missing OAuth scope: ${need}.`);
    }
  }

  return { ok: errors.length === 0, errors };
}

// ── Queries ─────────────────────────────────────────────────────────────

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

// ── LinkedIn API adapter (mock) ─────────────────────────────────────────

async function callLinkedInApi(
  post: GeneratedPost,
  target: LinkedInTarget,
  auth: LinkedInAuth,
): Promise<void> {
  const endpoint =
    target.destination === "personal"
      ? "POST https://api.linkedin.com/v2/ugcPosts (w_member_social)"
      : "POST https://api.linkedin.com/v2/ugcPosts (w_organization_social)";

  const urn = target.linkedin_person_urn ?? target.linkedin_organization_urn;
  console.info("[linkedin-adapter]", {
    endpoint,
    urn,
    user_id: auth.user_id,
    access_token: maskToken(auth.access_token),
    scopes: auth.scopes,
    chars: post.content.length,
  });

  if (!USE_MOCK_PUBLISHER) {
    // Real backend call would go here, e.g.:
    // await api.post("/linkedin/publish", { post, target, /* token resolved server-side */ });
  }
  await new Promise((r) => setTimeout(r, 1100));
}

// ── Public API ──────────────────────────────────────────────────────────

export async function publishNow(
  post: GeneratedPost,
  target: LinkedInTarget,
  auth: LinkedInAuth | null = getStoredAuth(),
): Promise<PublishedPost> {
  const v = validatePublishRequest(target, auth);
  if (!v.ok || !auth) throw new Error(v.errors.join(" "));

  await callLinkedInApi(post, target, auth);

  const record: PublishedPost = {
    id: `pub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    post,
    target,
    user_id: auth.user_id,
    publishedAt: Date.now(),
  };
  write(PUBLISHED_KEY, [record, ...read<PublishedPost>(PUBLISHED_KEY)]);
  return record;
}

export function schedulePost(
  post: GeneratedPost,
  target: LinkedInTarget,
  scheduledFor: number,
  auth: LinkedInAuth | null = getStoredAuth(),
): ScheduledPost {
  const v = validatePublishRequest(target, auth);
  if (!v.ok || !auth) throw new Error(v.errors.join(" "));

  const record: ScheduledPost = {
    id: `sch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    post,
    target,
    user_id: auth.user_id,
    scheduledFor,
    status: "pending",
  };
  setScheduled([...read<ScheduledPost>(SCHEDULED_KEY), record]);
  console.info("[publisher] scheduled", {
    id: record.id,
    user_id: auth.user_id,
    urn: target.linkedin_person_urn ?? target.linkedin_organization_urn,
    when: new Date(scheduledFor).toISOString(),
  });
  return record;
}

// ── Background scheduler ────────────────────────────────────────────────

let workerStarted = false;
export function startScheduler() {
  if (workerStarted || typeof window === "undefined") return;
  workerStarted = true;
  const tick = async () => {
    const now = Date.now();
    const all = read<ScheduledPost>(SCHEDULED_KEY);
    const due = all.filter((s) => s.status === "pending" && s.scheduledFor <= now);
    if (due.length === 0) return;
    const auth = getStoredAuth();
    for (const item of due) {
      try {
        if (!auth) throw new Error("LinkedIn auth missing at publish time.");
        await callLinkedInApi(item.post, item.target, auth);
        item.status = "published";
        item.publishedAt = Date.now();
        const pubs = read<PublishedPost>(PUBLISHED_KEY);
        write(PUBLISHED_KEY, [
          {
            id: `pub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            post: item.post,
            target: item.target,
            user_id: item.user_id,
            publishedAt: item.publishedAt,
          },
          ...pubs,
        ]);
      } catch (e) {
        item.status = "failed";
        item.error = e instanceof Error ? e.message : "Unknown error";
      }
    }
    setScheduled(all);
  };
  void tick();
  window.setInterval(() => void tick(), 10_000);
}
