import { takiSteps, type CustomerInsight, type Industry, type Product, type Scenario } from "../app/data";

export type Feedback = {
  score: number;
  issue: string;
  corrected: string;
  process: string;
  metrics?: Record<string, number>;
};

export type TrainingMessage = {
  id?: string;
  role: "customer" | "sale";
  text: string;
  feedback?: Feedback;
};

export type TrainingTurnResult = {
  customerMessage: string;
  feedback: Feedback;
  mode: "ai" | "adaptive";
  diagnostics: {
    detectedIntents: string[];
    answeredFacts: string[];
    challengeType: string;
    duplicateRisk: number;
  };
};

type Intent =
  | "need"
  | "timing"
  | "past"
  | "budget"
  | "decision"
  | "fear"
  | "warranty"
  | "price"
  | "proof"
  | "comparison"
  | "fit"
  | "next_step";

const nonsense = /^(ok|ừ|uh|uk|haha|hihi|không biết|chịu|asdf|test|abc|123|gì vậy|linh tinh|ờ|uhm)[.!?\s]*$/i;
const empathyPattern = /(em hiểu|em ghi nhận|em đồng ý|đúng là|chị đang lo|chị băn khoăn|cảm ơn chị|em xin lỗi|em hiểu ý|em hiểu rằng)/i;
const evidencePattern = /(ví dụ|case|kết quả|số liệu|cam kết|lộ trình|thực tế|đã áp dụng|đo lường|chứng nhận|hồ sơ|video|ảnh thật)/i;
const nextStepPattern = /(hẹn|gọi|demo|đăng ký|xác nhận|giữ chỗ|bước tiếp|thời gian nào|ngày nào|gửi chị|đặt lịch|xem mẫu|thử|đo)/i;
const questionPattern = /\?|\b(không|chưa|nào|bao nhiêu|vì sao|điều gì|khi nào|ai|chị có|chị đang|chị muốn|chị cần)\b/i;
const vagueOptionPattern = /\b(mẫu|gói|loại|phương án|máy|sản phẩm|bộ|set|combo|căn|phòng|tour|khóa|liệu trình|dịch vụ)\s*(số\s*)?\d+\b|\b(mẫu|gói|loại|phương án|máy|sản phẩm|bộ|set|combo|căn|phòng|tour|khóa|liệu trình|dịch vụ)\s+này\s*(ok|được|ổn|hợp|không|đáp ứng)/i;
const deliveryPattern = /(giao hàng|vận chuyển|giao trễ|giao chậm|chậm giao|trễ đơn|giao kịp|nhận hàng|đúng hẹn|tuyến giao)/i;

const intentPatterns: Record<Intent, RegExp> = {
  need: /(mục tiêu|mong muốn|ưu tiên|nhu cầu|cần gì|tìm gì|dùng để|mua để)/i,
  timing: /(khi nào|bao giờ|thời gian|rảnh|gấp|ngày nào|tuần này|tháng này|cần trước|dự kiến (khi|ngày|tháng|tuần)|giao hàng|vận chuyển|giao trễ|trễ|kịp|đúng hẹn)/i,
  past: /(từng|trước đây|đã dùng|đã mua|đã học|kinh nghiệm|lần trước|trải nghiệm cũ)/i,
  budget: /(ngân sách|mức tiền|khoảng bao nhiêu|chi được|đầu tư bao nhiêu|học phí)/i,
  decision: /(ai quyết|người quyết|chồng|vợ|gia đình|sếp|phê duyệt|quyết định cùng)/i,
  fear: /(lo nhất|ngại nhất|sợ|rủi ro|băn khoăn|e ngại)/i,
  warranty: /(bảo hành|đổi trả|hậu mãi|hỗ trợ sau|bảo trì|hoàn tiền)/i,
  price: /(giá|chi phí|rẻ|đắt|khuyến mãi|giảm|phát sinh|đơn giá)/i,
  proof: /(bằng chứng|chứng nhận|case|số liệu|hồ sơ|kiểm chứng|cam kết|ảnh thật|video thật)/i,
  comparison: /(so sánh|đối thủ|bên khác|bên kia|bên đó|phương án khác|chỗ khác|thương hiệu khác|chênh lệch)/i,
  fit: /(phù hợp|hợp với|đáp ứng|giải quyết|dành cho|đúng nhu cầu)/i,
  next_step: /(hẹn|đăng ký|đặt lịch|giữ chỗ|chốt|thanh toán|đặt cọc|bước tiếp)/i,
};

