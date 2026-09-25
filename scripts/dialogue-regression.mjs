// Node >=22.18 strips TypeScript types natively, so the suite runs without a bundler.
const { repetitionRisk, runAdaptiveTurn, similarity } = await import("../lib/training-engine.ts");
const { industries, products, scenarios, customerInsights } = await import("../app/data.ts");

let checks = 0;
const failures = [];
const assert = (condition, label, detail = "") => {
  checks += 1;
  if (!condition) failures.push({ label, detail });
};

for (const industry of industries) {
  const product = products.find((item) => item.industryId === industry.id);
  const scenario = scenarios.find((item) => item.id === "fit");
  const customer = customerInsights[industry.id][0];
  const opening = { role: "customer", text: `${customer.situation}. ${customer.need}.` };

  const grounded = runAdaptiveTurn({
    answer: "Dạ em hiểu điều chị đang cần. Chị dự kiến ngân sách khoảng bao nhiêu và cần trước thời điểm nào ạ?",
    industry,
    product,
    scenario,
    customer,
    transcript: [opening],
  });
  assert(grounded.diagnostics.answeredFacts.includes("budget"), `${industry.id}: trả lời ngân sách`, grounded.customerMessage);
  assert(grounded.diagnostics.answeredFacts.includes("timing"), `${industry.id}: trả lời thời gian`, grounded.customerMessage);
  assert(grounded.customerMessage.length < 650, `${industry.id}: câu khách không quá dài`, grounded.customerMessage);

  const nonsense = runAdaptiveTurn({ answer: "abc", industry, product, scenario, customer, transcript: [opening] });
  assert(nonsense.feedback.score <= 2, `${industry.id}: vô nghĩa điểm rất thấp`, String(nonsense.feedback.score));

  const vague = runAdaptiveTurn({ answer: "Chị xem mẫu 1 ok không ạ?", industry, product, scenario, customer, transcript: [opening] });
  assert(vague.feedback.score <= 18, `${industry.id}: lựa chọn mơ hồ bị giới hạn điểm`, `${vague.feedback.score}: ${vague.customerMessage}`);
  assert(/mẫu nào|lựa chọn nào|cụ thể/i.test(vague.customerMessage), `${industry.id}: khách yêu cầu làm rõ mẫu`, vague.customerMessage);

  const mismatchText = industry.id === "technology"
    ? "Chị cao và nặng bao nhiêu để em chọn laptop cho phù hợp ạ?"
    : "Máy này dùng chip gì và có bao nhiêu RAM để em chọn sản phẩm cho chị?";
  const mismatch = runAdaptiveTurn({ answer: mismatchText, industry, product, scenario, customer, transcript: [opening] });
  assert(mismatch.feedback.score <= 10, `${industry.id}: lệch ngành bị chặn điểm`, `${mismatch.feedback.score}: ${mismatch.customerMessage}`);

  const verbose = runAdaptiveTurn({
    answer: "Dạ em hiểu chị. Bên em có rất nhiều lựa chọn. Sản phẩm tốt và được nhiều khách tin dùng. Giá đang ưu đãi. Chính sách cũng tốt. Bảo hành đầy đủ. Đội ngũ hỗ trợ nhiệt tình. Chị cứ yên tâm. Em sẽ gửi thêm nhiều thông tin. Ngoài ra bên em còn có nhiều chương trình khác và rất nhiều quyền lợi khác dành cho chị trong tháng này.",
    industry,
    product,
    scenario,
    customer,
    transcript: [opening],
  });
  assert(verbose.feedback.score <= 55, `${industry.id}: dài dòng bị giới hạn điểm`, String(verbose.feedback.score));

  const repeated = runAdaptiveTurn({
    answer: "Ngân sách chị dự kiến khoảng bao nhiêu ạ?",
    industry,
    product,
    scenario,
    customer,
    transcript: [opening, { role: "customer", text: customer.budget }],
  });
  assert(/vừa nói rồi/i.test(repeated.customerMessage), `${industry.id}: không hỏi lại dữ kiện cũ`, repeated.customerMessage);
}

