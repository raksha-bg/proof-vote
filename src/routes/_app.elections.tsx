import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Election } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Calendar, Search, Vote as VoteIcon } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/elections")({
  head: () => ({ meta: [{ title: "Elections — BlockVote" }] }),
  component: ElectionsPage,
});

const fallback: Election[] = [
  { id: 1, title: "Community Council 2026", description: "Elect the seven-member council for the upcoming term.", start_date: new Date().toISOString(), end_date: new Date(Date.now() + 3 * 864e5).toISOString(), status: "active" },
  { id: 2, title: "Treasury Proposal 42", description: "Approve the Q1 budget allocation for community grants.", start_date: new Date(Date.now() + 864e5).toISOString(), end_date: new Date(Date.now() + 6 * 864e5).toISOString(), status: "draft" },
  { id: 3, title: "Board Chair Election", description: "Choose the next chair of the board of directors.", start_date: new Date(Date.now() - 10 * 864e5).toISOString(), end_date: new Date(Date.now() - 3 * 864e5).toISOString(), status: "ended" },
];

const statusBadge: Record<Election["status"], string> = {
  active: "bg-success/15 text-success",
  draft: "bg-warning/15 text-warning",
  ended: "bg-muted text-muted-foreground",
};

function ElectionsPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | Election["status"]>("all");

  const { data } = useQuery<Election[]>({
    queryKey: ["elections"],
    queryFn: async () => (await api.get<Election[]>("/elections/")).data,
    retry: false,
    placeholderData: fallback,
  });

  const items = (data ?? []).filter((e) =>
    (tab === "all" || e.status === tab) &&
    (q === "" || e.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Elections</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and vote on open elections</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search elections…" className="pl-9" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "draft", "ended"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              tab === t ? "bg-gradient-primary text-primary-foreground shadow-glow" : "glass hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center shadow-elegant">
          <VoteIcon className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="mt-3 font-semibold">No elections found</p>
          <p className="text-sm text-muted-foreground">Try a different filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <Link
              key={e.id}
              to="/elections/$id"
              params={{ id: String(e.id) }}
              className="glass rounded-2xl p-5 shadow-elegant hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${statusBadge[e.status]}`}>{e.status}</span>
                <span className="text-xs text-muted-foreground mono">#{e.id}</span>
              </div>
              <h3 className="mt-3 font-bold text-lg truncate">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(e.start_date), "MMM d")} → {format(new Date(e.end_date), "MMM d, yyyy")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
