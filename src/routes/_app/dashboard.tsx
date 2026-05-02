import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentPipeline } from "@/components/agent-pipeline";
import { PostCard } from "@/components/post-card";
import { PublishPanel } from "@/components/publish-panel";
import { generatePost } from "@/lib/api";
import { addToHistory } from "@/lib/history";
import type { AgentName, AgentStep, GeneratedPost, Length, Tone } from "@/lib/types";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Postwright" },
      { name: "description", content: "Generate LinkedIn posts with a multi-agent AI pipeline." },
    ],
  }),
  component: Dashboard,
});

const INITIAL_STEPS: AgentStep[] = [
  { name: "research", label: "Research Agent", status: "pending" },
  { name: "draft", label: "Draft Agent", status: "pending" },
  { name: "critic", label: "Critic Agent", status: "pending" },
  { name: "formatter", label: "Formatter", status: "pending" },
];

function Dashboard() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");
  const [steps, setSteps] = useState<AgentStep[]>(INITIAL_STEPS);
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [generating, setGenerating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("default_tone") as Tone | null;
    const savedLen = localStorage.getItem("default_length") as Length | null;
    if (saved) setTone(saved);
    if (savedLen) setLength(savedLen);
  }, []);

  const updateStep = (name: AgentName, status: AgentStep["status"], log?: string) => {
    setSteps((prev) => prev.map((s) => (s.name === name ? { ...s, status, log: log ?? s.log } : s)));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    setGenerating(true);
    setPost(null);
    setSteps(INITIAL_STEPS);

    try {
      const result = await generatePost(
        { topic: topic.trim(), tone, length },
        ({ agent, status, log }) => updateStep(agent, status, log),
      );
      setPost(result);
      addToHistory(result);
      toast.success("Post generated");
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      toast.error("Generation failed. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe a topic. The agent pipeline takes care of the rest.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left: input + result */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight">New post</h2>
            </div>

            <Label htmlFor="topic" className="text-xs font-medium text-muted-foreground">
              Topic
            </Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Why most AI agent demos fail in production"
              className="mt-1.5 min-h-[88px] resize-none"
              disabled={generating}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as Tone)} disabled={generating}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="thought-leader">Thought leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Length</Label>
                <Select
                  value={length}
                  onValueChange={(v) => setLength(v as Length)}
                  disabled={generating}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="mt-5 w-full shadow-elegant sm:w-auto"
              size="lg"
            >
              <Wand2 className="mr-1.5 h-4 w-4" />
              {generating ? "Generating…" : "Generate post"}
            </Button>
          </div>

          <div ref={resultRef}>
            <AnimatePresence mode="wait">
              {generating && !post && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-border/60 bg-card p-5"
                >
                  <Skeleton className="h-4 w-1/3" />
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-11/12" />
                    <Skeleton className="h-3 w-10/12" />
                    <Skeleton className="h-3 w-9/12" />
                  </div>
                </motion.div>
              )}
              {post && (
                <PostCard
                  key={post.id}
                  post={post}
                  generating={generating}
                  onRegenerate={handleGenerate}
                />
              )}
            </AnimatePresence>
            {post && <PublishPanel key={`pub-${post.id}`} post={post} />}
          </div>
        </div>

        {/* Right: pipeline */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <AgentPipeline steps={steps} />
        </div>
      </div>
    </div>
  );
}
