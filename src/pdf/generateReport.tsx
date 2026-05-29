import { pdf } from "@react-pdf/renderer";
import type { AnalizState, CalcResult } from "../lib/types";
import { NumuneRaporPDF } from "./NumuneRaporPDF";

export function reportFilename(state: AnalizState): string {
  const ad = (state.meta.numuneAd.trim() || "numune").replace(/[^\p{L}\p{N}._-]+/gu, "_");
  return `${ad}-${state.meta.tarih}.pdf`;
}

export async function buildReportBlob(state: AnalizState, r: CalcResult): Promise<Blob> {
  return await pdf(<NumuneRaporPDF state={state} r={r} />).toBlob();
}
