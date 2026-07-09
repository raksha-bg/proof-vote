import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Election, Candidate } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_app/results")({
  head: () => ({ meta: [{ title: "Results — BlockVote" }] }),
  component: ResultsPage,
});

function ResultsPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const electionsQ = useQuery<Election[]>({
    queryKey: ["elections"],
    queryFn: async () => (await api.get<Election[]>("/elections/")).data,
    retry: false,
    placeholderData: [
      { id: 1, title: "Community Council 2026", description: "", start_date: "", end_date: "", status: "active" },
      { id: 2, title: "Board Chair Election", description: "", start_date: "", end_date: "", status: "ended" },
    ],
  });

  const electionId = selected ?? electionsQ.data?.[0]?.id ?? 1;

  const candidatesQ = useQuery<Candidate[]>({
    queryKey: ["candidates", electionId],
    queryFn: async () => (await api.get<Candidate[]>(`/elections/${electionId}/candidates/`)).data,
    retry: false,
    placeholderData: [
      { id: 1, election: electionId, name: "Ada Reyes", party: "Progress", symbol: "🌱", manifesto: "", votes: 1240 },
      { id: 2, election: electionId, name: "Ken Okafor", party: "Renew", symbol: "🔷", manifesto: "", votes: 890 },
      { id: 3, election: electionId, name: "Mira Chen", party: "Independent", symbol: "⭐", manifesto: "", votes: 460 },
      { id: 4, election: electionId, name: "Sam Kimura", party: "Green", symbol: "🌿", manifesto: "", votes: 301 },
    ],
  });

  const rows = (candidatesQ.data ?? []).slice().sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  const total = rows.reduce((a, c) => a + (c.votes ?? 0), 0);
  const winner = rows[0];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Results</h1>
          <p className="text-sm text-muted-foreground mt-1">Live tallies straight from the smart contract</p>
        </div>
        <Button variant="outline" onClick={() => toast.success("PDF export queued")}>
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(electionsQ.data ?? []).map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              electionId === e.id ? "bg-gradient-primary text-primary-foreground shadow-glow" : "glass hover:bg-muted"
            }`}
          >
            {e.title}
          </button>
        ))}
      </div>

      {winner && (
        <div className="glass-strong rounded-3xl p-6 shadow-elegant flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow shrink-0">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Leading</p>
              <p className="text-2xl font-black truncate">{winner.name}</p>
              <p className="text-sm text-muted-foreground truncate">{winner.party} · {winner.votes} votes ({total ? Math.round(((winner.votes ?? 0) / total) * 100) : 0}%)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total votes</p>
            <p className="text-2xl font-black text-gradient">{total.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-5 shadow-elegant">
        <h3 className="font-bold mb-4">Vote distribution</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} width={100} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Bar dataKey="votes" fill="oklch(0.56 0.22 275)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 shadow-elegant overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
              <th className="p-3">Rank</th>
              <th className="p-3">Candidate</th>
              <th className="p-3">Party</th>
              <th className="p-3 text-right">Votes</th>
              <th className="p-3 text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => (
              <tr key={c.id} className="border-b last:border-b-0 hover:bg-muted/40">
                <td className="p-3 font-black mono">#{i + 1}</td>
                <td className="p-3 font-semibold">{c.symbol} {c.name}</td>
                <td className="p-3 text-muted-foreground">{c.party}</td>
                <td className="p-3 text-right mono">{c.votes}</td>
                <td className="p-3 text-right mono">{total ? Math.round(((c.votes ?? 0) / total) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
