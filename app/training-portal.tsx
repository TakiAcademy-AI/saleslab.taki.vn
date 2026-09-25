"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { customerInsights, industries, industryForProduct, products, scenarios, takiSteps, type CustomerInsight, type Industry, type Product, type Scenario } from "./data";

type Identity = { id: string; email?: string; name?: string };
type Profile = { id: string; email: string; displayName: string; team: string; role: "sale" | "admin" };
type Feedback = { score: number; issue: string; corrected: string; process: string; metrics?: Record<string, number> };
type Message = { id: string; role: "customer" | "sale"; text: string; feedback?: Feedback };
type TurnResponse = { customerMessage?: string; feedback?: Feedback; error?: string };
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

const questionWords = /(ạ|không|chưa|nào|bao nhiêu|vì sao|điều gì|khi nào|ai |chị có|chị đang|chị muốn)/i;
const empathyWords = /(em hiểu|em ghi nhận|em đồng ý|đúng là|chị đang lo|chị băn khoăn|tiếc là|cảm ơn chị)/i;

const uid = () => crypto.randomUUID();
const productName = (id: string) => products.find((item) => item.id === id)?.name ?? id;
const industryName = (productId: string) => industryForProduct(productId).name;
const scenarioName = (id: string) => scenarios.find((item) => item.id === id)?.name ?? id;
const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

export function openingFor(industry: Industry, scenario: Scenario, product: Product, customer: CustomerInsight) {
  const openings: Record<Scenario["objection"], string> = {
    time: `Chị đang tranh thủ có mấy phút thôi. ${customer.need.charAt(0).toUpperCase()}${customer.need.slice(1)}. Em hỏi nhanh giúp chị nhé.`,
    price: `${customer.budget.charAt(0).toUpperCase()}${customer.budget.slice(1)}. Nhưng ${lowerFirst(industry.priceChallenge)}`,
    trust: `${customer.past.charAt(0).toUpperCase()}${customer.past.slice(1)} nên giờ chị khá ngại nghe cam kết. ${industry.proofChallenge}`,
    authority: `${customer.decision.charAt(0).toUpperCase()}${customer.decision.slice(1)}. Nếu muốn chị mang thông tin về bàn tiếp thì em sẽ đưa cho chị những gì?`,
    fit: `${customer.situation.charAt(0).toUpperCase()}${customer.situation.slice(1)}. Chị chưa chắc ${product.name} có hợp với mình đâu, em cần biết thêm gì?`,
    competition: `Chị đang xem thêm hai bên khác nữa. ${industry.comparisonChallenge}`,
  };
  return openings[scenario.objection];
}