const sectorSignals: Record<string, RegExp> = {
  fashion: /(size|form|dáng|vai|eo|vòng ngực|số đo|vải|màu|chiều cao|cân nặng)/i,
  accessories: /(phụ kiện|trang sức|nhẫn|vòng|dây chuyền|cổ tay|ngón tay|chất liệu|dị ứng|xuống màu|khóa|làm quà)/i,
  beauty: /(da|mụn|nám|routine|hoạt chất|retinol|kích ứng|thành phần|serum|mỹ phẩm)/i,
  food: /(ăn|uống|khẩu phần|calo|đạm|đường|dinh dưỡng|dị ứng|hạn dùng|bảo quản)/i,
  "home-appliances": /(diện tích|công suất|độ ồn|điện|vệ sinh|bộ lọc|linh kiện|gia dụng)/i,
  technology: /(cấu hình|ram|chip|pin|phần mềm|dữ liệu|camera|bộ nhớ|bảo mật|công nghệ)/i,
  education: /(mục tiêu học|khóa học|lộ trình|giảng viên|bài tập|trình độ|đầu ra|chuyển nghề|portfolio)/i,
  travel: /(chuyến đi|phòng|khách sạn|tour|vé|lịch trình|hoàn hủy|trẻ em|người lớn tuổi)/i,
  "real-estate": /(căn hộ|pháp lý|sổ|vay|lãi suất|dòng tiền|bàn giao|thanh khoản|mét vuông)/i,
  healthcare: /(triệu chứng|bệnh|thuốc|bác sĩ|xét nghiệm|điều trị|sức khỏe|bệnh nền|chỉ định)/i,
  spa: /(liệu trình|phác đồ|laser|thẩm mỹ|thiết bị|chống chỉ định|hồi phục)/i,
  interior: /(mặt bằng|nội thất|tủ|bếp|sofa|bản vẽ|boq|thi công|kích thước)/i,
  "building-materials": /(công trình|vật tư|gạch|chống thấm|định mức|lô|co\/cq|nghiệm thu|hao hụt)/i,
};

const stopWords = new Set("chi em anh la va co cua cho voi thi ma duoc khong mot nhung cac dang se da nay do de ve nhu tu vao khi neu cung rat chi can muon giup ben minh nhe nha roi con".split(" "));

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string) {
  return normalize(text).split(" ").filter((word) => word.length > 2 && !stopWords.has(word));
}

export function similarity(left: string, right: string) {
  const a = new Set(tokens(left));
  const b = new Set(tokens(right));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / Math.max(1, Math.min(a.size, b.size));
}

function ngrams(text: string, size = 3) {
  const words = tokens(text);
  const values = new Set<string>();
  for (let index = 0; index <= words.length - size; index += 1) values.add(words.slice(index, index + size).join(" "));
  return values;
}

export function repetitionRisk(left: string, right: string) {
  const semantic = similarity(left, right);
  const leftNgrams = ngrams(left);
  const rightNgrams = ngrams(right);
  if (!leftNgrams.size || !rightNgrams.size) return semantic;
  const shared = [...leftNgrams].filter((value) => rightNgrams.has(value)).length;
  const phrase = shared / Math.max(1, Math.min(leftNgrams.size, rightNgrams.size));
  return Math.max(semantic, phrase);
}

function hash(text: string) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value >>> 0);
}

function sentenceCount(text: string) {
  return text.split(/[.!?\n]+/).filter((part) => part.trim().length > 3).length;
}

function focusFromCustomer(text: string, industry: Industry) {
  const parts = text.split(/[.!?\n]+/).map((part) => part.trim()).filter((part) => part.length > 8);
  if (!parts.length) return "điều chị vừa nêu";
  const ranked = parts.map((part, index) => {
    const normalizedPart = ` ${normalize(part)} `;
    const keywordHits = industry.keywords.filter((keyword) => {
      const value = normalize(keyword);
      return value.length >= 3 && normalizedPart.includes(` ${value} `);
    }).length;
    const sectorHit = sectorSignals[industry.id]?.test(part) ? 2 : 0;
    const needHit = /(cần|muốn|ưu tiên|lo|sợ|phải|nếu)/i.test(part) ? 2 : 0;
    return { part, index, score: keywordHits * 3 + sectorHit + needHit };
  }).sort((left, right) => right.score - left.score || left.index - right.index);
  const focus = ranked[0].part.replace(/^chị\s*/i, "").trim();
  return focus.length > 150 ? `${focus.slice(0, 147).trim()}…` : focus;
}

function detectIntents(text: string): Intent[] {
  return (Object.entries(intentPatterns) as [Intent, RegExp][])
    .filter(([, pattern]) => pattern.test(text))
    .map(([intent]) => intent);
}

