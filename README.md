# embe — Little Things, Us

**v2.0 — Cinematic Editorial** · Bản gộp: nội dung & cấu trúc của bạn + lớp thiết kế cinematic.

Một chiếc album số ấm áp, giàu chất kể chuyện, dành cho những tấm ảnh và điều nhỏ muốn giữ lại. Giao diện ưu tiên tiếng Việt, font có fallback Unicode, trải nghiệm mobile và cảm giác như một cuốn scrapbook được chăm chút.

## Hai trang chính: Kỷ niệm và Đi ăn (Google Sheets)

Website giữ nguyên tất cả section cũ ở **`/`** (Kỷ niệm), và có thêm trang riêng **`/di-an`** để đọc dữ liệu quán ăn từ Google Sheets. Menu đầu trang có hai mục Kỷ niệm / Đi ăn. Không cần deploy lại chỉ để sửa tên quán, địa chỉ hay ghi chú.

### Nguồn Google Sheets CSV — Đi ăn

Sheet công khai đã cấu hình (gid `0`):

- Bản xem: `https://docs.google.com/spreadsheets/d/e/2PACX-1vRfXZMFB-k1E166qxmkIYIk1tgGTYpuXc28cilKliJKJycutaDYsUlv20Y6SYTNwG-AmAGI380fvVHJ/pubhtml?gid=0&single=true`
- CSV website dùng: `https://docs.google.com/spreadsheets/d/e/2PACX-1vRfXZMFB-k1E166qxmkIYIk1tgGTYpuXc28cilKliJKJycutaDYsUlv20Y6SYTNwG-AmAGI380fvVHJ/pub?gid=0&single=true&output=csv`
- Nếu sau này đổi Sheet: thiết lập biến môi trường server `DINING_CSV_URL` thành **link xuất bản CSV** mới. Không dùng link `/pubhtml` hoặc link `/edit`.
- Website dùng server-side fetch nên không cần API Key Google và không bị CORS trên trình duyệt. Dữ liệu được làm mới theo cache **120 giây** (Google có thể mất thêm vài phút mới xuất bản thay đổi). Khi Sheet lỗi, giao diện thông báo thay vì bịa dữ liệu.

### Cấu trúc cột trong Sheet (giữ tiếng Việt)

| Mục lớn | Mục nhỏ | Tên quán | Địa chỉ | Món nổi bật | Khoảng giá | Đánh giá | Ảnh bìa | Ảnh bổ sung | Google Maps | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tp HCM | Gò Vấp | Quán Chay An | 12 Lê Lợi | Bún riêu | 50.000đ | 5 | quan-chay-an.jpg | mon-1.png\|mon-2.jpg | https://maps.google.com/ | Rất ngon |
| *(ô merge)* | *(ô merge)* | Quán tiếp theo | | | | | | | | |
| *(ô merge)* | Bình Thạnh | Quán khác | | | | | | | | |
| Bạc Liêu | *(trống)* | Bánh mì xíu mại | | | | | | | | |

- **Mục lớn** là tỉnh/thành phố, **Mục nhỏ** là quận, phường hoặc khu vực. Có thể merge theo **chiều dọc** trong giao diện Google Sheets rồi Insert row để thêm quán mới.
- CSV không lưu thông tin merge; các ô được merge sẽ xuất thành ô trống. Bộ đọc tự **kế thừa Mục lớn / Mục nhỏ** từ hàng trên; **khi một Mục lớn mới xuất hiện thì Mục nhỏ được đặt lại**, tránh lẫn tỉnh/thành.
- Các hàng không có `Tên quán` không tạo địa điểm; có thể dùng hàng đó chỉ để thay khu vực. Cột `Tên quán` bắt buộc, các cột khác có thể để trống. Không đổi tên các header tiếng Việt.
- Vì bộ đọc kế thừa vùng từ **hàng phía trên**, nhớ giữ các hàng theo nhóm Mục lớn → Mục nhỏ và khi Insert row kiểm tra vùng merge đã được mở rộng chính xác.
- Tìm kiếm/lọc hoạt động trên thành phố, khu vực, tên quán, địa chỉ, món nổi bật; các mục vẫn tự nhóm theo thứ tự của Sheet.
- Khi chọn **Google Maps**, chỉ những URL `https://` hoặc `http://` hợp lệ mới trở thành link mở bản đồ.

