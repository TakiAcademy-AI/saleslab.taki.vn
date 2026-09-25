export type Objection = "time" | "price" | "trust" | "authority" | "fit" | "competition";

export type Industry = {
  id: string;
  name: string;
  icon: string;
  persona: string;
  context: string;
  decisionCriteria: string;
  proofDemand: string;
  diagnosticQuestion: string;
  priceChallenge: string;
  proofChallenge: string;
  afterSalesChallenge: string;
  comparisonChallenge: string;
  keywords: string[];
  challenges: string[];
};

export type Product = {
  id: string;
  industryId: string;
  name: string;
  category: string;
  promise: string;
  price: string;
};

export type Scenario = {
  id: string;
  name: string;
  step: number;
  goal: string;
  objection: Objection;
};

export type CustomerInsight = {
  label: string;
  voice: "direct" | "cautious" | "impatient" | "skeptical";
  situation: string;
  need: string;
  fear: string;
  budget: string;
  timing: string;
  past: string;
  decision: string;
};

export const industries: Industry[] = [
  {
    id: "fashion", name: "Thời trang", icon: "👗", persona: "Khách kỹ tính về dáng, chất liệu và độ giống ảnh", context: "Cần đồ đi làm nhưng từng mua online bị sai form và khó đổi size", decisionCriteria: "form dáng, chất liệu thật, bảng size, đổi trả và thời gian giao", proofDemand: "ảnh/video thật, số đo mẫu mặc và chính sách đổi size", diagnosticQuestion: "Chị ưu tiên che khuyết điểm nào và thường mặc size nào ở thương hiệu đang dùng?", priceChallenge: "Chỗ khác có mẫu gần giống rẻ hơn 30%. Chênh lệch nằm ở chất liệu hay chỉ ở thương hiệu?", proofChallenge: "Ảnh mẫu đẹp không nói lên lúc chị mặc. Em có số đo và video ánh sáng thường không?", afterSalesChallenge: "Nếu mặc không vừa hoặc màu thực tế khác ảnh thì ai chịu phí đổi và mất bao lâu?", comparisonChallenge: "So cho chị theo chất vải, đường may, giữ form và đổi trả; đừng chỉ nói mẫu bên em cao cấp.", keywords: ["size", "form", "dáng", "vải", "chất liệu", "đổi", "màu", "số đo"], challenges: ["Chị cao 1m55, phần vai hơi rộng. Form này có làm chị bị thấp hơn không?", "Vải có nhăn, xù hay lộ nội y dưới ánh sáng mạnh không?", "Số đo của chị nằm giữa hai size thì chọn thế nào, căn cứ vào đâu?", "Chị cần mặc sau ba ngày; nếu giao trễ thì phương án của em là gì?", "Giặt vài lần có co hoặc phai màu không, bên em có hướng dẫn rõ chứ?"]
  },
  {
    id: "accessories", name: "Phụ kiện", icon: "⌚", persona: "Khách soi độ bền, tính thật giả và khả năng phối đồ", context: "Muốn mua làm quà nhưng sợ sản phẩm nhanh xuống màu và khó bảo hành", decisionCriteria: "chất liệu, nguồn gốc, độ bền, bảo hành và tính phù hợp người nhận", proofDemand: "chứng nhận chất liệu, ảnh cận thật và điều khoản bảo hành", diagnosticQuestion: "Chị mua dùng hằng ngày hay làm quà, người nhận có dị ứng chất liệu nào không?", priceChallenge: "Mẫu tương tự trên sàn rẻ bằng nửa. Vì sao chị không chọn bên đó?", proofChallenge: "Làm sao chị biết chất liệu đúng như tư vấn chứ không phải chỉ mạ bên ngoài?", afterSalesChallenge: "Nếu xuống màu hoặc hỏng khóa sau vài tuần thì bảo hành cụ thể ra sao?", comparisonChallenge: "Em so theo chất liệu lõi, độ hoàn thiện và bảo hành, không so bằng lời quảng cáo nhé.", keywords: ["chất liệu", "bảo hành", "xuống màu", "mạ", "khóa", "dị ứng", "chứng nhận"], challenges: ["Da nhạy cảm có đeo được cả ngày không?", "Màu này phối được với tủ đồ công sở hay chỉ hợp đi tiệc?", "Có khắc tên không và làm vậy có mất quyền đổi trả không?", "Hộp quà và hóa đơn có làm lộ giá với người nhận không?", "Nếu khóa bị lỏng thì sửa tại đâu và mất bao lâu?"]
  },
  {
    id: "beauty", name: "Mỹ phẩm & chăm sóc cá nhân", icon: "🧴", persona: "Khách da nhạy cảm, nghi ngờ công dụng và sợ kích ứng", context: "Đã đổi nhiều sản phẩm nhưng tình trạng da không ổn định", decisionCriteria: "thành phần, loại da, nguồn gốc, hướng dẫn dùng và xử lý kích ứng", proofDemand: "bảng thành phần, công bố sản phẩm và hướng dẫn test trước", diagnosticQuestion: "Da chị đang gặp vấn đề gì, dùng hoạt chất nào và có tiền sử kích ứng không?", priceChallenge: "Cùng hoạt chất đó có sản phẩm rẻ hơn nhiều. Điểm khác biệt có đo được là gì?", proofChallenge: "Đừng dùng ảnh trước-sau chung chung; sản phẩm có hồ sơ và dữ liệu nào đáng tin?", afterSalesChallenge: "Nếu kích ứng trong tuần đầu thì bên em hướng dẫn và xử lý thế nào?", comparisonChallenge: "So cho chị nồng độ, nền công thức, độ phù hợp và cách dùng; đừng nói 'hợp mọi loại da'.", keywords: ["da", "thành phần", "hoạt chất", "kích ứng", "nồng độ", "routine", "nguồn gốc"], challenges: ["Chị đang dùng retinol thì kết hợp sản phẩm này có xung đột không?", "Bao lâu mới đánh giá được hiệu quả và dấu hiệu nào phải ngưng?", "Da dầu thiếu nước nhưng dễ bí tắc, công thức này có phù hợp không?", "Hàng chính hãng kiểm tra bằng cách nào ngoài tem dán?", "Em đang cam kết hơi nhiều; kết quả nào là thực tế và kết quả nào không thể hứa?"]
  },
  {
    id: "food", name: "Thực phẩm & đồ uống", icon: "🥗", persona: "Khách quan tâm an toàn, khẩu vị và giá trị dinh dưỡng", context: "Mua cho gia đình có trẻ nhỏ và người cần kiểm soát đường", decisionCriteria: "thành phần, hạn dùng, nguồn gốc, bảo quản và khẩu vị", proofDemand: "nhãn dinh dưỡng, chứng nhận an toàn và ngày sản xuất", diagnosticQuestion: "Nhà chị có ai dị ứng, ăn kiêng hoặc cần kiểm soát đường/muối không?", priceChallenge: "Nguyên liệu này nơi khác bán rẻ hơn. Chênh giá có đến từ chất lượng thật không?", proofChallenge: "Chị cần nhãn thành phần và kiểm nghiệm, không cần lời 'healthy' chung chung.", afterSalesChallenge: "Hàng giao tới bị móp, rã đông hoặc cận date thì bên em xử lý thế nào?", comparisonChallenge: "So theo thành phần trên mỗi khẩu phần, nguồn nguyên liệu và bảo quản giúp chị.", keywords: ["thành phần", "dinh dưỡng", "đường", "calo", "dị ứng", "hạn dùng", "bảo quản", "kiểm nghiệm"], challenges: ["Một khẩu phần thật sự có bao nhiêu đường và natri?", "Trẻ nhỏ dùng được không, độ tuổi nào và căn cứ ở đâu?", "Sản phẩm cần bảo quản lạnh nhưng giao xa thì kiểm soát nhiệt độ thế nào?", "Vị có quá ngọt không, nếu nhà chị không hợp khẩu vị thì sao?", "Nguồn nguyên liệu và ngày sản xuất lô chị nhận là khi nào?"]
  },
  {
    id: "home-appliances", name: "Đồ gia dụng", icon: "🏠", persona: "Khách thực dụng, sợ mua về ít dùng và khó sửa", context: "Nhà nhỏ, muốn tiết kiệm thời gian nhưng ngại thiết bị cồng kềnh", decisionCriteria: "công suất, diện tích, điện năng, độ ồn, vệ sinh và bảo hành", proofDemand: "thông số kỹ thuật, video vận hành và mạng lưới bảo hành", diagnosticQuestion: "Diện tích nhà, tần suất dùng và việc nhà nào đang tốn thời gian nhất của chị?", priceChallenge: "Mẫu phổ thông rẻ hơn nhiều vẫn có cùng chức năng. Phần hơn đáng tiền ở đâu?", proofChallenge: "Thông số quảng cáo có đúng khi dùng trong nhà thật không? Em có dữ liệu độ ồn và điện năng không?", afterSalesChallenge: "Hỏng sau bảo hành thì linh kiện và chi phí sửa có sẵn không?", comparisonChallenge: "So theo hiệu suất thực, độ ồn, vệ sinh và tổng chi phí sử dụng giúp chị.", keywords: ["công suất", "điện", "độ ồn", "diện tích", "bảo hành", "linh kiện", "vệ sinh"], challenges: ["Nhà chị 60m² và nhiều tóc, máy có xử lý được thật không?", "Mỗi tháng tốn thêm bao nhiêu tiền điện nếu dùng hằng ngày?", "Vệ sinh bộ lọc mất bao lâu và phải thay định kỳ với giá nào?", "Độ ồn ban đêm là bao nhiêu dB, không nói cảm tính nhé.", "Trung tâm bảo hành gần nhất ở đâu và thời gian sửa trung bình?"]
  },
  {
    id: "technology", name: "Điện tử & công nghệ", icon: "💻", persona: "Khách hiểu công nghệ, hay đối chiếu cấu hình và giá", context: "Cần thiết bị dùng ổn định nhiều năm, không muốn trả tiền cho tính năng thừa", decisionCriteria: "hiệu năng thực, tương thích, bảo mật, bảo hành và vòng đời", proofDemand: "benchmark phù hợp tác vụ, chính sách cập nhật và bảo hành chính hãng", diagnosticQuestion: "Chị dùng những phần mềm nào, dữ liệu bao nhiêu và ưu tiên hiệu năng hay tính di động?", priceChallenge: "Cấu hình trên giấy giống máy rẻ hơn. Vì sao hiệu năng thực lại đáng chênh giá?", proofChallenge: "Cho chị benchmark đúng tác vụ, đừng chỉ đọc lại thông số của hãng.", afterSalesChallenge: "Nếu lỗi dữ liệu hoặc phải gửi bảo hành thì có máy thay thế và cam kết thời gian không?", comparisonChallenge: "So theo hiệu năng bền, màn hình, pin, cổng kết nối và hỗ trợ sau bán.", keywords: ["cấu hình", "hiệu năng", "ram", "chip", "pin", "bảo hành", "tương thích", "bảo mật"], challenges: ["Máy có chạy ổn phần mềm chị dùng khi mở nhiều tác vụ không?", "RAM có nâng cấp được hay bị hàn chết, chi phí vòng đời ra sao?", "Pin thực tế dùng văn phòng được bao lâu, không lấy số phòng lab nhé.", "Thiết bị có tương thích hệ thống hiện tại và chuyển dữ liệu ai hỗ trợ?", "Sau ba năm còn được cập nhật bảo mật và có linh kiện thay không?"]
  },
  {
    id: "education", name: "Giáo dục & khóa học", icon: "🎓", persona: "Khách từng mua khóa học nhưng không áp dụng", context: "Thiếu thời gian, nghi ngờ chất lượng giảng viên và đầu ra", decisionCriteria: "đầu ra đo được, lộ trình, giảng viên, thực hành và hỗ trợ", proofDemand: "đề cương, bài tập mẫu, đầu ra học viên tương đồng và cơ chế hỗ trợ", diagnosticQuestion: "Mục tiêu cụ thể sau khóa học là gì và hiện chị đang thiếu kiến thức, thời gian hay người hướng dẫn?", priceChallenge: "Nội dung tương tự có rất nhiều trên mạng miễn phí. Chị trả tiền cho giá trị nào?", proofChallenge: "Cho chị xem đầu ra học viên giống trình độ hiện tại, không chỉ testimonial đẹp.", afterSalesChallenge: "Nếu học không theo kịp hoặc bỏ lỡ buổi thì được hỗ trợ cụ thể thế nào?", comparisonChallenge: "So theo thời lượng thực hành, phản hồi bài, năng lực giảng viên và hỗ trợ sau học.", keywords: ["đầu ra", "lộ trình", "bài tập", "giảng viên", "thực hành", "hỗ trợ", "học viên"], challenges: ["Chị chỉ có hai giờ mỗi tuần thì lộ trình có thực tế không?", "Ai chấm bài và phản hồi trong bao lâu?", "Giảng viên trực tiếp dạy hay giao hết cho trợ giảng?", "Nếu kiến thức không phù hợp trình độ hiện tại thì có chuyển lớp không?", "Kết quả nào chương trình cam kết và điều kiện để đạt là gì?"]
  },
  {
    id: "travel", name: "Du lịch & lưu trú", icon: "✈️", persona: "Khách đi cùng gia đình, sợ chi phí ẩn và dịch vụ không đúng ảnh", context: "Lịch cố định, có trẻ nhỏ và cần phương án khi chuyến đi thay đổi", decisionCriteria: "vị trí, phòng thực, tổng chi phí, hoàn hủy và hỗ trợ sự cố", proofDemand: "xác nhận dịch vụ bằng văn bản, ảnh phòng đúng hạng và điều khoản hoàn hủy", diagnosticQuestion: "Đoàn có bao nhiêu người, trẻ em/người lớn tuổi và ưu tiên nghỉ dưỡng hay di chuyển thuận tiện?", priceChallenge: "Ứng dụng khác đang rẻ hơn. Giá cuối cùng bên em gồm và chưa gồm những gì?", proofChallenge: "Ảnh này có đúng hạng phòng chị nhận không, hay chỉ là ảnh đại diện đẹp nhất?", afterSalesChallenge: "Nếu chuyến bay đổi hoặc phòng không đúng xác nhận thì ai xử lý ngay tại chỗ?", comparisonChallenge: "So tổng chi phí sau thuế phí, vị trí, hạng phòng và điều kiện hoàn hủy giúp chị.", keywords: ["phòng", "lịch", "hoàn", "hủy", "thuế", "phí", "vị trí", "chuyến bay"], challenges: ["Giá cuối đã gồm thuế, ăn sáng và phụ thu trẻ em chưa?", "Từ phòng ra biển thật sự bao xa và có phải qua đường lớn không?", "Nếu đến nơi hết phòng đúng hạng thì phương án bồi hoàn là gì?", "Hủy trước ba ngày mất bao nhiêu và hoàn tiền trong bao lâu?", "Đoàn có người lớn tuổi; lịch trình có đoạn nào phải đi bộ nhiều không?"]
  },
  {
    id: "real-estate", name: "Bất động sản", icon: "🏢", persona: "Khách đầu tư thận trọng, kiểm tra pháp lý và dòng tiền", context: "Đang so nhiều dự án, không tin cam kết tăng giá thiếu căn cứ", decisionCriteria: "pháp lý, tiến độ, vị trí, dòng tiền, chủ đầu tư và thanh khoản", proofDemand: "hồ sơ pháp lý, tiến độ thực, bảng dòng tiền và dữ liệu giao dịch", diagnosticQuestion: "Chị mua để ở hay đầu tư, thời gian nắm giữ và mức vốn tự có là bao nhiêu?", priceChallenge: "Giá mỗi mét vuông cao hơn khu vực. Cơ sở nào biện minh cho phần chênh đó?", proofChallenge: "Đừng nói 'sắp ra sổ' hay 'cam kết lợi nhuận'; cho chị tài liệu pháp lý và số liệu.", afterSalesChallenge: "Nếu chậm bàn giao hoặc không đạt điều kiện vay thì quyền lợi của chị trong hợp đồng là gì?", comparisonChallenge: "So theo pháp lý, tổng giá, dòng tiền, tiến độ, phí vận hành và thanh khoản.", keywords: ["pháp lý", "sổ", "tiến độ", "dòng tiền", "vay", "mét vuông", "thanh khoản", "hợp đồng"], challenges: ["Hồ sơ pháp lý nào đã có bản gốc để chị kiểm tra?", "Nếu lãi suất tăng 2% thì dòng tiền hằng tháng thay đổi thế nào?", "Giá giao dịch thực gần nhất trong khu vực là bao nhiêu, nguồn ở đâu?", "Điều khoản phạt chậm bàn giao có cân bằng cho hai bên không?", "Phí quản lý, quỹ bảo trì và chi phí sở hữu mỗi năm là bao nhiêu?"]
  },
  {
    id: "healthcare", name: "Y tế & chăm sóc sức khỏe", icon: "🩺", persona: "Khách ưu tiên an toàn, quyền riêng tư và chuyên môn", context: "Có triệu chứng kéo dài nhưng sợ tư vấn quá mức và chi phí phát sinh", decisionCriteria: "chỉ định phù hợp, chuyên môn, an toàn, chi phí minh bạch và theo dõi", proofDemand: "phạm vi dịch vụ, bằng cấp/chuyên khoa, quy trình đồng ý và cảnh báo rủi ro", diagnosticQuestion: "Chị đã được bác sĩ đánh giá chưa, có bệnh nền/thuốc đang dùng và mục tiêu thăm khám là gì?", priceChallenge: "Vì sao cần gói này thay vì từng hạng mục thiết yếu? Có xét nghiệm nào chưa có chỉ định rõ không?", proofChallenge: "Chị cần căn cứ chuyên môn và giới hạn của dịch vụ, không cần lời hứa chắc chắn.", afterSalesChallenge: "Nếu có kết quả bất thường thì ai giải thích, chuyển chuyên khoa và theo dõi ra sao?", comparisonChallenge: "So theo phạm vi khám, chuyên khoa, tiêu chuẩn an toàn, thời gian chờ và tổng chi phí.", keywords: ["bác sĩ", "chỉ định", "bệnh nền", "thuốc", "xét nghiệm", "rủi ro", "theo dõi", "chi phí"], challenges: ["Hạng mục nào thực sự cần cho trường hợp của chị và hạng mục nào chỉ là tùy chọn?", "Ai đọc kết quả và chị được tư vấn lại trong bao lâu?", "Dữ liệu sức khỏe của chị được lưu và chia sẻ cho ai?", "Nếu đang dùng thuốc này thì có cần hỏi bác sĩ trước khi thực hiện không?", "Có rủi ro, chống chỉ định hoặc dấu hiệu nào cần đi cấp cứu không?"]
  },
  {
    id: "spa", name: "Spa & thẩm mỹ", icon: "✨", persona: "Khách sợ đau, biến chứng và quảng cáo quá mức", context: "Từng làm dịch vụ không đạt kỳ vọng, muốn biết người thực hiện và quy trình xử lý rủi ro", decisionCriteria: "chỉ định, người thực hiện, thiết bị/sản phẩm, số buổi, rủi ro và hậu mãi", proofDemand: "thăm khám, phác đồ cá nhân, nguồn gốc thiết bị/sản phẩm và cam kết bằng văn bản", diagnosticQuestion: "Tình trạng hiện tại, tiền sử điều trị và kết quả mong muốn thực tế của chị là gì?", priceChallenge: "Gói bên em đắt hơn nhưng vẫn cần nhiều buổi. Chi phí trọn liệu trình và điều kiện phát sinh là gì?", proofChallenge: "Ảnh trước-sau có cùng ánh sáng và đúng tình trạng như chị không? Ai chịu trách nhiệm chuyên môn?", afterSalesChallenge: "Nếu đỏ kéo dài, tăng sắc tố hoặc không đạt kỳ vọng thì quy trình theo dõi thế nào?", comparisonChallenge: "So theo chỉ định, người thực hiện, thông số thiết bị, số buổi và xử lý biến chứng.", keywords: ["phác đồ", "liệu trình", "thiết bị", "rủi ro", "chống chỉ định", "người thực hiện", "hậu mãi"], challenges: ["Ai trực tiếp làm cho chị và trình độ chuyên môn cụ thể là gì?", "Tổng bao nhiêu buổi, khoảng cách giữa các buổi và chi phí trọn gói?", "Tình trạng nào không nên làm dịch vụ này?", "Nếu da phản ứng mạnh sau khi về nhà thì liên hệ ai, trong bao lâu?", "Kết quả nào là thực tế với nền da của chị và điều gì không thể cam kết?"]
  },
  {
    id: "interior", name: "Nội thất", icon: "🛋️", persona: "Khách kỹ về kích thước, vật liệu và tiến độ thi công", context: "Đang hoàn thiện nhà, sợ bản vẽ đẹp nhưng sản phẩm thực tế sai vật liệu", decisionCriteria: "công năng, kích thước, vật liệu, hoàn thiện, tiến độ và bảo hành", proofDemand: "mẫu vật liệu, bản vẽ kỹ thuật, BOQ và công trình đã bàn giao", diagnosticQuestion: "Mặt bằng, phong cách, ngân sách và hạng mục ưu tiên của gia đình chị là gì?", priceChallenge: "Báo giá bên em cao hơn xưởng khác. Chênh ở vật liệu, phụ kiện hay chi phí quản lý?", proofChallenge: "Render không đủ; chị cần mẫu vật liệu, cấu tạo và công trình đã dùng sau một năm.", afterSalesChallenge: "Nếu cong vênh, sai màu hoặc trễ tiến độ thì điều khoản sửa và phạt thế nào?", comparisonChallenge: "So đúng mã vật liệu, độ dày, phụ kiện, phạm vi thi công và bảo hành.", keywords: ["kích thước", "vật liệu", "bản vẽ", "boq", "thi công", "phụ kiện", "bảo hành", "tiến độ"], challenges: ["Kích thước này có cản lối đi và mở cửa tủ khi sử dụng thật không?", "Mã gỗ, lớp phủ và phụ kiện ghi cụ thể ở đâu trong hợp đồng?", "Nếu tường thực tế lệch so với bản vẽ thì ai chịu chi phí chỉnh sửa?", "Tiến độ từng mốc và điều khoản phạt chậm là gì?", "Sau một năm cong vênh hoặc bản lề xệ thì bảo hành tại nhà trong bao lâu?"]
  },
  {
    id: "building-materials", name: "Vật liệu xây dựng", icon: "🧱", persona: "Khách công trình đòi thông số, định mức và giao hàng chuẩn", context: "Cần chốt vật tư theo tiến độ, sợ sai lô và phát sinh hao hụt", decisionCriteria: "tiêu chuẩn kỹ thuật, định mức, đồng nhất lô, tiến độ giao và bảo hành", proofDemand: "CO/CQ, test report, mẫu duyệt và điều kiện nghiệm thu", diagnosticQuestion: "Hạng mục, diện tích, môi trường sử dụng và tiêu chuẩn nghiệm thu của công trình là gì?", priceChallenge: "Đơn giá bên em cao hơn; tính đủ định mức, hao hụt và chi phí thi công thì chênh bao nhiêu?", proofChallenge: "Cho chị CO/CQ và kết quả thử nghiệm đúng mã hàng, không gửi tài liệu chung của hãng.", afterSalesChallenge: "Nếu giao sai lô, lệch màu hoặc không đạt nghiệm thu thì đổi hàng và bù tiến độ thế nào?", comparisonChallenge: "So theo tiêu chuẩn, định mức thực, hao hụt, điều kiện thi công và chi phí trọn hạng mục.", keywords: ["định mức", "tiêu chuẩn", "co", "cq", "lô", "nghiệm thu", "hao hụt", "thi công"], challenges: ["Định mức thực tế trên bề mặt công trình này là bao nhiêu, đã tính hao hụt chưa?", "Mã hàng có CO/CQ và test report đúng lô giao không?", "Các lô sau có đảm bảo đồng màu, nếu lệch thì xử lý thế nào?", "Điều kiện bề mặt và thời tiết nào khiến vật liệu mất bảo hành?", "Lịch giao chia theo tiến độ ra sao để không chiếm kho công trường?"]
  },
];

