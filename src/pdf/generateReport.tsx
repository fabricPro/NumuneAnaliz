import { pdf } from "@react-pdf/renderer";
import type { AnalizState, CalcResult } from "../lib/types";
import { NumuneRaporPDF } from "./NumuneRaporPDF";

export async function generateReport(state: AnalizState, r: CalcResult): Promise<void> {
  const blob = await pdf(<NumuneRaporPDF state={state} r={r} />).toBlob();
  const ad = (state.meta.numuneAd.trim() || "numune").replace(/[^\p{L}\p{N}._-]+/gu, "_");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ad}-${state.meta.tarih}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
