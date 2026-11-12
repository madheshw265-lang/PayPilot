import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Zap, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HowSteps } from "@/components/how-steps";
import { SandboxBadge } from "@/components/site-header";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "PayPilot AI — From chat message to PayPal checkout" },
      { name: "description", content: "PayPilot AI helps small businesses turn customer messages into approved invoices and PayPal checkouts in seconds." },
      { property: "og:title", content: "PayPilot AI — From chat message to PayPal checkout" },
      { property: "og:description", content: "AI-drafted invoices, seller-approved PayPal checkouts, and a live payment dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-navy text-navy-foreground">
        <div className="grid-fade pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <SandboxBadge />
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold sm:text-6xl">
            From customer message to <span className="text-gradient-brand">PayPal checkout</span> in seconds.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-foreground/75">
            PayPilot AI reads natural-language orders, drafts an editable invoice, and — once you approve — creates a PayPal checkout. Built for bakeries, makers and solo sellers.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="shadow-glow"><Link to="/">Open live demo <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="secondary"><Link to="/how-it-works">How it works</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-14 md:grid-cols-3">
        {[
          { icon: Zap, t: "Minutes saved per order", b: "No more retyping DMs into invoices. AI extracts items, quantities and contacts." },
          { icon: ShieldCheck, t: "Seller stays in control", b: "Every invoice requires explicit approval. AI flags risk — it never decides for you." },
          { icon: Store, t: "Made for small shops", b: "PayPal checkout buyers already trust, plus a dashboard that shows what's paid." },
        ].map((f) => (
          <div key={f.t} className="rounded-2xl border bg-card p-6 shadow-card">
            <f.icon className="size-6 text-primary" />
            <h3 className="mt-3 text-lg font-semibold">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.b}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
        <p className="mt-1 text-muted-foreground">Five steps, one human checkpoint.</p>
        <div className="mt-6"><HowSteps /></div>
      </section>
    </main>
  );
}

