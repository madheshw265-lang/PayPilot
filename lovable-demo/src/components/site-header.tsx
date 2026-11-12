import { Link } from "@tanstack/react-router";
import { Sparkles, FlaskConical } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-brand shadow-glow">
        <Sparkles className="size-4 text-primary-foreground" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        PayPilot <span className="text-cyan">AI</span>
      </span>
    </Link>
  );
}

export function SandboxBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
      <FlaskConical className="size-3.5" /> Sandbox · demo data
    </span>
  );
}

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/landing", label: "Overview" },
  { to: "/how-it-works", label: "How it works" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-navy text-navy-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-1.5 text-sm text-navy-foreground/70 transition hover:bg-navy-soft hover:text-navy-foreground"
              activeProps={{ className: "bg-navy-soft !text-navy-foreground" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <SandboxBadge />
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="whitespace-nowrap rounded-md px-3 py-1 text-xs text-navy-foreground/70" activeProps={{ className: "bg-navy-soft !text-navy-foreground" }} activeOptions={{ exact: true }}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

