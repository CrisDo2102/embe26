# Nhật ký nâng cấp — 1.1.0

Bản nâng cấp này giữ nguyên giao diện và toàn bộ nội dung chữ của bạn (đã đối chiếu từng chuỗi với bản gốc), tập trung vào độ đúng, độ bền, hiệu năng, trợ năng và khả năng bảo trì.

## Kết quả đo được

Đo bằng Chromium thật, trước và sau, cùng một máy.

| Chỉ số | Trước | Sau |
| --- | --- | --- |
| Ảnh tải lần đầu (5 ảnh) | 1.091 KB (JPEG) | 38 KB (AVIF) |
| Tổng dữ liệu khi mở trang, desktop | 1.330 KB | 274 KB |
| LCP, điện thoại, 4G chậm + CPU chậm 4× (trung vị 3 lần) | 4.904 ms | 2.340 ms (dao động 1.744–2.396) |
| FCP, cùng điều kiện | 576 ms | 1.084 ms (xem ghi chú) |
| JavaScript tải lần đầu | 198 KB | 215 KB |
| Lỗi/cảnh báo trong console khi tải trang | 0 | 0 |
| Vi phạm trợ năng (axe, WCAG 2.2 A/AA) | 28 phần tử (độ tương phản) | 0 |
| Lỗi + cảnh báo lint (quy tắc khuyến nghị của Next 16) | 4 + 3 | 0 + 0 |
| Test tự động | 0 | 183 (đơn vị/component) + 16 smoke + 38 e2e |
| Coverage (domain, API, lib) | — | 99% câu lệnh, 94% nhánh |

**Ghi chú về FCP:** ở bản gốc, “nội dung đầu tiên” được vẽ ra chính là màn hình *Đang mở chiếc hộp nhỏ…* (xem lỗi số 1 bên dưới), không phải câu chuyện của bạn. Bản mới vẽ ngay nội dung thật nên FCP muộn hơn nhưng LCP (khi phần chính xuất hiện) sớm hơn một nửa. JavaScript tăng ~17 KB do thêm `next/image`, sao lưu/khôi phục và hộp thoại có kiểm soát focus.

## Lỗi đã sửa (mỗi lỗi đều được tái hiện bằng test trước khi sửa)

1. **Màn hình loading nháy lên mỗi lần mở trang**, và ai không có JavaScript (hoặc bot xem trước link) chỉ thấy màn hình đó. Nguyên nhân: `loading.tsx` ở gốc bọc cả trang tĩnh trong Suspense. Đã bỏ (ADR 007). Tiêu đề hero cũng không còn bị ẩn bằng `opacity:0` trong HTML.
2. **Dữ liệu `localStorage` sai định dạng làm sập cả trang** (hiện màn hình lỗi). Tương tự khi trình duyệt chặn hoặc từ chối ghi (thường gặp ở trình duyệt nhúng trong ứng dụng chat khi chia sẻ link). Giờ hộp ghi chú vẫn chạy, và nói rõ khi không lưu được.
3. **Thêm ghi chú bị lỗi khi mở trang qua `http://` trong mạng nội bộ** (`crypto.randomUUID` chỉ có ở HTTPS/localhost).
4. **Tìm “hẹn hò” gõ từ bàn phím macOS/iOS không ra kết quả** (chuỗi dấu dạng tổ hợp NFD). Gõ không dấu (“hen ho”) cũng không ra. Cả hai đã được hỗ trợ.
5. **Danh mục kỷ niệm bị gán theo số thứ tự**: “Ngày mọi thứ bắt đầu” và “Còn nhiều chương ở phía trước” nằm trong nhóm “Những chuyến đi”. Giờ category/tags nằm trong dữ liệu.
6. **Ngày không có thật bị đổi lặng lẽ**: `2026-02-31` thành `03/03`. Giờ bị từ chối và bộ đếm ẩn đi. Bộ đếm cũng tính theo lịch Việt Nam nên mọi người ở mọi múi giờ thấy cùng một con số.
7. **Nhập tệp sao lưu có thể trùng id, và âm thầm xoá ghi chú mới nhất của bạn** khi vượt 30 mục. Giờ gộp theo thứ tự thời gian, bỏ trùng, chỉ bỏ ghi chú *cũ nhất* và báo số lượng.
8. **“Chế độ dịu nhẹ” không tác động đến animation của Motion** (chỉ CSS), và không được nhớ sau khi tải lại.
9. **Lightbox không giữ focus**: Tab thoát ra trang phía sau, đóng xong không trả focus, trang vẫn cuộn được. Giờ hoạt động như hộp thoại thật.
10. **Trang gửi request tới file nhạc (~4,4 MB) ngay khi mở**, dù chưa ai bấm phát. Đo trên Chrome: request bị hủy ngay và nhận 0 KB, nhưng cách preload của trình duyệt khác thì mình không kiểm chứng được. Khi file thiếu, thông báo cũng gây hiểu nhầm. Giờ không có request nào cho tới khi bấm phát; lỗi được giải thích đúng.
11. **Ảnh lỗi làm vỡ bố cục / không có kích thước khai báo.** Giờ có placeholder cùng kích thước.
12. **`/api/health` báo version `1.0.0` cứng** khi không chạy qua npm; **không có `/favicon.ico`** (404 mỗi lần); `cover.jpg` cache `max-age=0`; `<nav>` và `<footer>` nằm trong `<main>`; lỗi lint ở câu trích có dấu `'`.
13. **Độ tương phản chữ nhỏ** dưới ngưỡng WCAG (3.4–4.5:1).

