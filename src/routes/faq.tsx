import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — BlockVote" },
      { name: "description", content: "Answers to common questions about blockchain voting, security, and using BlockVote." },
      { property: "og:title", content: "FAQ — BlockVote" },
      { property: "og:description", content: "Common questions about blockchain voting." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  { q: "Is my vote private?", a: "Your identity is authenticated off-chain via JWT. On-chain, only a hashed voter identifier and your candidate choice are stored — nobody can trace a ballot back to your personal details." },
  { q: "Can I vote more than once?", a: "No. The smart contract enforces a single vote per verified voter address. Any second attempt reverts on-chain." },
  { q: "What if the blockchain goes down?", a: "Elections are hosted on Ethereum (or a compatible EVM chain), which has never had unplanned downtime affecting finality. Votes queue if the RPC is temporarily unreachable." },
  { q: "Do I need MetaMask?", a: "MetaMask is optional. Admins can enable managed wallets so voters don't need to hold ETH or install extensions." },
  { q: "Can I verify my vote later?", a: "Yes — every ballot returns a transaction hash and block number. Use the Blockchain Explorer page or any Ethereum block explorer to confirm." },
  { q: "How are results computed?", a: "Directly from the smart contract's on-chain tally. Nothing on our servers can alter them." },
  { q: "Is there a mobile app?", a: "The web app is fully responsive and works great on mobile browsers. Native apps are on the roadmap." },
];

function FaqPage() {
  return (
    <PageShell hero>
      <section className="mx-auto max-w-3xl px-4 md:px-8 py-20">
        <h1 className="text-4xl font-black tracking-tight text-center">Frequently asked</h1>
        <p className="mt-3 text-center text-muted-foreground">Everything you probably want to know before running or joining an election.</p>
        <div className="mt-10 glass-strong rounded-3xl p-4 md:p-6 shadow-elegant">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`q-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PageShell>
  );
}
