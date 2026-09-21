# BÁO CÁO HOÀN TẤT TINH CHỈNH KHOA HỌC & SƯ PHẠM
## N&Mstudio Interactive Astronomy Series · Chuyên Đề Trái Đất & 4 Mùa (`earth.html`)

**Phiên bản:** Release Hardening · One-Round Final Refinement  
**Hệ thống:** N&Mstudio Interactive Astronomy Series  
**Phạm vi:** `/earth` (`earth.html`)  
**URL Production:** `https://tinh-do-thai-duong.vercel.app/earth`  
**Ngày phát hành:** 21/09/2026  
**Phương pháp luận:** Ponytail Methodology (Tối giản, chuẩn mực, đúng bản chất khoa học) + Alibaba Open Code Review (Độ tin cậy & Robustness).

---

### 1. EXECUTIVE SUMMARY (TỔNG QUAN ĐIỀU HÀNH)

Đợt tinh chỉnh này tập trung giải quyết triệt để 5 rào cản nhận thức lớn nhất của học sinh khi tiếp cận chuyên đề Trái Đất và 4 Mùa:
1. **Ngộ nhận về khoảng cách Mặt Trời gây ra mùa:** Làm rõ nguyên nhân thiên văn thực sự là **độ nghiêng trục tự quay 23,44°** không đổi hướng trong không gian khi Trái Đất chuyển động quanh Mặt Trời, dẫn tới sự biến thiên góc nhập xạ và thời gian chiếu sáng.
2. **Ngộ nhận về độ lệch tâm quỹ đạo:** Bổ sung ghi chú minh bạch về tỉ lệ trực quan quỹ đạo ($e \approx 0.0167$, gần như tròn hoàn hảo), loại bỏ nguy cơ học sinh nghĩ Trái Đất quay theo hình elip dẹt.
3. **Mặt Trời lên thiên đỉnh tại Việt Nam:** Tích hợp tính toán thời điểm và giải thích bản chất vì sao toàn bộ lãnh thổ Việt Nam (nằm hoàn toàn trong vùng nội chí tuyến Bắc) đều có đúng **2 lần Mặt Trời lên thiên đỉnh mỗi năm**, thời gian giữa 2 lần dài dần từ Bắc vào Nam.
4. **Cầu nối tự nhiên giữa Thiên văn → Khí hậu → Thời tiết:** Bổ sung bài học chuỗi nhân quả: *Mặt Trời → Góc nhập xạ → Mặt đất nóng không đều → Chênh lệch nhiệt & áp → Gió → Hiệu ứng Coriolis làm lệch hướng quy mô lớn → Hoàn lưu khí quyển & các mùa gió tại Việt Nam*.
5. **Giảm tải nhận thức (Cognitive Load):** Tách dải telemetry thành 2 tầng: **Cơ bản** (dành cho học sinh quan sát nhanh) và **Nâng cao** (dành cho giáo viên/chuyên sâu với nút thu gọn mở rộng).

---

### 2. BẢNG ĐỐI CHIẾU TRƯỚC & SAU TINH CHỈNH

| Hạng mục | Trước tinh chỉnh | Sau tinh chỉnh | Giá trị giáo dục & Khoa học |
| :--- | :--- | :--- | :--- |
| **Dải Telemetry** | Hiển thị dồn dập nhiều tham số kỹ thuật ($\delta$, Khoảng cách, Vận tốc, EoT) | Tách thành **Mức cơ bản** (Thời gian, Mùa, Vị trí, Góc trưa, Độ dài ngày) + Nút **Số liệu nâng cao ▾** | Giảm tải nhận thức cho học sinh tiểu học/THCS, cung cấp đúng lúc cho học sinh THPT/giáo viên. |
| **Nguyên nhân tạo Mùa** | Giải thích chung chung | Xác định rõ: Độ nghiêng trục là **nguyên nhân thiên văn chính**, kèm lưu ý địa lý về biển/lục địa/địa hình tại từng địa phương | Đúng chuẩn chương trình Địa lý 10 & Vật lý Thiên văn. |
| **Thiên đỉnh tại Việt Nam** | Chỉ ghi nhận ngày thiên đỉnh chung | Tính toán động theo vĩ độ click: Hiển thị rõ Ngày lần 1, Ngày lần 2, cọc gnomon không bóng lúc chính trưa; vĩ độ ngoài nội chí tuyến giải thích rõ lý do không có | Học sinh tự so sánh được Hà Nội (21°B), Đà Nẵng (16°B), TP.HCM (10.8°B). |
| **Định luật Cosine / Lambert** | Nhãn "Quang thông", "Hiệu suất nhiệt" dễ gây hiểu nhầm | Đổi thành "Hệ số chiếu hình học" và "Bức xạ lý tưởng", kèm nhãn `MODEL · IDEALIZED` | Minh bạch khoa học: mô hình góc chiếu hình học lý tưởng chưa tính suy giảm khí quyển. |
| **Khám phá qua Gnomon** | Chưa có liên kết trực quan lịch sử | Thêm micro-card Eratosthenes (~240 TCN) và nút bấm khám phá bóng cọc gnomon tức thì | Tái hiện phương pháp đo bán kính Trái Đất cổ đại một cách sinh động. |
| **Hiệu ứng Coriolis** | Mô tả chưa phân biệt quy mô | Nhấn mạnh: hiệu ứng thể hiện rõ ở **chuyển động quy mô lớn** (gió Mậu dịch, bão, dòng biển), không áp dụng cho bồn rửa bát | Chống ngộ nhận phổ biến trong đời sống. |
| **Hệ thống câu hỏi dẫn đường** | Chưa có | Bổ sung thanh 6 câu hỏi dẫn đường tương tác nhanh ở đầu Sổ tay kiến thức | Học sinh click câu hỏi → Tự động mở tab/bài học tương ứng để trả lời. |

