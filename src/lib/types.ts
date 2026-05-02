export type AgentName = "research" | "draft" | "critic" | "formatter";

export type AgentStatus = "pending" | "running" | "done" | "error";

export interface AgentStep {
  name: AgentName;
  label: string;
  status: AgentStatus;
  log?: string;
}

export type Tone = "professional" | "casual" | "thought-leader";
export type Length = "short" | "medium" | "long";

export interface GenerateOptions {
  topic: string;
  tone: Tone;
  length: Length;
}

export interface GeneratedPost {
  id: string;
  topic: string;
  tone: Tone;
  length: Length;
  content: string;
  hashtags: string[];
  qualityScore: number;
  createdAt: number;
}

// ── LinkedIn auth & target ──────────────────────────────────────────────

export type LinkedInScope = "w_member_social" | "w_organization_social" | "r_liteprofile";

export type DestinationKind = "personal" | "company";

/**
 * Resolved publishing target. Exactly ONE of the URN fields is set,
 * matching the destination kind.
 */
export interface LinkedInTarget {
  destination: DestinationKind;
  /** Full LinkedIn page/profile URL — UI only, never sent to LinkedIn */
  target_page_url: string;
  /** urn:li:person:xxxx — set when destination === "personal" */
  linkedin_person_urn?: string;
  /** urn:li:organization:xxxx — set when destination === "company" */
  linkedin_organization_urn?: string;
}

/** Auth context required by the publisher service. */
export interface LinkedInAuth {
  access_token: string;
  user_id: string;
  scopes: LinkedInScope[];
}
