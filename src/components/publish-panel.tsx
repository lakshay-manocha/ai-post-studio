import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CalendarClock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { publishNow, schedulePost, type Platform } from "@/lib/publisher";
import type { GeneratedPost } from "@/lib/types";

interface Props {
  post: GeneratedPost;
}

function defaultDateTime() {
  const d = new Date(Date.now() + 60 * 60 * 1000); // +1h
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PublishPanel({ post }: Props) {
  const [mode, setMode] = useState<"idle" | "schedule">("idle");
  const [datetime, setDatetime] = useState(defaultDateTime());
  const [platform, setPlatform] = useState<Platform>("linkedin-profile");
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState<"published" | "scheduled" | null>(null);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishNow(post, platform);
      setDone("published");
      toast.success("Posted to LinkedIn (mock)");
    } catch {
      toast.error("Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = () => {
    const ts = new Date(datetime).getTime();
    if (Number.isNaN(ts)) {
      toast.error("Pick a valid date & time");
      return;
    }
    if (ts < Date.now() - 60_000) {
      toast.error("Pick a time in the future");
      return;
    }
    schedulePost(post, ts, platform);
    setDone("scheduled");
    toast.success(`Scheduled for ${new Date(ts).toLocaleString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-semibold tracking-tight">Publish options</h3>
        </div>
        {done && (
          <span className="flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {done === "published" ? "Published" : "Scheduled"}
          </span>
        )}
      </div>

      <div className="mb-4">
        <Label className="text-xs font-medium text-muted-foreground">Platform</Label>
        <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linkedin-profile">LinkedIn · Personal profile</SelectItem>
            <SelectItem value="linkedin-company">LinkedIn · Company page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handlePublish} disabled={publishing} size="sm">
            {publishing ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-3.5 w-3.5" />
            )}
            Publish now
          </Button>
          <Button onClick={() => setMode("schedule")} variant="outline" size="sm">
            <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
            Schedule post
          </Button>
        </div>
      )}

      {mode === "schedule" && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Date & time</Label>
            <Input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="mt-1.5"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Background worker checks every 10s and auto-publishes when due.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSchedule} size="sm">
              <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
              Confirm schedule
            </Button>
            <Button onClick={() => setMode("idle")} variant="ghost" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
