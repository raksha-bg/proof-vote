import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — BlockVote" },
      { name: "description", content: "Get in touch with the BlockVote team about running elections on the blockchain." },
      { property: "og:title", content: "Contact — BlockVote" },
      { property: "og:description", content: "Talk to the team about your election." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message required").max(1000),
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    // Wire to your Django /api/contact/ endpoint
    setTimeout(() => {
      setSubmitting(false);
      form.reset();
      toast.success("Message sent — we'll get back to you shortly.");
    }, 600);
  }

  return (
    <PageShell hero>
      <section className="mx-auto max-w-5xl px-4 md:px-8 py-20 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Let's talk</h1>
          <p className="mt-3 text-muted-foreground">Questions about elections, pilots, or integrations? Send a note.</p>
          <div className="mt-8 space-y-4">
            {[
              { icon: Mail, t: "hello@blockvote.io" },
              { icon: MessageSquare, t: "Chat with support in-app" },
              { icon: MapPin, t: "Remote-first, worldwide" },
            ].map((r) => (
              <div key={r.t} className="glass rounded-2xl p-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow shrink-0">
                  <r.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{r.t}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-8 shadow-elegant space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={5} required maxLength={1000} />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            {submitting ? "Sending…" : "Send message"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}
