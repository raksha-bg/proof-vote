import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "primary" | "accent" | "success" | "warning";
}

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  primary: "from-primary to-primary-glow",
  accent: "from-accent to-primary",
  success: "from-success to-accent",
  warning: "from-warning to-destructive",
};

export function StatCard({ label, value, icon: Icon, hint, tone = "primary" }: Props) {
  return (
    <div className="glass rounded-2xl p-5 shadow-elegant transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight truncate">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${toneMap[tone]} shadow-glow`}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}
