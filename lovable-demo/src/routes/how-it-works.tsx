import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, FlaskConical, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HowSteps } from "@/components/how-steps";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How PayPilot AI works — for judges" },
      { name: "description", content: "The PayPilot AI flow: message, AI extraction, seller approval, PayPal Sandbox checkout, and tracking." },
      { property: "og:title", content: "How PayPilot AI works" },
      { property: "og:description", content: "Message → AI invoice → seller approval → PayPal Sandbox checkout → dashboard." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">How it works</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">A judge-friendly walkthrough of the PayPilot AI flow and its guardrails.</p>
      </div>
      <HowSteps />
      <div className="grid gap-4 md:grid-cols-3">
        <Note icon={ShieldCheck} title="Human-in-the-loop" body="AI only drafts. The checkout button stays disabled until the seller ticks the approval box; editing any line resets approval." />
        <Note icon={Cpu} title="Confidence & risk cues" body="Each draft shows a confidence score and flags like missing email, huge quantities, or payment-pressure language for seller review." />
        <Note icon={FlaskConical} title="Demo scope" body="This MVP runs on seed data with a simulated extractor and a PayPal Sandbox-style confirmation. No real payments or credentials." />
      </div>
      <div className="rounded-2xl bg-gradient-navy p-8 text-navy-foreground">
        <h2 className="text-2xl font-bold">Try the 60-second demo</h2>
        <p className="mt-1 text-navy-foreground/75">Click “Sample”, extract, tweak a quantity, approve, then simulate the buyer paying.</p>
        <Button asChild className="mt-5 shadow-glow"><Link to="/">Open dashboard</Link></Button>
      </div>
    </main>
  );
}

function Note({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <Icon className="size-6 text-primary" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

