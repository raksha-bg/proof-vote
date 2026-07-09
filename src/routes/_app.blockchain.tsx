import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Vote } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search, Network, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/blockchain")({
  head: () => ({ meta: [{ title: "Blockchain Explorer — BlockVote" }] }),
  component: BlockchainPage,
});

const fallback: Vote[] = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  voter: 100 + i,
  candidate: (i % 4) + 1,
  transaction_hash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
  block_number: 18247391 - i,
  timestamp: new Date(Date.now() - i * 1000 * 60 * 7).toISOString(),
}));

function BlockchainPage() {
  const [q, setQ] = useState("");
  const { data } = useQuery<Vote[]>({
    queryKey: ["blockchain-txns"],
    queryFn: async () => (await api.get<Vote[]>("/blockchain/transactions/")).data,
    retry: false,
    placeholderData: fallback,
  });

  const rows = (data ?? []).filter((v) =>
    q === "" || v.transaction_hash.toLowerCase().includes(q.toLowerCase()) || String(v.block_number).includes(q),
  );

  function copy(s: string) {
    navigator.clipboard.writeText(s);
    toast.success("Copied");
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Blockchain Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">Every vote, permanently anchored on-chain</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { l: "Latest block", v: `#${fallback[0].block_number.toLocaleString()}` },
          { l: "Total votes on-chain", v: (data?.length ?? 0).toLocaleString() },
          { l: "Network", v: "Sepolia" },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-5 shadow-elegant">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
            <p className="mt-1 text-2xl font-black text-gradient">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by tx hash or block number…" className="pl-9" />
      </div>

      <div className="glass rounded-2xl shadow-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <th className="p-3">Tx hash</th>
                <th className="p-3">Block</th>
                <th className="p-3">Voter</th>
                <th className="p-3">Candidate</th>
                <th className="p-3">Age</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className="border-b last:border-b-0 hover:bg-muted/40">
                  <td className="p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shrink-0">
                        <Network className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="mono text-xs truncate max-w-[180px]">{v.transaction_hash}</span>
                    </div>
                  </td>
                  <td className="p-3 mono text-xs">#{v.block_number.toLocaleString()}</td>
                  <td className="p-3 mono text-xs">0x{v.voter.toString(16).padStart(4, "0")}…</td>
                  <td className="p-3">Candidate #{v.candidate}</td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(v.timestamp))} ago</td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => copy(v.transaction_hash)} className="p-2 rounded-lg hover:bg-muted" aria-label="Copy">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <a href={`https://sepolia.etherscan.io/tx/${v.transaction_hash}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-muted" aria-label="Etherscan">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
