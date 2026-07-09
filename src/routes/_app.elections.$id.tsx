import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiErrorMessage } from "@/lib/api";
import type { Election, Candidate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, Vote as VoteIcon, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, formatDistanceToNowStrict } from "date-fns";

export const Route = createFileRoute("/_app/elections/$id")({
  head: () => ({ meta: [{ title: "Election — BlockVote" }] }),
  component: ElectionDetailPage,
});

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return "Ended";
  return formatDistanceToNowStrict(new Date(target));
}

function ElectionDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);

  const electionQ = useQuery<Election>({
    queryKey: ["election", id],
    queryFn: async () => (await api.get<Election>(`/elections/${id}/`)).data,
    retry: false,
    placeholderData: {
      id: Number(id), title: `Election #${id}`, description: "A live election. Verify your ballot on-chain after voting.",
      start_date: new Date().toISOString(), end_date: new Date(Date.now() + 2 * 864e5).toISOString(), status: "active",
    },
  });

  const candidatesQ = useQuery<Candidate[]>({
    queryKey: ["candidates", id],
    queryFn: async () => (await api.get<Candidate[]>(`/elections/${id}/candidates/`)).data,
    retry: false,
    placeholderData: [
      { id: 1, election: Number(id), name: "Ada Reyes", party: "Progress Party", symbol: "🌱", manifesto: "Invest in community infrastructure, transparent budgeting, and open committees.", votes: 1240 },
      { id: 2, election: Number(id), name: "Ken Okafor", party: "Renew Movement", symbol: "🔷", manifesto: "Modernize services, reduce fees, and prioritize sustainability initiatives.", votes: 890 },
      { id: 3, election: Number(id), name: "Mira Chen", party: "Independent", symbol: "⭐", manifesto: "Independent voice for accountability, transparency, and reform.", votes: 460 },
    ],
  });

  const myVoteQ = useQuery<{ voted: boolean; transaction_hash?: string; block_number?: number }>({
    queryKey: ["my-vote", id],
    queryFn: async () => (await api.get(`/elections/${id}/my-vote/`)).data,
    retry: false,
    placeholderData: { voted: false },
  });

  const voteMut = useMutation({
    mutationFn: async (candidateId: number) => (await api.post(`/elections/${id}/vote/`, { candidate: candidateId })).data,
    onSuccess: (data: { transaction_hash?: string; block_number?: number }) => {
      toast.success(`Vote recorded on-chain! Tx ${(data?.transaction_hash ?? "0x…").slice(0, 12)}…`);
      qc.invalidateQueries({ queryKey: ["my-vote", id] });
      qc.invalidateQueries({ queryKey: ["candidates", id] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Vote failed")),
  });

  const election = electionQ.data!;
  const candidates = candidatesQ.data ?? [];
  const totalVotes = useMemo(() => candidates.reduce((a, c) => a + (c.votes ?? 0), 0), [candidates]);
  const countdown = useCountdown(election.end_date);
  const voted = myVoteQ.data?.voted;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <Link to="/elections" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to elections
      </Link>

      <div className="glass-strong rounded-3xl p-6 md:p-8 shadow-elegant">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">{election.status}</span>
              <span className="mono text-xs text-muted-foreground">#{election.id}</span>
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">{election.title}</h1>
            <p className="mt-2 text-muted-foreground">{election.description}</p>
          </div>
          <div className="glass rounded-2xl p-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Ends in</div>
            <p className="mt-1 text-2xl font-black text-gradient">{countdown}</p>
            <p className="mt-1 text-[10px] text-muted-foreground mono">{format(new Date(election.end_date), "PPp")}</p>
          </div>
        </div>
      </div>

      {voted && (
        <div className="glass rounded-2xl p-5 shadow-elegant border border-success/30">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold">Your vote is recorded on-chain</p>
              <p className="text-xs text-muted-foreground mono truncate">tx: {myVoteQ.data?.transaction_hash ?? "0x…"} · block #{myVoteQ.data?.block_number ?? "—"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {candidates.map((c) => {
          const pct = totalVotes ? Math.round(((c.votes ?? 0) / totalVotes) * 100) : 0;
          const isSelected = selected === c.id;
          return (
            <div key={c.id} className={`glass rounded-2xl p-5 shadow-elegant transition-all ${isSelected ? "ring-2 ring-primary shadow-glow" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-2xl">
                  <span>{c.symbol || "🗳️"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-bold truncate">{c.name}</h3>
                    <span className="mono text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.party}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.manifesto}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
              {!voted && election.status === "active" && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(isSelected ? null : c.id)}>
                    {isSelected ? "Selected" : "Select"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="flex-1 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90" disabled={!isSelected || voteMut.isPending}>
                        <VoteIcon className="mr-2 h-4 w-4" /> Cast vote
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-strong">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm your vote for {c.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will submit an on-chain transaction and cannot be undone. You get one vote per election.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => voteMut.mutate(c.id)} className="bg-gradient-primary text-primary-foreground">
                          Confirm & sign
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-5 flex items-center gap-3 text-sm">
        <ShieldCheck className="h-5 w-5 text-success shrink-0" />
        <p className="text-muted-foreground">
          Your ballot is signed and stored on Ethereum. No one can change it — not even us.
        </p>
      </div>
    </div>
  );
}
