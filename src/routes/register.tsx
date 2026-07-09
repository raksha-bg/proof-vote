import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — BlockVote" }, { name: "description", content: "Create a BlockVote account and start voting on-chain." }] }),
  component: RegisterPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Full name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(128),
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      await register(parsed.data);
      toast.success("Account created — check your inbox to verify your email.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell hero>
      <section className="mx-auto max-w-md px-4 py-16">
        <div className="glass-strong rounded-3xl p-8 shadow-elegant">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow mx-auto">
            <UserPlus className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-center">Create your account</h1>
          <p className="mt-1 text-sm text-center text-muted-foreground">Register once, vote securely forever</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="new-password" minLength={8} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have one? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