---

### 3. CHI TIẾT CÁC MODULE ĐÃ ĐƯỢC NÂNG CẤP

#### 3.1. Phân tầng Telemetry (Progressive Disclosure)
- **Mức hiển thị tức thì:**
  - `Thời gian`: Ngày trong năm (dạng `DD/MM`).
  - `Mùa thiên văn`: Icon + tên mùa tại Bắc bán cầu.
  - `Vị trí khảo sát`: Tên địa phương (ví dụ: `🏛️ Hà Nội`).
  - `Góc trưa`: Độ cao cực đại của Mặt Trời tại kinh tuyến địa phương.
  - `Độ dài ngày`: Số giờ có ánh sáng Mặt Trời trong ngày.
- **Mức nâng cao (Ẩn/Hiện qua toggle):**
  - Xích vĩ trực xạ Mặt Trời ($\delta$).
  - Khoảng cách Đất - Trời (triệu km).
  - Vận tốc quỹ đạo tức thời ($v \approx 29.8\text{ km/s}$).
  - Phương trình thời gian (EoT, bù trừ nhật cảm).
  - Nhãn minh bạch tỉ lệ quỹ đạo trực quan ($e \approx 0.0167$).

#### 3.2. Sổ tay tri thức & Chuỗi bài học địa lý tự nhiên
- **Bài học 1:** Chuyển động tự quay quanh trục từ Tây sang Đông, chu kỳ 23h56m04s, đường phân chia sáng/tối (terminator).
- **Bài học 2:** Trục nghiêng 23,44° không đổi phương trong không gian — nguyên nhân thiên văn cốt lõi của 4 mùa.
- **Bài học 3:** Hiện tượng Mặt Trời lên thiên đỉnh tại vùng nội chí tuyến và thực tế Việt Nam.
- **Bài học 4:** Lực Coriolis và sự lệch hướng chuyển động quy mô lớn trong hệ quy chiếu quay (bán cầu Bắc lệch phải, bán cầu Nam lệch trái).
- **Bài học 5:** Hiện tượng ngày đêm dài ngắn theo mùa và theo vĩ độ (ngày trắng 24h và đêm vùng cực).
- **Bài học 6 (Mới):** Mối liên hệ tự nhiên từ Mặt Trời đến Thời tiết & Khí hậu Việt Nam:
  $$\text{Mặt Trời} \xrightarrow{\text{Góc chiếu}} \text{Nhiệt bề mặt} \xrightarrow{\Delta T} \text{Chênh lệch khí áp} \xrightarrow{} \text{Gió & Coriolis} \xrightarrow{} \text{Thời tiết & Mùa gió VN}$$

#### 3.3. Thanh 6 câu hỏi dẫn đường tương tác (`goToQuestion`)
1. *Vì sao có ngày và đêm?* → Mở bài học 1 & quan sát bán cầu sáng tối.
2. *Vì sao Trái Đất có mùa?* → Mở bài học 2 & chuyển động công chuyển.
3. *Vì sao mùa hè nóng hơn?* → Mở phòng thí nghiệm định luật Cosine / Lambert.
4. *Hà Nội và TP.HCM khác nhau thế nào?* → Mở bài học thiên đỉnh & chọn tự động Hà Nội để so sánh.
5. *Vì sao gió và bão bị lệch hướng?* → Mở bài học lực Coriolis.
6. *Mặt Trời liên quan gì đến thời tiết?* → Mở bài học 6 liên hệ thời tiết và khí hậu.

---

### 4. KẾT QUẢ KIỂM ĐỊNH TỰ ĐỘNG & BẢNG SỐ LIỆU MẪU