function customerFact(intent: Intent, customer: CustomerInsight) {
  const facts: Partial<Record<Intent, string>> = {
    need: customer.need,
    timing: customer.timing,
    past: customer.past,
    budget: customer.budget,
    decision: customer.decision,
    fear: customer.fear,
  };
  return facts[intent] ?? "";
}

function upperFirst(text: string) {
  const clean = text.trim().replace(/[.?!]+$/, "");
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : clean;
}

function contextMismatch(text: string, industry: Industry) {
  const bodyStats = /(cao bao nhiêu|chiều cao|nặng bao nhiêu|cân nặng|bao nhiêu kg|mấy kg)/i.test(text);
  const bodyStatsRelevant = ["fashion", "food", "healthcare", "spa"].includes(industry.id);
  if (bodyStats && !bodyStatsRelevant) return true;
  const normalizedText = normalize(text);
  const paddedText = ` ${normalizedText} `;
  const ownKeyword = industry.keywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword);
    return normalizedKeyword.length >= 3 && paddedText.includes(` ${normalizedKeyword} `);
  });
  const ownTopic = ownKeyword || (sectorSignals[industry.id]?.test(text) ?? false);
  const foreignTopic = Object.entries(sectorSignals).some(([id, pattern]) => id !== industry.id && pattern.test(text));
  const usefulGeneric = /(mục tiêu|mong muốn|ưu tiên|ngân sách|thời gian|từng dùng|từng mua|trước đây|ai quyết|lo nhất|băn khoăn|bảo hành|giá|bằng chứng)/i.test(text);
  return !ownTopic && foreignTopic && !usefulGeneric;
}

function relevantToLastCustomer(answer: string, lastCustomer: string, intents: Intent[]) {
  const overlap = similarity(answer, lastCustomer);
  const lastIntents = detectIntents(lastCustomer);
  const intentMatch = intents.some((intent) => lastIntents.includes(intent));
  return Math.min(1, Math.max(overlap, intentMatch ? 0.72 : 0));
}

function pickLeastRepeated(candidates: { text: string; type: string }[], previousCustomer: string[], seed: string) {
  const ranked = candidates.map((candidate, index) => ({
    ...candidate,
    index,
    repeat: previousCustomer.reduce((max, message) => Math.max(max, repetitionRisk(candidate.text, message)), 0),
  })).sort((a, b) => a.repeat - b.repeat || ((hash(seed + a.index) % 997) - (hash(seed + b.index) % 997)));
  return ranked[0];
}

function challengeBank(scenario: Scenario, industry: Industry, product: Product) {
  const common = [
    { text: industry.afterSalesChallenge, type: "warranty" },
    { text: industry.priceChallenge, type: "price" },
    { text: industry.proofChallenge, type: "proof" },
    { text: industry.comparisonChallenge, type: "comparison" },
    ...industry.challenges.map((text, index) => ({ text, type: `industry_${index + 1}` })),
  ];
  const scenarioSpecific: Record<Scenario["objection"], { text: string; type: string }[]> = {
    time: [
      { text: "Chị đang ít thời gian, em chọn đúng một thông tin quan trọng nhất cần hỏi trước được không?", type: "focus" },
      { text: "Nếu cần quyết nhanh thì bước nào là bắt buộc và bước nào có thể làm sau?", type: "priority" },
    ],
    price: [
      { text: `Với ${product.name}, phần giá trị nào đủ rõ để chị trả thêm tiền?`, type: "price_value" },
      { text: "Em tách giúp chị chi phí chính, chi phí có thể phát sinh và phần không bao gồm nhé.", type: "price_breakdown" },
    ],
    trust: [
      { text: `Nói thật giúp chị: ${product.name} có giới hạn nào bên em không thể cam kết?`, type: "limitations" },
      { text: "Bằng chứng nào kiểm tra được độc lập, không phải nội dung quảng cáo của bên em?", type: "independent_proof" },
    ],
    authority: [
      { text: "Người cùng quyết định với chị cần xem thông tin gì để không phải nghe lại toàn bộ tư vấn?", type: "decision_pack" },
      { text: "Chị chưa đặt cọc ngay. Có bước kiểm tra nào trước khi cả nhà quyết định không?", type: "low_risk_step" },
    ],
    fit: [
      { text: `Trường hợp nào thì chị không nên chọn ${product.name}?`, type: "disqualifier" },
      { text: `Em dựa trên dữ kiện nào để kết luận ${product.name} hợp với trường hợp của chị?`, type: "fit_evidence" },
    ],
    competition: [
      { text: "Em chọn ba tiêu chí có thể kiểm chứng để chị tự so với bên khác nhé.", type: "comparison_criteria" },
      { text: `Có trường hợp nào bên khác phù hợp hơn ${product.name} không?`, type: "honest_comparison" },
    ],
  };
  return [...scenarioSpecific[scenario.objection], ...common];
}

