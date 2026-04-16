/**
 * Camada ambiental (gradiente + grelha + orbes) — puramente decorativa.
 * © 2024-2026 PlayLoadX
 */

import type { ReactElement } from "react";

export function AmbientBackground(): ReactElement {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[#050508]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(124,58,237,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(34,211,238,0.12),transparent_40%)]" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[90px]" />
    </div>
  );
}
