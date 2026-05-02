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

  // LinkedIn auth (mock — real app uses OAuth flow + backend token storage)
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [scopes, setScopes] = useState<LinkedInScope[]>([
    "w_member_social",
    "w_organization_social",
  ]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setApiBase(localStorage.getItem("api_base_url") ?? "");
    setTone((localStorage.getItem("default_tone") as Tone) ?? "professional");
    setLength((localStorage.getItem("default_length") as Length) ?? "medium");
    const auth = getStoredAuth();
    if (auth) {
      setAccessToken(auth.access_token);
      setUserId(auth.user_id);
      setScopes(auth.scopes);
      setConnected(true);
    }
  }, []);

  const save = () => {
    localStorage.setItem("api_base_url", apiBase.trim());
    localStorage.setItem("default_tone", tone);
    localStorage.setItem("default_length", length);
    toast.success("Settings saved");
  };

  const saveLinkedIn = () => {
    if (!accessToken.trim()) return toast.error("Access token is required");
    if (!userId.trim()) return toast.error("User ID is required");
    if (scopes.length === 0) return toast.error("Select at least one OAuth scope");
    setStoredAuth({
      access_token: accessToken.trim(),
      user_id: userId.trim(),
      scopes,
    });
    setConnected(true);
    toast.success("LinkedIn connection saved");
  };

  const disconnectLinkedIn = () => {
    clearStoredAuth();
    setAccessToken("");
    setUserId("");
    setConnected(false);
    toast.success("LinkedIn disconnected");
  };

  const toggleScope = (scope: LinkedInScope, checked: boolean) => {
    setScopes((prev) =>
      checked ? Array.from(new Set([...prev, scope])) : prev.filter((s) => s !== scope),
    );
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
          title={
            <span className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-primary" />
              LinkedIn connection
              {connected && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  <ShieldCheck className="h-3 w-3" /> Connected
                </span>
              )}
            </span>
          }
          desc="OAuth tokens for the publishing system. In production these come from the LinkedIn OAuth flow and live server-side; this UI is for local mock testing."
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="lk-token" className="text-xs font-medium text-muted-foreground">
                Access token
              </Label>
              <Input
                id="lk-token"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="AQX... (LinkedIn OAuth access token)"
                className="mt-1.5 font-mono text-sm"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="lk-userid" className="text-xs font-medium text-muted-foreground">
                User ID <span className="text-foreground/60">(internal database ID, not LinkedIn ID)</span>
              </Label>
              <Input
                id="lk-userid"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="usr_abc123"
                className="mt-1.5 font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Granted OAuth scopes</Label>
              <div className="mt-2 space-y-2">
                <ScopeRow
                  scope="w_member_social"
                  label="Personal profile posts"
                  checked={scopes.includes("w_member_social")}
                  onChange={(c) => toggleScope("w_member_social", c)}
                />
                <ScopeRow
                  scope="w_organization_social"
                  label="Company page posts"
                  checked={scopes.includes("w_organization_social")}
                  onChange={(c) => toggleScope("w_organization_social", c)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={saveLinkedIn} size="sm">
                {connected ? "Update connection" : "Connect LinkedIn"}
              </Button>
              {connected && (
                <Button onClick={disconnectLinkedIn} variant="outline" size="sm">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Disconnect
                </Button>
              )}
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
  title: React.ReactNode;
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

function ScopeRow({
  scope,
  label,
  checked,
  onChange,
}: {
  scope: LinkedInScope;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={`scope-${scope}`}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 p-2.5 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
    >
      <Checkbox
        id={`scope-${scope}`}
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">{scope}</p>
      </div>
    </label>
  );
}
