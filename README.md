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

Yêu cầu Node.js `>=22.13.0`.

```bash
npm install
cp .env.example .env.local   # điền GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET
npm run dev                  # http://localhost:3000
```

Tạo `SESSION_SECRET` bằng `openssl rand -hex 32`. Trong Google Cloud Console, thêm
`http://localhost:3000/api/auth/callback` vào Authorized redirect URIs.

Không cần chạy migration thủ công — `getDb()` áp dụng thư mục `drizzle/` ở lần truy cập đầu tiên.

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
