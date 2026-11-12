// Simulated "AI" extraction for the demo: deterministic, client-side, no network.
export type LineItem = { id: string; name: string; qty: number; unitPrice: number };

export type ExtractedOrder = {
  customer: string;
  email: string;
  items: LineItem[];
  notes: string;
  confidence: number; // 0-100
  flags: string[];
};

export const CATALOG: Record<string, number> = {
  "sourdough loaf": 8.5,
  croissant: 3.75,
  "cold brew": 5.25,
  "latte": 4.9,
  "cinnamon roll": 4.25,
  "birthday cake": 42,
  "coffee beans": 18,
  "tote bag": 15,
  candle: 22,
  "gift box": 35,
};

const WORD_NUM: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, dozen: 12, twelve: 12,
};

let seq = 0;
export const newId = () => `li_${Date.now().toString(36)}_${seq++}`;

export function subtotal(items: LineItem[]) {
  return round(items.reduce((s, i) => s + i.qty * i.unitPrice, 0));
}
export const TAX_RATE = 0.08;
export function totals(items: LineItem[]) {
  const sub = subtotal(items);
  const tax = round(sub * TAX_RATE);
  return { subtotal: sub, tax, total: round(sub + tax) };
}
function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function extractOrder(text: string): ExtractedOrder {
  const lower = text.toLowerCase();
  const items: LineItem[] = [];
  const flags: string[] = [];

  for (const [name, price] of Object.entries(CATALOG)) {
    const product = name.endsWith("loaf")
      ? `${name.slice(0, -4)}(?:loaf|loaves)`
      : `${name}s?`;
    const quantity = `(?:a\\s+)?dozen|\\d+|${Object.keys(WORD_NUM).join("|")}`;
    const re = new RegExp(`\\b(?:(${quantity})\\s*(?:[x×]\\s*)?)?${product}\\b`, "i");
    const m = lower.match(re);
    if (m) {
      const raw = m[1]?.trim().replace(/^a\s+dozen$/, "dozen");
      const qty = raw ? (Number(raw) || WORD_NUM[raw] || 1) : 1;
      items.push({ id: newId(), name: titleCase(name), qty, unitPrice: price });
    }
  }

  const email = text.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/)?.[0] ?? "";
  const nameMatch =
    text.match(/(?:i'm|i am|this is|name is|from|it's)\s+([a-z]+(?:\s+[a-z]+)?)(?=\s*[-—–,!.?\n]|\s*$)/i) ??
    text.match(/[-–]\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*$/m);
  const customer = titleCase((nameMatch?.[1] ?? "").toLowerCase());
  const noteMatch = text.match(/(?:pick ?up|deliver(?:y)?|by|on)\s+([^.!\n]{3,40})/i);
  const notes = noteMatch ? noteMatch[0].trim() : "";

  if (!customer) flags.push("Customer name not detected — please confirm");
  if (!email) flags.push("No email found — needed to send the PayPal link");
  if (items.length === 0) flags.push("No catalog items matched — add lines manually");
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  if (totalQty >= 30) flags.push("Unusually large quantity — review before sending");
  if (/urgent|asap|gift card|wire|overpay/i.test(text)) flags.push("Urgency / payment-pressure language detected");

  const confidence = Math.max(
    35,
    Math.min(98, 60 + items.length * 9 + (customer ? 8 : 0) + (email ? 8 : 0) - flags.length * 7),
  );

  return { customer, email, items, notes, confidence, flags };
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

