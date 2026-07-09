import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, apiErrorMessage } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Wallet, ShieldCheck, Mail, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — BlockVote" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, refresh } = useAuth();
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setSaving(true);
    try {
      await api.patch("/auth/me/", data);
      await refresh();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Update failed"));
    } finally {
      setSaving(false);
    }
  }

  async function connectWallet() {
    const eth = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    if (!eth) return toast.error("MetaMask not detected");
    setConnecting(true);
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      await api.patch("/auth/me/", { wallet_address: address });
      await refresh();
      toast.success("Wallet linked");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Wallet connection failed"));
    } finally {
      setConnecting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and wallet</p>
      </div>

      <div className="glass-strong rounded-3xl p-6 md:p-8 shadow-elegant">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-primary text-primary-foreground text-3xl font-black shadow-glow shrink-0">
            {user.full_name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-black truncate">{user.full_name}</h2>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">{user.role}</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user.verified ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                {user.verified ? "verified" : "pending verification"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} className="glass rounded-2xl p-6 shadow-elegant space-y-4">
          <div className="flex items-center gap-2 mb-2"><UserIcon className="h-4 w-4" /> <h3 className="font-bold">Personal info</h3></div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" defaultValue={user.full_name} required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" defaultValue={user.email} required className="pl-9" maxLength={255} />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <div className="glass rounded-2xl p-6 shadow-elegant space-y-4">
          <div className="flex items-center gap-2"><Wallet className="h-4 w-4" /> <h3 className="font-bold">Wallet</h3></div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Linked address</p>
            <p className="mt-1 mono text-xs break-all">{user.wallet_address ?? "No wallet linked yet"}</p>
          </div>
          <Button onClick={connectWallet} disabled={connecting} variant="outline" className="w-full">
            {connecting ? "Connecting…" : user.wallet_address ? "Reconnect MetaMask" : "Connect MetaMask"}
          </Button>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-success" />
            <p>Your wallet address is used to sign votes on-chain. Your private key never leaves your device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
