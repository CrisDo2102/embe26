"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { KeepsakeImportResult } from "@/domain/keepsakes/service";
import { useKeepsakes } from "@/hooks/useKeepsakes";
import { MAX_IMPORT_BYTES, MAX_KEEPSAKE_ITEMS, MAX_KEEPSAKE_LENGTH } from "@/lib/constants";
import { formatNoteDate, ymdInTimeZone } from "@/lib/utils/date";
import { downloadTextFile } from "@/lib/utils/download";

const STARTERS = [
  "Nhớ lưu lại một điều nhỏ làm mình mỉm cười hôm nay.",
  "Có những ngày bình thường rồi sẽ thành ngày đáng nhớ.",
  "Mình muốn cùng nhau thử một điều mới vào cuối tuần này.",
];

const STORAGE_WARNING = "Trình duyệt này không cho lưu lại — ghi chú chỉ còn trong lần mở này. Hãy sao lưu thành tệp để không mất nhé.";

function describeImport(result: Extract<KeepsakeImportResult, { ok: true }>): string {
  const parts: string[] = [];
  if (result.added > 0) parts.push(`Đã khôi phục ${result.added} ghi chú ♡`);
  else if (result.skipped > 0) parts.push("Những ghi chú này đã có trong hộp rồi ♡");
  else parts.push("Tệp này chưa có ghi chú nào mới.");
  if (result.dropped > 0) parts.push(`${result.dropped} ghi chú cũ nhất không còn chỗ trong hộp.`);
  return parts.join(" ");
}

export default function MemoryKeepsake() {
  const { items, status, add, remove, exportJson, importJson } = useKeepsakes();
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [starterIndex, setStarterIndex] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = add(draft);
    if (!result.ok) {
      setNotice(result.message);
      return;
    }
    setDraft("");
    setNotice("Đã cất vào hộp ♡");
  }

  function removeItem(id: string) {
    remove(id);
    setNotice("Đã xóa ghi chú.");
  }

  function addStarter() {
    setDraft(STARTERS[starterIndex % STARTERS.length] ?? "");
    setStarterIndex((value) => value + 1);
  }

  function backup() {
    downloadTextFile(`embe-keepsakes-${ymdInTimeZone(new Date())}.json`, exportJson(), "application/json;charset=utf-8");
    setNotice("Đã tạo tệp sao lưu ♡");
  }

  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same file be chosen again later
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setNotice("Tệp quá lớn để là bản sao lưu của hộp kỷ niệm.");
      return;
    }
    const result = importJson(await file.text());
    setNotice(result.ok ? describeImport(result) : result.message);
  }

  return (
    <section className="keepsake-panel" aria-labelledby="keepsake-title">
      <div className="keepsake-heading">
        <div>
          <p className="eyebrow">A POCKET-SIZED TIME CAPSULE <span>✳</span></p>
          <h3 id="keepsake-title">Cất một điều nhỏ.</h3>
        </div>
        <span className="keepsake-count">{items.length.toString().padStart(2, "0")} / {MAX_KEEPSAKE_ITEMS}</span>
      </div>
      <p className="keepsake-intro">Một câu nói, một lời hứa, hay chuyện ngốc nghếch khiến cả hai bật cười. Những điều viết ở đây được giữ trên trình duyệt này.</p>
      <form className="keepsake-form" onSubmit={addItem}>
        <label className="visually-hidden" htmlFor="keepsake-draft">Điều muốn lưu giữ</label>
        <textarea
          id="keepsake-draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, MAX_KEEPSAKE_LENGTH))}
          placeholder="Hôm nay, mình muốn nhớ rằng…"
          rows={3}
          maxLength={MAX_KEEPSAKE_LENGTH}
        />
        <div className="keepsake-form-foot">
          <span>{MAX_KEEPSAKE_LENGTH - draft.length} ký tự còn lại</span>
          <div>
            <button type="button" className="text-button" onClick={addStarter}>Gợi ý một câu ↗</button>
            <button type="submit" className="button button-dark" disabled={!draft.trim()}>Cất vào hộp <span>♡</span></button>
          </div>
        </div>
      </form>
      <p className="keepsake-notice" role="status">{notice}</p>
      {status !== "ok" && <p className="keepsake-warning" role="alert">{STORAGE_WARNING}</p>}
      <div className="keepsake-list">
        {!items.length && (
          <div className="keepsake-empty"><span>♡</span><p>Chiếc hộp vẫn đang chờ điều đầu tiên.</p><small>Viết một điều nhỏ để bắt đầu nhé.</small></div>
        )}
        {items.map((item) => (
          <article className="keepsake-note" key={item.id}>
            <span className="keepsake-pin" aria-hidden="true">✳</span>
            <p>{item.text}</p>
            <footer>
              <time dateTime={item.createdAt}>{formatNoteDate(item.createdAt)}</time>
              <button type="button" onClick={() => removeItem(item.id)} aria-label={`Xóa ghi chú: ${item.text.slice(0, 28)}`}>Xóa ×</button>
            </footer>
          </article>
        ))}
      </div>
      <p className="keepsake-privacy">♡ Ghi chú chỉ được lưu trong trình duyệt hiện tại. Chưa có tài khoản hay đồng bộ đám mây.</p>
      <div className="keepsake-backup">
        <span>Muốn mang sang thiết bị khác?</span>
        <button type="button" className="text-button" onClick={backup} disabled={!items.length}>Sao lưu thành tệp ↓</button>
        <button type="button" className="text-button" onClick={() => fileInput.current?.click()}>Khôi phục từ tệp ↑</button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={restore} aria-label="Chọn tệp sao lưu hộp kỷ niệm" />
      </div>
    </section>
  );
}
