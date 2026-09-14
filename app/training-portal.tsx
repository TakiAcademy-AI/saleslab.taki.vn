"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { products, scenarios, takiSteps, type Product, type Scenario } from "./data";

type Identity = { id: string; email?: string; name?: string };
type Profile = { id: string; email: string; displayName: string; team: string; role: "sale" | "admin" };
type Feedback = { score: number; issue: string; corrected: string; process: string };
type Message = { id: string; role: "customer" | "sale"; text: string; feedback?: Feedback };
type SavedSession = {
  id: string;
  displayName?: string;
  email?: string;
  team?: string;
  productId: string;
  scenarioId: string;
  score: number;
  turns: number;
  metrics: Record<string, number>;
  transcript: Message[];
  createdAt: string;
};

const nonsense = /^(ok|ừ|uh|uk|haha|hihi|không biết|chịu|asdf|test|abc|123|gì vậy|linh tinh)[.!?\s]*$/i;
const questionWords = /(ạ|không|chưa|nào|bao nhiêu|vì sao|điều gì|khi nào|ai |chị có|chị đang|chị muốn)/i;
const empathyWords = /(em hiểu|em ghi nhận|em đồng ý|đúng là|chị đang lo|chị băn khoăn|tiếc là|cảm ơn chị)/i;
const evidenceWords = /(ví dụ|case|kết quả|số liệu|cam kết|lộ trình|thực tế|đã áp dụng|đo lường)/i;
const nextStepWords = /(hẹn|gọi|demo|đăng ký|xác nhận|giữ chỗ|bước tiếp|thời gian nào|ngày nào)/i;

const uid = () => crypto.randomUUID();
const productName = (id: string) => products.find((item) => item.id === id)?.name ?? id;
const scenarioName = (id: string) => scenarios.find((item) => item.id === id)?.name ?? id;
const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

function correctionFor(text: string, scenario: Scenario, product: Product): Feedback {
  const clean = text.trim();
  const tooShort = clean.length < 24;
  const isNonsense = !clean || nonsense.test(clean);
  const asks = questionWords.test(clean) || clean.includes("?");
  const empathizes = empathyWords.test(clean);
  const hasEvidence = evidenceWords.test(clean);
  const hasNextStep = nextStepWords.test(clean);
  const mentionsNeed = /(mục tiêu|hiện tại|khó|vướng|ưu tiên|doanh thu|quy trình|đội ngũ|thời gian|ngân sách|kết quả)/i.test(clean);

  let score = isNonsense ? 4 : 18;
  if (!tooShort) score += 12;
  if (empathizes) score += 18;
  if (asks) score += 20;
  if (mentionsNeed) score += 16;
  if (hasEvidence) score += 10;
  if (hasNextStep) score += scenario.step >= 7 ? 14 : 5;
  if (clean.length > 360) score -= 12;
  score = Math.max(0, Math.min(100, score));

  let issue = "Câu trả lời chưa cho thấy bạn đã hiểu đúng nỗi lo và chưa có câu hỏi khai thác cụ thể.";
  if (isNonsense) issue = "Câu trả lời không liên quan đến lời khách; không đủ dữ kiện để tư vấn và không được tính điểm quy trình.";
  else if (!empathizes) issue = "Bạn đi thẳng vào giải pháp trước khi xác nhận nỗi lo của khách.";
  else if (!asks) issue = "Bạn đã ghi nhận nhưng chưa hỏi một câu giúp làm rõ tình trạng thực tế.";
  else if (clean.length > 360) issue = "Câu trả lời quá dài; khách khó tính sẽ cảm thấy bị thuyết trình thay vì được lắng nghe.";
  else if (scenario.step >= 7 && !hasNextStep) issue = "Lập luận đã khá hơn nhưng chưa chốt một hành động hoặc mốc thời gian rõ ràng.";
  else if (score >= 75) issue = "Câu trả lời bám tình huống; có thể sắc hơn bằng một dữ kiện đo lường hoặc bước tiếp cụ thể.";

  const suggestions: Record<Scenario["objection"], string> = {
    time: `Dạ em hiểu chị lo học xong vẫn không có thời gian áp dụng. Hiện chị vướng nhất ở lịch tham gia hay ở việc triển khai sau buổi học ạ? Em hỏi để kiểm tra ${product.name} có thật sự phù hợp trước khi tư vấn tiếp.`,
    price: `Dạ, so sánh chi phí là hoàn toàn hợp lý. Ngoài mức đầu tư, chị đang dùng tiêu chí kết quả nào để chọn chương trình? Nếu chị cho em biết mục tiêu và chi phí của vấn đề hiện tại, em sẽ cùng chị kiểm tra giá trị của ${product.name} thay vì chỉ nói về giá.`,
    trust: `Em hiểu vì chị đã nghe nhiều lời hứa giống nhau. Chị muốn thấy bằng chứng về kết quả, cách triển khai hay cơ chế hỗ trợ sau học trước? Em sẽ chỉ gửi đúng dữ liệu liên quan đến trường hợp của chị.`,
    authority: `Dạ, quyết định có thêm cộng sự là hợp lý. Anh/chị ấy quan tâm nhất đến ngân sách, thời gian hay kết quả đầu ra? Mình có thể hẹn 20 phút cùng trao đổi để mọi người có đủ dữ kiện trước khi quyết định.`,
    fit: `Dạ, quy mô nhỏ càng cần tránh mua một hệ thống quá nặng. Hiện đội chị có bao nhiêu người và điểm nghẽn nào làm mất nhiều thời gian hoặc doanh thu nhất? Em sẽ đối chiếu đúng phần cần dùng của ${product.name}.`,
    competition: `Dạ, chị nên so sánh kỹ. Ba tiêu chí quan trọng nhất với chị là kết quả, mức độ cầm tay chỉ việc hay hỗ trợ sau chương trình? Khi rõ tiêu chí, em sẽ nói thẳng điểm ${product.name} phù hợp và cả trường hợp không phù hợp.`,
  };

  return { score, issue, corrected: suggestions[scenario.objection], process: `Bước ${scenario.step} · ${takiSteps[scenario.step - 1]}` };
}

