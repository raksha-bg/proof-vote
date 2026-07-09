import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { StatCard } from "@/components/StatCard";
import { Vote, Users, Trophy, Clock, Activity, Network, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import type { Election } from "@/lib/types";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — BlockVote" }] }),
  component: DashboardPage,
});

interface Stats {
  total_elections: number;
  total_voters: number;
  total_candidates: number;
  votes_cast: number;
  pending_verifications: number;
  blockchain_txns: number;
}

const fallbackStats: Stats = {
  total_elections: 12, total_voters: 3480, total_candidates: 47, votes_cast: 2891, pending_verifications: 34, blockchain_txns: 2891,
};

const participationData = [
  { day: "Mon", votes: 240 }, { day: "Tue", votes: 420 }, { day: "Wed", votes: 380 },
  { day: "Thu", votes: 610 }, { day: "Fri", votes: 720 }, { day: "Sat", votes: 890 }, { day: "Sun", votes: 540 },
];
const candidateData = [
  { name: "Ada R.", votes: 1240 }, { name: "Ken O.", votes: 890 }, { name: "Mira C.", votes: 460 }, { name: "Sam K.", votes: 301 },
];
const distributionData = [
  { name: "Cast", value: 2891, color: "oklch(0.56 0.22 275)" },
  { name: "Pending", value: 320, color: "oklch(0.72 0.18 200)" },
  { name: "Not voted", value: 269, color: "oklch(0.9 0.015 260)" },
];

function DashboardPage() {
  const { user } = useAuth();

  const statsQ = useQuery<Stats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => (await api.get<Stats>("/dashboard/stats/")).data,
    retry: false,
    placeholderData: fallbackStats,
  });

  const electionsQ = useQuery<Election[]>({
    queryKey: ["elections", "active"],
    queryFn: async () => (await api.get<Election[]>("/elections/?status=active")).data,
    retry: false,
    placeholderData: [],
  });

  const s = statsQ.data ?? fallbackStats;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{user?.full_name}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Elections" value={s.total_elections} icon={Vote} tone="primary" />
        <StatCard label="Voters" value={s.total_voters.toLocaleString()} icon={Users} tone="accent" />
        <StatCard label="Candidates" value={s.total_candidates} icon={Trophy} tone="primary" />
        <StatCard label="Votes cast" value={s.votes_cast.toLocaleString()} icon={Activity} tone="success" />
        <StatCard label="Pending" value={s.pending_verifications} icon={Clock} tone="warning" />
        <StatCard label="On-chain txns" value={s.blockchain_txns.toLocaleString()} icon={Network} tone="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 shadow-elegant lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Voter participation (last 7 days)</h3>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="votes" stroke="oklch(0.56 0.22 275)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 shadow-elegant">
          <h3 className="font-bold mb-4">Voter distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {distributionData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1">
            {distributionData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </div>
                <span className="mono">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 shadow-elegant lg:col-span-2">
          <h3 className="font-bold mb-4">Candidate vote count</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidateData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="votes" fill="oklch(0.72 0.19 300)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 shadow-elegant">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-success" />
            <h3 className="font-bold">Your status</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Verified</span><span className="font-semibold">{user?.verified ? "Yes" : "Pending"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-semibold capitalize">{user?.role}</span></div>
            <div className="flex justify-between items-center gap-2 min-w-0"><span className="text-muted-foreground shrink-0">Wallet</span><span className="mono text-xs truncate">{user?.wallet_address ?? "Not linked"}</span></div>
          </div>
          <Button asChild className="mt-4 w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/elections">View elections</Link>
          </Button>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 shadow-elegant">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Active elections</h3>
          <Button variant="ghost" size="sm" asChild><Link to="/elections">See all</Link></Button>
        </div>
        {(electionsQ.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No active elections right now — check back soon.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {electionsQ.data!.slice(0, 4).map((e) => (
              <Link key={e.id} to="/elections/$id" params={{ id: String(e.id) }} className="glass rounded-xl p-4 hover:-translate-y-0.5 transition-transform block">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold truncate">{e.title}</h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">{e.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{e.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
