import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api, apiErrorMessage } from "@/lib/api";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — BlockVote" }, { name: "description", content: "Reset your BlockVote password." }] }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().trim().email().max(255) });

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);
    if (!parsed.success) return toast.error("Enter a valid email");
    setLoading(true);
    try {
      await api.post("/auth/password/reset/", { email: parsed.data.email });
      setSent(true);
      toast.success("If that email exists, a reset link is on its way.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell hero>
      <section className="mx-auto max-w-md px-4 py-16">
        <div className="glass-strong rounded-3xl p-8 shadow-elegant">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow mx-auto">
            <KeyRound className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-center">Reset your password</h1>
          <p className="mt-1 text-sm text-center text-muted-foreground">We'll email you a reset link</p>

          {sent ? (
            <div className="mt-6 rounded-xl bg-success/10 border border-success/30 p-4 text-sm text-center">
              Check your inbox for the reset link.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required maxLength={255} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