### Quy ước ảnh trong folder (không dùng link ảnh ngoài)

Tạo ảnh trong **`public/images/di-an/`**, ví dụ:

```text
public/images/di-an/
├── quan-chay-an.jpg
├── mon-1.png
├── mon-2.jpg
└── banh-mi-xiu-mai.jpg
```

- `Ảnh bìa`: chỉ ghi **tên file**, ví dụ `quan-chay-an.jpg`. Website tự chuyển thành `/images/di-an/quan-chay-an.jpg`.
- `Ảnh bổ sung`: `mon-1.png|mon-2.jpg` (ngăn cách bằng dấu `|`); có thể bấm xem ảnh trong chi tiết quán.
- File có thể `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` (tên file phân biệt hoa/thường trên Vercel). Nên dùng chữ thường không dấu, dấu gạch ngang, tối ưu dung lượng ảnh.
- File ảnh không tồn tại/đặt sai tên sẽ được thay bằng hình placeholder trang trí; không xuất hiện biểu tượng ảnh vỡ.
- **Google Sheets chỉ thay đổi dữ liệu**. Ảnh được lưu trong repo/local folder nên khi thêm ảnh mới vẫn phải đưa file lên host (GitHub/Vercel) và deploy website.
- Xem thêm `public/images/di-an/README.md`.

### Cập nhật nhanh

1. Mở Sheet → Insert row dưới nhóm thành phố/quận tương ứng → nhập `Tên quán` và các trường cần thiết.
2. Sửa các ô `Ảnh bìa`, `Ảnh bổ sung` đúng tên file có trong `public/images/di-an/`.
3. Lưu Sheet bình thường, đảm bảo **Publish to web** vẫn bật và tự động xuất bản thay đổi. Đợi Google cập nhật và cache server hết hạn, sau đó tải lại `/di-an`.
4. Nếu thêm ảnh mới: copy ảnh vào folder, commit/push lên GitHub hoặc deploy theo quy trình hiện tại.

**Bảo mật:** Sheet đã publish có thể được người ngoài xem nếu biết URL. Không lưu thông tin cá nhân nhạy cảm trong Sheet.

---

## Bắt đầu nhanh (chỉ dùng npm)

**Yêu cầu:** Node.js 20.9+ (khuyến nghị bản Node.js 22 LTS mới nhất tương thích dependencies, xem `.nvmrc`) và npm. Không cần file `.bat`, không có `HUONG_DAN_CHAY.md`; toàn bộ hướng dẫn được quản lý ngay trong README này.

### Windows / macOS / Linux

1. Giải nén project và mở Terminal/CMD/PowerShell tại thư mục chứa `package.json`.
2. Kiểm tra môi trường:

   ```bash
   node --version
   npm --version
   ```

3. Cài dependencies đúng theo lockfile và chạy môi trường phát triển:

   ```bash
   npm ci
   npm run dev
   ```

4. Mở `http://localhost:3000`. Dừng server bằng `Ctrl+C`.

Lần đầu cần kết nối mạng để `npm ci` tải các package. Sau khi cài đặt xong, chạy dev không cần script launcher riêng. Nếu bạn thay đổi dependencies, dùng `npm install <ten-package>` rồi commit/copy cả `package.json` và `package-lock.json`.

### Lệnh thường dùng

