import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";
import type { AgentStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AgentPipeline({ steps }: { steps: AgentStep[] }) {
  const completed = steps.filter((s) => s.status === "done").length;
  const pct = (completed / steps.length) * 100;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold tracking-tight">Agent pipeline</h3>
          <p className="text-xs text-muted-foreground">LangGraph multi-agent workflow</p>
        </div>
        <div className="text-xs font-mono tabular-nums text-muted-foreground">
          {completed}/{steps.length}
        </div>
      </div>

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <ol className="space-y-2.5">
        {steps.map((step, i) => (
          <li key={step.name} className="flex items-start gap-3">
            <StatusDot status={step.status} index={i} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    step.status === "pending" && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                <StatusBadge status={step.status} />
              </div>
              <AnimatePresence>
                {step.log && step.status !== "pending" && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
                  >
                    {step.log}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StatusDot({ status, index }: { status: AgentStep["status"]; index: number }) {
  return (
    <div className="relative mt-0.5 flex h-6 w-6 items-center justify-center">
      {status === "done" && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
      )}
      {status === "running" && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        </div>
      )}
      {status === "pending" && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <span className="text-[10px] font-mono">{index + 1}</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <Circle className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: AgentStep["status"] }) {
  const map = {
    pending: { text: "Pending", cls: "bg-muted text-muted-foreground" },
    running: { text: "Running", cls: "bg-primary/15 text-primary" },
    done: { text: "Done", cls: "bg-success/15 text-success" },
    error: { text: "Error", cls: "bg-destructive/15 text-destructive" },
  } as const;
  const m = map[status];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", m.cls)}>
      {m.text}
    </span>
  );
}