## Thay đổi kiến trúc và hạ tầng

- `page.tsx` thành Server Component; chỉ các “đảo” tương tác chạy JS. Hero dùng animation CSS.
- Một nguồn sự thật cho mọi giới hạn (`lib/constants.ts`); trước đây 180/30/120 bị lặp ở 4 nơi.
- Lớp `domain/keepsakes` (đã viết nhưng chưa dùng) giờ là lõi của hộp ghi chú; thêm store `useSyncExternalStore` không bao giờ ném lỗi, đồng bộ nhiều tab.
- API: lỗi JSON ổn định, ETag/304, `GET /api/memories/:id`, ánh xạ `DomainError` sang mã HTTP.
- Header bảo mật + CSP, `noindex` mặc định, icon, `robots.txt`, `global-error`.
- Tooling: ESLint 9 (cấu hình Next), Vitest, Playwright + axe-core, smoke test, TypeScript chặt hơn (`noUncheckedIndexedAccess`…), CI, Dependabot, Dockerfile, `.editorconfig`, `.nvmrc`.

## Những quyết định của mình mà bạn nên xem lại

- **Phân loại lại kỷ niệm:** “Buổi hẹn đầu tiên” → `dates`; ba mục còn lại → `everyday` (không mục nào là chuyến đi). Nhóm “Những chuyến đi” tự ẩn cho tới khi bạn thêm mục `trips`. Đổi lại trong `src/data/memories.ts`.
- **Màu chữ phụ và màu đỏ tối đi nhẹ** (`--muted` `#777268`→`#666259`, `--red` `#a64e3c`→`#9e4a39`, cùng tông) để đạt tương phản 4,5:1. Hoàn tác bằng hai dòng đầu trong `globals.css` nếu bạn thích màu cũ (đổi lại sẽ làm test axe đỏ trở lại).
- **`noindex` mặc định** và **không có ảnh xem trước khi chia sẻ link**, vì đây là món quà riêng tư. Bật bằng `NEXT_PUBLIC_ALLOW_INDEXING=true`.
- **Đã xoá code không được tham chiếu ở đâu:** `domain/memories/presenter.ts`, `hooks/useMediaQuery.ts`, `hooks/useCopyText.ts`, `components/ShareMemory.tsx`, `lib/storage/browser-storage.ts`, `lib/utils/cn.ts` (và `loading.tsx`). `ShareMemory` là một tính năng chia sẻ chưa từng được gắn vào trang; nếu bạn định dùng, lấy lại từ zip gốc.
- **Thay `.vscode/`:** thư mục này chứa cấu hình C/C++ Runner với đường dẫn máy cá nhân (`launch.json`, `c_cpp_properties.json`, `settings.json`), không thuộc dự án web. Đã thay bằng cấu hình cho TypeScript/ESLint. Nếu bạn dùng chung thư mục cho code C, lấy lại từ zip gốc.
- **ESLint được ghim v9**, vì ESLint 10 làm sập plugin mà `eslint-config-next` đóng gói (đã thử, báo lỗi `getFilename`).

## Nâng cấp từ bản cũ

1. Chép đè thư mục, rồi `npm ci`. (Nên xoá `node_modules` cũ: bản trong zip gốc chứa binary của Windows.)
2. `npm run check`, `npm run build`, `npm run smoke`.
3. Ghi chú đã lưu trong trình duyệt được tự nâng cấp, không mất dữ liệu (có test).
4. Nếu bạn đã sửa `src/data/memories.ts`: mỗi kỷ niệm giờ cần thêm `id`, `category`, `tags`; mỗi ảnh cần `width` và `height` (một test báo lỗi nếu sai).