| Lệnh | Làm gì |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển. |
| `npm run check` | Kiểm tra UTF-8/mojibake + typecheck + lint + toàn bộ test. Chạy trước mỗi lần commit. |
| `npm run check:encoding` | Quét source/docs để phát hiện UTF-8 không hợp lệ và một số mẫu lỗi font tiếng Việt thường gặp. |
| `npm run test` / `test:watch` / `test:coverage` | Test đơn vị và component (Vitest + Testing Library). |
| `npm run build` rồi `npm run smoke` | Build production, sau đó kiểm tra HTTP thật: header bảo mật, cache, tối ưu ảnh, HTML render sẵn từ server. |
| `npm run e2e:install` (một lần) rồi `npm run e2e` | Test trên trình duyệt thật (Playwright), desktop và mobile, kèm quét trợ năng bằng axe-core. Cần `npm run build` trước. |
| `npm run start` | Chạy bản production đã build. |

## Sửa lỗi font / tiếng Việt bị lỗi dấu

- Các file source và Markdown phải được lưu bằng **UTF-8**. VS Code: bấm encoding ở thanh trạng thái → **Save with Encoding** → `UTF-8`. Không lưu file `.ts`, `.tsx`, `.css`, `.json`, `.md` bằng ANSI/Windows-1252.
- Document khai báo `lang="vi"` và UTF-8; CSS dùng font stack ưu tiên system UI, Segoe UI/Roboto/Noto Sans/Arial để có fallback Unicode và glyph tiếng Việt. Các nút và ô nhập kế thừa cùng font để tránh giao diện mỗi chỗ một kiểu.
- Chạy `npm run check:encoding` để quét source và tài liệu. Đây là bộ phát hiện cơ bản, không thay thế việc kiểm tra giao diện thực tế.
- Nếu dấu vẫn hiển thị sai sau khi sửa file: dừng server (`Ctrl+C`), chạy `npm run dev` lại và hard refresh trình duyệt (`Ctrl+Shift+R`). Kiểm tra encoding file và thử trình duyệt khác trước khi xóa dữ liệu trình duyệt.
- Nếu chữ bị thành chuỗi kiểu `tiáº¿ng Viá»‡t`, đó thường là lỗi mã hóa nội dung (mojibake), không đơn thuần là font. Sửa văn bản gốc về UTF-8; không dùng CSS để chữa lỗi mã hóa.

## Build và chạy production

```bash
npm ci
npm run check
npm run build
npm run smoke
npm run start
```

Sau khi build thành công, mở `http://localhost:3000`. `npm run start` dùng bản production đã build; nếu source thay đổi, chạy lại `npm run build`. Có thể chỉ chạy `npm run build` khi cần kiểm tra build, hoặc `npm run check` khi cần kiểm tra chất lượng code.

### Xử lý lỗi thường gặp

- **`npm` hoặc `node` không được nhận diện:** cài Node.js 22 LTS, đóng và mở lại Terminal, sau đó kiểm tra `node -v` và `npm -v`.
- **`npm ci` lỗi:** kiểm tra mạng, proxy và phiên bản Node.js; không xóa `package-lock.json` để né lỗi.
- **Cổng 3000 đang được sử dụng:** dừng tiến trình đang chạy hoặc dùng `npm run dev -- --port 3001`, sau đó mở `http://localhost:3001`.
- **Lỗi cache / khai báo route Next.js:** các script `dev`, `build`, `typecheck` đã gọi `scripts/clean-next.mjs` để dọn cache Next.js cũ; không sửa trực tiếp file trong `.next`.
- **Test trình duyệt E2E:** chạy `npm run e2e:install` một lần để cài Chromium, sau đó `npm run build` và `npm run e2e`.

## Bộ Claude Code agents chuyên nghiệp

