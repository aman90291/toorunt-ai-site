"use client";

import { useEffect } from "react";
import { startPointer } from "@/lib/pointer";

/**
 * Owns the lifecycle of the shared pointer signal (lib/pointer).
 *
 * Mounted once in the layout so there is exactly one owner. Consumers — the
 * cloud shader, the perspective tilt, the cursor — only ever READ `pointer`,
 * and none of them start or stop it. That avoids the obvious alternative,
 * where each consumer calls startPointer() and the first one to unmount kills
 * the signal for everyone still using it.
 */
export function PointerDriver() {
  useEffect(() => startPointer(), []);
  return null;
}