## Những gì mình chưa kiểm chứng được

- **Dockerfile:** máy này không có Docker. Mình đã kiểm tra luồng tương đương (build `standalone` → lắp thư mục runtime như Dockerfile → chạy `server.js` → 16/16 smoke check), nhưng chưa build image thật.
- **GitHub Actions:** chưa chạy trên GitHub. Các lệnh trong workflow chính là các lệnh đã chạy ở đây.
- **Trình duyệt:** e2e chạy trên một bản Chromium headless (desktop và mô phỏng Pixel 7). Chưa thử Safari/WebKit, Firefox, thiết bị thật, hay trình đọc màn hình. Axe chỉ bắt được một phần các vấn đề trợ năng, không thay thế được kiểm tra bằng người.
- **CSP** đã được kiểm chứng là không gây lỗi console trong Chromium; nên mở thử một lần trên bản deploy thật.
- Số đo hiệu năng là mô phỏng mạng/CPU trên localhost, không phải dữ liệu từ người dùng thật.

## Gợi ý bước tiếp theo (chưa làm, có chủ đích)

- Viết `alt` mô tả cho từng ảnh (mình không xem ảnh cá nhân của bạn nên không tự viết).
- Rate limiting và xác thực chỉ cần khi có endpoint *ghi* (ADR 003/004).
- Thêm database adapter sau `MemoryRepository` khi cần nội dung động.

---

# Gộp với bản của bạn (embe_1.zip)

**Giữ nguyên từ bản của bạn:** `scripts/clean-next.mjs`, `scripts/check-encoding.mjs` (và việc `check` chạy nó đầu tiên), `next typegen` trước typecheck, README viết lại cho Windows/macOS/Linux kèm mục sửa lỗi font, font stack mới trong `globals.css`, thư mục `.claude/agents` (đã thêm vào `.dockerignore`).

**Đã sửa lại sau khi ghép:**
- Xóa lại `src/app/loading.tsx` và các file không được tham chiếu (`ShareMemory`, `presenter`, `useCopyText`, `useMediaQuery`, `browser-storage`, `cn`, và cấu hình C/C++ trong `.vscode`). Chúng quay lại do chép đè lên thư mục cũ. Riêng `loading.tsx` làm lỗi màn hình loading (ADR 007) trở lại, nên có thêm test `src/app/structure.test.ts` để lần sau `npm test` báo đỏ ngay.
- Gỡ `<meta charSet>` thêm tay trong `layout.tsx`: Next đã tự sinh sẵn một thẻ, thêm nữa thành hai thẻ (HTML chỉ cho phép một). Smoke test giờ kiểm tra đúng một thẻ.

**Lưu ý về `predev` / `pretypecheck`:** cả hai xóa thư mục `.next`. Nếu chạy `npm run check` hoặc `npm run typecheck` *trong lúc* `npm run dev` đang mở, thư mục cache của dev server bị xóa dưới chân nó (mình chưa thử, nhưng nhiều khả năng làm dev server hỏng cho tới khi khởi động lại). Nếu gặp, đóng dev server trước khi typecheck, hoặc bỏ `scripts/clean-next.mjs` khỏi `pretypecheck` (chỉ giữ `next typegen`).

---

# v2.0.0 — Cinematic Editorial merge (2026-10-22)

Gộp bản cá nhân (embe_indi) với lớp cinematic editorial:

**Giữ nguyên từ bản của bạn:**
- Không có `src/app/loading.tsx` + `structure.test.ts` (ADR 007)
- Layout không nhân đôi `<meta charSet>`
- Scripts `clean-next.mjs`, `check-encoding.mjs`, README đa nền tảng
- Toàn bộ nội dung kỷ niệm, ảnh, nhạc, components logic

**Thêm từ bản cinematic:**
- Design system mới: tokens màu, shadow, ease, type scale rõ ràng
- Atmosphere: grain + vignette + ambient hearts (CSS-only, tắt khi quiet/reduced-motion)
- Nav sticky glass blur + underline hover
- Hero polaroid frame, stamp, entrance timing
- Timeline gradient + hover pulse dots
- Gallery polaroid tilt + deeper lightbox
- Letter giấy kẻ dòng + lề đỏ sổ tay
- Reasons / keepsakes hover micro-interactions
- Anniversary counter glow
- Responsive tinh chỉnh lại

Chạy `npm ci && npm run check` sau khi giải nén.