export const customerInsights: Record<string, CustomerInsight[]> = {
  fashion: [
    { label: "Nhân viên văn phòng thấp người", voice: "cautious", situation: "Chị cao 1m55, vai hơi ngang và cần đồ mặc đi làm hằng tuần", need: "chị cần bộ dễ mặc, gọn dáng chứ không phải mẫu chỉ đẹp khi chụp ảnh", fear: "chị sợ nhận hàng bị dài và làm phần vai trông thô hơn", budget: "chị dự trù khoảng 1,5 triệu nếu mặc được thường xuyên", timing: "cuối tuần này chị có buổi gặp khách nên cần nhận trước thứ sáu", past: "lần trước chị mua online, bảng size đúng mà mặc vẫn bị bó vai", decision: "chị tự quyết nhưng chỉ mua khi đổi size không rắc rối" },
    { label: "Khách mua váy dự sự kiện", voice: "impatient", situation: "Chị cần đồ dự tiệc công ty, muốn lịch sự nhưng không bị đứng tuổi", need: "chị cần lên dáng đẹp dưới ánh đèn và ngồi lâu vẫn thoải mái", fear: "chị ngại màu và chất vải ngoài đời không giống ảnh", budget: "tầm hai triệu thì được, miễn là không phải sửa lại nhiều", timing: "sự kiện còn đúng bốn ngày", past: "chị từng phải bỏ một bộ vì giao sát giờ mà khóa kéo bị lỗi", decision: "chị quyết ngay nếu có video thật và chắc lịch giao" },
  ],
  accessories: [
    { label: "Khách mua quà kỷ niệm", voice: "cautious", situation: "Chị mua quà kỷ niệm cho chồng, anh ấy dùng đồ khá kỹ", need: "chị muốn món nhìn tinh tế, dùng hằng ngày và không quá phô", fear: "chị sợ chất liệu xuống màu hoặc bảo hành nói một đằng làm một nẻo", budget: "chị muốn giữ trong khoảng ba triệu", timing: "chị cần gói quà và giao kín trước ngày 18", past: "món quà trước bị bong lớp mạ chỉ sau hai tháng", decision: "chị là người chọn, nhưng muốn đổi được nếu kích thước không hợp" },
    { label: "Khách da nhạy cảm", voice: "skeptical", situation: "Da chị dễ ngứa khi đeo kim loại lâu", need: "chị cần phụ kiện tối giản để đeo đi làm mỗi ngày", fear: "chị không tin câu 'không dị ứng' nếu không nói rõ chất liệu", budget: "giá không phải vấn đề lớn, nhưng chị không trả thêm chỉ vì hộp đẹp", timing: "chị chưa vội, có thể chờ nếu cần đặt đúng mẫu", past: "chị từng mua bạc 925 nhưng đeo vẫn bị đỏ da", decision: "chị chỉ mua sau khi xem được thông tin vật liệu và cách đổi trả" },
  ],
  beauty: [
    { label: "Da nhạy cảm đang dùng treatment", voice: "skeptical", situation: "Da chị dầu thiếu nước, đang dùng retinol hai tối một tuần", need: "chị cần phục hồi mà không bí da hay nổi mụn ẩn", fear: "chị sợ thêm sản phẩm mới lại kích ứng và phải bỏ cả routine", budget: "dưới một triệu cho một sản phẩm là mức chị cân nhắc", timing: "chị muốn theo dõi ít nhất hai tuần rồi mới mua cả bộ", past: "chị từng đỏ rát vì nghe tư vấn dùng hoạt chất quá nhanh", decision: "chị tự quyết nhưng phải hiểu rõ cách test và dấu hiệu cần ngưng" },
    { label: "Khách trị mụn lâu năm", voice: "direct", situation: "Chị bị mụn viêm vùng cằm kéo dài và da để lại thâm", need: "chị cần routine đơn giản vì không có thời gian dùng nhiều bước", fear: "chị sợ bị bán trọn bộ dù có món không cần thiết", budget: "chị dành tối đa 1,5 triệu mỗi tháng", timing: "chị muốn bắt đầu sau khi khám da vào tuần tới", past: "chị đã đổi ba bộ sản phẩm nhưng không ai theo dõi khi da phản ứng", decision: "chị sẽ hỏi bác sĩ trước nếu có hoạt chất điều trị" },
  ],
  food: [
    { label: "Mẹ mua đồ ăn cho gia đình", voice: "cautious", situation: "Nhà chị có hai bé, một bé dị ứng hạt và ông bà phải hạn chế đường", need: "chị cần đồ tiện nhưng thành phần phải rõ để cả nhà dùng an toàn", fear: "chị sợ nhãn ghi healthy nhưng đường và natri vẫn cao", budget: "chị cân đối khoảng 1,2 triệu một tuần", timing: "nếu hợp chị muốn nhận đều từ thứ hai tới thứ sáu", past: "chị từng nhận đồ đông lạnh bị mềm vì giao trễ", decision: "chị quyết nhưng phải xem nhãn và khẩu phần trước" },
    { label: "Người tập luyện kiểm soát dinh dưỡng", voice: "direct", situation: "Chị tập bốn buổi mỗi tuần và đang theo dõi lượng đạm, calo", need: "chị cần khẩu phần đủ no và số liệu dinh dưỡng đáng tin", fear: "chị sợ định lượng thực tế lệch nhiều so với nhãn", budget: "chị so theo giá mỗi bữa chứ không chỉ giá combo", timing: "chị muốn thử ba ngày trước khi đặt theo tháng", past: "suất ăn trước ghi nhiều đạm nhưng phần thịt thực tế rất ít", decision: "chị tự quyết dựa trên thành phần và khả năng giao đúng giờ" },
  ],
  "home-appliances": [
    { label: "Gia đình ở chung cư nhỏ", voice: "direct", situation: "Nhà chị 60 mét vuông, có trẻ nhỏ và rất nhiều tóc rụng", need: "chị cần giảm thời gian quét lau nhưng máy phải gọn và dễ vệ sinh", fear: "chị sợ mua về vướng đồ, ồn rồi cuối cùng bỏ xó", budget: "chị cân nhắc dưới 10 triệu nếu chi phí thay phụ kiện hợp lý", timing: "chị muốn dùng thử hoặc xem demo trước cuối tháng", past: "máy cũ thường mắc ở chân ghế và tìm bản đồ lại từ đầu", decision: "chị bàn với chồng về ngân sách nhưng chị là người dùng chính" },
    { label: "Khách mua cho bố mẹ", voice: "cautious", situation: "Chị mua thiết bị cho bố mẹ lớn tuổi ở nhà phố", need: "chị cần thao tác đơn giản, chữ dễ nhìn và có người hướng dẫn", fear: "chị lo khi lỗi nhỏ bố mẹ không biết xử lý", budget: "chị chấp nhận cao hơn một chút nếu bảo hành tận nhà", timing: "chị cần lắp và hướng dẫn vào cuối tuần", past: "bố mẹ từng bỏ dùng một máy vì ứng dụng quá khó", decision: "chị quyết nhưng bố mẹ phải tự dùng được" },
  ],
  technology: [
    { label: "Quản lý cần máy làm việc bền", voice: "skeptical", situation: "Chị dùng Excel nặng, họp video và mở nhiều tab cả ngày", need: "chị cần máy ổn định ba đến bốn năm, pin đủ một buổi họp", fear: "chị sợ cấu hình đẹp trên giấy nhưng nóng và tụt hiệu năng", budget: "ngân sách công ty duyệt tối đa 30 triệu", timing: "máy cũ đang lỗi nên chị cần bàn giao trong tuần này", past: "máy trước pin quảng cáo mười tiếng nhưng thực tế chỉ được bốn", decision: "chị chọn cấu hình, phòng IT kiểm tra tương thích và bảo mật" },
    { label: "Nhà sáng tạo nội dung", voice: "direct", situation: "Chị quay video ngắn, chỉnh ảnh và cần chuyển dữ liệu liên tục", need: "chị ưu tiên camera, bộ nhớ và quy trình sao lưu nhanh", fear: "chị sợ mua tính năng thừa nhưng lại thiếu cổng và dung lượng", budget: "chị có thể lên 35 triệu nếu hiệu quả làm việc chênh rõ", timing: "chị chưa vội, muốn so kỹ hai hệ sinh thái", past: "chị từng mất thời gian vì thiết bị không tương thích phụ kiện đang có", decision: "chị tự quyết sau khi thử tác vụ thật" },
  ],
  education: [
    { label: "Chủ doanh nghiệp ít thời gian", voice: "impatient", situation: "Chị đang điều hành đội mười hai người và chỉ rảnh hai tối mỗi tuần", need: "chị cần học xong áp dụng ngay vào một vấn đề đang có", fear: "chị sợ lại mua khóa học rồi chỉ xem video và bỏ dở", budget: "chị trả được 12 triệu nếu có người sửa bài sát", timing: "chị muốn triển khai trong quý này chứ không học để biết", past: "chị đã mua hai khóa online nhưng không ai nhắc hay phản hồi bài", decision: "chị tự quyết, nhưng cần thấy lịch học có thực tế với mình" },
    { label: "Nhân sự muốn chuyển nghề", voice: "cautious", situation: "Chị đang làm hành chính và muốn chuyển sang marketing", need: "chị cần portfolio đủ để ứng tuyển chứ không chỉ chứng chỉ", fear: "chị lo nền tảng yếu sẽ không theo kịp lớp", budget: "chị phải chia học phí theo tháng", timing: "chị muốn có thể ứng tuyển sau khoảng bốn tháng", past: "chị từng học một lớp đông và gần như không được hỏi giảng viên", decision: "chị tự quyết nhưng gia đình quan tâm thời gian và học phí" },
  ],
  travel: [
    { label: "Gia đình có trẻ nhỏ", voice: "cautious", situation: "Nhà chị đi bốn người, có bé ba tuổi và bà ngoại đau gối", need: "chị cần lịch nhẹ, phòng thuận tiện và không phát sinh nhiều khoản", fear: "chị sợ đến nơi phòng không giống ảnh hoặc phải đi bộ quá nhiều", budget: "tổng ngân sách khoảng 25 triệu cho cả nhà", timing: "ngày đi cố định theo lịch nghỉ của bé", past: "chuyến trước khách sạn đổi hạng phòng mà không báo", decision: "chị lên phương án, chồng chị chốt ngân sách" },
    { label: "Cặp đôi tự túc", voice: "direct", situation: "Chị và bạn trai muốn đi tự túc, chỉ cần bên em lo phần khó", need: "chị cần vé, phòng và lịch trình linh hoạt chứ không muốn chạy tour", fear: "chị sợ phí ẩn và điều kiện hủy quá chặt", budget: "chị đang so tổng chi phí với tự đặt trên ứng dụng", timing: "có thể đổi ngày trong khoảng hai tuần", past: "chị từng mất tiền vì vé không cho đổi tên", decision: "hai người sẽ cùng xem điều khoản trước khi đặt cọc" },
  ],
  "real-estate": [
    { label: "Nhà đầu tư dùng đòn bẩy", voice: "skeptical", situation: "Chị có 2,5 tỷ vốn tự có và dự kiến vay phần còn lại", need: "chị cần tài sản có thể cho thuê và dòng tiền không quá áp lực", fear: "chị sợ lãi suất tăng, chậm bàn giao và thanh khoản kém", budget: "tổng giá chị xem trong khoảng bốn đến năm tỷ", timing: "chị không cần mua ngay nếu pháp lý chưa đủ", past: "chị từng giữ chỗ một dự án rồi mất thời gian lấy lại tiền", decision: "chị chọn sản phẩm, chồng và ngân hàng cùng kiểm tra dòng tiền" },
    { label: "Gia đình mua để ở", voice: "cautious", situation: "Gia đình chị có hai con và đang thuê nhà gần trường", need: "chị cần ở lâu dài, đi học thuận tiện và cộng đồng ổn", fear: "chị lo diện tích thực nhỏ, phí vận hành cao và bàn giao muộn", budget: "khả năng trả hằng tháng của gia đình khoảng 35 triệu", timing: "chị muốn chuyển vào trước năm học mới năm sau", past: "chị đã xem vài căn nhưng sale chỉ nói tăng giá, không hỏi nhu cầu ở", decision: "hai vợ chồng quyết chung, bố mẹ sẽ xem pháp lý" },
  ],
  healthcare: [
    { label: "Khách khám vì có triệu chứng", voice: "cautious", situation: "Chị mệt kéo dài và hay chóng mặt nhưng chưa biết nên khám khoa nào", need: "chị cần được hướng dẫn đúng bước, không muốn làm cả gói cho yên tâm", fear: "chị lo xét nghiệm quá mức và không ai giải thích kết quả", budget: "chị có bảo hiểm nhưng muốn biết rõ khoản ngoài phạm vi", timing: "chị muốn khám trong tuần vì triệu chứng ảnh hưởng công việc", past: "lần trước chị nhận kết quả rồi phải tự tìm bác sĩ để hỏi", decision: "chị tự quyết nhưng sẽ theo chỉ định chuyên môn" },
    { label: "Người chăm sóc cha mẹ", voice: "direct", situation: "Chị đặt lịch cho bố 67 tuổi, có tăng huyết áp và đang dùng thuốc", need: "chị cần quy trình ít phải chờ và bác sĩ xem toàn bộ hồ sơ cũ", fear: "chị sợ dịch vụ không lưu ý bệnh nền hoặc trùng xét nghiệm", budget: "chi phí minh bạch quan trọng hơn việc chọn gói rẻ nhất", timing: "gia đình chỉ thu xếp được sáng thứ bảy", past: "bố chị từng mệt vì phải di chuyển qua nhiều khu khám", decision: "chị lo thủ tục, bác sĩ và bố chị quyết phần chuyên môn" },
  ],
  spa: [
    { label: "Khách từng bị tăng sắc tố", voice: "skeptical", situation: "Chị từng laser ở nơi khác rồi bị thâm kéo dài", need: "chị muốn cải thiện da nhưng ưu tiên an toàn hơn tốc độ", fear: "chị sợ tư vấn giấu rủi ro và đến lúc có vấn đề không ai theo", budget: "chị cần biết trọn liệu trình trước, không mua buổi lẻ liên tục", timing: "chị chưa làm ngay, muốn thăm khám và đọc cam kết trước", past: "nơi cũ chỉ nhắn chị chờ da tự hồi khi bị phản ứng", decision: "chị tự quyết sau khi biết ai trực tiếp thực hiện" },
    { label: "Khách chuẩn bị sự kiện", voice: "impatient", situation: "Chị có sự kiện sau sáu tuần và muốn da đều màu hơn", need: "chị cần phương án có thời gian hồi phục phù hợp lịch làm việc", fear: "chị sợ bong đỏ đúng tuần diễn ra sự kiện", budget: "chị dự trù khoảng tám triệu nhưng không muốn phát sinh", timing: "mốc sáu tuần là cố định", past: "chị từng được hứa một buổi là đẹp nhưng kết quả không như nói", decision: "chị sẽ chốt nếu kỳ vọng và lịch hồi phục được nói thật" },
  ],
  interior: [
    { label: "Gia đình đang hoàn thiện căn hộ", voice: "direct", situation: "Nhà chị 78 mét vuông, bếp liền phòng khách và có hai bé nhỏ", need: "chị cần công năng dễ dọn, góc cạnh an toàn và đủ chỗ chứa", fear: "chị sợ render đẹp nhưng thi công sai màu, thiếu ổ cắm và trễ ngày vào nhà", budget: "chị dành khoảng 180 triệu cho các hạng mục chính", timing: "chị phải chuyển vào nhà sau mười tuần", past: "căn trước từng bị tủ cong cánh và bên thi công né bảo hành", decision: "chị duyệt công năng, chồng chị kiểm tra vật liệu và báo giá" },
    { label: "Chủ nhà cho thuê", voice: "skeptical", situation: "Chị làm nội thất cho căn hộ cho thuê dài hạn", need: "chị cần bền, dễ sửa và không phải vật liệu quá sang", fear: "chị lo báo giá thiếu hạng mục rồi phát sinh lúc thi công", budget: "chị chốt theo tổng mức đầu tư và thời gian hoàn vốn", timing: "cần bàn giao trong sáu tuần để kịp khách thuê", past: "đội trước báo rẻ nhưng phụ kiện xuống rất nhanh", decision: "chị tự quyết sau khi bóc rõ BOQ và tiến độ" },
  ],
  "building-materials": [
    { label: "Chủ thầu cần giữ tiến độ", voice: "direct", situation: "Công trình của chị đang vào giai đoạn hoàn thiện, kho tại chỗ khá nhỏ", need: "chị cần vật tư đúng lô và giao chia theo từng tầng", fear: "chị sợ lệch màu, thiếu hàng giữa chừng làm đội thi công phải chờ", budget: "chị so giá theo chi phí hoàn thiện thực tế, kể cả hao hụt", timing: "đợt đầu phải có tại công trình sau năm ngày", past: "nhà cung cấp trước giao lẫn hai lô khiến nghiệm thu bị trả", decision: "chị đề xuất nhà cung cấp, tư vấn giám sát duyệt mẫu và hồ sơ" },
    { label: "Chủ nhà tự giám sát", voice: "cautious", situation: "Chị tự theo dõi phần chống thấm cho nhà đang xây", need: "chị cần hiểu vật liệu nào hợp từng vị trí và thợ phải làm đúng bước", fear: "chị lo mua hàng tốt nhưng thi công sai rồi không được bảo hành", budget: "chị ưu tiên xử lý dứt điểm hơn là chọn đơn giá thấp", timing: "tuần sau đội thợ bắt đầu làm khu vệ sinh và ban công", past: "nhà cũ từng thấm lại sau một mùa mưa", decision: "chị quyết chi phí, kỹ sư công trình xác nhận giải pháp" },
  ],
};

