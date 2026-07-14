"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";

const Pipeline3D = dynamic(() => import("./Pipeline3D").then((m) => m.Pipeline3D), { ssr: false });

/** If WebGL throws at runtime, fall back to the static pipeline instead of a blank page. */
class GLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

/** Static CSS pipeline — the no-WebGL / SSR / reduced-motion floor. Never blank. */
function StaticPipeline() {
  const stages = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const human = new Set([2, 6]);
  return (
    <div className="fixed inset-0 -z-10 flex items-center justify-center" aria-hidden="true">
      <div className="flex items-center gap-0" style={{ transform: "perspective(1100px) rotateX(52deg) rotateZ(-38deg)" }}>
        {stages.map((i) => (
          <div key={i} className="flex items-center">
            {i > 0 && <span className="h-[6px] w-14 bg-gradient-to-r from-line to-line-2" />}
            {human.has(i) ? (
              <span className="relative grid h-9 w-9 place-items-center rounded-full" style={{ boxShadow: "0 0 0 6px rgba(138,120,86,.14)" }}>
                <span className="absolute inset-0 rounded-full ring-2 ring-accent-text" />
                <span className="h-4 w-4 rounded-full bg-accent-text" />
              </span>
            ) : (
              <span className="h-8 w-8 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%, #fff, #cfc8b6 60%, #9a8f76)", boxShadow: "0 8px 16px -4px rgba(0,0,0,.35)" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroScene() {
  const [mode, setMode] = useState<"static" | "reduced" | "full">("static");
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasWebGL()) setMode("static");
    else if (reduce) setMode("reduced");
    else setMode("full");
  }, []);

  if (mode === "static") return <StaticPipeline />;
  return (
    <GLBoundary fallback={<StaticPipeline />}>
      <Pipeline3D reduced={mode === "reduced"} />
    </GLBoundary>
  );
}
