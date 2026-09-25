# TAKI Sales Lab

Hệ thống luyện tư vấn cho đội ngũ sales TAKI với khách hàng mô phỏng khó tính, chấm điểm từng câu và lưu lịch sử huấn luyện.

Chạy tại **https://saleslab.taki.vn** (Coolify, VPS 152.53.177.175).

## Tính năng

- Đăng nhập bằng Google, giới hạn theo domain email công ty.
- Đăng ký hồ sơ nội bộ đơn giản: họ tên và đội nhóm.
- Nhiều sản phẩm, tình huống và bước bán hàng TAKI.
- Khách hàng mô phỏng phản hồi theo loại từ chối của tình huống.
- Chữa bài ngay sau từng câu: điểm, lỗi, câu gợi ý và bước quy trình.
- Lịch sử cá nhân và dashboard admin xem toàn bộ điểm, transcript.
- Dữ liệu lưu trong SQLite trên volume `/data`, migration tự chạy khi khởi động.

## Chạy cục bộ

Yêu cầu **Node.js `>=22.13.0`**. Trên Linux cần thêm `python3`, `make`, `g++` —
`better-sqlite3` là native module phải biên dịch lúc cài
(`sudo apt install -y python3 make g++`). macOS cần Xcode Command Line Tools.

### 1. Cài và cấu hình

```bash
npm install
cp .env.example .env.local
openssl rand -hex 32          # dán vào SESSION_SECRET
```

### 2. Tạo Google OAuth client

App không có mật khẩu riêng, đăng nhập hoàn toàn qua Google. Vào
[console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
→ *Create credentials* → *OAuth client ID* → *Web application*, thêm vào
**Authorized redirect URIs** (đúng từng ký tự, không thừa dấu `/` cuối):

```
http://localhost:3000/api/auth/callback
```

Điền `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` vào `.env.local`. Đặt
`APP_URL=http://localhost:3000` và `ALLOWED_EMAIL_DOMAINS=*` nếu muốn đăng nhập
bằng email bất kỳ khi phát triển. Muốn thấy tab Quản trị thì đặt
`TAKI_ADMIN_EMAIL` bằng chính email mình dùng để đăng nhập.

Nếu consent screen để ở chế độ *Testing*, chỉ email nằm trong **Test users** mới
đăng nhập được — thêm email của mình vào đó, hoặc bấm **Publish app**.

### 3. Chạy

```bash
npm run dev        # http://localhost:3000
npm test           # 147 check hội thoại trên 13 ngành
npm run typecheck
```

Không cần chạy migration thủ công: `getDb()` tự áp dụng thư mục `drizzle/` ở lần
truy cập đầu tiên, tạo sẵn `./data/saleslab.sqlite`.

### Chạy không cần AI

Để trống `AI_BACKEND`, `OPENAI_API_KEY` và `OPENAI_MODEL` thì app vẫn chạy đầy đủ
bằng engine tất định trong `lib/training-engine.ts` — vẫn sinh câu khách bám ngành
và chấm điểm 5 trục. Đây là cấu hình nhẹ nhất để bắt đầu; nối AI là bước tuỳ chọn.

## Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `APP_URL` | ✅ | Origin công khai, dùng dựng `redirect_uri`. Ví dụ `https://saleslab.taki.vn` |
| `GOOGLE_CLIENT_ID` | ✅ | OAuth client dạng Web application |
| `GOOGLE_CLIENT_SECRET` | ✅ | Secret của client trên |
| `SESSION_SECRET` | ✅ | Khoá ký cookie phiên, tối thiểu 32 ký tự |
| `ALLOWED_EMAIL_DOMAINS` | — | Mặc định `taki.vn`. Nhận domain hoặc email cụ thể, phân tách bằng dấu phẩy. `*` để mở hết |
| `TAKI_ADMIN_EMAIL` | — | Email thấy tab Quản trị, cho phép nhiều email phân tách bằng dấu phẩy |
| `DATABASE_PATH` | — | Mặc định `/data/saleslab.sqlite` trong image Docker |
| `AI_BACKEND` | — | `codex` để dùng Codex CLI. Để trống thì dùng `OPENAI_API_KEY` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | — | Phải có cả hai; thiếu một sẽ rơi về engine tất định |
| `CODEX_HOME` / `CODEX_TIMEOUT_MS` | — | Chỉ dùng khi `AI_BACKEND=codex` |

Không commit `.env`, `.dev.vars` hay secret vào repository.

## Triển khai

Build bằng `Dockerfile` (Next.js standalone). Cần gắn **persistent volume vào `/data`** —
nếu không, toàn bộ điểm và transcript sẽ mất mỗi lần redeploy.

## Công nghệ

Next.js 16 App Router, React 19, TypeScript, SQLite (better-sqlite3), Drizzle ORM, Google OAuth 2.0.

## Ghi chú

Repo gốc được sinh cho nền tảng OpenAI Sites (Cloudflare Workers + D1 + đăng nhập ChatGPT).
Bản này đã port sang Node + SQLite + Google OAuth để chạy trên VPS. Các file còn sót của
nền tảng cũ (`vite.config.ts`, `build/`, `scripts/`, `.openai/`, `app/chatgpt-auth.ts`)
không còn được dùng và bị loại khỏi cả `tsconfig.json` lẫn image Docker.
