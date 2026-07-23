import { describe, expect, it } from "vitest";

import { formatPriceTHB } from "./currency";

describe("formatPriceTHB", () => {
  it("formats a number as Thai baht with 2 decimal places", () => {
    expect(formatPriceTHB(1234.5)).toBe("฿1,234.50");
  });

  it("formats a numeric string price (as returned by Postgres numeric columns)", () => {
    expect(formatPriceTHB("999")).toBe("฿999.00");
  });

  it("always shows exactly 2 decimal digits, never fewer or more", () => {
    expect(formatPriceTHB(100)).toBe("฿100.00");
    expect(formatPriceTHB(100.999)).toBe("฿101.00");
  });

  it("falls back to zero for non-numeric input instead of throwing", () => {
    expect(() => formatPriceTHB("not-a-number")).not.toThrow();
    expect(formatPriceTHB("not-a-number")).toBe("฿0.00");
  });
});
