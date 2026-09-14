import { getSessionUser, isAdminEmail } from "../lib/auth";
import TrainingPortal from "./training-portal";

export const dynamic = "force-dynamic";

const AUTH_ERRORS: Record<string, string> = {
  cancelled: "Bạn đã huỷ đăng nhập Google.",
  missing_code: "Google không trả về mã xác thực. Vui lòng thử lại.",
  expired_state: "Phiên đăng nhập đã quá hạn. Vui lòng bấm đăng nhập lại.",
  bad_state: "Yêu cầu đăng nhập không hợp lệ. Vui lòng thử lại từ đầu.",
  exchange_failed: "Không kết nối được tới Google. Vui lòng thử lại sau.",
  unverified_email: "Email Google của bạn chưa được xác minh.",
  not_allowed: "Email này không thuộc danh sách được phép truy cập TAKI Sales Lab.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();

  if (!user) {
    const errorCode = (await searchParams).auth_error;
    const message =
      typeof errorCode === "string" ? AUTH_ERRORS[errorCode] : undefined;

    return (
      <main className="login-shell">
        <section className="login-card">
          <div className="brand-mark">T</div>
          <p className="eyebrow">TAKI SALES LAB</p>
          <h1>Luyện tư vấn với khách hàng AI khó tính</h1>
          <p className="login-copy">
            Đăng nhập để lưu điểm, lịch sử hội thoại và nhận chữa bài ngay sau từng câu trả lời.
          </p>
          {message && <p className="login-error">{message}</p>}
          <a className="primary-button login-button" href="/api/auth/google">
            Đăng nhập bằng Google
          </a>
          <p className="login-note">Dùng email công ty. Lần đầu bạn chỉ cần nhập tên và đội nhóm.</p>
        </section>
      </main>
    );
  }

  return (
    <TrainingPortal
      identity={{ id: user.userId, email: user.email, name: user.displayName }}
      isAdmin={isAdminEmail(user.email)}
    />
  );
}
