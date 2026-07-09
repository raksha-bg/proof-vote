import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Target, Users, Globe } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — BlockVote" },
      { name: "description", content: "Learn about BlockVote's mission to make elections verifiable, secure, and accessible with blockchain." },
      { property: "og:title", content: "About — BlockVote" },
      { property: "og:description", content: "Our mission to make every vote count — and prove it." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell hero>
      <section className="mx-auto max-w-4xl px-4 md:px-8 py-20">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">About BlockVote</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          BlockVote exists because trust in elections shouldn't require blind faith. We combine modern
          web authentication with Ethereum smart contracts so every ballot is verifiable — without
          revealing the voter behind it.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, t: "Our mission", d: "Give every organization access to elections that are as auditable as they are private." },
            { icon: Users, t: "Who it's for", d: "Universities, DAOs, unions, cooperatives, and communities — anywhere trust matters." },
            { icon: Globe, t: "How we do it", d: "Django REST backend for identity, Ethereum smart contract for ballots, React frontend for the voter." },
          ].map((f) => (
            <div key={f.t} className="glass rounded-2xl p-6 shadow-elegant">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-bold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="glass-strong mt-12 rounded-3xl p-8 shadow-elegant">
          <h2 className="text-2xl font-black">The stack</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
            <li><strong>Frontend:</strong> React 19 + TypeScript + Tailwind v4</li>
            <li><strong>Backend:</strong> Django REST Framework + PostgreSQL</li>
            <li><strong>Auth:</strong> JWT (SimpleJWT) with role-based access</li>
            <li><strong>Blockchain:</strong> Solidity smart contract on Ethereum</li>
            <li><strong>Web3:</strong> ethers.js + MetaMask</li>
            <li><strong>Design:</strong> Glassmorphism + gradient accents</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
