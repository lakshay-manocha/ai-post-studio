import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  CalendarClock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  publishNow,
  schedulePost,
  resolveUrnFromUrl,
  validatePublishRequest,
  getStoredAuth,
} from "@/lib/publisher";
import type { DestinationKind, GeneratedPost, LinkedInAuth, LinkedInTarget } from "@/lib/types";

interface Props {
  post: GeneratedPost;
}

function defaultDateTime() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PublishPanel({ post }: Props) {
  const [destination, setDestination] = useState<DestinationKind>("personal");
  const [pageUrl, setPageUrl] = useState("");
  const [datetime, setDatetime] = useState(defaultDateTime());
  const [scheduling, setScheduling] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState<"published" | "scheduled" | null>(null);
  const [auth, setAuth] = useState<LinkedInAuth | null>(null);

  useEffect(() => {
    setAuth(getStoredAuth());
    const onChange = () => setAuth(getStoredAuth());
    window.addEventListener("linkedin_auth_v1:changed", onChange);
    return () => window.removeEventListener("linkedin_auth_v1:changed", onChange);
  }, []);

  // Derive target from URL + destination
  const target = useMemo<LinkedInTarget>(() => {
    const resolved = resolveUrnFromUrl(pageUrl);
    const t: LinkedInTarget = {
      destination,
      target_page_url: pageUrl.trim(),
    };
    if (resolved && resolved.destination === destination) {
      if (destination === "personal") t.linkedin_person_urn = resolved.urn;
      else t.linkedin_organization_urn = resolved.urn;
    }
    return t;
  }, [pageUrl, destination]);

  const validation = useMemo(() => validatePublishRequest(target, auth), [target, auth]);
  const resolvedUrn = target.linkedin_person_urn ?? target.linkedin_organization_urn;

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishNow(post, target, auth);
      setDone("published");
      toast.success("Posted to LinkedIn (mock)");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = () => {
    const ts = new Date(datetime).getTime();
    if (Number.isNaN(ts)) return toast.error("Pick a valid date & time");
    if (ts < Date.now() - 60_000) return toast.error("Pick a time in the future");
    try {
      schedulePost(post, target, ts, auth);
      setDone("scheduled");
      toast.success(`Scheduled for ${new Date(ts).toLocaleString()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Schedule failed");
    }
  };

  const placeholder =
    destination === "personal"
      ? "https://www.linkedin.com/in/johndoe/"
      : "https://www.linkedin.com/company/google/";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-semibold tracking-tight">Publish to LinkedIn</h3>
        </div>
        {done && (
          <span className="flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {done === "published" ? "Published" : "Scheduled"}
          </span>
        )}
      </div>

      {/* Auth status banner */}
      {!auth ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <div className="flex-1">
            <p className="font-medium text-foreground">LinkedIn account not connected.</p>
            <p className="mt-0.5 text-muted-foreground">
              Add your access token and user ID in{" "}
              <Link to="/settings" className="font-medium text-primary underline-offset-2 hover:underline">
                Settings → LinkedIn
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>
            Connected · user_id <span className="font-mono">{auth.user_id}</span> · scopes{" "}
            <span className="font-mono">{auth.scopes.join(", ") || "none"}</span>
          </span>
        </div>
      )}

      {/* Destination selector */}
      <div className="mb-4">
        <Label className="text-xs font-medium text-muted-foreground">Post destination</Label>
        <RadioGroup
          value={destination}
          onValueChange={(v) => setDestination(v as DestinationKind)}
          className="mt-2 grid grid-cols-2 gap-2"
        >
          <label
            htmlFor="dest-personal"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <RadioGroupItem value="personal" id="dest-personal" />
            Personal profile
          </label>
          <label
            htmlFor="dest-company"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <RadioGroupItem value="company" id="dest-company" />
            Company page
          </label>
        </RadioGroup>
      </div>

      {/* LinkedIn page URL */}
      <div className="mb-4">
        <Label htmlFor="page-url" className="text-xs font-medium text-muted-foreground">
          LinkedIn {destination === "personal" ? "profile" : "company page"} URL
        </Label>
        <div className="relative mt-1.5">
          <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="page-url"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            placeholder={placeholder}
            className="pl-8 font-mono text-xs"
          />
        </div>
        {resolvedUrn && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Resolved URN: <span className="font-mono text-foreground">{resolvedUrn}</span>
          </p>
        )}
      </div>

      {/* Validation errors */}
      {!validation.ok && (pageUrl || auth) && (
        <ul className="mb-4 space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-[11px] text-destructive">
          {validation.errors.map((e) => (
            <li key={e} className="flex gap-1.5">
              <span>•</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Schedule time */}
      <div className="mb-4">
        <Label className="text-xs font-medium text-muted-foreground">Schedule for (optional)</Label>
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

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handlePublish} disabled={publishing || !validation.ok} size="sm">
          {publishing ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-3.5 w-3.5" />
          )}
          Publish now
        </Button>
        <Button
          onClick={handleSchedule}
          disabled={scheduling || !validation.ok}
          variant="outline"
          size="sm"
        >
          <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
          Schedule post
        </Button>
      </div>
    </motion.div>
  );
}
