import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clapperboard,
  Film,
  Cpu,
  Workflow,
  Wand2,
  Mic,
  Play,
  Pause,
  Download,
  Share2,
  Upload,
  Server,
  Gauge,
  ListChecks,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Circle,
  Sparkles,
  Volume2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/commercial")({
  head: () => ({
    meta: [
      { title: "Commercial Studio · Postwright" },
      { name: "description", content: "AI-powered cinematic commercial generation studio." },
    ],
  }),
  component: CommercialPage,
});

// ────────────────────────────────────────────────────────────────────────────
// Types

type Scene = {
  id: string;
  title: string;
  shot: string;
  prompt: string;
  narration: string;
  durationSec: number;
  status: "idle" | "queued" | "rendering" | "done";
};

type PipelineStage = {
  key: string;
  label: string;
  status: "pending" | "running" | "done";
};

const VOICES = ["Aria — warm female", "Atlas — cinematic male", "Nova — bright female", "Echo — neutral"];

const PIPELINE_STAGES: PipelineStage[] = [
  { key: "prompt", label: "Prompt", status: "pending" },
  { key: "scene", label: "Scene Planning", status: "pending" },
  { key: "comfy", label: "ComfyUI Generation", status: "pending" },
  { key: "narration", label: "Narration", status: "pending" },
  { key: "tts", label: "TTS", status: "pending" },
  { key: "render", label: "Rendering", status: "pending" },
  { key: "final", label: "Final Commercial", status: "pending" },
];

// ────────────────────────────────────────────────────────────────────────────

function CommercialPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
            <Clapperboard className="h-3 w-3 text-primary" />
            Commercial Studio
            <span className="ml-1 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            AI Commercial Generator
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan, generate and render cinematic ads from a single prompt.
          </p>
        </div>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="generator">
            <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Generator
          </TabsTrigger>
          <TabsTrigger value="comfy">
            <Cpu className="mr-1.5 h-3.5 w-3.5" /> ComfyUI
          </TabsTrigger>
          <TabsTrigger value="studio">
            <Film className="mr-1.5 h-3.5 w-3.5" /> Studio
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <Workflow className="mr-1.5 h-3.5 w-3.5" /> Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <GeneratorPanel />
        </TabsContent>
        <TabsContent value="comfy">
          <ComfyPanel />
        </TabsContent>
        <TabsContent value="studio">
          <StudioPanel />
        </TabsContent>
        <TabsContent value="pipeline">
          <PipelinePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Generator ───────────────────────────────────────────────────────────────

