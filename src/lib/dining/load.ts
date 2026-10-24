import { parseDiningCsv, type DiningPlace } from "./parse";

/** Public Google Sheets publication; override only with a trusted published CSV URL. */
export const DEFAULT_DINING_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRfXZMFB-k1E166qxmkIYIk1tgGTYpuXc28cilKliJKJycutaDYsUlv20Y6SYTNwG-AmAGI380fvVHJ/pub?gid=0&single=true&output=csv";

export type DiningResult = { places: DiningPlace[]; error: string | null };

export async function loadDining(): Promise<DiningResult> {
  const url = process.env.DINING_CSV_URL || DEFAULT_DINING_CSV_URL;
  try {
    const response = await fetch(url, { next: { revalidate: 120 }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    return { places: parseDiningCsv(csv), error: null };
  } catch (error) {
    console.warn("Could not load dining CSV:", error instanceof Error ? error.message : "unknown error");
    return { places: [], error: "Chưa thể tải dữ liệu từ Google Sheets. Kiểm tra đường dẫn CSV hoặc thử lại sau nhé." };
  }
}
