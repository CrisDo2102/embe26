"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DiningImage from "@/components/DiningImage";
import type { DiningPlace } from "@/lib/dining/parse";

const ALL = "__all__";
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLocaleLowerCase("vi");

export default function DiningExplorer({ places }: { places: DiningPlace[] }) {
  const [city, setCity] = useState(ALL);
  const [district, setDistrict] = useState(ALL);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DiningPlace | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selected) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setSelected(null); }
      if (event.key === "Tab" && dialog) {
        const focusable = [...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = originalOverflow; window.removeEventListener("keydown", onKey); previousFocus?.focus(); };
  }, [selected]);
  const cities = useMemo(() => [...new Set(places.map((place) => place.city))], [places]);
  const districts = useMemo(() => [...new Set(places.filter((place) => city === ALL || place.city === city).map((place) => place.district))], [places, city]);
  const results = useMemo(() => {
    const query = normalize(search.trim());
    return places.filter((place) => (city === ALL || place.city === city) && (district === ALL || place.district === district) &&
      (!query || normalize([place.name, place.city, place.district, place.address, place.specialty, place.note].join(" ")).includes(query)));
  }, [places, city, district, search]);
  const groups = useMemo(() => {
    const grouping = new Map<string, Map<string, DiningPlace[]>>();
    for (const place of results) {
      if (!grouping.has(place.city)) grouping.set(place.city, new Map());
      const neighborhoods = grouping.get(place.city)!;
      if (!neighborhoods.has(place.district)) neighborhoods.set(place.district, []);
      neighborhoods.get(place.district)!.push(place);
    }
    return grouping;
  }, [results]);
  const showDetails = (place: DiningPlace) => { setSelected(place); setPhotoIndex(0); };
  const closeDetails = () => setSelected(null);

  return <>
    <div className="dining-stats" aria-label="Tổng quan địa điểm">
      <div><strong>{places.length.toString().padStart(2, "0")}</strong><span>ĐỊA ĐIỂM ĐÃ GHI</span></div>
      <div><strong>{cities.length.toString().padStart(2, "0")}</strong><span>THÀNH PHỐ / TỈNH</span></div>
      <div><strong>{new Set(places.map(p => `${p.city} / ${p.district}`)).size.toString().padStart(2, "0")}</strong><span>KHU VỰC</span></div>
      <span className="dining-stats-flower" aria-hidden="true">✳</span>
    </div>
    <div className="dining-filters" aria-label="Lọc địa điểm ăn uống">
      <div className="dining-filter-search"><label htmlFor="dining-search">TÌM MỘT QUÁN NHỎ</label><input id="dining-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên quán, món ngon, địa chỉ..." /></div>
      <div><label htmlFor="dining-city">MỤC LỚN · ĐỊA PHƯƠNG</label><select id="dining-city" value={city} onChange={(event) => { setCity(event.target.value); setDistrict(ALL); }}><option value={ALL}>Tất cả địa phương</option>{cities.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
      <div><label htmlFor="dining-district">MỤC NHỎ · KHU VỰC</label><select id="dining-district" value={district} onChange={(event) => setDistrict(event.target.value)}><option value={ALL}>Tất cả khu vực</option>{districts.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
    </div>
    <div className="dining-result-count" aria-live="polite"><span>✳</span> {results.length} địa điểm trong sổ tay <span className="dining-result-line" /></div>
    {groups.size ? Array.from(groups.entries()).map(([cityName, neighborhoods], cityIndex) => <section key={cityName} className="dining-city-group" aria-label={`Địa phương ${cityName}`}>
      <div className="dining-city-heading"><div><span className="eyebrow">{String(cityIndex + 1).padStart(2, "0")} / NƠI MÌNH ĐI QUA</span><h2>{cityName}<em>.</em></h2></div><span className="dining-city-decoration" aria-hidden="true">♡</span></div>
      {Array.from(neighborhoods.entries()).map(([districtName, items]) => <div className="dining-district" key={districtName}>
        <div className="dining-district-heading"><h3><span aria-hidden="true">↳ </span>{districtName}</h3><span>{items.length} {items.length === 1 ? "địa điểm" : "địa điểm"}</span></div>
        <div className="dining-grid">{items.map((item, i) => <article className="dining-card" key={item.id}>
          <button className="dining-card-photo" type="button" onClick={() => showDetails(item)} aria-label={`Xem chi tiết ${item.name}`}>
            <DiningImage src={item.cover} alt={`Ảnh của ${item.name}`} />
            <span className="dining-photo-count">{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            <span className="dining-photo-open">XEM CHI TIẾT ↗</span>
          </button>
          <div className="dining-card-body"><p className="dining-card-kicker">{item.district} · {item.city}</p><h4>{item.name}</h4>
            {item.address && <p className="dining-card-address">⌁ {item.address}</p>}
            {item.specialty && <p className="dining-card-specialty">Nên thử: <strong>{item.specialty}</strong></p>}
            <div className="dining-card-bottom"><span>{item.price || "Một nơi để nhớ"}</span><button type="button" onClick={() => showDetails(item)}>KHÁM PHÁ <span aria-hidden="true">↗</span></button></div>
          </div>
        </article>)}</div>
      </div>)}
    </section>) : <div className="dining-empty"><span aria-hidden="true">♡</span><h2>Chưa tìm thấy quán nào.</h2><p>{places.length ? "Thử một từ khóa khác hoặc chọn lại khu vực nhé." : "Chỉ cần thêm một hàng có Tên quán vào Google Sheets, nơi này sẽ dần đầy ắp những kỷ niệm."}</p>{places.length > 0 && <button className="button button-dark" type="button" onClick={() => {setSearch("");setCity(ALL);setDistrict(ALL);}}>Hiện tất cả địa điểm ↗</button>}</div>}
    {selected && <div className="dining-overlay" role="presentation" onMouseDown={(event) => {if(event.target === event.currentTarget) closeDetails();}}>
      <div ref={dialogRef} className="dining-dialog" role="dialog" aria-modal="true" aria-label={`Thông tin ${selected.name}`}>
        <div className="dining-dialog-top"><span>OUR FOOD JOURNAL ✳</span><button type="button" aria-label="Đóng chi tiết" onClick={closeDetails}>ĐÓNG ×</button></div>
        <div className="dining-dialog-image"><DiningImage src={selected.photos[photoIndex] || selected.cover} alt={`Ảnh ${photoIndex + 1} của ${selected.name}`} /></div>
        {selected.photos.length > 1 && <div className="dining-dialog-photo-nav"><button type="button" onClick={() => setPhotoIndex((photoIndex + selected.photos.length - 1) % selected.photos.length)}>← Ảnh trước</button><span>{photoIndex + 1} / {selected.photos.length}</span><button type="button" onClick={() => setPhotoIndex((photoIndex + 1) % selected.photos.length)}>Ảnh sau →</button></div>}
        <div className="dining-dialog-copy"><p className="eyebrow">{selected.city} / {selected.district}</p><h2>{selected.name}</h2>
          <dl>{selected.address && <div><dt>ĐỊA CHỈ</dt><dd>{selected.address}</dd></div>}{selected.specialty && <div><dt>MÓN NỔI BẬT</dt><dd>{selected.specialty}</dd></div>}{selected.price && <div><dt>KHOẢNG GIÁ</dt><dd>{selected.price}</dd></div>}{selected.rating && <div><dt>ĐÁNH GIÁ</dt><dd>{selected.rating}</dd></div>}</dl>
          {selected.note && <div className="dining-dialog-note"><span>GHI CHÚ CỦA MÌNH</span><p>{selected.note}</p></div>}
          {selected.mapsUrl && <a className="button button-dark" href={selected.mapsUrl} target="_blank" rel="noopener noreferrer">MỞ GOOGLE MAPS ↗</a>}
        </div>
      </div>
    </div>}
  </>;
}
