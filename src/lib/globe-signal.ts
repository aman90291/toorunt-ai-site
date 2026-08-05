/**
 * The one-way channel from the search field to the globe.
 *
 * Deliberately a mutable module singleton rather than React state or context.
 * The globe reads it inside `useFrame`, sixty times a second; routing focus
 * and keystrokes through `useState` would re-render the R3F tree on every
 * character typed, which at best throws away the render target's bindings and
 * at worst tears down and recompiles the shader mid-animation. Nothing here
 * needs to trigger a render — the canvas is already rendering.
 *
 * `pulse` is a level, not an event: `ping()` sets it to 1 and the frame loop
 * decays it. That way a burst of keystrokes reads as one sustained ripple
 * instead of stacking into a seizure.
 */

type GlobeState = {
  /** 1 while the search field holds focus. */
  focus: number;
  /** 0..1, set to 1 on each keystroke, decayed by the frame loop. */
  pulse: number;
};

const state: GlobeState = { focus: 0, pulse: 0 };

export const globeSignal = {
  setFocus(on: boolean) {
    state.focus = on ? 1 : 0;
  },
  ping() {
    state.pulse = 1;
  },
  read(): Readonly<GlobeState> {
    return state;
  },
  /** Called by the frame loop only. */
  decay(delta: number) {
    if (state.pulse > 0) state.pulse = Math.max(0, state.pulse - delta * 0.9);
  },
};
