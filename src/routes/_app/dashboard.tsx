import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Clapperboard,
  ArrowRight,
  Brain,
  Workflow,
  MessageSquare,
  Globe,
  Cloud,
  LineChart,
  GraduationCap,
  Handshake,
} from "lucide-react";
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
      {/* Hero / welcome */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            RoarAI Systems · Intelligent AI Solutions
          </div>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Build Intelligent Automation with{" "}
            <span className="text-gradient">RoarAI Systems</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            AI-powered software, workflow automation, cinematic AI content generation, and scalable
            digital solutions.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="shadow-elegant">
              <Link to="/commercial">
                <Clapperboard className="mr-1.5 h-4 w-4" />
                Launch Commercial Studio
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/scheduled">
                Explore AI Automation <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Commercial Studio quick-access */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mb-8"
      >
        <Link
          to="/commercial"
          className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:shadow-elegant"
        >
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Clapperboard className="h-5 w-5 text-primary-foreground" />
                <span className="absolute inset-0 animate-ping rounded-xl bg-primary-glow/30" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    AI Commercial Studio
                  </h3>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                    New
                  </span>
                </div>
                <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
                  Generate cinematic AI advertisements using ComfyUI, AI narration, and automated
                  rendering.
                </p>
              </div>
            </div>
            <Button size="sm" className="shrink-0 shadow-elegant">
              Launch Studio <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </Link>
      </motion.div>

      <div className="mb-2">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe a topic. The agent pipeline takes care of the rest.
        </p>
      </div>
      <div className="mb-6" />

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

      {/* Services */}
      <section className="mt-16">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight">What we build</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            RoarAI Systems services — end-to-end intelligent solutions.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Brain, title: "AI Model Training", desc: "Custom AI solutions tailored to your domain and data." },
            { icon: Workflow, title: "Agentic Workflow Automation", desc: "Multi-agent orchestration that ships real work." },
            { icon: MessageSquare, title: "AI Chatbots & RAG", desc: "Realtime assistants connected to your data warehouse." },
            { icon: Globe, title: "Web & E-commerce", desc: "High-performance storefronts and product experiences." },
            { icon: Cloud, title: "Cloud Solutions", desc: "AWS · Azure · GCP architecture, deploy & scale." },
            { icon: LineChart, title: "SEO & Growth", desc: "Search visibility and revenue-driving campaigns." },
          ].map((s) => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                  <s.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="mt-3 font-display text-sm font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Internship & collaboration */}
      <section className="mt-12 mb-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-gradient-primary opacity-15 blur-3xl" />
          <div className="relative grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" /> Now open
              </div>
              <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
                Internships, Training & Client Collaborations
              </h3>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Join RoarAI Systems — work on real agentic AI products, or partner with us to ship
                your next AI-powered launch.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="shadow-elegant">
                <GraduationCap className="mr-1.5 h-4 w-4" /> Apply Now
              </Button>
              <Button size="sm" variant="outline">
                <Handshake className="mr-1.5 h-4 w-4" /> Connect
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
