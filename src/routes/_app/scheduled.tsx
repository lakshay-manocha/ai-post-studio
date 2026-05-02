import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Trash2, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getScheduledPosts,
  getPublishedPosts,
  removeScheduled,
  type ScheduledPost,
  type PublishedPost,
} from "@/lib/publisher";

export const Route = createFileRoute("/_app/scheduled")({
  head: () => ({
    meta: [
      { title: "Scheduled · Postwright" },
      { name: "description", content: "Scheduled and published LinkedIn posts." },
    ],
  }),
  component: ScheduledPage,
});

function useLiveQueue() {
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);
  const [published, setPublished] = useState<PublishedPost[]>([]);

  useEffect(() => {
    const refresh = () => {
      setScheduled(getScheduledPosts());
      setPublished(getPublishedPosts());
    };
    refresh();
    const onSched = () => refresh();
    const onPub = () => refresh();
    window.addEventListener("scheduled_posts_v1:changed", onSched);
    window.addEventListener("published_posts_v1:changed", onPub);
    const id = window.setInterval(refresh, 5000);
    return () => {
      window.removeEventListener("scheduled_posts_v1:changed", onSched);
      window.removeEventListener("published_posts_v1:changed", onPub);
      window.clearInterval(id);
    };
  }, []);

  return { scheduled, published };
}

function relTime(ts: number) {
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60000);
  const h = Math.round(m / 60);
  const d = Math.round(h / 24);
  const fmt = abs < 60_000 ? "now" : m < 60 ? `${m}m` : h < 24 ? `${h}h` : `${d}d`;
  return diff > 0 ? `in ${fmt}` : `${fmt} ago`;
}

function ScheduledPage() {
  const { scheduled, published } = useLiveQueue();
  const pending = scheduled.filter((s) => s.status === "pending");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Scheduled</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pending.length} pending · {published.length} published. Worker checks every 10s.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/dashboard">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            New post
          </Link>
        </Button>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold tracking-tight">
          <CalendarClock className="h-4 w-4 text-primary" /> Pending queue
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center text-sm text-muted-foreground">
            No posts scheduled. Generate a post and click <em>Schedule</em> to queue it.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((s, i) => (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 text-sm font-semibold">{s.post.topic}</h3>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {relTime(s.scheduledFor)}
                  </Badge>
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">{s.post.content}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(s.scheduledFor).toLocaleString()} ·{" "}
                    {s.platform === "linkedin-profile" ? "Profile" : "Company"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      removeScheduled(s.id);
                      toast.success("Removed from queue");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold tracking-tight">
          <Send className="h-4 w-4 text-success" /> Published
        </h2>
        {published.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center text-sm text-muted-foreground">
            Nothing published yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {published.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 text-sm font-semibold">{p.post.topic}</h3>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-success">
                    <CheckCircle2 className="h-3 w-3" /> Live
                  </span>
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">{p.post.content}</p>
                <div className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                  {new Date(p.publishedAt).toLocaleString()} ·{" "}
                  {p.platform === "linkedin-profile" ? "Profile" : "Company"}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
