import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Zap, Eye, Lock, ArrowRight, CheckCircle2, Vote, Network, FileCheck, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <PageShell hero>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 py-20 md:py-32 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Ethereum smart contracts
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Elections you can <span className="text-gradient">actually trust</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              BlockVote is a secure, transparent, and tamper-proof voting platform.
              Every vote is cryptographically signed and permanently recorded on the blockchain.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/register">Get started free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">See how it works</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["One person, one vote", "End-to-end encrypted", "Auditable on-chain"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {f}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-strong rounded-3xl p-6 shadow-elegant animate-float">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-medium">LIVE ELECTION</span>
                </div>
                <span className="mono text-xs text-muted-foreground">block #18,247,391</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">Community Council 2026</h3>
              <div className="mt-6 space-y-3">
                {[
                  { name: "Ada Reyes", party: "Progress", pct: 48, color: "bg-primary" },
                  { name: "Ken Okafor", party: "Renew", pct: 34, color: "bg-accent" },
                  { name: "Mira Chen", party: "Independent", pct: 18, color: "bg-success" },
                ].map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.name}</span>
                      <span className="mono text-muted-foreground">{c.pct}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${c.color} rounded-full transition-all`} style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-muted/50 p-3 mono text-[10px] text-muted-foreground break-all">
                tx: 0x9f4a…8b21e7c02d1a55e3f7b9c4a
              </div>
            </div>
            <div className="absolute -top-6 -right-4 glass rounded-2xl p-4 shadow-glow">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Verified on-chain</p>
                  <p className="text-[10px] text-muted-foreground">Sepolia testnet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "128k+", l: "Votes cast" },
            { v: "412", l: "Elections run" },
            { v: "99.99%", l: "Uptime" },
            { v: "0", l: "Tampered records" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-gradient">{s.v}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Built for trust, from vote to result</h2>
          <p className="mt-3 text-muted-foreground">Every layer of BlockVote is designed to be verifiable, private, and resistant to tampering.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Lock, title: "JWT Authentication", desc: "Password-hashed accounts with email verification and role-based access." },
            { icon: Network, title: "Ethereum Smart Contract", desc: "Solidity contract enforces one vote per verified voter — immutably." },
            { icon: Eye, title: "Public Audit Trail", desc: "Every ballot has a transaction hash and block number anyone can verify." },
            { icon: Zap, title: "Live Results", desc: "Real-time tallies streamed straight from the blockchain as votes settle." },
            { icon: FileCheck, title: "Exportable Reports", desc: "One-click PDF export with candidate breakdowns and turnout metrics." },
            { icon: Shield, title: "Zero Duplicate Voting", desc: "Contract-level checks make double voting cryptographically impossible." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 shadow-elegant hover:-translate-y-1 transition-transform">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        <div className="glass-strong rounded-3xl p-8 md:p-12 shadow-elegant">
          <h2 className="text-3xl font-black tracking-tight text-center">Four steps from register to result</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { n: "01", t: "Register", d: "Create an account and verify your email." },
              { n: "02", t: "Get approved", d: "Admin verifies your identity to unlock voting." },
              { n: "03", t: "Cast vote", d: "Sign your ballot — the smart contract records it." },
              { n: "04", t: "Verify", d: "Grab your transaction hash and check it on-chain." },
            ].map((s) => (
              <div key={s.n}>
                <p className="mono text-3xl font-black text-gradient">{s.n}</p>
                <p className="mt-2 font-semibold">{s.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 md:px-8 py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow mx-auto animate-pulse-glow">
          <Vote className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="mt-6 text-3xl md:text-5xl font-black tracking-tight">Ready to run a trusted election?</h2>
        <p className="mt-4 text-muted-foreground">Join organizations using BlockVote to make voting verifiable.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" asChild className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/register">Create your account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/contact">Talk to us</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