function preferredChallenges(intents: Intent[], scenario: Scenario, industry: Industry, product: Product) {
  const bank = challengeBank(scenario, industry, product);
  const wanted = new Set<string>();
  if (intents.includes("warranty")) wanted.add("warranty");
  if (intents.includes("price") || intents.includes("budget")) wanted.add("price");
  if (intents.includes("proof")) wanted.add("proof");
  if (intents.includes("comparison")) wanted.add("comparison");
  if (intents.includes("fit")) wanted.add("fit_evidence");
  const reactive = bank.filter((item) => wanted.has(item.type) || detectIntents(item.text).some((intent) => intents.includes(intent)));
  return reactive.length ? [...reactive, ...bank.filter((item) => !wanted.has(item.type))] : bank;
}

function claimChallenges(answer: string, intents: Intent[]) {
  const claims: { text: string; type: string }[] = [];
  const certainty = /(cứ yên tâm|chắc chắn|cam kết|100%|không thể trễ|không trễ được|không bao giờ)/i.test(answer);
  const competitorClaim = /(bên (đó|kia).*(đểu|dở|kém|không tốt)|chất liệu bên (đó|kia))/i.test(answer);

  if (deliveryPattern.test(answer) && certainty) {
    claims.push(
      { text: "Em nói sẽ không trễ, nhưng nếu đơn vẫn chậm do phát sinh vận chuyển thì bên em báo chị khi nào và xử lý ra sao?", type: "timing_claim" },
      { text: "Căn cứ nào để em chắc chắn giao kịp, và phương án dự phòng nếu hãng vận chuyển chậm là gì?", type: "timing_claim" },
    );
  }
  if (intents.includes("comparison") && competitorClaim) {
    claims.push(
      { text: "Em nói chất liệu bên kia không tốt dựa trên thông tin nào? Chị cần em so bằng loại vải, độ hoàn thiện và chính sách đổi trả cụ thể.", type: "comparison_claim" },
      { text: "Chị không muốn nghe nhận xét cảm tính về bên khác. Em chỉ rõ mẫu bên em hơn ở tiêu chí nào và có gì kiểm chứng được nhé.", type: "comparison_claim" },
    );
  }
  return claims;
}

function connectorsFor(customer: CustomerInsight) {
  const connectors: Record<CustomerInsight["voice"], string[]> = {
    direct: ["Chị hỏi thẳng thêm:", "Vậy em nói rõ giúp chị:", "Chị cần chốt đúng điểm này:", "Còn một ý quan trọng:", "Được, nhưng chị muốn biết:"],
    cautious: ["Chị hiểu rồi, nhưng vẫn hơi lo:", "Vậy em làm rõ giúp chị:", "Chị muốn hỏi kỹ thêm:", "Phần này chị hiểu; còn điểm sau thì sao:", "Trước khi quyết định, chị cần biết:"],
    impatient: ["Đi thẳng vào ý này giúp chị:", "Được rồi, trả lời nhanh giúp chị:", "Chị chỉ hỏi thêm đúng một việc:", "Vậy chốt giúp chị điểm này:", "Còn việc này thì sao:"],
    skeptical: ["Chị vẫn cần kiểm tra thêm:", "Lý lẽ đó nghe được; còn điểm này:", "Chị chưa yên tâm ở chỗ:", "Muốn chị tin thì em làm rõ:", "Chị cần một câu trả lời cụ thể về:"],
  };
  return connectors[customer.voice];
}

function responseForRepeatedFact(intent: Intent, customer: CustomerInsight) {
  const labels: Partial<Record<Intent, string>> = {
    need: "nhu cầu",
    timing: "thời gian cần",
    past: "trải nghiệm trước đây",
    budget: "ngân sách",
    decision: "người quyết định",
    fear: "điều chị lo",
  };
  return `Phần ${labels[intent] ?? "đó"} chị vừa nói rồi: ${customerFact(intent, customer).replace(/^chị\s*/i, "")}. Em dùng dữ kiện đó để tư vấn tiếp giúp chị nhé.`;
}