{
  const industry = industries.find((item) => item.id === "accessories");
  const product = products.find((item) => item.id === "silver-jewelry");
  const scenario = scenarios.find((item) => item.id === "trust");
  const customer = customerInsights.accessories[0];
  const transcript = [{ role: "customer", text: `${customer.situation}. ${customer.need}.` }];
  const replies = [];
  for (let index = 0; index < 10; index += 1) {
    const result = runAdaptiveTurn({
      answer: "Dạ em hiểu chị đang cân nhắc kỹ. Sản phẩm bên em có chính sách bảo hành và có thông tin kiểm chứng rõ ạ.",
      industry,
      product,
      scenario,
      customer,
      transcript,
    });
    replies.push(result.customerMessage);
    transcript.push({ role: "sale", text: "Tư vấn" }, { role: "customer", text: result.customerMessage });
  }
  assert(new Set(replies).size >= 8, "chống lặp: tối thiểu 8/10 câu khác nhau", replies.join(" | "));
  const worstSimilarity = replies.flatMap((left, index) => replies.slice(index + 1).map((right) => similarity(left, right))).reduce((max, value) => Math.max(max, value), 0);
  assert(worstSimilarity < 0.9, "chống lặp: không có câu gần như sao chép", String(worstSimilarity));
  const consecutiveRisk = replies.slice(1).map((reply, index) => repetitionRisk(reply, replies[index]));
  assert(consecutiveRisk.every((value) => value < 0.68), "chống lặp: hai lượt liên tiếp không dùng lại cụm câu", consecutiveRisk.join(", "));
  const openings = replies.map((reply) => reply.split(":")[0].trim().toLowerCase());
  assert(openings.slice(1).every((opening, index) => opening !== openings[index]), "chống lặp: không lặp câu mở đầu liên tiếp", openings.join(" | "));
  assert(replies.every((reply) => !/thông tin đó (rất )?hữu ích/i.test(reply)), "chống lặp: loại bỏ câu nối máy móc", replies.join(" | "));
  assert(replies.every((reply) => reply.split(/[.!?]+/).filter((part) => part.trim()).length <= 3), "độ dài: mỗi lượt tối đa ba câu", replies.join(" | "));
}

{
  const industry = industries.find((item) => item.id === "fashion");
  const product = products.find((item) => item.id === "office-dress");
  const scenario = scenarios.find((item) => item.id === "competition");
  const customer = customerInsights.fashion[0];
  const comparisonQuestion = "Chỗ khác có mẫu gần giống rẻ hơn 30%. Chênh lệch nằm ở chất liệu hay chỉ ở thương hiệu?";
  const comparison = runAdaptiveTurn({
    answer: "Dạ chất liệu bên đó đểu, chị cứ yên tâm dùng bên em.",
    industry,
    product,
    scenario,
    customer,
    transcript: [{ role: "customer", text: comparisonQuestion }],
  });
  assert(comparison.diagnostics.challengeType === "comparison_claim", "fashion: phản biện đúng lời chê đối thủ", comparison.customerMessage);
  assert(/dựa trên|cảm tính|tiêu chí/i.test(comparison.customerMessage), "fashion: khách đòi căn cứ so sánh", comparison.customerMessage);
  assert(!/lệch khỏi nhu cầu/i.test(comparison.customerMessage), "fashion: chất liệu không bị nhận nhầm ngành", comparison.customerMessage);
  assert(/không nên đánh giá|thay vì nói/i.test(comparison.feedback.corrected), "fashion: chữa đúng lỗi chê đối thủ", comparison.feedback.corrected);

  const deliveryQuestion = "Chị cần mặc sau ba ngày; nếu giao trễ thì phương án của em là gì?";
  const delivery = runAdaptiveTurn({
    answer: "Bên em làm với tất cả bên vận chuyển tại Việt Nam nên không trễ được ạ.",
    industry,
    product,
    scenario,
    customer,
    transcript: [{ role: "customer", text: deliveryQuestion }],
  });
  assert(delivery.diagnostics.challengeType === "timing_claim", "fashion: bám đúng cam kết giao hàng", delivery.customerMessage);
  assert(/trễ|vận chuyển|giao kịp/i.test(delivery.customerMessage), "fashion: khách hỏi tiếp đúng chủ đề giao hàng", delivery.customerMessage);
  assert(delivery.feedback.score > 10, "fashion: câu giao hàng không bị chấm lệch ngành", String(delivery.feedback.score));
  assert(/ba ngày|tuyến giao|vận chuyển chậm/i.test(delivery.feedback.corrected), "fashion: chữa đúng rủi ro giao trễ", delivery.feedback.corrected);

  const repeatedFeedbackTranscript = [
    { role: "customer", text: deliveryQuestion },
    { role: "sale", text: "Bên em đảm bảo không trễ ạ.", feedback: delivery.feedback },
    { role: "customer", text: "Nếu vẫn trễ thì ai xử lý cho chị?" },
  ];
  const nextDelivery = runAdaptiveTurn({
    answer: "Chị cứ yên tâm, chắc chắn bên em giao kịp ạ.",
    industry,
    product,
    scenario,
    customer,
    transcript: repeatedFeedbackTranscript,
  });
  assert(nextDelivery.feedback.corrected !== delivery.feedback.corrected, "chữa bài: không lặp nguyên mẫu liên tiếp", nextDelivery.feedback.corrected);
  assert(nextDelivery.feedback.issue !== delivery.feedback.issue, "chữa bài: nhận xét không lặp nguyên mẫu liên tiếp", nextDelivery.feedback.issue);
}