export const products: Product[] = [
  { id: "office-dress", industryId: "fashion", name: "Đầm công sở Premium", category: "Thời trang nữ", promise: "Form tôn dáng, chất liệu ít nhăn và hỗ trợ đổi size", price: "1.290.000đ" },
  { id: "linen-set", industryId: "fashion", name: "Bộ linen thiết kế", category: "Thời trang nữ", promise: "Trang phục thoáng nhẹ, may hoàn thiện theo form", price: "1.590.000đ" },
  { id: "silver-jewelry", industryId: "accessories", name: "Trang sức bạc 925", category: "Trang sức", promise: "Thiết kế dùng hằng ngày, bảo hành làm sáng", price: "890.000đ" },
  { id: "leather-bag", industryId: "accessories", name: "Túi da thủ công", category: "Phụ kiện", promise: "Da thật, hoàn thiện thủ công và bảo hành phụ kiện", price: "2.490.000đ" },
  { id: "recovery-serum", industryId: "beauty", name: "Serum phục hồi da", category: "Chăm sóc da", promise: "Hỗ trợ hàng rào bảo vệ da với routine tối giản", price: "790.000đ" },
  { id: "acne-routine", industryId: "beauty", name: "Routine chăm sóc da mụn", category: "Chăm sóc cá nhân", promise: "Bộ sản phẩm theo tình trạng da và hướng dẫn sử dụng", price: "1.450.000đ" },
  { id: "healthy-combo", industryId: "food", name: "Combo bữa ăn lành mạnh", category: "Thực phẩm", promise: "Khẩu phần kiểm soát năng lượng, giao theo tuần", price: "1.190.000đ/tuần" },
  { id: "specialty-coffee", industryId: "food", name: "Cà phê đặc sản rang mới", category: "Đồ uống", promise: "Nguồn hạt truy xuất được, rang theo gu pha", price: "320.000đ" },
  { id: "robot-vacuum", industryId: "home-appliances", name: "Robot hút bụi lau nhà", category: "Thiết bị gia dụng", promise: "Tự động vệ sinh theo bản đồ và lịch đặt trước", price: "8.990.000đ" },
  { id: "air-fryer", industryId: "home-appliances", name: "Nồi chiên không dầu", category: "Thiết bị bếp", promise: "Nấu nhanh, dung tích gia đình và dễ vệ sinh", price: "3.490.000đ" },
  { id: "business-laptop", industryId: "technology", name: "Laptop doanh nhân", category: "Máy tính", promise: "Hiệu năng ổn định, bảo mật và bảo hành tận nơi", price: "28.990.000đ" },
  { id: "smartphone-pro", industryId: "technology", name: "Điện thoại flagship", category: "Điện thoại", promise: "Camera cao cấp, hiệu năng dài hạn và hệ sinh thái đồng bộ", price: "24.990.000đ" },
  { id: "digital-marketing", industryId: "education", name: "Khóa Digital Marketing thực chiến", category: "Khóa học", promise: "Học qua dự án, có phản hồi bài và lộ trình triển khai", price: "12.000.000đ" },
  { id: "business-english", industryId: "education", name: "Tiếng Anh giao tiếp công việc", category: "Giáo dục", promise: "Lộ trình theo trình độ và tình huống công việc", price: "8.500.000đ" },
  { id: "family-resort", industryId: "travel", name: "Gói nghỉ dưỡng gia đình", category: "Lưu trú", promise: "Phòng gia đình, ăn sáng và hỗ trợ lịch trình", price: "Từ 9.900.000đ" },
  { id: "japan-tour", industryId: "travel", name: "Tour Nhật Bản 6N5Đ", category: "Du lịch", promise: "Lịch trình trọn gói, hướng dẫn viên và hỗ trợ visa", price: "39.900.000đ" },
  { id: "city-apartment", industryId: "real-estate", name: "Căn hộ trung tâm", category: "Căn hộ", promise: "Sản phẩm để ở/cho thuê với tiến độ thanh toán theo đợt", price: "Từ 4,2 tỷ" },
  { id: "suburban-townhouse", industryId: "real-estate", name: "Nhà phố khu đô thị", category: "Nhà ở", promise: "Không gian gia đình, tiện ích nội khu và pháp lý minh bạch", price: "Từ 9,8 tỷ" },
  { id: "health-check", industryId: "healthcare", name: "Gói khám sức khỏe chuyên sâu", category: "Y tế", promise: "Sàng lọc theo yếu tố nguy cơ và tư vấn kết quả", price: "6.500.000đ" },
  { id: "rehab-program", industryId: "healthcare", name: "Chương trình phục hồi vận động", category: "Chăm sóc sức khỏe", promise: "Đánh giá và theo dõi bởi đội ngũ chuyên môn", price: "Theo chỉ định" },
  { id: "skin-treatment", industryId: "spa", name: "Liệu trình chăm sóc da chuyên sâu", category: "Spa", promise: "Phác đồ theo tình trạng da và theo dõi sau buổi", price: "Từ 6.000.000đ" },
  { id: "body-contouring", industryId: "spa", name: "Liệu trình tạo dáng không xâm lấn", category: "Thẩm mỹ", promise: "Đánh giá cá nhân, liệu trình và hướng dẫn chăm sóc", price: "Theo phác đồ" },
  { id: "modular-kitchen", industryId: "interior", name: "Tủ bếp thiết kế theo nhà", category: "Nội thất", promise: "Thiết kế công năng, sản xuất và lắp đặt trọn gói", price: "Từ 85.000.000đ" },
  { id: "premium-sofa", industryId: "interior", name: "Sofa phòng khách", category: "Nội thất", promise: "Kích thước tùy chỉnh, vật liệu chọn mẫu và bảo hành", price: "Từ 32.000.000đ" },
  { id: "porcelain-tile", industryId: "building-materials", name: "Gạch porcelain cao cấp", category: "Hoàn thiện", promise: "Độ hút nước thấp, lô màu đồng nhất và giao theo tiến độ", price: "Từ 620.000đ/m²" },
  { id: "waterproof-system", industryId: "building-materials", name: "Hệ chống thấm công trình", category: "Vật liệu kỹ thuật", promise: "Giải pháp theo bề mặt, định mức và quy trình nghiệm thu", price: "Theo khối lượng" },
];

