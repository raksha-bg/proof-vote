import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiErrorMessage } from "@/lib/api";
import type { Election, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Play, Square, Trash2, ShieldOff, ShieldCheck, Users, Vote as VoteIcon } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — BlockVote" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <div className="glass-strong rounded-3xl p-8 shadow-elegant">
          <ShieldOff className="h-10 w-10 mx-auto text-destructive" />
          <h1 className="mt-4 text-xl font-black">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage elections, candidates, and voter accounts</p>
      </div>

      <Tabs defaultValue="elections" className="w-full">
        <TabsList className="glass p-1">
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="voters">Voters</TabsTrigger>
        </TabsList>
        <TabsContent value="elections" className="mt-6"><ElectionsAdmin /></TabsContent>
        <TabsContent value="voters" className="mt-6"><VotersAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

function ElectionsAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const q = useQuery<Election[]>({
    queryKey: ["admin-elections"],
    queryFn: async () => (await api.get<Election[]>("/elections/")).data,
    retry: false,
    placeholderData: [
      { id: 1, title: "Community Council 2026", description: "Council election", start_date: new Date().toISOString(), end_date: new Date(Date.now() + 3 * 864e5).toISOString(), status: "active" },
      { id: 2, title: "Treasury Proposal 42", description: "Budget", start_date: new Date(Date.now() + 864e5).toISOString(), end_date: new Date(Date.now() + 6 * 864e5).toISOString(), status: "draft" },
    ],
  });

  const create = useMutation({
    mutationFn: async (data: Partial<Election>) => (await api.post("/elections/", data)).data,
    onSuccess: () => { toast.success("Election created"); qc.invalidateQueries({ queryKey: ["admin-elections"] }); setOpen(false); },
    onError: (e) => toast.error(apiErrorMessage(e, "Create failed")),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/elections/${id}/`),
    onSuccess: () => { toast.success("Election deleted"); qc.invalidateQueries({ queryKey: ["admin-elections"] }); },
    onError: (e) => toast.error(apiErrorMessage(e, "Delete failed")),
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Election["status"] }) => api.patch(`/elections/${id}/`, { status }),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["admin-elections"] }); },
    onError: (e) => toast.error(apiErrorMessage(e, "Update failed")),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"><Plus className="mr-2 h-4 w-4" /> New election</Button>
          </DialogTrigger>
          <DialogContent className="glass-strong">
            <DialogHeader><DialogTitle>Create election</DialogTitle></DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget)) as unknown as Partial<Election>;
                create.mutate(data);
              }}
              className="space-y-4"
            >
              <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" required maxLength={200} /></div>
              <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" required maxLength={2000} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label htmlFor="start_date">Start</Label><Input id="start_date" name="start_date" type="datetime-local" required /></div>
                <div className="space-y-2"><Label htmlFor="end_date">End</Label><Input id="end_date" name="end_date" type="datetime-local" required /></div>
              </div>
              <Button type="submit" disabled={create.isPending} className="w-full bg-gradient-primary text-primary-foreground">
                {create.isPending ? "Creating…" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass rounded-2xl shadow-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Start</th>
                <th className="p-3">End</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(q.data ?? []).map((e) => (
                <tr key={e.id} className="border-b last:border-b-0 hover:bg-muted/40">
                  <td className="p-3 font-semibold">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shrink-0">
                        <VoteIcon className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="truncate">{e.title}</span>
                    </div>
                  </td>
                  <td className="p-3"><span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted">{e.status}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{e.start_date ? format(new Date(e.start_date), "MMM d, yyyy") : "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground">{e.end_date ? format(new Date(e.end_date), "MMM d, yyyy") : "—"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      {e.status !== "active" && (
                        <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: e.id, status: "active" })}>
                          <Play className="h-3.5 w-3.5 text-success" />
                        </Button>
                      )}
                      {e.status === "active" && (
                        <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: e.id, status: "ended" })}>
                          <Square className="h-3.5 w-3.5 text-warning" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete "${e.title}"?`)) remove.mutate(e.id); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
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

function VotersAdmin() {
  const qc = useQueryClient();
  const q = useQuery<User[]>({
    queryKey: ["admin-voters"],
    queryFn: async () => (await api.get<User[]>("/admin/voters/")).data,
    retry: false,
    placeholderData: [
      { id: 1, full_name: "Ada Reyes", email: "ada@example.com", role: "voter", verified: true, wallet_address: "0xA1b2…c3D4" },
      { id: 2, full_name: "Ken Okafor", email: "ken@example.com", role: "voter", verified: false, wallet_address: null },
      { id: 3, full_name: "Mira Chen", email: "mira@example.com", role: "voter", verified: false, wallet_address: null },
    ],
  });

  const verify = useMutation({
    mutationFn: async ({ id, verified }: { id: number; verified: boolean }) => api.patch(`/admin/voters/${id}/`, { verified }),
    onSuccess: () => { toast.success("Voter updated"); qc.invalidateQueries({ queryKey: ["admin-voters"] }); },
    onError: (e) => toast.error(apiErrorMessage(e, "Update failed")),
  });

  return (
    <div className="glass rounded-2xl shadow-elegant overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
              <th className="p-3">Voter</th>
              <th className="p-3">Email</th>
              <th className="p-3">Wallet</th>
              <th className="p-3">Verified</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((u) => (
              <tr key={u.id} className="border-b last:border-b-0 hover:bg-muted/40">
                <td className="p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-xs shrink-0">
                      {u.full_name[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold truncate">{u.full_name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground truncate max-w-[180px]">{u.email}</td>
                <td className="p-3 mono text-xs">{u.wallet_address ?? "—"}</td>
                <td className="p-3">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${u.verified ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                    {u.verified ? "yes" : "pending"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Button size="sm" variant={u.verified ? "outline" : "default"} onClick={() => verify.mutate({ id: u.id, verified: !u.verified })} className={!u.verified ? "bg-gradient-primary text-primary-foreground" : ""}>
                    {u.verified ? <><ShieldOff className="mr-1 h-3.5 w-3.5" /> Revoke</> : <><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Approve</>}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(q.data?.length ?? 0) === 0 && (
        <div className="p-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">No voters yet.</p>
        </div>
      )}
    </div>
  );
}