function buildCustomerMessage(args: {
  answer: string;
  scenario: Scenario;
  product: Product;
  industry: Industry;
  customer: CustomerInsight;
  transcript: TrainingMessage[];
}) {
  const { answer, scenario, product, industry, customer, transcript } = args;
  const clean = answer.trim();
  const previousCustomer = transcript.filter((item) => item.role === "customer").map((item) => item.text);
  const intents = detectIntents(clean);
  const hasQuestion = questionPattern.test(clean);
  const mismatch = contextMismatch(clean, industry);
  const verbose = clean.length > 420 || sentenceCount(clean) > 7;
  const vagueOption = vagueOptionPattern.test(clean) && !industry.keywords.some((keyword) => clean.toLowerCase().includes(keyword.toLowerCase()));

  if (!clean || nonsense.test(clean)) {
    const candidate = pickLeastRepeated([
      { text: "Chị chưa thấy câu đó trả lời điều chị vừa hỏi. Em nói lại đúng trọng tâm giúp chị nhé.", type: "nonsense" },
      { text: "Nếu em chưa hiểu ý chị thì hỏi lại, đừng trả lời cho có nhé.", type: "nonsense" },
      { text: "Câu vừa rồi chưa cho chị thêm dữ kiện nào để quyết định. Em trả lời lại cụ thể giúp chị.", type: "nonsense" },
      { text: "Chị chưa hiểu em muốn tư vấn điều gì. Em bám đúng vấn đề chị vừa nêu nhé.", type: "nonsense" },
    ], previousCustomer, clean + transcript.length);
    return { text: candidate.text, intents, answeredFacts: [] as string[], challengeType: candidate.type, duplicateRisk: candidate.repeat };
  }

  if (mismatch) {
    const naturalNeed = customer.need.replace(/^chị (cần|muốn)\s*/i, "");
    const candidate = pickLeastRepeated([
      { text: `Thông tin đó liên quan thế nào đến việc chọn ${product.name} vậy em? Chị đang cần ${naturalNeed}.`, type: "off_topic" },
      { text: `Khoan, câu đó đang lệch khỏi nhu cầu của chị. Với ${product.name}, em cần hỏi dữ kiện nào thực sự liên quan?`, type: "off_topic" },
      { text: `Chị chưa thấy mối liên hệ giữa câu vừa rồi và ${industry.decisionCriteria}. Em hỏi lại đúng trọng tâm giúp chị nhé.`, type: "off_topic" },
    ], previousCustomer, clean);
    return { text: candidate.text, intents, answeredFacts: [] as string[], challengeType: candidate.type, duplicateRisk: candidate.repeat };
  }

  if (vagueOption) {
    const namedMachine = /\bmáy\s*(số\s*)?\d+\b/i.test(clean);
    const numberedOption = clean.match(vagueOptionPattern)?.[0]?.trim();
    const optionCandidates = namedMachine
      ? [
          { text: `“Máy số 1” cụ thể là model nào? Em nói rõ ${industry.decisionCriteria} và vì sao nó hợp với nhu cầu chị vừa nêu nhé.`, type: "vague_option" },
          { text: `Em đang nói đến máy nào vậy? Chị cần biết kích thước, cách vệ sinh và căn cứ đáp ứng việc quét lau trước khi quyết định.`, type: "vague_option" },
        ]
      : numberedOption
        ? [
            { text: `Chị vẫn chưa biết “${numberedOption}” cụ thể là lựa chọn nào. Em nêu tên hoặc mã, ${industry.decisionCriteria} và lý do phù hợp giúp chị nhé.`, type: "vague_option" },
            { text: `“${upperFirst(numberedOption)}” là lựa chọn nào trong ${product.name}? Em mô tả đặc điểm thực tế và căn cứ phù hợp, đừng chỉ nói “đẹp” nhé.`, type: "vague_option" },
          ]
      : [
          { text: "Mẫu nào và đặc điểm nào khiến em thấy hợp với chị vậy? Em nói rõ căn cứ giúp chị nhé.", type: "vague_option" },
          { text: `Chị chưa biết “mẫu đó” cụ thể là gì. Em mô tả đặc điểm và lý do phù hợp với nhu cầu của chị nhé.`, type: "vague_option" },
          { text: `Em đang nói tới lựa chọn nào của ${product.name}? Chị cần thông tin cụ thể trước khi trả lời có hay không.`, type: "vague_option" },
        ];
    const candidate = pickLeastRepeated(optionCandidates, previousCustomer, clean);
    return { text: candidate.text, intents, answeredFacts: [] as string[], challengeType: candidate.type, duplicateRisk: candidate.repeat };
  }

  const factIntents = intents.filter((intent) => Boolean(customerFact(intent, customer))).slice(0, 3);
  const repeatedIntent = factIntents.find((intent) => previousCustomer.some((message) => similarity(message, customerFact(intent, customer)) > 0.72));
  if (hasQuestion && repeatedIntent && factIntents.length === 1) {
    const text = responseForRepeatedFact(repeatedIntent, customer);
    return { text, intents, answeredFacts: [repeatedIntent], challengeType: "already_answered", duplicateRisk: 0 };
  }

  const facts = factIntents.map((intent) => upperFirst(customerFact(intent, customer)));
  const reactiveClaims = claimChallenges(clean, intents);
  const challengePool = reactiveClaims.length ? reactiveClaims : preferredChallenges(intents, scenario, industry, product);
  const factText = facts.length ? `${facts.join("; ")}.` : "";
  const standardLeads = connectorsFor(customer);
  const verboseLeads = ["Em đang nói khá nhiều ý. Chị cần em chốt đúng điểm này:", "Chị nghe nhiều ý quá. Em trả lời đúng một việc giúp chị:", "Mình tách từng ý nhé. Trước hết chị cần biết:", "Em nói ngắn lại giúp chị. Chị đang cần làm rõ:", "Chị chưa theo kịp hết các ý. Mình chốt trước việc này:"];
  const leadOptions = verbose ? verboseLeads : standardLeads;
  const recentCustomer = previousCustomer.slice(-4).map(normalize);
  const freshLeads = leadOptions.filter((lead) => !recentCustomer.some((message) => message.includes(normalize(lead))));
  const leadPool = freshLeads.length ? freshLeads : leadOptions;
  const composed = challengePool.flatMap((challenge) => leadPool.map((lead) => {
    const prefix = factText ? `${factText} ` : "";
    return { text: `${prefix}${lead} ${challenge.text}`.replace(/\s+/g, " ").trim(), type: challenge.type };
  }));
  const selected = pickLeastRepeated(composed, previousCustomer, clean + transcript.length);
  const text = selected.text;

  return {
    text: text.replace(/\s+/g, " ").trim(),
    intents,
    answeredFacts: factIntents,
    challengeType: selected.type,
    duplicateRisk: selected.repeat,
  };
}

