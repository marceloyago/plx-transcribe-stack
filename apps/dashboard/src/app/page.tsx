/**
 * Home — métricas da API (Server Component).
 * © 2024-2026 PlayLoadX
 */

import type { ReactElement } from "react";

import { HomeOverview } from "@/components/home-overview";
import { loadHomeStatus } from "@/lib/load-home-status";

export const dynamic = "force-dynamic";

export default async function HomePage(): Promise<ReactElement> {
  const status = await loadHomeStatus();
  return <HomeOverview status={status} />;
}
