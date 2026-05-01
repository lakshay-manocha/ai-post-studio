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
