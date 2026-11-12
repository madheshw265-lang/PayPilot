import { describe, expect, it } from "vitest";
import { extractOrder, totals } from "@/lib/order-parser";
import { SAMPLE_ORDER } from "@/lib/demo-data";

describe("order extraction", () => {
  it("extracts sample order items and contact", () => {
    const o = extractOrder(SAMPLE_ORDER);
    expect(o.email).toBe("priya.shah@example.com");
    expect(o.customer).toBe("Priya Shah");
    const byName = Object.fromEntries(o.items.map((i) => [i.name, i.qty]));
    expect(byName).toEqual({ "Sourdough Loaf": 2, Croissant: 12, "Cold Brew": 3 });
    expect(o.flags).toEqual([]);
    expect(totals(o.items)).toEqual({ subtotal: 77.75, tax: 6.22, total: 83.97 });
  });
  it.each([
    "Hi! THIS IS Priya Shah — 2 sourdough loaves, 12 croissants and 3 cold brews. priya.shah@example.com",
    "Hi! this is priya shah — two sourdough loaves, a dozen croissants and three cold brews. priya.shah@example.com",
    "I'm Priya Shah, 2 x sourdough loaf, twelve croissant and 3× cold brew. priya.shah@example.com",
  ])("extracts sample-equivalent wording: %s", (message) => {
    const order = extractOrder(message);
    expect(order.customer).toBe("Priya Shah");
    expect(order.email).toBe("priya.shah@example.com");
    expect(Object.fromEntries(order.items.map((i) => [i.name, i.qty]))).toEqual({ "Sourdough Loaf": 2, Croissant: 12, "Cold Brew": 3 });
  });
  it("adds 8% tax to the subtotal", () => {
    expect(totals([{ id: "a", name: "x", qty: 2, unitPrice: 10 }])).toEqual({ subtotal: 20, tax: 1.6, total: 21.6 });
  });
  it("flags risky messages", () => {
    expect(extractOrder("URGENT need 40 gift boxes asap, will overpay").flags.length).toBeGreaterThan(1);
  });
});

