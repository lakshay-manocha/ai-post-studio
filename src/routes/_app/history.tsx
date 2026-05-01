import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Copy, Trash2, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHistory } from "@/hooks/use-history";
import { removeFromHistory } from "@/lib/history";

export const Route = createFileRoute("/_app/history")({
  head: () => ({
    meta: [
      { title: "History · Postwright" },
      { name: "description", content: "Your previously generated LinkedIn posts." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const items = useHistory();

  const handleCopy = async (text: string, hashtags: string[]) => {
    await navigator.clipboard.writeText(`${text}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`);
    toast.success("Copied");
  };

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    toast.success("Deleted");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "post" : "posts"} stored locally on this device.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/dashboard">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            New post
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 p-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-display text-base font-semibold">No posts yet</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Generated posts will show up here so you can copy or refine them later.
          </p>
          <Button asChild className="mt-5">
            <Link to="/dashboard">Create your first post</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="flex flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-elegant"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 font-display text-sm font-semibold tracking-tight">
                  {p.topic}
                </h3>
                <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
                  {p.qualityScore}
                </Badge>
              </div>
              <p className="line-clamp-4 flex-1 text-xs leading-relaxed text-muted-foreground">
                {p.content}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.hashtags.slice(0, 3).map((h) => (
                  <span
                    key={h}
                    className="rounded-md bg-accent/50 px-1.5 py-0.5 text-[10px] text-accent-foreground"
                  >
                    #{h}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-[11px] text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString()}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => handleCopy(p.content, p.hashtags)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