function customerReply(answer: string, scenario: Scenario, product: Product, turn: number): string {
  if (!answer.trim() || nonsense.test(answer.trim())) {
    return [
      "Chị chưa thấy câu đó liên quan đến điều chị vừa hỏi. Em có thể trả lời thẳng vào vấn đề được không?",
      "Nếu em chưa hiểu ý chị thì hỏi lại cho rõ, đừng trả lời cho có nhé.",
      "Câu vừa rồi chưa giúp chị có thêm dữ kiện nào để quyết định cả.",
    ][turn % 3];
  }

  const bank: Record<Scenario["objection"], string[]> = {
    time: [
      "Lịch của chị thay đổi liên tục. Nếu nghỉ một buổi thì bên em xử lý thế nào?",
      "Hỗ trợ sau học cụ thể trong bao lâu, ai hỗ trợ và phản hồi trong thời gian nào?",
      "Chị chỉ có khoảng hai giờ mỗi tuần. Em nói thật xem như vậy có làm được không?",
      "Bên em dựa vào đâu để biết học viên đang áp dụng thật chứ không lại bỏ dở?",
      "Nếu đội chị không theo kịp tiến độ thì chi phí và phương án tiếp theo là gì?",
    ],
    price: [
      `Chị vẫn chưa thấy phần nào của ${product.name} tạo ra giá trị đủ bù chi phí.`,
      "Nếu sau chương trình kết quả không đạt như kỳ vọng thì bên em chịu trách nhiệm đến đâu?",
      "Đối thủ rẻ hơn gần một nửa và cũng nói có hỗ trợ. Em so sánh bằng tiêu chí cụ thể đi.",
      "Em đang nói lợi ích chung. Với tình trạng của chị thì con số nào có thể đo được?",
      "Chị chưa muốn trả toàn bộ ngay. Có cách nào giảm rủi ro cho quyết định này không?",
    ],
    trust: [
      "Case đó có giống quy mô và ngành của chị không, hay chỉ là ví dụ đẹp nhất?",
      "Ai là người trực tiếp hướng dẫn và kinh nghiệm triển khai thực tế của họ là gì?",
      "Chị muốn xem đầu ra cụ thể, không chỉ feedback cảm tính. Bên em có gì?",
      "Nếu nội dung không giống như tư vấn ban đầu thì quy trình xử lý thế nào?",
      "Em đang hứa khá nhiều. Điều gì bên em không thể cam kết cho chị?",
    ],
    authority: [
      "Cộng sự của chị sẽ hỏi lợi tức đầu tư. Em giúp chị trả lời bằng dữ kiện nào?",
      "Nếu anh ấy không tham gia buổi trao đổi thì em cần chị gửi thông tin gì để đánh giá?",
      "Ai trong đội cần trực tiếp học và ai chỉ cần theo dõi kết quả?",
      "Chị chưa muốn bị thúc quyết định. Bước tiếp theo ít rủi ro nhất là gì?",
      "Nếu cả hai vẫn chưa thống nhất thì bên em có phương án thử hoặc đánh giá trước không?",
    ],
    fit: [
      "Đội chị chỉ có ba người và chưa dùng CRM. Bắt đầu từ đâu để không quá tải?",
      "Em đang giả định vấn đề nằm ở công cụ, nhưng nếu do năng lực đội sales thì sao?",
      "Phần nào có thể áp dụng ngay trong tuần đầu và ai phải chịu trách nhiệm?",
      "Chị không muốn mua thêm công cụ. Chương trình có tận dụng hệ thống hiện tại không?",
      "Để kết luận phù hợp, em còn thiếu dữ liệu quan trọng nào về doanh nghiệp chị?",
    ],
    competition: [
      "Đừng nói bên em tốt hơn chung chung. Điểm khác biệt nào kiểm chứng được?",
      "Nếu ưu tiên của chị là triển khai nhanh thì bên nào có lợi thế và vì sao?",
      "Bên kia cho học thử. Bên em giảm rủi ro cho chị bằng cách nào?",
      "Có trường hợp nào chị nên chọn đối thủ thay vì chọn bên em không?",
      "Em hãy giúp chị lập ba tiêu chí để tự ra quyết định, không cần chốt ngay.",
    ],
  };
  return bank[scenario.objection][turn % bank[scenario.objection].length];
}