Project có bộ agent theo vai trò trong `.claude/agents/`. Mỗi agent là một file Markdown có YAML frontmatter và hướng dẫn chuyên môn; Claude Code có thể nạp agent cấp project từ thư mục này. Xem [tài liệu subagents chính thức của Claude Code](https://code.claude.com/docs/en/sub-agents) để biết phiên bản và cách gọi phù hợp.

### Danh mục agent

| Nhóm | Vai trò |
| --- | --- |
| `engineering/` | `frontend-developer`, `backend-architect`, `mobile-app-builder`, `ai-engineer`, `devops-automator`, `rapid-prototyper` |
| `product/` | `trend-researcher`, `feedback-synthesizer`, `sprint-prioritizer` |
| `marketing/` | `tiktok-strategist`, `instagram-curator`, `twitter-engager`, `reddit-community-builder`, `app-store-optimizer`, `content-creator`, `growth-hacker` |
| `design/` | `ui-designer`, `ux-researcher`, `brand-guardian`, `visual-storyteller`, `whimsy-injector` |
| `project-management/` | `experiment-tracker`, `project-shipper`, `studio-producer` |
| `studio-operations/` | `support-responder`, `analytics-reporter`, `infrastructure-maintainer`, `legal-compliance-checker`, `finance-tracker` |
| `testing/` | `tool-evaluator`, `api-tester`, `workflow-optimizer`, `performance-benchmarker`, `test-results-analyzer` |

### Cách dùng

1. Mở thư mục gốc của project trong Claude Code.
2. Nếu Claude Code đang mở từ trước khi `.claude/agents/` được tạo lần đầu, khởi động lại session để chắc chắn agent được nạp.
3. Giao việc cụ thể, ví dụ: “Dùng `frontend-developer` và `ui-designer` rà soát trang chủ; sau đó dùng `api-tester` và `test-results-analyzer` kiểm chứng các thay đổi. Không sửa README ngoài phần cần thiết.”
4. Với task lớn, yêu cầu agent nêu phạm vi, tiêu chí chấp nhận, kiểm thử và rủi ro trước khi sửa. Kiểm tra diff trước khi chấp nhận thay đổi.

Các agent là bộ hướng dẫn vai trò, không phải cam kết tự chạy song song hoặc tự động thực thi mọi task. Khả năng công cụ và cách gọi phụ thuộc phiên bản/cấu hình Claude Code đang dùng. Agent phải báo trung thực những kiểm tra chưa chạy được.

### Romantic UI/UX specialist agents

Nhóm `design/` bổ sung 12 agent chuyên sâu để đưa Embe theo hướng **Romantic Editorial × Digital Scrapbook × Cinematic Motion**. Các hướng dẫn được ghi trực tiếp trong từng file agent, theo định dạng subagent Markdown + YAML frontmatter của Claude Code.

| Agent | Trách nhiệm |
| --- | --- |
| `romantic-art-director` | Concept cảm xúc và art direction tổng thể |
| `luxury-editorial-designer` | Typography, hierarchy và bố cục editorial cao cấp |
| `romantic-visual-storyteller` | Nhịp kể chuyện, ảnh, caption và alt text |
| `digital-scrapbook-artist` | Motif giấy, ảnh in, thư và kỷ vật |
| `cinematic-web-designer` | Scene, nhịp điệu và chuyển cảnh có kiểm soát |
| `motion-design-specialist` | Motion system, reduced motion và hiệu năng animation |
| `micro-interaction-engineer` | Phản hồi tương tác, trạng thái và keyboard/touch |
| `romantic-design-system-architect` | Design tokens và component nhất quán |
| `mobile-romantic-ux-specialist` | Responsive/mobile UX và touch |
| `accessibility-auditor` | Accessibility, focus, contrast và WCAG-aligned review |
| `visual-regression-reviewer` | Soát lỗi giao diện theo viewport/screenshot |
| `web-performance-optimizer` | Ảnh, font, bundle, layout shift và hiệu năng |

**Định hướng thẩm mỹ:** ấm áp và riêng tư, có chất liệu giấy nhưng không rối; màu ivory, burgundy, dusty rose và ink làm gợi ý, ưu tiên design tokens hiện có; typography phải hỗ trợ dấu tiếng Việt; animation có mục đích, không autoplay âm thanh, không chặn nội dung, tôn trọng `prefers-reduced-motion`.

**Prompt mẫu:**

```text
Đọc README và các agent trong .claude/agents/design trước khi sửa.
Dùng romantic-art-director để đề xuất art direction; phối hợp
luxury-editorial-designer, digital-scrapbook-artist và
romantic-design-system-architect để triển khai nhất quán.
Sau đó dùng mobile-romantic-ux-specialist, accessibility-auditor,
visual-regression-reviewer và web-performance-optimizer để review.
Giữ nguyên hành vi hiện có, không bịa nội dung kỷ niệm, không tạo
RUN_EMBE.bat hoặc HUONG_DAN_CHAY.md. Chạy các kiểm tra có thể chạy
và ghi rõ những gì chưa xác minh được.
```

Tham khảo cách định nghĩa subagent: [Claude Code — Create custom subagents](https://code.claude.com/docs/en/sub-agents). Các file này là hướng dẫn chuyên môn; không tự đảm bảo mọi agent sẽ chạy đồng thời hoặc mọi kiểm thử đã được thực thi.

## Kiến trúc

Next.js App Router, React 19, TypeScript strict và Motion for React. Các lớp tách theo trách nhiệm; album không biến thành dashboard.

```text
src/
  app/
    api/
      health/route.ts            # health-check (có version của bản build)
      memories/route.ts          # đọc/lọc/tìm kỷ niệm (ETag, cache)
      memories/[id]/route.ts     # một kỷ niệm theo id (200/400/404)
    globals.css                  # design tokens, layout, responsive, print
    layout.tsx                   # metadata, MotionProvider, document shell
    page.tsx                     # Server Component: ghép các section
    robots.ts, icon.svg, apple-icon.png, global-error.tsx, error.tsx, not-found.tsx
  components/                    # chỉ những "đảo" tương tác mới là client component
    MemoryExplorer.tsx           # tìm kiếm (debounce, huỷ request, cache theo query)
    Gallery.tsx                  # gallery + lightbox (focus trap, trả focus, khoá scroll)
    MemoryKeepsake.tsx           # hộp ghi chú cục bộ + sao lưu/khôi phục
    MusicPlayer.tsx, SurpriseNote.tsx, AnniversaryCounter.tsx, QuietMode.tsx, ...
    MotionProvider.tsx           # một công tắc cho mọi chuyển động (OS + chế độ dịu nhẹ)
    Reveal.tsx, SafeImage.tsx    # hiện dần khi cuộn; ảnh có placeholder khi lỗi
  data/memories.ts               # NỘI DUNG có thể biên tập (kỷ niệm, ảnh, danh sách, lời nhắn)
  domain/
    memories/                    # types, repository (ranh giới lưu trữ), service (tìm/lọc), errors
    keepsakes/                   # types, serialize (làm sạch dữ liệu không tin cậy), service
  hooks/                         # useKeepsakes, useDialogFocus, useDebouncedValue, ...
  lib/
    api/                         # respond.ts (lỗi ổn định, ETag/304), http.ts (client)
    storage/                     # store cho localStorage: không bao giờ ném lỗi
    utils/                       # text (bỏ dấu, NFC), date (UTC+7, kiểm tra ngày thật), validation
    constants.ts, site.ts        # mọi giới hạn/cấu hình ở MỘT chỗ
e2e/                             # Playwright: hành trình người dùng + a11y
scripts/smoke.mjs                # kiểm tra HTTP trên server production
scripts/clean-next.mjs           # dọn cache .next trước dev/build/typecheck
scripts/check-encoding.mjs       # phát hiện file không phải UTF-8 / lỗi mojibake tiếng Việt
docs/                            # ARCHITECTURE (ADR), QUALITY-PLAN, CHANGELOG
```

### Luồng dữ liệu

```text
Page (Server Component) ──► Domain service ──► Repository interface
        │                                         ├── Local content adapter (hiện tại)
        ▼                                         └── Database adapter (có thể bổ sung sau)
Client islands ──► /api/memories ──► Domain service
```

Trang render sẵn trên server nên toàn bộ câu chuyện, timeline và danh sách kỷ niệm có ngay trong HTML đầu tiên (đọc được cả khi tắt JavaScript). JavaScript phía client chỉ dành cho phần tương tác.

## Tính năng

- Trang mở đầu, timeline, gallery và lightbox điều hướng bằng bàn phím (focus được giữ trong hộp thoại, trả về đúng ảnh đã mở khi đóng).
- Thư, danh sách những điều đáng yêu, lời nhắn bất ngờ.
- **Tìm kiếm tiếng Việt thông minh:** gõ không dấu (“hen ho”) vẫn ra “hẹn hò”; chấp nhận cả chuỗi dấu dạng tổ hợp từ bàn phím macOS/iOS; kết quả khớp đúng dấu xếp trước.
- Hộp ghi chú tối đa 30 mục trong `localStorage`, có **sao lưu/khôi phục ra tệp JSON**. Nếu trình duyệt chặn lưu (một số trình duyệt nhúng trong ứng dụng chat), ghi chú vẫn dùng được trong phiên và có cảnh báo rõ ràng. Dữ liệu từ phiên bản cũ được tự động nâng cấp, không mất ghi chú.
- Thanh tiến độ đọc, nút về đầu trang, chế độ dịu nhẹ (nhớ lựa chọn; giảm cả chuyển động do Motion điều khiển chứ không chỉ CSS).
- Responsive, focus-visible, reduced-motion, CSS in ấn, liên kết “bỏ qua điều hướng”.
- Ảnh tối ưu AVIF/WebP, có kích thước khai báo (không giật layout), placeholder khi ảnh lỗi.
- Nhạc chỉ được yêu cầu khi bấm phát (file vài MB, không phát sinh request lúc mở trang).
- Header bảo mật + CSP, mặc định không cho công cụ tìm kiếm lập chỉ mục (đây là món quà riêng tư).

## API

Mọi lỗi có cùng một dạng JSON: `{ "error": { "code": "NOT_FOUND", "message": "…" } }`. Không bao giờ trả stack trace hay chi tiết nội bộ.

### `GET /api/health`
`{ status, app, version, timestamp }`, không cache. `version` lấy từ `package.json` lúc build.

### `GET /api/memories`
- `q`: tìm trong tiêu đề, mô tả và tags (tối đa 120 ký tự; không phân biệt dấu; mọi từ phải khớp, không cần đúng thứ tự).
- `category`: `all`, `dates`, `everyday`, hoặc `trips` (giá trị lạ được hiểu là `all`).

Ví dụ: `/api/memories?q=hen%20ho&category=dates` → `{ data: [...], meta: { count, query, category } }`.
Có `ETag`; gửi lại `If-None-Match` sẽ nhận `304`.

### `GET /api/memories/:id`
`200 { data }`, `404 NOT_FOUND` hoặc `400 INVALID_INPUT` (id chứa ký tự không an toàn).

API đọc dữ liệu nội dung có sẵn; chưa có database, đăng nhập hay đồng bộ đa thiết bị. Đây là ranh giới có chủ ý để không giả vờ rằng dữ liệu đã được lưu trên server.

## Cá nhân hóa nội dung

Mọi nội dung nằm ở **`src/data/memories.ts`**:

- **Kỷ niệm:** mỗi mục cần `id` (duy nhất, không dấu cách), `category` (`dates` | `everyday` | `trips`) và `tags`. Nhóm nào chưa có mục nào sẽ tự ẩn khỏi bộ lọc.
- **Ảnh:** đặt file `.jpg` vào `public/assets/images/` rồi thêm vào `photos`, kèm `width` và `height` đúng với file (một test sẽ báo lỗi nếu khai sai, tránh ảnh bị méo). Nên viết `alt` mô tả nội dung ảnh; nếu bỏ trống sẽ dùng `title`.
- **Nhạc:** đặt file vào `public/assets/music/birthday-song.mp3`.
- **Thư:** chỉnh `src/components/LoveLetter.tsx`; danh sách “điều anh thương” và “lời nhắn” nằm trong `memories.ts`.
- **Tên website, mô tả:** `src/lib/site.ts`.

### Biến môi trường (`.env.local`, xem `.env.example`)

| Biến | Ý nghĩa |
| --- | --- |
| `NEXT_PUBLIC_RELATIONSHIP_START_DATE` | `YYYY-MM-DD`. Bật bộ đếm ngày. Ngày không có thật (vd `2026-02-31`) hoặc ở tương lai sẽ ẩn bộ đếm thay vì hiển thị sai. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` nếu bạn *cố ý* muốn Google lập chỉ mục. Mặc định: không. |
| `NEXT_PUBLIC_SITE_URL` | Địa chỉ công khai (tuỳ chọn, cho URL tuyệt đối trong bản xem trước link). |

Không bao giờ đặt bí mật vào biến `NEXT_PUBLIC_*`: chúng được đưa ra phía client.

## Triển khai

- **Vercel (hoặc nền tảng hỗ trợ Next.js):** nhập repo, dùng build mặc định `npm run build`; không cần cấu hình thêm.
- **Docker:** `docker build -t embe .` rồi `docker run --rm -p 3000:3000 embe`. Image dùng output `standalone`, chạy bằng user không phải root và có `HEALTHCHECK` vào `/api/health`.
- **CI:** `.github/workflows/ci.yml` chạy typecheck, lint, test + coverage, build, smoke và e2e cho mỗi pull request.

## Ghi chú vận hành

- `localStorage` chỉ tồn tại trên trình duyệt/thiết bị hiện tại. Dùng nút “Sao lưu thành tệp” để mang ghi chú sang nơi khác.
- Nếu thêm backend/database: validate ở server, thêm migration, kiểm soát quyền truy cập và giới hạn tốc độ API trước khi lưu nội dung riêng tư (xem `docs/ARCHITECTURE.md`).
- ESLint được ghim ở v9 vì `eslint-config-next` đóng gói plugin chưa hỗ trợ ESLint 10.
- Các thư mục `.next`, `node_modules`, `coverage`, log không thuộc source archive.

## Kiểm tra chất lượng

Phần lớn checklist trong `docs/QUALITY-PLAN.md` đã được tự động hóa; xem bảng đối chiếu ở đó. Những việc còn lại cần con người:

- [ ] Xem trên điện thoại thật, và thử với ít nhất một trình đọc màn hình.
- [ ] Kiểm tra tiếng Việt có dấu trên Windows, Android và iOS (Safari/WebKit chưa nằm trong bộ e2e); `npm run check:encoding` chỉ là kiểm tra tĩnh.
- [ ] Cấu hình ngày kỷ niệm thật trước khi bật bộ đếm.
- [ ] Viết `alt` mô tả cho từng ảnh.
- [ ] Xác nhận quyền sử dụng ảnh và nhạc trước khi public.

### Nếu chữ tiếng Việt bị tách dấu hoặc giãn bất thường

1. Dừng server bằng `Ctrl+C`.
2. Chạy `npm run dev` lại để Next.js dựng lại CSS.
3. Tải lại trình duyệt bằng `Ctrl+Shift+R`.
4. Kiểm tra `src/data/memories.ts` phải giữ nguyên chuỗi Unicode tiếng Việt; không chuyển nội dung sang ANSI/Windows-1252.
5. Nếu chỉ tiêu đề bị lỗi, kiểm tra `letter-spacing`, `font-kerning`, `font-synthesis` và font serif trong `src/app/globals.css`.

Giao diện hiện đặt tracking bình thường cho timeline, dùng Cambria/Georgia làm serif fallback và tránh ép `text-rendering: optimizeLegibility` toàn trang để giảm rủi ro lỗi metrics ở dấu tiếng Việt.
