/**
 * Shared target for where the 3D constellation should sit so it clears the
 * active text panel. Values are in the camera's screen space (world units):
 * +offsetX = shift toward screen-right, +offsetY = shift toward screen-up.
 * DayNight.tsx writes the target from the active [data-side] panel; Pipeline3D
 * lerps the constellation toward it each frame.
 */
export const heroState = { offsetX: 0, offsetY: 0 };

// How far the model slides off the text side (world units) and the recede for
// centre panels.
export const FOCUS_SHIFT = 2.9;
export const FOCUS_RISE = 1.8;

/** Map a panel's text side to the constellation's screen-space offset target. */
export function sideToOffset(side: string): { x: number; y: number } {
  if (side === "right") return { x: -FOCUS_SHIFT, y: 0 };   // text right → model left
  if (side === "center") return { x: 0, y: FOCUS_RISE };    // text centre → model rises
  return { x: FOCUS_SHIFT, y: 0 };                          // text left → model right
}
