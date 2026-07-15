"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Component, useEffect, useState, type ReactNode } from "react";

const Scene3D = dynamic(() => import("./three/Scene3D"), { ssr: false });

/** If WebGL throws at runtime, fall back instead of a blank page. */
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

/** Static CSS pipeline — the home page's no-WebGL floor. Never blank. */
function StaticPipeline() {
  const stages = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const human = new Set([2, 6]);
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
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

/**
 * The global background: one persistent WebGL canvas behind every page —
 * fluid haze + particle dust everywhere, the constellation + orbit camera on
 * the home page. Mounted once in the layout, so route changes never rebuild
 * the GL context. Falls back gracefully (static pipeline on home, quiet ground
 * elsewhere) when WebGL is unavailable.
 */
export function BackgroundFX() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [mode, setMode] = useState<"static" | "reduced" | "full">("static");
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasWebGL()) setMode("static");
    else if (reduce) setMode("reduced");
    else setMode("full");
    // "lite" tier: strip the heaviest 3D (haze shader, bloom, most dust, high DPR)
    // on phones/tablets and low-power machines — the #1 cause of scroll lag/crashes.
    const nav = navigator as Navigator & { deviceMemory?: number };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 820;
    const weak = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4;
    setLite(coarse || small || weak);
  }, []);

  return (
    <div className="hero-3d fixed inset-0 -z-10" aria-hidden="true">
      {mode === "static" ? (
        home ? <StaticPipeline /> : null
      ) : (
        <GLBoundary fallback={home ? <StaticPipeline /> : null}>
          <Scene3D home={home} reduced={mode === "reduced"} lite={lite} />
        </GLBoundary>
      )}
    </div>
  );
}