Tất cả các hàm toán học thiên văn trong `earth.html` đã được xác minh tự động bằng engine kiểm thử:

| Địa điểm | Vĩ độ | Ngày Thiên đỉnh 1 | Ngày Thiên đỉnh 2 | Góc trưa Hạ chí | Góc trưa Đông chí | Độ dài ngày Hạ chí | Độ dài ngày Đông chí |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Xích đạo** | $0.00^\circ$ | 20/03 (DOY 79) | 23/09 (DOY 266) | $66.56^\circ$ | $66.56^\circ$ | 12.1h | 12.1h |
| **TP. Hồ Chí Minh** | $10.82^\circ\text{B}$ | 17/04 (DOY 107) | 24/08 (DOY 236) | $77.38^\circ$ | $55.74^\circ$ | 12.7h | 11.5h |
| **Đà Nẵng** | $16.05^\circ\text{B}$ | 03/05 (DOY 123) | 07/08 (DOY 219) | $82.61^\circ$ | $50.51^\circ$ | 13.0h | 11.2h |
| **Hà Nội** | $21.03^\circ\text{B}$ | 24/05 (DOY 144) | 17/07 (DOY 198) | $87.59^\circ$ | $45.53^\circ$ | 13.4h | 10.9h |
| **Chí tuyến Bắc** | $23.44^\circ\text{B}$ | 21/06 (DOY 172) | 21/06 (DOY 172) | $90.00^\circ$ | $43.12^\circ$ | 13.5h | 10.7h |
| **Tokyo** | $35.68^\circ\text{B}$ | *Không có* | *Không có* | $77.76^\circ$ | $30.88^\circ$ | 14.5h | 9.8h |
| **Vòng cực Bắc** | $66.56^\circ\text{B}$ | *Không có* | *Không có* | $46.88^\circ$ | $0.00^\circ$ | 24.0h (Ngày trắng) | 0.0h (Đêm cực) |

*Ghi chú:* Bức xạ lý tưởng theo định luật Lambert tại góc $90^\circ$ là $1361\text{ W/m}^2$, tại $60^\circ$ là $1179\text{ W/m}^2$ ($86.6\%$), tại $30^\circ$ là $680\text{ W/m}^2$ ($50.0\%$).

---

### 5. HƯỚNG DẪN SỬ DỤNG CHO GIÁO VIÊN & HỌC SINH

1. **Khởi động bài học (5 phút):**
   - Học sinh click vào thanh câu hỏi dẫn đường (ví dụ câu hỏi 1 và 2) để kích thích sự tò mò.
   - Bật/tắt chế độ tự quay và công chuyển trên thanh điều khiển dưới chân trang để nhận biết trực quan sự khác nhau giữa ngày/đêm và mùa.
2. **Khám phá góc chiếu & 4 mùa (15 phút):**
   - Kéo thanh trượt Ngày trên timeline hoặc bấm nhanh 4 mốc: Xuân phân (20/03), Hạ chí (21/06), Thu phân (23/09), Đông chí (21/12).
   - Quan sát đường phân chia sáng tối (terminator) và chùm tia nắng song song (`Tia nắng DIAGRAM`).
3. **Thực hành liên hệ Việt Nam (10 phút):**
   - Chọn lần lượt `Hà Nội`, `Đà Nẵng`, `TP. Hồ Chí Minh` trong menu Vị trí.
   - So sánh ngày Mặt Trời lên thiên đỉnh giữa miền Bắc và miền Nam: Tại sao ở Hà Nội 2 ngày thiên đỉnh rất gần nhau (tháng 5 và tháng 7), trong khi ở TP.HCM lại cách xa nhau (tháng 4 và tháng 8)?
4. **Mở rộng phòng thí nghiệm (10 phút):**
   - Mở modal `🧪 Thí Nghiệm` để học sinh tự kéo thanh trượt góc nhập xạ $\alpha$ từ $5^\circ$ đến $90^\circ$, quan sát diện tích ánh sáng trải dài và lượng bức xạ hấp thụ.
   - Bấm nút `🚀 Phóng luồng hạt từ Xích đạo` để chứng minh định luật Ferrel về sự lệch hướng gió do lực Coriolis.

---

### 6. TRẠNG THÁI TRIỂN KHAI

- **Mã nguồn:** Toàn bộ chỉnh sửa nằm gọn trong file `earth.html` duy nhất, không phát sinh thêm thư viện ngoài (zero new dependencies).
- **Tương thích:** Đáp ứng chuẩn hiển thị responsive trên Desktop, Tablet và Mobile.
- **Trạng thái:** Sẵn sàng commit, push và deploy lên GitHub và Vercel.
