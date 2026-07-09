import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Shield, Lock, Eye, Zap, Network, FileCheck, Users, Vote, BarChart3, Wallet, Search, Bell } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — BlockVote" },
      { name: "description", content: "Everything you get with BlockVote: smart contract voting, JWT auth, admin dashboard, live results, blockchain explorer, and more." },
      { property: "og:title", content: "Features — BlockVote" },
      { property: "og:description", content: "Smart contract voting, JWT auth, live results, blockchain explorer, and more." },
    ],
  }),
  component: FeaturesPage,
});

const groups = [
  {
    title: "Security",
    items: [
      { icon: Lock, t: "JWT authentication", d: "Password hashing, refresh tokens, RBAC." },
      { icon: Shield, t: "Duplicate-proof voting", d: "Contract-enforced one-vote-per-voter." },
      { icon: Eye, t: "Public audit trail", d: "Every vote has a transaction hash & block number." },
    ],
  },
  {
    title: "For voters",
    items: [
      { icon: Vote, t: "Simple ballot flow", d: "Browse elections, review candidates, cast in seconds." },
      { icon: Wallet, t: "MetaMask integration", d: "Sign votes with your own wallet, or use a managed one." },
      { icon: Bell, t: "Election notifications", d: "Get notified when voting opens and closes." },
    ],
  },
  {
    title: "For admins",
    items: [
      { icon: Users, t: "Voter verification", d: "Review and approve voter registrations." },
      { icon: BarChart3, t: "Live dashboard", d: "Turnout, results, and blockchain activity at a glance." },
      { icon: FileCheck, t: "Export results", d: "PDF reports with candidate breakdowns." },
    ],
  },
  {
    title: "Blockchain",
    items: [
      { icon: Network, t: "Ethereum smart contract", d: "Solidity contract deployable on any EVM chain." },
      { icon: Search, t: "Explorer view", d: "Browse votes by tx hash, block, and voter." },
      { icon: Zap, t: "Real-time settlement", d: "Results update as blocks confirm." },
    ],
  },
];

function FeaturesPage() {
  return (
    <PageShell hero>
      <section className="mx-auto max-w-6xl px-4 md:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Everything you need to run a trusted election</h1>
          <p className="mt-4 text-muted-foreground">From voter onboarding to final tallies — with the blockchain doing the verifying.</p>
        </div>

        <div className="mt-16 space-y-16">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="text-2xl font-black tracking-tight">{g.title}</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {g.items.map((f) => (
                  <div key={f.t} className="glass rounded-2xl p-6 shadow-elegant hover:-translate-y-1 transition-transform">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                      <f.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="mt-4 font-bold">{f.t}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