{
  const industry = industries.find((item) => item.id === "home-appliances");
  const product = products.find((item) => item.industryId === "home-appliances");
  const scenario = scenarios.find((item) => item.id === "no-time");
  const customer = customerInsights["home-appliances"][0];
  const opening = "Chị đang tranh thủ có mấy phút thôi. Chị cần giảm thời gian quét lau nhưng máy phải gọn và dễ vệ sinh. Em hỏi nhanh giúp chị nhé.";
  const result = runAdaptiveTurn({
    answer: "Vâng, vậy máy số 1 đáp ứng hết nhu cầu của mình đó ạ.",
    industry,
    product,
    scenario,
    customer,
    transcript: [{ role: "customer", text: opening }],
  });
  assert(result.diagnostics.challengeType === "vague_option", "gia dụng: máy số 1 là lựa chọn mơ hồ", result.customerMessage);
  assert(/model nào|đặc điểm nào|lựa chọn nào/i.test(result.customerMessage), "gia dụng: khách yêu cầu nói rõ máy", result.customerMessage);
  assert(/lựa chọn số 1|lựa chọn nào|model/i.test(result.feedback.corrected), "gia dụng: chữa đúng câu máy số 1", result.feedback.corrected);
  assert(/giảm thời gian quét lau|gọn|dễ vệ sinh/i.test(result.feedback.corrected), "gia dụng: câu gợi ý nhắc đúng nhu cầu khách", result.feedback.corrected);
  assert(/diện tích|tần suất|việc nhà|công suất|độ ồn|vệ sinh|model/i.test(result.feedback.corrected), "gia dụng: gợi ý dùng dữ kiện đúng ngành", result.feedback.corrected);
  assert(!/tuyến giao|vận chuyển chậm|giao kịp|hàng sẵn/i.test(result.feedback.corrected), "gia dụng: thời gian quét lau không bị hiểu thành giao hàng", result.feedback.corrected);
  assert(result.feedback.score <= 18, "gia dụng: khẳng định mơ hồ bị giới hạn điểm", String(result.feedback.score));
}

{
  const industry = industries.find((item) => item.id === "fashion");
  const product = products.find((item) => item.id === "linen-set");
  const scenario = scenarios.find((item) => item.id === "cold");
  const customer = customerInsights.fashion[0];
  const question = "Em đang nói tới lựa chọn nào của Bộ linen thiết kế? Chị cần thông tin cụ thể trước khi trả lời có hay không.";
  const result = runAdaptiveTurn({
    answer: "Bộ số 1 ấy ạ, hàng chuẩn đẹp rất hợp với mình ạ.",
    industry,
    product,
    scenario,
    customer,
    transcript: [{ role: "customer", text: question }],
  });
  assert(result.diagnostics.challengeType === "vague_option", "thời trang: bộ số 1 là lựa chọn mơ hồ", result.customerMessage);
  assert(/bộ số 1|lựa chọn nào|tên hoặc mã/i.test(result.customerMessage), "thời trang: khách tiếp tục đòi xác định đúng bộ", result.customerMessage);
  assert(/bộ số 1|tên hoặc mã|lựa chọn nào/i.test(result.feedback.corrected), "thời trang: câu gợi ý trả lời đúng bộ nào", result.feedback.corrected);
  assert(/chất liệu|form|dáng|đổi trả|đặc điểm thực tế/i.test(result.feedback.corrected), "thời trang: câu gợi ý nêu đặc điểm cần làm rõ", result.feedback.corrected);
  assert(!/khuyết điểm|thương hiệu đang dùng/i.test(result.feedback.corrected), "thời trang: không chuyển sang hỏi dữ kiện ngoài câu khách", result.feedback.corrected);
  assert(/mơ hồ|chưa nói đó là|lựa chọn/i.test(result.feedback.issue), "thời trang: cần sửa đúng lỗi trả lời mơ hồ", result.feedback.issue);
  assert(result.feedback.score <= 18, "thời trang: bộ số 1 mơ hồ bị giới hạn điểm", String(result.feedback.score));
}



if (failures.length) {
  console.error(JSON.stringify({ checks, passed: checks - failures.length, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ checks, passed: checks, industries: industries.length, status: "ok" }, null, 2));