export default function TrainingPortal({ identity, isAdmin }: { identity: Identity; isAdmin: boolean }) {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [tab, setTab] = useState<"train" | "history" | "admin">("train");
  const [productId, setProductId] = useState(products[0].id);
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [adminSessions, setAdminSessions] = useState<SavedSession[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  const product = useMemo(() => products.find((item) => item.id === productId) ?? products[0], [productId]);
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);
  const saleMessages = messages.filter((message) => message.role === "sale");
  const score = saleMessages.length ? Math.round(saleMessages.reduce((sum, item) => sum + (item.feedback?.score ?? 0), 0) / saleMessages.length) : 0;

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/me");
        if (response.status === 401) { window.location.href = "/api/auth/signout"; return; }
        if (!response.ok) {
          // A failed load is a server problem, not "this user has not registered".
          setLoadError(`Máy chủ trả lỗi ${response.status} khi tải tài khoản. Vui lòng tải lại trang hoặc báo quản trị viên.`);
          return;
        }
        const data = await response.json();
        setProfile(data.profile ?? null);
      } catch {
        setLoadError("Không kết nối được tới máy chủ. Kiểm tra mạng rồi tải lại trang.");
      }
    })();
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function startTraining() {
    setMessages([{ id: uid(), role: "customer", text: scenario.opening }]);
    setSaved(false);
    setTab("train");
  }

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || saved) return;
    const feedback = correctionFor(text, scenario, product);
    const turn = saleMessages.length;
    setMessages((current) => [
      ...current,
      { id: uid(), role: "sale", text, feedback },
      { id: uid(), role: "customer", text: customerReply(text, scenario, product, turn) },
    ]);
    setDraft("");
  }

  async function finishSession() {
    if (!saleMessages.length || busy) return;
    setBusy(true);
    const metrics = {
      "Bám sát lời khách": Math.round(saleMessages.reduce((sum, item) => sum + Math.min(100, (item.feedback?.score ?? 0) + 5), 0) / saleMessages.length),
      "Đúng quy trình": score,
      "Câu hỏi khai thác": Math.round((saleMessages.filter((item) => questionWords.test(item.text) || item.text.includes("?")).length / saleMessages.length) * 100),
      "Xử lý tự nhiên": Math.round((saleMessages.filter((item) => empathyWords.test(item.text)).length / saleMessages.length) * 100),
    };
    const response = await fetch("/api/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId, scenarioId, score, turns: saleMessages.length, metrics, transcript: messages }) });
    setBusy(false);
    if (response.ok) setSaved(true);
  }

  async function loadHistory(target: "history" | "admin") {
    setTab(target);
    const response = await fetch(target === "admin" ? "/api/admin/sessions" : "/api/sessions");
    const data = await response.json();
    if (target === "admin") setAdminSessions(data.sessions ?? []);
    else setSessions(data.sessions ?? []);
  }

  if (loadError) return <main className="login-shell"><section className="login-card"><div className="brand-mark">T</div><p className="eyebrow">KHÔNG TẢI ĐƯỢC</p><p className="login-error">{loadError}</p><a className="primary-button login-button" href="/">Tải lại</a></section></main>;

  if (profile === undefined) return <main className="center-screen"><div className="loader" /><p>Đang tải tài khoản…</p></main>;

  if (!profile) return <Registration identity={identity} onComplete={setProfile} />;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark small">T</span><div><strong>TAKI Sales Lab</strong><small>Huấn luyện tư vấn theo quy trình</small></div></div>
        <nav className="tabs" aria-label="Điều hướng">
          <button className={tab === "train" ? "active" : ""} onClick={() => setTab("train")}>Luyện tập</button>
          <button className={tab === "history" ? "active" : ""} onClick={() => loadHistory("history")}>Lịch sử của tôi</button>
          {isAdmin && <button className={tab === "admin" ? "active" : ""} onClick={() => loadHistory("admin")}>Quản trị</button>}
        </nav>
        <div className="profile-chip"><span>{profile.displayName.slice(0, 1).toUpperCase()}</span><div><strong>{profile.displayName}</strong><small>{profile.team}{isAdmin ? " · Admin" : ""}</small></div><a className="signout-link" href="/api/auth/signout">Đăng xuất</a></div>
      </header>

      {tab === "train" && (
        <section className="workspace">
          <aside className="control-panel card">
            <p className="eyebrow">THIẾT LẬP PHIÊN LUYỆN</p>
            <label>Sản phẩm<select value={productId} onChange={(e) => setProductId(e.target.value)}>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Tình huống<select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <div className="context-box"><strong>{product.name}</strong><span>{product.promise}</span><small>{product.category} · {product.price}</small></div>
            <div className="context-box amber"><strong>Mục tiêu huấn luyện</strong><span>{scenario.goal}</span><small>Bám {takiSteps[scenario.step - 1]}</small></div>
            <button className="primary-button" onClick={startTraining}>{messages.length ? "Bắt đầu phiên mới" : "Bắt đầu luyện"}</button>
            {messages.length > 0 && <button className="secondary-button" disabled={!saleMessages.length || busy} onClick={finishSession}>{saved ? "Đã lưu phiên" : busy ? "Đang lưu…" : "Kết thúc & lưu điểm"}</button>}
          </aside>

          <section className="chat-card card">
            <div className="chat-head"><div><p className="eyebrow">KHÁCH HÀNG AI · KHÓ TÍNH</p><h1>{scenario.name}</h1></div><div className="live-score"><span>Điểm hiện tại</span><strong>{score}</strong></div></div>
            <div className="chat-stream">
              {!messages.length && <div className="empty-state"><span>💬</span><h2>Sẵn sàng cho một khách hàng không dễ tính?</h2><p>AI sẽ bám trực tiếp vào câu trả lời của sale. Sau mỗi câu, hệ thống chấm và chữa ngay theo quy trình TAKI.</p></div>}
              {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
              <div ref={chatEnd} />
            </div>
            {messages.length > 0 && !saved && <form className="composer" onSubmit={sendMessage}><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nhập câu trả lời của sale…" rows={2} /><button className="send-button" aria-label="Gửi">Gửi</button></form>}
            {saved && <div className="saved-banner"><strong>Đã lưu phiên · {score}/100</strong><span>Admin có thể xem đầy đủ hội thoại và phần chữa bài này.</span></div>}
          </section>
        </section>
      )}

      {tab === "history" && <SessionList title="Lịch sử luyện tập của tôi" sessions={sessions} expanded={expanded} setExpanded={setExpanded} />}
      {tab === "admin" && isAdmin && <AdminDashboard sessions={adminSessions} expanded={expanded} setExpanded={setExpanded} />}
    </main>
  );
}

function Registration({ identity, onComplete }: { identity: Identity; onComplete: (profile: Profile) => void }) {
  const [displayName, setDisplayName] = useState(identity.name ?? "");
  const [team, setTeam] = useState("Sales");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function register(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/me", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ displayName, team }) });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.profile) {
        setError(data?.error ?? `Không tạo được tài khoản (lỗi ${response.status}). Vui lòng thử lại hoặc báo quản trị viên.`);
        return;
      }
      onComplete(data.profile);
    } catch {
      setError("Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-shell"><form className="login-card registration" onSubmit={register}><div className="brand-mark">T</div><p className="eyebrow">HOÀN TẤT ĐĂNG KÝ</p><h1>Chào mừng đến TAKI Sales Lab</h1><p className="login-copy">Nhập thông tin ngắn gọn để điểm và lịch sử được ghi đúng theo từng thành viên.</p>{error && <p className="login-error">{error}</p>}<label>Họ và tên<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} minLength={2} maxLength={80} required /></label><label>Đội / phòng ban<input value={team} onChange={(e) => setTeam(e.target.value)} minLength={2} maxLength={80} required /></label><button className="primary-button" disabled={busy}>{busy ? "Đang tạo tài khoản…" : "Bắt đầu luyện"}</button></form></main>;
}

function ChatMessage({ message }: { message: Message }) {
  return <div className={`message-row ${message.role}`}><div className="message-bubble">{message.text}</div>{message.feedback && <div className={`feedback-card ${message.feedback.score < 50 ? "danger" : message.feedback.score < 75 ? "warn" : "good"}`}><div className="feedback-top"><strong>Chữa câu trả lời</strong><span>{message.feedback.score}/100</span></div><p><b>Cần sửa:</b> {message.feedback.issue}</p><p><b>Câu gợi ý:</b> {message.feedback.corrected}</p><small>{message.feedback.process}</small></div>}</div>;
}

function SessionList({ title, sessions, expanded, setExpanded }: { title: string; sessions: SavedSession[]; expanded: string | null; setExpanded: (id: string | null) => void }) {
  return <section className="page-section"><div className="section-head"><p className="eyebrow">BÁO CÁO CÁ NHÂN</p><h1>{title}</h1></div>{!sessions.length ? <div className="card empty-list">Chưa có phiên luyện nào được lưu.</div> : <div className="session-list">{sessions.map((session) => <SessionCard key={session.id} session={session} open={expanded === session.id} onToggle={() => setExpanded(expanded === session.id ? null : session.id)} />)}</div>}</section>;
}

function SessionCard({ session, open, onToggle, admin = false }: { session: SavedSession; open: boolean; onToggle: () => void; admin?: boolean }) {
  return <article className="session-card card"><button className="session-summary" onClick={onToggle}><div><strong>{admin ? `${session.displayName} · ${session.team}` : scenarioName(session.scenarioId)}</strong><span>{productName(session.productId)} · {formatDate(session.createdAt)}</span></div><div className={`score-pill ${session.score < 50 ? "low" : ""}`}>{session.score}/100</div></button>{open && <div className="session-detail"><div className="metric-grid">{Object.entries(session.metrics).map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}/100</strong></div>)}</div><div className="transcript-review">{session.transcript.map((message) => <ChatMessage key={message.id} message={message} />)}</div></div>}</article>;
}

function AdminDashboard({ sessions, expanded, setExpanded }: { sessions: SavedSession[]; expanded: string | null; setExpanded: (id: string | null) => void }) {
  const people = new Set(sessions.map((item) => item.email)).size;
  const average = sessions.length ? Math.round(sessions.reduce((sum, item) => sum + item.score, 0) / sessions.length) : 0;
  return <section className="page-section"><div className="section-head"><p className="eyebrow">ADMIN DASHBOARD</p><h1>Điểm số & lịch sử toàn đội</h1><p>Chỉ tài khoản chủ sở hữu được đọc dữ liệu này; quyền được kiểm tra ở máy chủ.</p></div><div className="stats-grid"><div className="stat-card"><span>Thành viên đã luyện</span><strong>{people}</strong></div><div className="stat-card"><span>Tổng phiên</span><strong>{sessions.length}</strong></div><div className="stat-card"><span>Điểm trung bình</span><strong>{average}</strong></div></div>{!sessions.length ? <div className="card empty-list">Chưa có dữ liệu của đội.</div> : <div className="session-list">{sessions.map((session) => <SessionCard key={session.id} session={session} open={expanded === session.id} onToggle={() => setExpanded(expanded === session.id ? null : session.id)} admin />)}</div>}</section>;
}
