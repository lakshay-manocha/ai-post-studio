import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Download, RefreshCw, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportLinkedInImage, type ExportSize } from "@/lib/export-image";
import type { GeneratedPost } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  post: GeneratedPost;
  onRegenerate: () => void;
  generating?: boolean;
}

export function PostCard({ post, onRegenerate, generating }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleCopy = async () => {
    const text = `${post.content}\n\n${post.hashtags.map((h) => `#${h}`).join(" ")}`;
    await navigator.clipboard.writeText(text);
    toast.success("Post copied to clipboard");
  };

  const handleExport = async (size: ExportSize) => {
    setExporting(true);
    try {
      await exportLinkedInImage(post, size);
      toast.success(`Exported ${size === "square" ? "1080×1080" : "1200×627"} PNG`);
    } catch {
      toast.error("Failed to export image");
    } finally {
      setExporting(false);
    }
  };

  const scoreColor =
    post.qualityScore >= 90 ? "text-success" : post.qualityScore >= 75 ? "text-primary" : "text-warning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elegant">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold tracking-tight">Generated post</h3>
          </div>
          <ScoreRing score={post.qualityScore} colorClass={scoreColor} />
        </div>

        {/* In-app preview only — export uses a dedicated off-screen renderer for pixel-perfect LinkedIn look */}
        <div ref={previewRef} className="rounded-xl border border-border/60 bg-background p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
              AI
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Postwright</span>
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">AI generated</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Drafted just now · LinkedIn</p>
            </div>
          </div>

          <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground">
            {post.content}
          </p>

          {post.hashtags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.hashtags.map((h) => (
                <span
                  key={h}
                  className="rounded-md bg-accent/60 px-2 py-0.5 text-xs font-medium text-accent-foreground"
                >
                  #{h}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={handleCopy} size="sm" variant="default">
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy
          </Button>
          <Button onClick={onRegenerate} size="sm" variant="outline" disabled={generating}>
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", generating && "animate-spin")} />
            Regenerate
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={exporting}>
                <Download className={cn("mr-1.5 h-3.5 w-3.5", exporting && "animate-pulse")} />
                Export PNG
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("square")}>
                Square · 1080 × 1080
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("landscape")}>
                Landscape · 1200 × 627
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreRing({ score, colorClass }: { score: number; colorClass: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
        <circle cx="22" cy="22" r={r} className="stroke-muted" strokeWidth="3" fill="none" />
        <circle
          cx="22"
          cy="22"
          r={r}
          className={cn("transition-all", colorClass)}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          fill="none"
        />
      </svg>
      <span className={cn("absolute font-mono text-[11px] font-semibold tabular-nums", colorClass)}>
        {score}
      </span>
    </div>
  );
}
