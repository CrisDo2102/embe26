"use client";

import { useEffect, useState } from "react";
import type { CategoryCount, MemoryCategory, MemoryRecord } from "@/domain/memories/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getJson, isAbortError, userFacingError } from "@/lib/api/http";
import { MAX_SEARCH_LENGTH, MEMORY_CATEGORY_LABELS, ROUTES } from "@/lib/constants";

type MemoryResponse = { data: MemoryRecord[]; meta: { count: number; query: string; category: string } };
type Entry = { items: MemoryRecord[]; error: string | null };
type Props = {
  /** Rendered on the server, so the list is in the first HTML and needs no request on load. */
  initialItems: MemoryRecord[];
  /** Only categories that contain records. */
  categories: CategoryCount[];
};

const keyOf = (query: string, category: MemoryCategory) => `${category}|${query}`;

export default function MemoryExplorer({ initialItems, categories }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const debounced = useDebouncedValue(query.trim());

  // Results are cached per query. Missing entry = loading; the previous list stays on screen meanwhile (no flash).
  const [entries, setEntries] = useState<Record<string, Entry>>({ [keyOf("", "all")]: { items: initialItems, error: null } });
  const [lastShown, setLastShown] = useState<Entry>({ items: initialItems, error: null });
  const key = keyOf(debounced, category);
  const entry = entries[key];
  const loading = entry === undefined;
  const { items, error } = entry ?? lastShown;
  const active = items.find((item) => item.id === selected) ?? null;

  useEffect(() => {
    if (entries[key]) return;
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    if (category !== "all") params.set("category", category);
    const store = (result: Entry) => {
      setEntries((current) => ({ ...current, [key]: result }));
      setLastShown(result);
    };
    getJson<MemoryResponse>(`${ROUTES.memories}?${params.toString()}`, controller.signal)
      .then((response) => store({ items: response.data, error: null }))
      .catch((reason: unknown) => {
        if (!isAbortError(reason)) store({ items: [], error: userFacingError(reason) });
      });
    return () => controller.abort();
  }, [key, entries, debounced, category]);

  function retry() {
    setEntries((current) => Object.fromEntries(Object.entries(current).filter(([entryKey]) => entryKey !== key)));
  }

  return (
    <section className="memory-explorer" aria-labelledby="memory-explorer-title">
      <div className="memory-explorer-heading">
        <div>
          <p className="eyebrow">A SMALL INDEX OF US <span>✳</span></p>
          <h3 id="memory-explorer-title">Tìm lại một kỷ niệm.</h3>
        </div>
        <span className="explorer-total">{items.length.toString().padStart(2, "0")} mẩu chuyện</span>
      </div>
      <div className="memory-search-row">
        <label className="memory-search">
          <span aria-hidden="true">⌕</span>
          <span className="visually-hidden">Tìm kiếm kỷ niệm</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value.slice(0, MAX_SEARCH_LENGTH))}
            placeholder="Thử tìm “hẹn hò”, “bình yên”…"
            autoComplete="off"
          />
        </label>
        {categories.length > 1 && (
          <label className="category-select-label">
            <span className="visually-hidden">Lọc theo nhóm</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as MemoryCategory)}>
              <option value="all">{MEMORY_CATEGORY_LABELS.all}</option>
              {categories.map(({ category: value }) => (
                <option key={value} value={value}>{MEMORY_CATEGORY_LABELS[value]}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <p className="visually-hidden" role="status">{loading ? "Đang tìm…" : error ? "" : `${items.length} mẩu chuyện`}</p>
      {!loading && error && (
        <div className="explorer-status explorer-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry}>Thử lại</button>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="explorer-status"><span>♡</span><p>Chưa tìm thấy mẩu chuyện này.</p><small>Thử một từ khóa khác nhé.</small></div>
      )}
      {items.length > 0 && (
        <div className="explorer-results" aria-busy={loading}>
          {items.map((item, index) => {
            const open = selected === item.id;
            return (
              <button
                type="button"
                key={item.id}
                className={`explorer-item ${open ? "is-selected" : ""}`}
                onClick={() => setSelected(open ? null : item.id)}
                aria-expanded={open}
              >
                <span className="explorer-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="explorer-item-copy">
                  <strong>{item.title}</strong>
                  <small>{item.date}</small>
                  {open && <span className="explorer-description">{item.description}</span>}
                </span>
                <span className="explorer-open" aria-hidden="true">{open ? "−" : "+"}</span>
              </button>
            );
          })}
        </div>
      )}
      {active && <p className="explorer-footnote">Mỗi câu chuyện là một mẩu nhỏ — còn nhiều điều đẹp đẽ chưa được viết thành lời. ♡</p>}
    </section>
  );
}