export default function TrainingPortal({ identity, isAdmin }: { identity: Identity; isAdmin: boolean }) {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [tab, setTab] = useState<"train" | "history" | "admin">("train");
  const [industryId, setIndustryId] = useState(industries[0].id);
  const [productId, setProductId] = useState(products[0].id);
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [customerIndex, setCustomerIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [adminSessions, setAdminSessions] = useState<SavedSession[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  const industry = useMemo(() => industries.find((item) => item.id === industryId) ?? industries[0], [industryId]);
  const availableProducts = useMemo(() => products.filter((item) => item.industryId === industry.id), [industry]);
  const product = useMemo(() => products.find((item) => item.id === productId) ?? availableProducts[0] ?? products[0], [productId, availableProducts]);
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);
  const customerOptions = customerInsights[industry.id] ?? [];
  const customer = customerOptions[customerIndex] ?? customerOptions[0];
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
    setMessages([{ id: uid(), role: "customer", text: openingFor(industry, scenario, product, customer) }]);
    setSaved(false);
    setTab("train");
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || saved || responding) return;
    const saleId = uid();
    const currentTranscript = messages;
    setMessages((current) => [...current, { id: saleId, role: "sale", text }]);
    setDraft("");
    setResponding(true);
    try {
      const response = await fetch("/api/training/respond", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer: text, industryId: industry.id, productId: product.id, scenarioId: scenario.id, customerIndex, transcript: currentTranscript }),
      });
      const data = await response.json() as TurnResponse;
      if (!response.ok) throw new Error(data.error ?? "Không thể tạo phản hồi");
      if (!data.feedback || !data.customerMessage) throw new Error("Phản hồi không hợp lệ");
      const feedback = data.feedback;
      const customerMessage = data.customerMessage;
      setMessages((current) => [
        ...current.map((message) => message.id === saleId ? { ...message, feedback } : message),
        { id: uid(), role: "customer", text: customerMessage },
      ]);
    } catch {
      setMessages((current) => [
        ...current.map((message) => message.id === saleId ? { ...message, feedback: { score: 0, issue: "Hệ thống chưa phân tích được câu này. Vui lòng gửi lại.", corrected: "Hãy thử gửi lại câu trả lời ngắn gọn hơn.", process: "Lỗi kết nối" } } : message),
        { id: uid(), role: "customer", text: "Kết nối vừa bị gián đoạn. Em gửi lại câu trả lời giúp chị nhé." },
      ]);
    } finally {
      setResponding(false);
    }
  }

  async function finishSession() {
    if (!saleMessages.length || busy) return;
    setBusy(true);
    const metricAverage = (key: string, fallback: number) => Math.round(saleMessages.reduce((sum, item) => sum + (item.feedback?.metrics?.[key] ?? fallback), 0) / saleMessages.length);
    const metrics = {
      "Bám sát lời khách": metricAverage("Bám sát lời khách", score),
      "Đúng quy trình": score,
      "Câu hỏi khai thác": metricAverage("Khai thác", Math.round((saleMessages.filter((item) => questionWords.test(item.text) || item.text.includes("?")).length / saleMessages.length) * 100)),
      "Xử lý tự nhiên": metricAverage("Lắng nghe", Math.round((saleMessages.filter((item) => empathyWords.test(item.text)).length / saleMessages.length) * 100)),
    };
    const response = await fetch("/api/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId, scenarioId, score, turns: saleMessages.length, metrics, transcript: messages }) });
    setBusy(false);
    if (response.ok) setSaved(true);
  }

  async function loadHistory(target: "history" | "admin") {
    setTab(target);
    const response = await fetch(target === "admin" ? "/api/admin/sessions" : "/api/sessions");
    const data = await response.json() as { sessions?: SavedSession[] };
    if (target === "admin") setAdminSessions(data.sessions ?? []);
    else setSessions(data.sessions ?? []);
  }

  if (loadError) return <main className="login-shell"><section className="login-card"><div className="brand-mark">T</div><p className="eyebrow">KHÔNG TẢI ĐƯỢC</p><p className="login-error">{loadError}</p><a className="primary-button login-button" href="/">Tải lại</a></section></main>;

  if (profile === undefined) return <main className="center-screen"><div className="loader" /><p>Đang tải tài khoản…</p></main>;

  if (!profile) return <Registration identity={identity} onComplete={setProfile} />;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark small">S</span><div><strong>Sales Lab Đa Ngành</strong><small>Khách hàng AI khó tính · TAKI</small></div></div>
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
            <label>Ngành hàng<select value={industryId} onChange={(e) => { const next = e.target.value; setIndustryId(next); setProductId(products.find((item) => item.industryId === next)?.id ?? products[0].id); setCustomerIndex(0); setMessages([]); setSaved(false); }}>{industries.map((item) => <option key={item.id} value={item.id}>{item.icon} {item.name}</option>)}</select></label>
            <label>Sản phẩm / dịch vụ<select value={product.id} onChange={(e) => { setProductId(e.target.value); setMessages([]); setSaved(false); }}>{availableProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Tình huống<select value={scenarioId} onChange={(e) => { setScenarioId(e.target.value); setMessages([]); setSaved(false); }}>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Chân dung khách<select value={customerIndex} onChange={(e) => { setCustomerIndex(Number(e.target.value)); setMessages([]); setSaved(false); }}>{customerOptions.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}</select></label>
            <div className="industry-badge"><span>{industry.icon}</span><div><strong>{customer.label}</strong><small>{industry.persona}</small></div></div>
            <div className="context-box"><strong>{product.name}</strong><span>{product.promise}</span><small>{product.category} · {product.price}</small></div>
            <div className="context-box challenge"><strong>Khách sẽ soi kỹ</strong><span>{industry.decisionCriteria}</span><small>Bối cảnh: {industry.context}</small></div>
            <div className="context-box amber"><strong>Mục tiêu huấn luyện</strong><span>{scenario.goal}</span><small>Bám {takiSteps[scenario.step - 1]}</small></div>
            <button className="primary-button" onClick={startTraining}>{messages.length ? "Bắt đầu phiên mới" : "Bắt đầu luyện"}</button>
            {messages.length > 0 && <button className="secondary-button" disabled={!saleMessages.length || busy} onClick={finishSession}>{saved ? "Đã lưu phiên" : busy ? "Đang lưu…" : "Kết thúc & lưu điểm"}</button>}
          </aside>

          <section className="chat-card card">
            <div className="chat-head"><div><p className="eyebrow">{industry.name.toUpperCase()} · KHÁCH HÀNG AI KHÓ TÍNH</p><h1>{scenario.name}</h1></div><div className="live-score"><span>Điểm hiện tại</span><strong>{score}</strong></div></div>
            <div className="chat-stream">
              {!messages.length && <div className="empty-state"><span>{industry.icon}</span><h2>{customer.label}</h2><p>Khách có hoàn cảnh, ngân sách, trải nghiệm và nỗi lo riêng. AI sẽ trả lời đúng điều sale hỏi rồi mới phản biện tiếp, không nhắc lại máy móc.</p></div>}
              {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
              <div ref={chatEnd} />
            </div>
            {responding && <div className="customer-thinking"><span /><span /><span /> Khách đang cân nhắc câu trả lời…</div>}
            {messages.length > 0 && !saved && <form className="composer" onSubmit={sendMessage}><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nhập câu trả lời của sale…" rows={2} disabled={responding} /><button className="send-button" aria-label="Gửi" disabled={responding}>{responding ? "Đang phản hồi" : "Gửi"}</button></form>}
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

  return <main className="login-shell"><form className="login-card registration" onSubmit={register}><div className="brand-mark">S</div><p className="eyebrow">HOÀN TẤT ĐĂNG KÝ</p><h1>Chào mừng đến Sales Lab Đa Ngành</h1><p className="login-copy">Nhập thông tin ngắn gọn để điểm và lịch sử được ghi đúng theo từng thành viên.</p>{error && <p className="login-error">{error}</p>}<label>Họ và tên<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} minLength={2} maxLength={80} required /></label><label>Đội / phòng ban<input value={team} onChange={(e) => setTeam(e.target.value)} minLength={2} maxLength={80} required /></label><button className="primary-button" disabled={busy}>{busy ? "Đang tạo tài khoản…" : "Bắt đầu luyện"}</button></form></main>;
}

function ChatMessage({ message }: { message: Message }) {
  return <div className={`message-row ${message.role}`}><div className="message-bubble">{message.text}</div>{message.feedback && <div className={`feedback-card ${message.feedback.score < 50 ? "danger" : message.feedback.score < 75 ? "warn" : "good"}`}><div className="feedback-top"><strong>Chữa câu trả lời</strong><span>{message.feedback.score}/100</span></div><p><b>Cần sửa:</b> {message.feedback.issue}</p><p><b>Câu gợi ý:</b> {message.feedback.corrected}</p><small>{message.feedback.process}</small></div>}</div>;
}

function SessionList({ title, sessions, expanded, setExpanded }: { title: string; sessions: SavedSession[]; expanded: string | null; setExpanded: (id: string | null) => void }) {
  return <section className="page-section"><div className="section-head"><p className="eyebrow">BÁO CÁO CÁ NHÂN</p><h1>{title}</h1></div>{!sessions.length ? <div className="card empty-list">Chưa có phiên luyện nào được lưu.</div> : <div className="session-list">{sessions.map((session) => <SessionCard key={session.id} session={session} open={expanded === session.id} onToggle={() => setExpanded(expanded === session.id ? null : session.id)} />)}</div>}</section>;
}

function SessionCard({ session, open, onToggle, admin = false }: { session: SavedSession; open: boolean; onToggle: () => void; admin?: boolean }) {
  return <article className="session-card card"><button className="session-summary" onClick={onToggle}><div><strong>{admin ? `${session.displayName} · ${session.team}` : scenarioName(session.scenarioId)}</strong><span>{industryName(session.productId)} · {productName(session.productId)} · {formatDate(session.createdAt)}</span></div><div className={`score-pill ${session.score < 50 ? "low" : ""}`}>{session.score}/100</div></button>{open && <div className="session-detail"><div className="metric-grid">{Object.entries(session.metrics).map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}/100</strong></div>)}</div><div className="transcript-review">{session.transcript.map((message) => <ChatMessage key={message.id} message={message} />)}</div></div>}</article>;
}

function AdminDashboard({ sessions, expanded, setExpanded }: { sessions: SavedSession[]; expanded: string | null; setExpanded: (id: string | null) => void }) {
  const people = new Set(sessions.map((item) => item.email)).size;
  const average = sessions.length ? Math.round(sessions.reduce((sum, item) => sum + item.score, 0) / sessions.length) : 0;
  return <section className="page-section"><div className="section-head"><p className="eyebrow">ADMIN DASHBOARD</p><h1>Điểm số & lịch sử toàn đội</h1><p>Chỉ tài khoản chủ sở hữu được đọc dữ liệu này; quyền được kiểm tra ở máy chủ.</p></div><div className="stats-grid"><div className="stat-card"><span>Thành viên đã luyện</span><strong>{people}</strong></div><div className="stat-card"><span>Tổng phiên</span><strong>{sessions.length}</strong></div><div className="stat-card"><span>Điểm trung bình</span><strong>{average}</strong></div></div>{!sessions.length ? <div className="card empty-list">Chưa có dữ liệu của đội.</div> : <div className="session-list">{sessions.map((session) => <SessionCard key={session.id} session={session} open={expanded === session.id} onToggle={() => setExpanded(expanded === session.id ? null : session.id)} admin />)}</div>}</section>;
}