function correctionFor(args: {
  answer: string;
  scenario: Scenario;
  product: Product;
  industry: Industry;
  customer: CustomerInsight;
  transcript: TrainingMessage[];
}) {
  const { answer, scenario, product, industry, transcript } = args;
  const clean = answer.trim();
  const lastCustomer = [...transcript].reverse().find((message) => message.role === "customer")?.text ?? "";
  const customerFocus = focusFromCustomer(lastCustomer, industry);
  const optionReference = clean.match(vagueOptionPattern)?.[0]?.trim() ?? "lựa chọn đó";
  const namedMachineOption = /\bmáy\s*(số\s*)?\d+\b/i.test(clean);
  const intents = detectIntents(clean);
  const isNonsense = !clean || nonsense.test(clean);
  const mismatch = contextMismatch(clean, industry);
  const vagueOption = vagueOptionPattern.test(clean) && !industry.keywords.some((keyword) => clean.toLowerCase().includes(keyword.toLowerCase()));
  const asks = questionPattern.test(clean);
  const empathizes = empathyPattern.test(clean);
  const grounded = industry.keywords.some((keyword) => clean.toLowerCase().includes(keyword.toLowerCase())) || sectorSignals[industry.id]?.test(clean) === true;
  const relevance = relevantToLastCustomer(clean, lastCustomer, intents);
  const verbose = clean.length > 420 || sentenceCount(clean) > 7;
  const hasEvidence = evidencePattern.test(clean);
  const hasNextStep = nextStepPattern.test(clean);
  const lastCustomerIntents = detectIntents(lastCustomer);
  const deliveryRelated = deliveryPattern.test(lastCustomer) || deliveryPattern.test(clean);
  const previousFeedback = transcript
    .filter((message) => message.role === "sale" && message.feedback)
    .flatMap((message) => [message.feedback?.issue ?? "", message.feedback?.corrected ?? ""])
    .filter(Boolean);

  const metrics = {
    "Bám sát lời khách": Math.round(relevance * 100),
    "Lắng nghe": empathizes ? 100 : 25,
    "Khai thác": asks ? 90 : 20,
    "Đúng dữ kiện ngành": grounded ? 90 : 35,
    "Bước tiếp theo": hasNextStep ? 90 : scenario.step >= 7 ? 15 : 45,
  };

  let score = Math.round(
    metrics["Bám sát lời khách"] * 0.38 +
    metrics["Lắng nghe"] * 0.17 +
    metrics["Khai thác"] * 0.2 +
    metrics["Đúng dữ kiện ngành"] * 0.15 +
    metrics["Bước tiếp theo"] * 0.1,
  );
  if (hasEvidence && scenario.step >= 5) score += 5;
  if (clean.length < 18) score = Math.min(score, 18);
  if (verbose) score = Math.min(score - 12, 55);
  if (relevance < 0.22) score = Math.min(score, 32);
  if (vagueOption) score = Math.min(score, 18);
  if (mismatch) score = Math.min(score, 10);
  if (isNonsense) score = 2;
  score = Math.max(0, Math.min(100, score));

  const certaintyClaim = /(cứ yên tâm|chắc chắn|cam kết|100%|không thể trễ|không trễ được|không bao giờ)/i.test(clean);
  const unsupportedComparison = /(bên (đó|kia).*(đểu|dở|kém|không tốt)|chất liệu bên (đó|kia))/i.test(clean);
  let issueCandidates = [
    "Câu trả lời còn chung chung; hãy phản hồi đúng ý khách vừa nói rồi hỏi một dữ kiện có mục đích.",
    "Bạn chưa chỉ ra căn cứ cụ thể cho lời tư vấn nên khách chưa có cơ sở để tin hoặc quyết định.",
  ];
  if (isNonsense) issueCandidates = ["Câu trả lời không có nội dung tư vấn và không giải quyết điều khách vừa nói."];
  else if (mismatch) issueCandidates = [`Câu hỏi đang lệch khỏi nhu cầu ${industry.name.toLowerCase()} và không giúp khách đánh giá ${product.name}.`];
  else if (vagueOption) issueCandidates = ["Bạn đưa một lựa chọn mơ hồ nhưng chưa nói đó là mẫu nào, đặc điểm gì và vì sao phù hợp với khách."];
  else if (deliveryRelated && certaintyClaim) issueCandidates = [
    "Bạn trả lời đúng chủ đề giao hàng nhưng khẳng định không trễ khi chưa kiểm tra tuyến giao và chưa có phương án dự phòng.",
    "Lời cam kết giao kịp đang tuyệt đối quá; khách cần mốc xác nhận và cách xử lý nếu đơn vẫn chậm.",
  ];
  else if (lastCustomerIntents.includes("comparison") && unsupportedComparison) issueCandidates = [
    "Bạn nhận xét chất liệu của bên khác nhưng không đưa căn cứ, khiến phần so sánh thiếu đáng tin.",
    "Bạn đang hạ thấp đối thủ thay vì chứng minh điểm hơn của sản phẩm bằng tiêu chí kiểm chứng được.",
  ];
  else if (relevance < 0.22) issueCandidates = [
    "Bạn chưa xử lý câu hỏi hoặc nỗi lo gần nhất của khách; các ý phía sau vì vậy bị lạc mạch.",
    "Câu trả lời bỏ qua trọng tâm khách vừa hỏi và chuyển sang một hướng khác quá sớm.",
  ];
  else if (verbose) issueCandidates = ["Câu trả lời quá dài và chứa quá nhiều ý; khách khó tính sẽ không biết đâu là câu trả lời chính."];
  else if (!empathizes) issueCandidates = [
    "Bạn chưa xác nhận điều khách đang lo trước khi hỏi hoặc giới thiệu giải pháp.",
    "Bạn đi thẳng vào giải thích nhưng chưa cho khách thấy mình đã hiểu đúng nỗi lo vừa nêu.",
  ];
  else if (!asks && scenario.step <= 5) issueCandidates = ["Bạn đã phản hồi nhưng chưa hỏi một câu chẩn đoán giúp thu hẹp nhu cầu."];
  else if (!grounded) issueCandidates = [`Bạn chưa dùng dữ kiện đặc thù của ngành ${industry.name.toLowerCase()} để làm câu trả lời đáng tin.`];
  else if (scenario.step >= 7 && !hasNextStep) issueCandidates = ["Bạn chưa chốt một bước tiếp theo đủ cụ thể sau khi xử lý phản đối."];
  else if (score >= 78) issueCandidates = ["Câu trả lời bám mạch tốt; có thể sắc hơn bằng một bằng chứng hoặc điều kiện kiểm chứng cụ thể."];
  const issue = pickLeastRepeated(
    issueCandidates.map((text) => ({ text, type: "issue" })),
    previousFeedback,
    clean + transcript.length + "issue",
  ).text;

  const timingCorrections = [
    "Dạ, chị cần dùng sau ba ngày nên em sẽ kiểm tra tồn kho và thời gian giao đến khu vực của chị trước. Nếu có nguy cơ trễ, em sẽ báo ngay và đề xuất mẫu còn sẵn hoặc phương án nhận nhanh; chị cho em xin khu vực nhận hàng ạ?",
    "Dạ, em chưa nên khẳng định chắc chắn khi chưa kiểm tra tuyến giao. Em sẽ xác nhận hàng sẵn, thời hạn dự kiến và phương án xử lý nếu vận chuyển chậm trước khi chị đặt.",
  ];
  const comparisonCorrections = [
    `Dạ, em không nên đánh giá chất liệu bên khác khi chưa có căn cứ. Với ${product.name}, em sẽ so rõ loại chất liệu, độ hoàn thiện, khả năng giữ form và chính sách đổi trả để chị tự đánh giá.`,
    `Dạ, thay vì nói bên khác không tốt, em xin đối chiếu bằng tiêu chí cụ thể: chất liệu, đường may, độ bền màu và điều kiện đổi size của ${product.name}.`,
  ];
  const focusCorrections = deliveryRelated
    ? timingCorrections
    : lastCustomerIntents.includes("comparison")
      ? comparisonCorrections
      : [
          `Dạ, em xin trả lời đúng điều chị vừa hỏi trước. ${industry.diagnosticQuestion} Sau đó em sẽ chỉ nói phần liên quan trực tiếp đến ${product.name}.`,
          `Dạ, em sẽ làm rõ đúng nỗi lo vừa nêu bằng dữ kiện kiểm chứng được, không chuyển sang câu hỏi khác. ${industry.diagnosticQuestion}`,
        ];
  const correctionCandidates = mismatch
    ? [`Dạ em xin lỗi, câu vừa rồi không liên quan đến nhu cầu của chị. ${industry.diagnosticQuestion}`]
    : vagueOption
      ? namedMachineOption
        ? [
            `Dạ, em hiểu chị ${customerFocus}. Em chưa nên nói “${optionReference} đáp ứng hết” khi chưa kiểm tra. ${industry.diagnosticQuestion} Sau đó em sẽ nói rõ model, cách vệ sinh và giới hạn thực tế của ${product.name}.`,
            `Dạ, với nhu cầu ${customerFocus}, em cần nói rõ ${optionReference} là model nào, kích thước, cách vệ sinh và căn cứ đáp ứng việc quét lau thay vì chỉ khẳng định chung chung.`,
          ]
        : [
            `Dạ, em đang nói đến ${optionReference} trong danh sách vừa gửi. Em sẽ nêu rõ tên hoặc mã lựa chọn, ${industry.decisionCriteria} và lý do nó phù hợp với nhu cầu chị vừa nói.`,
            `Dạ, em chưa trả lời rõ ${optionReference} là lựa chọn nào. Em xin chỉ đúng tên hoặc mã trong ${product.name}, mô tả đặc điểm thực tế và giải thích căn cứ phù hợp thay vì chỉ nói “đẹp” hoặc “đáp ứng hết”.`,
          ]
      : relevance < 0.22
        ? focusCorrections
        : deliveryRelated
          ? timingCorrections
          : lastCustomerIntents.includes("comparison")
            ? comparisonCorrections
            : [
                `Dạ, em hiểu điều chị đang cân nhắc. ${industry.diagnosticQuestion} Khi có dữ kiện đó, em sẽ nói rõ ${product.name} phù hợp ở đâu và giới hạn ở đâu.`,
                `Dạ, trước hết em xin xác nhận đúng mối quan tâm của chị. ${industry.diagnosticQuestion} Em sẽ dựa vào câu trả lời đó để tư vấn, không giới thiệu lan man.`,
              ];
  const corrected = pickLeastRepeated(
    correctionCandidates.map((text) => ({ text, type: "correction" })),
    previousFeedback,
    clean + transcript.length,
  ).text;

  return {
    score,
    issue,
    corrected,
    process: `Bước ${scenario.step} · ${takiSteps[scenario.step - 1]}`,
    metrics,
  } satisfies Feedback;
}

export function runAdaptiveTurn(args: {
  answer: string;
  scenario: Scenario;
  product: Product;
  industry: Industry;
  customer: CustomerInsight;
  transcript: TrainingMessage[];
}): TrainingTurnResult {
  const customer = buildCustomerMessage(args);
  return {
    customerMessage: customer.text,
    feedback: correctionFor(args),
    mode: "adaptive",
    diagnostics: {
      detectedIntents: customer.intents,
      answeredFacts: customer.answeredFacts,
      challengeType: customer.challengeType,
      duplicateRisk: Number(customer.duplicateRisk.toFixed(2)),
    },
  };
}