export const scenarios: Scenario[] = [
  { id: "cold", name: "Khách lạnh, thiếu kiên nhẫn", step: 2, goal: "Tạo thiện cảm và xin phép khai thác", objection: "time" },
  { id: "no-time", name: "Khách bận, muốn quyết nhanh", step: 3, goal: "Hỏi đúng dữ kiện quyết định thay vì thuyết trình", objection: "time" },
  { id: "price", name: "Khách phản đối giá", step: 7, goal: "Làm rõ giá trị, tổng chi phí và rủi ro", objection: "price" },
  { id: "trust", name: "Khách mất niềm tin", step: 6, goal: "Đưa bằng chứng đúng loại và không hứa quá", objection: "trust" },
  { id: "fit", name: "Khách nghi ngờ phù hợp", step: 5, goal: "Chẩn đoán trước khi nối giải pháp", objection: "fit" },
  { id: "authority", name: "Khách chưa tự quyết", step: 8, goal: "Xác định người quyết định và chốt bước tiếp", objection: "authority" },
  { id: "competition", name: "Khách đang so sánh đối thủ", step: 7, goal: "So sánh bằng tiêu chí kiểm chứng được", objection: "competition" },
  { id: "expert", name: "Khách hiểu ngành, hỏi sâu", step: 4, goal: "Không né câu hỏi kỹ thuật; làm rõ nhu cầu và giới hạn", objection: "trust" },
];

export const takiSteps = [
  "Mở đầu và xin phép",
  "Tạo thiện cảm, kiểm soát cuộc trò chuyện",
  "Khai thác hiện trạng và mục tiêu",
  "Đào sâu điểm đau, hậu quả",
  "Nối giải pháp đúng nhu cầu",
  "Trình bày bằng chứng phù hợp",
  "Xử lý từ chối theo CETAA",
  "Chốt bước tiếp theo cụ thể",
];

export function industryForProduct(productId: string) {
  const product = products.find((item) => item.id === productId);
  return industries.find((item) => item.id === product?.industryId) ?? industries[0];
}
