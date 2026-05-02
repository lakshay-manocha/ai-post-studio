import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Linkedin, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { clearHistory } from "@/lib/history";
import {
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
} from "@/lib/publisher";
import type { Length, LinkedInScope, Tone } from "@/lib/types";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Postwright" },
      { name: "description", content: "Theme, defaults, and backend configuration." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [apiBase, setApiBase] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");

  useEffect(() => {
    setApiBase(localStorage.getItem("api_base_url") ?? "");
    setTone((localStorage.getItem("default_tone") as Tone) ?? "professional");
    setLength((localStorage.getItem("default_length") as Length) ?? "medium");
  }, []);

  const save = () => {
    localStorage.setItem("api_base_url", apiBase.trim());
    localStorage.setItem("default_tone", tone);
    localStorage.setItem("default_length", length);
    toast.success("Settings saved");
  };

  const onClear = () => {
    if (confirm("Delete all post history? This cannot be undone.")) {
      clearHistory();
      toast.success("History cleared");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize the dashboard and backend.</p>
      </div>

      <div className="space-y-5">
        <Section title="Appearance" desc="Choose how Postwright looks.">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Theme</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
              <SelectTrigger className="mt-1.5 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Section
          title="Generation defaults"
          desc="Pre-fills tone and length on the dashboard."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Default tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
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
              <Label className="text-xs font-medium text-muted-foreground">Default length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as Length)}>
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
        </Section>

        <Section
          title="Backend"
          desc="Point this to your LangGraph + Ollama API. Leave blank to use the built-in mock generator."
        >
          <div>
            <Label htmlFor="api" className="text-xs font-medium text-muted-foreground">
              API base URL
            </Label>
            <Input
              id="api"
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              placeholder="https://api.your-backend.com"
              className="mt-1.5 font-mono text-sm"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Endpoints expected: <code className="font-mono">POST /generate-post</code>,{" "}
              <code className="font-mono">GET /history</code>,{" "}
              <code className="font-mono">DELETE /post/:id</code>.
            </p>
          </div>
        </Section>

        <div className="flex justify-end">
          <Button onClick={save}>Save settings</Button>
        </div>

        <Section title="Danger zone" desc="Irreversible actions." danger>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Clear post history</p>
              <p className="text-xs text-muted-foreground">Removes all locally saved posts.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={onClear}>
              Clear history
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
  danger,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={
        "rounded-2xl border bg-card p-5 shadow-sm " +
        (danger ? "border-destructive/30" : "border-border/60")
      }
    >
      <h2 className="font-display text-sm font-semibold tracking-tight">{title}</h2>
      {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
