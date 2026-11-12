import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Sparkles, Wand2, Plus, Trash2, ShieldCheck, ShieldAlert, CheckCircle2, Circle,
  MessageSquareText, FileText, UserCheck, CreditCard, BadgeCheck, TrendingUp,
  Wallet, Clock, Gauge, Lightbulb, Loader2, Lock, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { SandboxBadge } from "@/components/site-header";
import { extractOrder, newId, totals, type ExtractedOrder, type LineItem } from "@/lib/order-parser";
import { SAMPLE_ORDER, SEED_TRANSACTIONS, WEEKLY, fmt, type Transaction, type TxStatus } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard — PayPilot AI" },
      { name: "description", content: "Paste a customer order, let AI draft the invoice, approve it, and send a PayPal Sandbox checkout." },
      { property: "og:title", content: "Seller Dashboard — PayPilot AI" },
      { property: "og:description", content: "AI order composer, editable invoices and PayPal Sandbox checkout tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Stage = 0 | 1 | 2 | 3 | 4;

export function Dashboard() {
  const [message, setMessage] = useState(SAMPLE_ORDER);
  const [extracting, setExtracting] = useState(false);
  const [order, setOrder] = useState<ExtractedOrder | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [approved, setApproved] = useState(false);
  const [stage, setStage] = useState<Stage>(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [txs, setTxs] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [invoiceId, setInvoiceId] = useState("INV-1049");

  const t = useMemo(() => totals(items), [items]);

  const runExtract = () => {
    setExtracting(true);
    setTimeout(() => {
      try {
        const o = extractOrder(message);
        setOrder(o);
        setItems(o.items);
        setCustomer(o.customer);
        setEmail(o.email);
        setApproved(false);
        setStage(1);
        toast.success("Invoice drafted", { description: `${o.items.length} line items · ${o.confidence}% confidence` });
      } catch {
        toast.error("Could not draft the invoice. Please try again.");
      } finally {
        setExtracting(false);
      }
    }, 900);
  };

  const invalidateApproval = () => {
    setApproved(false);
    if (stage > 1) setStage(1);
  };

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    invalidateApproval();
  };

  const createCheckout = () => {
    setStage(3);
    setCheckoutOpen(true);
    setTxs((xs) => [
      { id: invoiceId, customer: customer || "Customer", items: items.map((i) => `${i.qty}× ${i.name}`).join(", "), amount: t.total, status: "pending", time: "Just now", confidence: order?.confidence ?? 0 },
      ...xs,
    ]);
  };

  const simulatePaid = () => {
    setStage(4);
    setTxs((xs) => xs.map((x) => (x.id === invoiceId ? { ...x, status: "paid" } : x)));
    toast.success("Sandbox payment captured", { description: `${fmt(t.total)} from ${customer || "customer"}` });
  };

  const resetFlow = () => {
    setCheckoutOpen(false);
    setOrder(null); setItems([]); setCustomer(""); setEmail(""); setApproved(false); setStage(0);
    setMessage("");
    setInvoiceId(`INV-${Number(invoiceId.slice(4)) + 1}`);
  };

  const paidTotal = txs.filter((x) => x.status === "paid").reduce((s, x) => s + x.amount, 0);
  const pending = txs.filter((x) => x.status === "pending");
  const review = txs.filter((x) => x.status === "review");
  const canCheckout = approved && items.length > 0 && t.total > 0 && !!email && stage < 3;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Good morning, Hearth & Crumb Bakery</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Seller dashboard</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3.5" /> AI drafts · you approve every payment request
        </div>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Collected today" value={fmt(paidTotal)} delta="+18% vs. last Mon" tone="success" />
        <Kpi icon={Clock} label="Awaiting payment" value={fmt(pending.reduce((s, x) => s + x.amount, 0))} delta={`${pending.length} open checkouts`} tone="primary" />
        <Kpi icon={Gauge} label="Avg. AI confidence" value={`${Math.round(txs.reduce((s, x) => s + x.confidence, 0) / txs.length)}%`} delta="Last 7 orders" tone="cyan" />
        <Kpi icon={ShieldAlert} label="Needs review" value={String(review.length)} delta="Held for seller check" tone="warning" />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Composer */}
        <Card className="overflow-hidden border-0 p-0 shadow-card lg:col-span-2">
          <div className="relative bg-gradient-navy p-5 text-navy-foreground">
            <div className="grid-fade pointer-events-none absolute inset-0" />
            <div className="relative flex items-center gap-2">
              <Sparkles className="size-5 text-cyan" />
              <h2 className="text-lg font-semibold">AI Order Composer</h2>
            </div>
            <p className="relative mt-1 text-sm text-navy-foreground/70">Paste a customer message from email, DM or chat.</p>
          </div>
          <div className="space-y-3 p-5">
            <Textarea
              value={message}
              aria-label="Customer order message"
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="e.g. Hi, it's Jordan — can I get 3 lattes and 2 croissants? jordan@example.com"
              className="resize-none text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={runExtract} disabled={!message.trim() || extracting} className="flex-1 shadow-glow">
                {extracting ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {extracting ? "Extracting…" : "Extract invoice"}
              </Button>
              <Button variant="outline" onClick={() => setMessage(SAMPLE_ORDER)}>Sample</Button>
              <Button variant="outline" onClick={() => setMessage("URGENT need 40 gift boxes asap, will overpay, send link now")}>Risky</Button>
            </div>
            <PaymentTimeline stage={stage} />
          </div>
        </Card>

        {/* Invoice */}
        <Card className="min-w-0 border-0 p-5 shadow-card lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">Invoice preview</h2>
              </div>
              <p className="text-sm text-muted-foreground">{invoiceId} · editable before sending</p>
            </div>
            {order && <ConfidencePill value={order.confidence} />}
          </div>

          {!order ? (
            <div className="mt-6 grid place-items-center rounded-xl border border-dashed p-10 text-center">
              <MessageSquareText className="size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No draft yet</p>
              <p className="text-sm text-muted-foreground">Extract an order to generate an editable invoice.</p>
            </div>
          ) : (
            <fieldset disabled={stage >= 3} className="mt-5 min-w-0 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Customer"><Input value={customer} onChange={(e) => { setCustomer(e.target.value); invalidateApproval(); }} placeholder="Customer name" /></Field>
                <Field label="Email for PayPal link"><Input value={email} onChange={(e) => { setEmail(e.target.value); invalidateApproval(); }} placeholder="name@example.com" /></Field>
              </div>

              <div className="overflow-hidden rounded-xl border">
                <div className="grid grid-cols-12 gap-2 bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="col-span-6">Item</span><span className="col-span-2">Qty</span><span className="col-span-3">Price</span><span className="col-span-1" />
                </div>
                {items.map((it) => (
                  <div key={it.id} className="grid grid-cols-12 items-center gap-2 border-t px-3 py-2">
                    <Input aria-label={`Item ${items.indexOf(it) + 1} name`} className="col-span-6 h-8" value={it.name} onChange={(e) => updateItem(it.id, { name: e.target.value })} />
                    <Input aria-label={`Item ${items.indexOf(it) + 1} quantity`} className="col-span-2 h-8 px-1 sm:px-3" type="number" min={0} value={it.qty} onChange={(e) => updateItem(it.id, { qty: Math.max(0, Number(e.target.value)) })} />
                    <Input aria-label={`Item ${items.indexOf(it) + 1} price`} className="col-span-3 h-8 px-1 sm:px-3" type="number" min={0} step="0.01" value={it.unitPrice} onChange={(e) => updateItem(it.id, { unitPrice: Math.max(0, Number(e.target.value)) })} />
                    <Button variant="ghost" size="icon" className="col-span-1 size-7 sm:size-8" aria-label="Remove line" onClick={() => { setItems((xs) => xs.filter((x) => x.id !== it.id)); invalidateApproval(); }}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost"
                  onClick={() => { setItems((xs) => [...xs, { id: newId(), name: "New item", qty: 1, unitPrice: 0 }]); invalidateApproval(); }}
                  className="w-full justify-start rounded-none border-t px-3 text-primary"
                >
                  <Plus className="size-4" /> Add line
                </Button>
              </div>

              {order.notes && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Note:</span> {order.notes}</p>}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <dl className="w-full space-y-1 text-sm sm:max-w-56">
                  <Row k="Subtotal" v={fmt(t.subtotal)} />
                  <Row k="Tax (8%)" v={fmt(t.tax)} />
                  <div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span>{fmt(t.total)}</span></div>
                </dl>
                <div className="space-y-3 sm:max-w-xs">
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg border bg-secondary/60 p-3 text-sm">
                    <Checkbox checked={approved} onCheckedChange={(v) => { setApproved(!!v); if (v && stage < 2) setStage(2); if (!v && stage === 2) setStage(1); }} disabled={stage >= 3} className="mt-0.5" />
                    <span>I reviewed the items and total. <span className="text-muted-foreground">Required before checkout.</span></span>
                  </label>
                  <Button onClick={createCheckout} disabled={!canCheckout} className="h-auto min-h-9 w-full whitespace-normal shadow-glow">
                    <CreditCard /> Create PayPal Sandbox checkout
                  </Button>
                  {!email && <p className="text-xs text-destructive">Add an email to send the link.</p>}
                </div>
              </div>
            </fieldset>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="min-w-0 border-0 p-5 shadow-card lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent transactions</h2>
            <span className="text-xs text-muted-foreground">{txs.length} invoices</span>
          </div>
          <div className="mt-3 divide-y">
            {txs.map((x) => (
              <div key={x.id} className="flex items-center gap-3 py-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                  {x.customer.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{x.customer} <span className="font-normal text-muted-foreground">· {x.id}</span></p>
                  <p className="truncate text-xs text-muted-foreground">{x.items}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{fmt(x.amount)}</p>
                  <p className="text-xs text-muted-foreground">{x.time}</p>
                </div>
                <StatusBadge s={x.status} />
              </div>
            ))}
          </div>
        </Card>

        <InsightsPanel order={order} reviewCount={review.length} />
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="w-[calc(100%-2rem)] min-w-0 max-w-md rounded-lg [&>*]:min-w-0">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4"><DialogTitle>{stage === 4 ? "Payment confirmed" : "Sandbox checkout created"}</DialogTitle></div>
            <DialogDescription className="break-words">
              {stage === 4 ? "Demo buyer completed payment in the PayPal Sandbox simulation." : `A demo checkout link is ready for ${email}. No real money moves.`}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-gradient-navy p-5 text-navy-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-navy-foreground/70"><span>{invoiceId}</span><SandboxBadge /></div>
            <p className="mt-4 text-sm text-navy-foreground/70">Amount due</p>
            <p className="text-3xl font-bold">{fmt(t.total)}</p>
            <p className="mt-3 truncate rounded-md bg-navy-soft px-3 py-2 font-mono text-xs">sandbox.paypal.com/checkoutnow?token=DEMO-{invoiceId}</p>
          </div>
          {stage === 4 ? (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <BadgeCheck className="size-12 text-success" />
              <p className="font-semibold">Captured {fmt(t.total)}</p>
              <Button className="mt-2 w-full" onClick={resetFlow}>Start next order</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button className="w-full" onClick={simulatePaid}><CheckCircle2 /> Simulate buyer payment</Button>
              <Button variant="outline" className="w-full" onClick={() => setCheckoutOpen(false)}>Leave pending</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1 text-xs font-medium text-muted-foreground"><span>{label}</span>{children}</label>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{k}</span><span className="text-foreground">{v}</span></div>;
}

const toneMap = {
  success: "bg-success/15 text-success",
  primary: "bg-primary/10 text-primary",
  cyan: "bg-cyan/15 text-cyan",
  warning: "bg-warning/20 text-warning-foreground",
} as const;

function Kpi({ icon: Icon, label, value, delta, tone }: { icon: typeof Wallet; label: string; value: string; delta: string; tone: keyof typeof toneMap }) {
  return (
    <Card className="gap-0 border-0 p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</span>
        <span className={cn("grid size-8 place-items-center rounded-lg", toneMap[tone])}><Icon className="size-4" /></span>
      </div>
      <p className="mt-2 font-display text-xl font-bold sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
    </Card>
  );
}

const steps = [
  { icon: MessageSquareText, label: "Message received" },
  { icon: Sparkles, label: "AI drafted invoice" },
  { icon: UserCheck, label: "Seller approved" },
  { icon: CreditCard, label: "Checkout sent" },
  { icon: BadgeCheck, label: "Payment captured" },
];

function PaymentTimeline({ stage }: { stage: Stage }) {
  return (
    <div className="rounded-xl border bg-muted/50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment flow</p>
      <ol className="space-y-2.5">
        {steps.map((s, i) => {
          const done = i <= stage && (i > 0 || stage > 0 || true);
          const active = i === stage;
          return (
            <li key={s.label} className="flex items-center gap-3 text-sm">
              <span className={cn("grid size-7 place-items-center rounded-full transition",
                i < stage || (i === 4 && stage === 4) ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-card text-muted-foreground border")}>
                {i < stage || (i === 4 && stage === 4) ? <CheckCircle2 className="size-4" /> : done ? <s.icon className="size-3.5" /> : <Circle className="size-3" />}
              </span>
              <span className={cn(active ? "font-semibold" : i < stage ? "" : "text-muted-foreground")}>{s.label}</span>
              {i === 2 && <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">Human</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const tone = value >= 80 ? "bg-success/15 text-success" : value >= 60 ? "bg-warning/20 text-warning-foreground" : "bg-destructive/15 text-destructive";
  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tone)}>AI confidence {value}%</span>;
}

const statusStyles: Record<TxStatus, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-cyan/15 text-primary",
  review: "bg-warning/20 text-warning-foreground",
  refunded: "bg-muted text-muted-foreground",
};
function StatusBadge({ s }: { s: TxStatus }) {
  return <span className={cn("w-16 shrink-0 rounded-full px-2 py-1 text-center text-xs font-semibold capitalize sm:w-20", statusStyles[s])}>{s}</span>;
}

function InsightsPanel({ order, reviewCount }: { order: ExtractedOrder | null; reviewCount: number }) {
  const max = Math.max(...WEEKLY.map((w) => w.v));
  return (
    <Card className="border-0 p-5 shadow-card lg:col-span-2">
      <div className="flex items-center gap-2"><Lightbulb className="size-5 text-cyan" /><h2 className="text-lg font-semibold">AI insights</h2></div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Weekly revenue</span><span className="flex items-center gap-1 font-semibold text-success"><TrendingUp className="size-4" />+22%</span></div>
        <div className="mt-3 flex h-24 items-end gap-2">
          {WEEKLY.map((w) => (
            <div key={w.d} className="flex h-full flex-1 flex-col justify-end items-center gap-1">
              <div className="w-full rounded-t-md bg-gradient-brand" style={{ height: `${(w.v / max) * 100}%` }} />
              <span className="text-[10px] text-muted-foreground">{w.d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {order ? (
          <div className={cn("rounded-xl border p-3", order.flags.length ? "border-warning/50 bg-warning/10" : "border-success/40 bg-success/10")}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {order.flags.length ? <AlertTriangle className="size-4 text-warning-foreground" /> : <ShieldCheck className="size-4 text-success" />}
              {order.flags.length ? "Review suggested" : "Low risk signals"}
            </div>
            <Progress value={order.confidence} className="mt-2 h-1.5" />
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {order.flags.length ? order.flags.map((f) => <li key={f}>• {f}</li>) : <li>• Known items, customer name and email detected.</li>}
            </ul>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">Extract an order to see confidence and risk cues for it.</p>
        )}
        <Insight icon={ShieldAlert} title={`${reviewCount} order held for review`} body="INV-1046: large quantity from an unknown sender with urgency language. AI flags it — you decide." />
        <Insight icon={TrendingUp} title="Croissants trend up on Fridays" body="Consider pre-baking 20% more for Friday pickups." />
        <p className="text-[11px] text-muted-foreground">Insights are suggestions. PayPilot never sends or approves payments without you.</p>
      </div>
    </Card>
  );
}

function Insight({ icon: Icon, title, body }: { icon: typeof Lightbulb; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-muted/60 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{body}</p></div>
    </div>
  );
}

