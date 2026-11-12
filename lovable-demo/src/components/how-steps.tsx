import { MessageSquareText, Sparkles, UserCheck, CreditCard, LayoutDashboard } from "lucide-react";

export const HOW_STEPS = [
  { icon: MessageSquareText, title: "Paste the order", body: "Copy any customer message — email, Instagram DM, WhatsApp — into the AI Order Composer." },
  { icon: Sparkles, title: "AI drafts the invoice", body: "Items, quantities, prices, customer and email are extracted with a confidence score and risk cues." },
  { icon: UserCheck, title: "Seller reviews & approves", body: "Edit any line, check the total and tick approval. Nothing is sent without this human step." },
  { icon: CreditCard, title: "PayPal checkout", body: "A PayPal Sandbox checkout link is created for the approved amount and shared with the buyer." },
  { icon: LayoutDashboard, title: "Track & learn", body: "The dashboard tracks payment status and surfaces practical insights — trends, holds, follow-ups." },
];

export function HowSteps() {
  return (
    <ol className="grid gap-4 md:grid-cols-5">
      {HOW_STEPS.map((s, i) => (
        <li key={s.title} className="relative rounded-2xl border bg-card p-5 shadow-card">
          <span className="font-display text-xs font-bold text-primary">STEP {i + 1}</span>
          <s.icon className="mt-3 size-6 text-primary" />
          <h3 className="mt-3 font-semibold">{s.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

