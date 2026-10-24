import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOTS = ["src", "scripts", "docs"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".json", ".html"]);
const MOJIBAKE = ["Ã¢", "Ã£", "Ã©", "Ãª", "Ã´", "Ãº", "Ä‘", "Æ°", "á»", "ï¿½", "\uFFFD"];
const issues = [];

async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (EXTENSIONS.has(path.extname(entry.name)) && file !== path.join("scripts", "check-encoding.mjs")) {
      const bytes = await readFile(file);
      const decoded = bytes.toString("utf8");
      if (!Buffer.from(decoded, "utf8").equals(bytes)) issues.push(`${file}: không phải UTF-8 hợp lệ`);
      for (const token of MOJIBAKE) {
        if (decoded.includes(token)) {
          issues.push(`${file}: có dấu hiệu lỗi mã hóa (${JSON.stringify(token)})`);
          break;
        }
      }
    }
  }
}

for (const root of ROOTS) await walk(root);
if (issues.length) {
  console.error("Kiểm tra encoding thất bại:\n" + issues.map((issue) => `- ${issue}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("✓ UTF-8 hợp lệ; không phát hiện chuỗi mojibake trong source/docs.");
}
