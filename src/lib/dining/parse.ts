/** Google Sheets published CSV -> dining places. Merged cells export as blank cells. */
export type DiningPlace = {
  id: string;
  city: string;
  district: string;
  name: string;
  address: string;
  specialty: string;
  price: string;
  rating: string;
  cover: string | null;
  photos: string[];
  mapsUrl: string | null;
  note: string;
};

/** Correctly handle commas, CRLF, UTF-8 BOM, quoted commas and newlines, and escaped quotes. */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  const source = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"') {
      if (quoted && source[i + 1] === '"') { value += '"'; i++; }
      else if (quoted || value.length === 0) quoted = !quoted;
      else value += ch;
    } else if (ch === "," && !quoted) { row.push(value); value = ""; }
    else if ((ch === "\r" || ch === "\n") && !quoted) {
      if (ch === "\r" && source[i + 1] === "\n") i++;
      row.push(value); rows.push(row); row = []; value = "";
    } else value += ch;
  }
  if (row.length || value.length) { row.push(value); rows.push(row); }
  return rows;
}

const normalize = (name: string) => name.normalize("NFC").trim().toLocaleLowerCase("vi").replace(/\s+/g, " ");

/** Only local file names, never arbitrary URLs or paths. Prevent ../ and encoded path traversal. */
export function imagePath(raw: string): string | null {
  const name = raw.trim().normalize("NFC");
  if (!name || name.startsWith(".") || name.includes("..") || /[/\\%?#<>\x00-\x1f]/.test(name)) return null;
  if (!/^[\p{L}\p{N} _().-]+\.(?:png|jpe?g|webp|avif)$/iu.test(name)) return null;
  return `/images/di-an/${encodeURIComponent(name)}`;
}

function publicUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export function parseDiningCsv(csv: string): DiningPlace[] {
  const rows = parseCsv(csv);
  const headerIndex = rows.findIndex((row) => row.some((cell) => normalize(cell) === "tên quán"));
  if (headerIndex < 0) throw new Error("Không tìm thấy cột Tên quán trong CSV.");
  const headings = rows[headerIndex].map(normalize);
  const index = (label: string) => headings.indexOf(normalize(label));
  const field = (row: string[], label: string) => {
    const at = index(label);
    return at < 0 ? "" : (row[at] ?? "").trim();
  };
  let city = "";
  let district = "";
  const places: DiningPlace[] = [];
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const major = field(row, "Mục lớn");
    const minor = field(row, "Mục nhỏ");
    if (major) {
      // Explicit new Mục lớn block must never inherit the previous district.
      district = "";
      city = major;
    }
    if (minor) district = minor;
    const name = field(row, "Tên quán");
    if (!name) continue; // grouping rows and blank merged/spacer rows do not become restaurants
    const cover = imagePath(field(row, "Ảnh bìa"));
    const photos = field(row, "Ảnh bổ sung").split(/[|;\n]+/).map(imagePath).filter((p): p is string => !!p);
    const uniquePhotos = [...new Set([...(cover ? [cover] : []), ...photos])];
    places.push({
      id: `${i}-${name}`,
      city: city || "Chưa phân loại",
      district: district || "Khu vực khác",
      name,
      address: field(row, "Địa chỉ"),
      specialty: field(row, "Món nổi bật"),
      price: field(row, "Khoảng giá"),
      rating: field(row, "Đánh giá"),
      cover: cover ?? uniquePhotos[0] ?? null,
      photos: uniquePhotos,
      mapsUrl: publicUrl(field(row, "Google Maps")),
      note: field(row, "Ghi chú"),
    });
  }
  return places;
}
