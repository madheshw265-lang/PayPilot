import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dashboard } from "@/routes/index";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function draft() {
  vi.useFakeTimers();
  render(<Dashboard />);
  fireEvent.click(screen.getByRole("button", { name: /^Sample$/ }));
  fireEvent.click(screen.getByRole("button", { name: "Extract invoice" }));
  act(() => vi.advanceTimersByTime(900));
}

describe("seller demo", () => {
  it("renders the extracted sample, requires approval and records a paid checkout", () => {
    draft();
    expect(screen.getByLabelText("Customer")).toHaveValue("Priya Shah");
    expect(screen.getByLabelText("Email for PayPal link")).toHaveValue("priya.shah@example.com");
    const checkout = screen.getByRole("button", { name: "Create PayPal Sandbox checkout" });
    expect(checkout).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(checkout).toBeEnabled();
    fireEvent.change(screen.getByLabelText("Item 1 quantity"), { target: { value: "3" } });
    expect(checkout).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(checkout);
    expect(within(screen.getByRole("dialog")).getByText("$93.15")).toBeInTheDocument();
    expect(screen.getByLabelText("Item 1 quantity")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Simulate buyer payment" }));
    expect(screen.getByRole("heading", { name: "Payment confirmed" })).toBeInTheDocument();
    const transaction = screen.getByText(/Priya Shah/, { selector: "p" }).closest("div.min-w-0")?.parentElement;
    expect(transaction).not.toBeNull();
    if (!transaction) throw new Error("Missing paid transaction");
    expect(within(transaction).getByText("paid")).toBeInTheDocument();
    expect(within(transaction).getByText("$93.15")).toBeInTheDocument();
  });

  it.each(["add", "remove", "customer", "email", "price", "name"])("clears seller approval after %s changes", (kind) => {
    draft();
    fireEvent.click(screen.getByRole("checkbox"));
    if (kind === "add") fireEvent.click(screen.getByRole("button", { name: "Add line" }));
    else if (kind === "remove") {
      const remove = screen.getAllByRole("button", { name: "Remove line" })[0];
      if (!remove) throw new Error("Missing remove button");
      fireEvent.click(remove);
    }
    else {
      const label = { customer: "Customer", email: "Email for PayPal link", price: "Item 1 price", name: "Item 1 name" }[kind];
      if (!label) throw new Error("Missing field");
      fireEvent.change(screen.getByLabelText(label), { target: { value: kind === "price" ? "10" : "Changed" } });
    }
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Create PayPal Sandbox checkout" })).toBeDisabled();
  });
});
