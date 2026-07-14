import { ECON } from "./stats";

/** Pure pricing math — no React, unit-testable, shared by the calculator. */
export function computePricing(prsPerMonth: number) {
  const devagentCost = prsPerMonth * ECON.price;
  const humanLow = prsPerMonth * ECON.humanLow;
  const humanHigh = prsPerMonth * ECON.humanHigh;
  const humanMid = (humanLow + humanHigh) / 2;
  const savings = humanMid - devagentCost;
  const savingsPct = Math.round((savings / humanMid) * 100);
  // ~6 loaded engineer-hours per human PR (8–16h band midpoint, discounted for review)
  const hoursReturned = Math.round(prsPerMonth * 8);
  return { devagentCost, humanLow, humanHigh, humanMid, savings, savingsPct, hoursReturned };
}

export const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
