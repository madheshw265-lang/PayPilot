export type TxStatus = "paid" | "pending" | "review" | "refunded";
export type Transaction = {
  id: string;
  customer: string;
  items: string;
  amount: number;
  status: TxStatus;
  time: string;
  confidence: number;
};

export const SAMPLE_ORDER = `Hi! This is Priya Shah — could I get 2 sourdough loaves, a dozen croissants and 3 cold brews for our team breakfast? Pick up Friday at 9am. Send the invoice to priya.shah@example.com. Thanks!`;

export const SEED_TRANSACTIONS: Transaction[] = [
  { id: "INV-1048", customer: "Marcus Lee", items: "Birthday Cake, 6× Cinnamon Roll", amount: 74.52, status: "paid", time: "12 min ago", confidence: 96 },
  { id: "INV-1047", customer: "Aisha Bello", items: "2× Coffee Beans, Tote Bag", amount: 55.08, status: "pending", time: "38 min ago", confidence: 91 },
  { id: "INV-1046", customer: "Unknown sender", items: "40× Gift Box", amount: 1512.0, status: "review", time: "1 h ago", confidence: 48 },
  { id: "INV-1045", customer: "Tom Becker", items: "4× Latte, 4× Croissant", amount: 37.37, status: "paid", time: "2 h ago", confidence: 94 },
  { id: "INV-1044", customer: "Sofia Ruiz", items: "Candle, Gift Box", amount: 61.56, status: "paid", time: "3 h ago", confidence: 89 },
  { id: "INV-1043", customer: "Daniel Kim", items: "3× Sourdough Loaf", amount: 27.54, status: "refunded", time: "Yesterday", confidence: 92 },
];

export const WEEKLY = [
  { d: "Mon", v: 420 }, { d: "Tue", v: 610 }, { d: "Wed", v: 540 },
  { d: "Thu", v: 780 }, { d: "Fri", v: 920 }, { d: "Sat", v: 1140 }, { d: "Sun", v: 860 },
];

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