function GeneratorPanel() {
  const [prompt, setPrompt] = useState("");
  const [voice, setVoice] = useState(VOICES[0]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [logs]);

  const pushLog = (l: string) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${l}`]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Describe your product first");
      return;
    }
    setGenerating(true);
    setScenes([]);
    setLogs([]);
    setProgress(0);

    const steps = [
      "Parsing brand brief…",
      "Drafting story beats…",
      "Allocating cinematic shots…",
      "Composing scene prompts…",
      "Synthesising narration draft…",
      "Storyboard ready.",
    ];
    for (let i = 0; i < steps.length; i++) {
      await sleep(450 + Math.random() * 300);
      pushLog(steps[i]);
      setProgress(Math.round(((i + 1) / steps.length) * 100));
    }

    const planned: Scene[] = [
      {
        id: crypto.randomUUID(),
        title: "Opening hook",
        shot: "Wide establishing · golden hour",
        prompt: `Cinematic wide shot introducing ${prompt}, dramatic light, 35mm`,
        narration: `Meet the next chapter of ${prompt}.`,
        durationSec: 4,
        status: "idle",
      },
      {
        id: crypto.randomUUID(),
        title: "Problem",
        shot: "Close-up · soft focus",
        prompt: `Close-up showing the pain point ${prompt} solves`,
        narration: "Every day, the same friction.",
        durationSec: 5,
        status: "idle",
      },
      {
        id: crypto.randomUUID(),
        title: "Reveal",
        shot: "Dolly in · neon rim",
        prompt: `Hero reveal of ${prompt} with confident product hero shot`,
        narration: "Until now.",
        durationSec: 4,
        status: "idle",
      },
      {
        id: crypto.randomUUID(),
        title: "Call to action",
        shot: "Logo lockup · subtle particles",
        prompt: `Logo lockup, cinematic particles, premium SaaS feel`,
        narration: "Move faster. Ship cinema.",
        durationSec: 3,
      status: "idle",
      },
    ];
    setScenes(planned);
    setGenerating(false);
    toast.success("Storyboard generated");
  };

  const updateScene = (id: string, patch: Partial<Scene>) =>
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const removeScene = (id: string) => setScenes((prev) => prev.filter((s) => s.id !== id));

  const addScene = () =>
    setScenes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: `Scene ${prev.length + 1}`,
        shot: "Medium shot",
        prompt: "",
        narration: "",
        durationSec: 4,
        status: "idle",
      },
    ]);

  const renderAll = async () => {
    if (scenes.length === 0) return;
    for (const s of scenes) {
      updateScene(s.id, { status: "queued" });
    }
    for (const s of scenes) {
      updateScene(s.id, { status: "rendering" });
      pushLog(`Rendering ${s.title}…`);
      await sleep(600 + Math.random() * 500);
      updateScene(s.id, { status: "done" });
    }
    pushLog("All scenes rendered.");
    toast.success("Render complete");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <CinematicCard>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold tracking-tight">Brand brief</h2>
          </div>
          <Label className="text-xs text-muted-foreground">Describe your startup or product</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Roar AI — an autonomous content studio that turns a single prompt into a finished commercial."
            disabled={generating}
            className="mt-1.5 min-h-[100px] resize-none"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Voice</Label>
              <Select value={voice} onValueChange={setVoice} disabled={generating}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                size="lg"
                className="w-full shadow-elegant"
              >
                <Wand2 className="mr-1.5 h-4 w-4" />
                {generating ? "Planning…" : "Generate storyboard"}
              </Button>
            </div>
          </div>

          {generating && (
            <div className="mt-4">
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </CinematicCard>

        {scenes.length > 0 && (
          <CinematicCard>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                <h2 className="font-display text-sm font-semibold tracking-tight">
                  Storyboard · {scenes.length} scenes
                </h2>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={addScene}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Scene
                </Button>
                <Button size="sm" onClick={renderAll}>
                  <Play className="mr-1 h-3.5 w-3.5" /> Render all
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {scenes.map((s, i) => (
                <SceneCard
                  key={s.id}
                  scene={s}
                  index={i}
                  onChange={(patch) => updateScene(s.id, patch)}
                  onRemove={() => removeScene(s.id)}
                />
              ))}
            </div>
          </CinematicCard>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold tracking-tight">AI logs</h3>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> live
            </span>
          </div>
          <div
            ref={logRef}
            className="h-72 overflow-y-auto rounded-lg border border-border/60 bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground"
          >
            {logs.length === 0 ? (
              <p className="opacity-60">Awaiting prompt…</p>
            ) : (
              logs.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {l}
                </motion.div>
              ))
            )}
          </div>
        </div>
        <RenderStatus scenes={scenes} />
      </aside>
    </div>
  );
}

function SceneCard({
  scene,
  index,
  onChange,
  onRemove,
}: {
  scene: Scene;
  index: number;
  onChange: (patch: Partial<Scene>) => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/60 p-4 shadow-sm transition hover:shadow-elegant"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 font-mono text-[10px] text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Input
            value={scene.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="h-7 border-0 bg-transparent px-1 text-sm font-semibold focus-visible:ring-1"
          />
        </div>
        <div className="flex items-center gap-1">
          <SceneStatusBadge status={scene.status} />
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground" onClick={onRemove}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="mb-3 aspect-video overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br from-muted via-background to-muted">
        <div className="relative flex h-full w-full items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          {scene.status === "rendering" && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          )}
          <span className="absolute bottom-1.5 left-2 rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground backdrop-blur">
            {scene.shot}
          </span>
        </div>
      </div>

      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Prompt</Label>
      <Textarea
        value={scene.prompt}
        onChange={(e) => onChange({ prompt: e.target.value })}
        className="mb-2 mt-1 min-h-[52px] resize-none text-xs"
      />
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Narration</Label>
      <Textarea
        value={scene.narration}
        onChange={(e) => onChange({ narration: e.target.value })}
        className="mt-1 min-h-[44px] resize-none text-xs"
      />

      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Duration</span>
        <Slider
          value={[scene.durationSec]}
          min={2}
          max={10}
          step={1}
          onValueChange={([v]) => onChange({ durationSec: v })}
          className="flex-1"
        />
        <span className="w-8 text-right font-mono text-[11px] tabular-nums">{scene.durationSec}s</span>
      </div>
    </motion.div>
  );
}

function SceneStatusBadge({ status }: { status: Scene["status"] }) {
  const map = {
    idle: { text: "Idle", cls: "bg-muted text-muted-foreground" },
    queued: { text: "Queued", cls: "bg-accent text-accent-foreground" },
    rendering: { text: "Rendering", cls: "bg-primary/15 text-primary" },
    done: { text: "Done", cls: "bg-success/15 text-success" },
  } as const;
  const m = map[status];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide", m.cls)}>
      {m.text}
    </span>
  );
}

function RenderStatus({ scenes }: { scenes: Scene[] }) {
  const total = scenes.length;
  const done = scenes.filter((s) => s.status === "done").length;
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold tracking-tight">Render status</h3>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {done}/{total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {total === 0 ? "No scenes yet." : done === total ? "All scenes ready to export." : "Processing…"}
      </p>
    </div>
  );
}

// ── ComfyUI ─────────────────────────────────────────────────────────────────

function ComfyPanel() {
  const [workflow, setWorkflow] = useState<string>("");
  const [valid, setValid] = useState<null | boolean>(null);
  const [queue, setQueue] = useState<{ id: string; name: string; status: "queued" | "running" | "done" }[]>([
    { id: "j-101", name: "hero_shot.json", status: "done" },
    { id: "j-102", name: "scene_02_dolly.json", status: "running" },
    { id: "j-103", name: "logo_lockup.json", status: "queued" },
  ]);
  const [gallery] = useState<string[]>(["scn-01", "scn-02", "scn-03", "scn-04", "scn-05", "scn-06"]);

  const validate = () => {
    try {
      const parsed = JSON.parse(workflow);
      setValid(typeof parsed === "object" && parsed !== null);
      toast.success("Workflow valid");
    } catch {
      setValid(false);
      toast.error("Invalid JSON");
    }
  };

  const enqueue = () => {
    setQueue((q) => [...q, { id: `j-${100 + q.length + 1}`, name: "custom_workflow.json", status: "queued" }]);
    toast.success("Job queued");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <CinematicCard>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight">Workflow JSON</h2>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={validate}>
                <ListChecks className="mr-1 h-3.5 w-3.5" /> Validate
              </Button>
              <Button size="sm" onClick={enqueue} disabled={!valid}>
                <Upload className="mr-1 h-3.5 w-3.5" /> Inject & queue
              </Button>
            </div>
          </div>
          <Textarea
            value={workflow}
            onChange={(e) => {
              setWorkflow(e.target.value);
              setValid(null);
            }}
            placeholder={`{\n  "nodes": [],\n  "links": []\n}`}
            className="min-h-[220px] resize-none font-mono text-xs"
          />
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            {valid === null && <span className="text-muted-foreground">Awaiting validation</span>}
            {valid === true && (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3 w-3" /> Schema OK · prompt injection ready
              </span>
            )}
            {valid === false && (
              <span className="flex items-center gap-1 text-destructive">
                <Circle className="h-3 w-3" /> Invalid workflow
              </span>
            )}
          </div>
        </CinematicCard>

        <CinematicCard>
          <div className="mb-4 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold tracking-tight">Output gallery</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((g, i) => (
              <motion.div
                key={g}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-muted via-background to-muted"
              >
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/80 px-2 py-1 text-[10px] backdrop-blur">
                  <span className="font-mono">{g}</span>
                  <Download className="h-3 w-3 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </CinematicCard>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <h3 className="mb-3 font-display text-sm font-semibold tracking-tight">Server status</h3>
          <div className="space-y-3">
            <StatusRow icon={<Server className="h-3.5 w-3.5" />} label="ComfyUI" value="Connected" tone="success" />
            <StatusRow icon={<Gauge className="h-3.5 w-3.5" />} label="GPU" value="RTX 4090 · 72%" tone="primary" />
            <StatusRow icon={<Workflow className="h-3.5 w-3.5" />} label="Queue depth" value={`${queue.length} jobs`} tone="muted" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <h3 className="mb-3 font-display text-sm font-semibold tracking-tight">Queue</h3>
          <ul className="space-y-2">
            {queue.map((j) => (
              <li
                key={j.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  {j.status === "running" ? (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  ) : j.status === "done" ? (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="font-mono">{j.name}</span>
                </div>
                <Badge variant="secondary" className="text-[9px] uppercase">
                  {j.status}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "success" | "primary" | "muted";
}) {
  const cls =
    tone === "success"
      ? "text-success bg-success/15"
      : tone === "primary"
      ? "text-primary bg-primary/15"
      : "text-muted-foreground bg-muted";
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", cls)}>{icon}</span>
        {label}
      </span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

// ── Studio ──────────────────────────────────────────────────────────────────

function StudioPanel() {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const total = 16;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTime((t) => {
        if (t >= total) {
          setPlaying(false);
          return total;
        }
        return t + 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  const segments = [
    { label: "Opening", dur: 4, color: "from-primary to-primary-glow" },
    { label: "Problem", dur: 5, color: "from-accent to-primary" },
    { label: "Reveal", dur: 4, color: "from-primary-glow to-primary" },
    { label: "CTA", dur: 3, color: "from-primary to-accent" },
  ];

  return (
    <div className="space-y-6">
      <CinematicCard>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold tracking-tight">Preview</h2>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Share2 className="mr-1 h-3.5 w-3.5" /> Share
            </Button>
            <Button size="sm">
              <Download className="mr-1 h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-xl border border-border/60 bg-black">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/40 to-accent/20" />
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_30%,white_0,transparent_50%)]" />
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/50"
              initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: 0 }}
              animate={{ y: ["100%", "-10%"], opacity: [0, 0.8, 0] }}
              transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/25"
            >
              {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
            </button>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-[11px] text-white/80">
            <span className="font-mono tabular-nums">{time.toFixed(1)}s</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-white/80" style={{ width: `${(time / total) * 100}%` }} />
            </div>
            <span className="font-mono tabular-nums">{total}s</span>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">Timeline</h3>
          <div className="flex h-10 overflow-hidden rounded-lg border border-border/60">
            {segments.map((s) => (
              <div
                key={s.label}
                style={{ flex: s.dur }}
                className={cn("relative flex items-center justify-center bg-gradient-to-r text-[10px] font-medium text-primary-foreground", s.color)}
              >
                {s.label}
              </div>
            ))}
          </div>
          <h3 className="mb-2 mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Volume2 className="h-3 w-3" /> Audio waveform
          </h3>
          <div className="flex h-12 items-center gap-[2px] rounded-lg border border-border/60 bg-muted/40 px-2">
            {Array.from({ length: 80 }).map((_, i) => {
              const h = 20 + Math.abs(Math.sin(i * 0.6)) * 70 + (i % 7) * 4;
              return (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-primary/60"
                  style={{ height: `${Math.min(h, 90)}%` }}
                />
              );
            })}
          </div>
        </div>
      </CinematicCard>

      <CinematicCard>
        <div className="mb-3 flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold tracking-tight">Render history</h2>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Project</th>
                <th className="px-3 py-2 text-left">Duration</th>
                <th className="px-3 py-2 text-left">Voice</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {[
                { p: "Roar AI launch", d: "16s", v: "Atlas", s: "Done" },
                { p: "Series A teaser", d: "22s", v: "Aria", s: "Done" },
                { p: "Product hunt cut", d: "9s", v: "Nova", s: "Rendering" },
              ].map((r) => (
                <tr key={r.p} className="border-t border-border/60">
                  <td className="px-3 py-2 font-medium">{r.p}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{r.d}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.v}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[9px] uppercase",
                        r.s === "Rendering" && "bg-primary/15 text-primary",
                        r.s === "Done" && "bg-success/15 text-success",
                      )}
                    >
                      {r.s}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CinematicCard>
    </div>
  );
}

// ── Pipeline ────────────────────────────────────────────────────────────────

function PipelinePanel() {
  const [stages, setStages] = useState<PipelineStage[]>(PIPELINE_STAGES);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setStages(PIPELINE_STAGES.map((s) => ({ ...s, status: "pending" })));
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)));
      await sleep(700);
      setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s)));
    }
    setRunning(false);
    toast.success("Pipeline complete");
  };

  return (
    <CinematicCard>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold tracking-tight">Pipeline visualisation</h2>
        </div>
        <Button size="sm" onClick={run} disabled={running}>
          <Play className="mr-1 h-3.5 w-3.5" />
          {running ? "Running…" : "Simulate run"}
        </Button>
      </div>

      <div className="relative overflow-x-auto pb-4">
        <div className="flex min-w-max items-center gap-3">
          {stages.map((s, i) => (
            <div key={s.key} className="flex items-center gap-3">
              <StageNode stage={s} index={i} />
              {i < stages.length - 1 && <Connector active={s.status === "done"} />}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricTile label="Active GPUs" value="2" tone="primary" />
        <MetricTile label="Tokens / s" value="184" tone="success" />
        <MetricTile label="ETA" value={running ? "~5s" : "Idle"} tone="muted" />
      </div>
    </CinematicCard>
  );
}

function StageNode({ stage, index }: { stage: PipelineStage; index: number }) {
  const isDone = stage.status === "done";
  const isRunning = stage.status === "running";
  return (
    <motion.div
      layout
      className={cn(
        "relative flex w-36 flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center shadow-sm transition",
        isDone && "border-success/40",
        isRunning && "border-primary/50 shadow-glow",
        !isDone && !isRunning && "border-border/60",
      )}
    >
      {isRunning && (
        <motion.span
          className="absolute inset-0 rounded-xl border border-primary/40"
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full font-mono text-[11px]",
          isDone && "bg-success/15 text-success",
          isRunning && "bg-primary/15 text-primary",
          !isDone && !isRunning && "bg-muted text-muted-foreground",
        )}
      >
        {isDone ? <CheckCircle2 className="h-4 w-4" /> : isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : index + 1}
      </div>
      <div className="text-xs font-medium leading-tight">{stage.label}</div>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wide",
          isDone && "bg-success/15 text-success",
          isRunning && "bg-primary/15 text-primary",
          !isDone && !isRunning && "bg-muted text-muted-foreground",
        )}
      >
        {stage.status}
      </span>
    </motion.div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className="relative h-px w-10 overflow-hidden bg-border">
      <AnimatePresence>
        {active && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-primary to-primary-glow"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricTile({ label, value, tone }: { label: string; value: string; tone: "primary" | "success" | "muted" }) {
  const cls =
    tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-2xl font-semibold tabular-nums", cls)}>{value}</div>
    </div>
  );
}

// ── Shared ──────────────────────────────────────────────────────────────────

function CinematicCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      {children}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
