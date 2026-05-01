import type { AgentName, GenerateOptions, GeneratedPost } from "./types";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const HOOKS = [
  "Here's something nobody talks about:",
  "I used to believe this was optional. I was wrong.",
  "After 7 years in this space, one lesson stands out:",
  "Stop scrolling. This will save you weeks.",
  "The uncomfortable truth about",
];

const CLOSERS = [
  "What's your take? 👇",
  "Curious how others approach this.",
  "Save this for later — you'll thank yourself.",
  "Agree or disagree? Let's discuss.",
];

const HASHTAG_POOL = [
  "AI", "LinkedIn", "Productivity", "Leadership", "Career",
  "Innovation", "Startup", "BuildInPublic", "GrowthMindset",
  "Tech", "FutureOfWork", "PersonalBrand",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildBody(topic: string, tone: GenerateOptions["tone"], length: GenerateOptions["length"]): string {
  const bullets = [
    `→ ${topic} isn't a trend — it's a shift.`,
    `→ The teams winning right now treat ${topic} as a daily practice, not a quarterly goal.`,
    `→ Small reps > big launches. Consistency compounds.`,
    `→ Tools matter less than the mental model behind them.`,
    `→ Share what you learn publicly. Feedback is the fastest tutor.`,
  ];

  const toneLine =
    tone === "casual"
      ? "Honestly? It took me way too long to figure this out. 😅"
      : tone === "thought-leader"
        ? "The next decade belongs to those who internalize this shift early."
        : "Three observations from working alongside teams adopting this:";

  const count = length === "short" ? 2 : length === "medium" ? 3 : 5;
  const selected = bullets.slice(0, count).join("\n");

  return `${pick(HOOKS)} ${topic}.\n\n${toneLine}\n\n${selected}\n\n${pick(CLOSERS)}`;
}

function topicHashtags(topic: string): string[] {
  const fromTopic = topic
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);
  const extras = [...HASHTAG_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  return Array.from(new Set([...fromTopic, ...extras])).slice(0, 5);
}

export type StepEvent = { agent: AgentName; status: "running" | "done"; log?: string };

export async function runMockGeneration(
  opts: GenerateOptions,
  onStep: (e: StepEvent) => void,
): Promise<GeneratedPost> {
  const stages: { agent: AgentName; log: string; ms: number }[] = [
    { agent: "research", log: `Gathering signals on "${opts.topic}"…`, ms: 1100 },
    { agent: "draft", log: "Writing first draft with chosen tone…", ms: 1300 },
    { agent: "critic", log: "Scoring clarity, hook strength, and cadence…", ms: 1000 },
    { agent: "formatter", log: "Polishing for LinkedIn formatting…", ms: 800 },
  ];

  for (const s of stages) {
    onStep({ agent: s.agent, status: "running", log: s.log });
    await wait(s.ms);
    onStep({ agent: s.agent, status: "done", log: s.log });
  }

  const content = buildBody(opts.topic, opts.tone, opts.length);
  const hashtags = topicHashtags(opts.topic);
  const qualityScore = Math.floor(78 + Math.random() * 18);

  return {
    id: crypto.randomUUID(),
    topic: opts.topic,
    tone: opts.tone,
    length: opts.length,
    content,
    hashtags,
    qualityScore,
    createdAt: Date.now(),
  };
}
