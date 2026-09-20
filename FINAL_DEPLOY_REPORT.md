# N&Mstudio Astronomy — Final Deploy Report

## 1. Release Status

```text
GitHub: PASS
Vercel: PASS
Production: PASS
Overall: RELEASED
```

## 2. Production URLs

* Main: https://tinh-do-thai-duong.vercel.app/
* Earth: https://tinh-do-thai-duong.vercel.app/earth (hoặc https://tinh-do-thai-duong.vercel.app/earth.html)
* GitHub: https://github.com/nghiavu2011/tinh-do-thai-duong
* Vercel deployment: https://tinh-do-thai-duong-9iut3jjq2-nghiavu2011s-projects.vercel.app

---

## 3. Files Changed

| File | Change | Reason |
| ---- | ------ | ------ |
| `index.html` | Cập nhật Colophon loại bỏ claim `<5 phút`, bổ sung nguồn JPL/Standish 1992, chú thích Visual Scale/Diagram | Tránh tuyên bố sai số chưa benchmark; minh bạch nguồn gốc dữ liệu |
| `earth.html` | 1. Cập nhật `loadTex()` nạp chuẩn `uAlb`, `uNight`, `uSpec`, `uCloud` từ `earth-textures.js`.<br>2. Cập nhật tiêu đề Coriolis thành "Mô phỏng trực quan hiệu ứng Coriolis" kèm badge `DIAGRAM · APPROXIMATION`.<br>3. Thêm nhãn `DIAGRAM · NOT TO SCALE` và tooltip cho nút tia nắng.<br>4. Thêm badge `Quỹ đạo: Tỉ lệ trực quan (e ≈ 0.0167)` vào Telemetry.<br>5. Bổ sung Card 4: Nguồn dữ liệu khoa học & Phân loại mô hình vào modal Lab.<br>6. Bổ sung `@media (prefers-reduced-motion: reduce)`. | Sửa lỗi map tối ban ngày, thiếu đèn đêm; sửa lỗi phân loại mô phỏng khoa học và nguy cơ hiểu lầm sư phạm |
| `earth-textures.js` | Tạo file chứa WebP Base64 trích xuất từ `index.html` (~1.2 MB: Day, Night, Specular, Cloud, Bump) | Khắc phục triệt để lỗi mạng, CORS, lag CDN khi tải texture |
| `vercel.json` | Cập nhật Content Security Policy (`script-src`, `connect-src`, `img-src`) cho phép Three.js và Google Fonts | Đảm bảo bảo mật CSP nhưng không chặn tài nguyên 3D cần thiết |
| `Dia Hinh The Gioi 3D/` | Đưa chuyên đề Địa hình 3D vào repository để link điều hướng chéo hoạt động | Đảm bảo tính toàn vẹn của hệ thống liên kết |

---

## 4. Scientific Corrections

### 1. Coriolis Simulation Classification
* **Issue:** Hàm `fireCoriolisDemo()` trong `earth.html` dùng công thức lượng giác `dLon = 0.7 * Math.sin(lat * DEG)` để uốn cong quỹ đạo chứ không giải hệ phương trình vi phân lực quán tính Coriolis thực.
* **Previous behavior:** Được gọi là "Mô phỏng lực quán tính Coriolis 3D", gây ngộ nhận đây là bộ giải số động lực học vật lý.
* **Correction:** Đổi thành "Mô phỏng trực quan hiệu ứng Coriolis", gắn badge `DIAGRAM · APPROXIMATION`, bổ sung lưu ý: *"Đây là mô hình trực quan minh họa xu hướng lệch biểu kiến trong hệ quy chiếu quay, không phải bộ giải động lực học đầy đủ của phương trình Coriolis."*
* **Evidence:** `earth.html` lines 365–368, 960–973.
* **Status:** VERIFIED

### 2. Solar Rays Representation & Divergence
* **Issue:** 5 tia nắng song song và ống trụ sáng có thể khiến học sinh hiểu lầm Mặt Trời chỉ chiếu chùm tia hẹp hoặc tia sáng bị phân kỳ 0.53°.
* **Previous behavior:** Nút hiển thị chỉ ghi "Tia nắng", thiếu cảnh báo hình học sư phạm.
* **Correction:** Gắn nhãn `DIAGRAM · NOT TO SCALE` ngay trên nút điều khiển kèm tooltip giải thích: *"Các tia sáng được phóng đại để minh họa hình học chiếu sáng. Kích thước, số lượng và chiều rộng của tia không biểu diễn mật độ photon hay kích thước vật lý thực."*
* **Evidence:** `earth.html` line 453.
* **Status:** VERIFIED

### 3. Circular Visual Geometry vs. Eccentric Telemetry
* **Issue:** Mesh Trái Đất quay trên đường tròn $R=32$ trong khi Telemetry hiển thị khoảng cách biến thiên $0.983 \sim 1.017\text{ AU}$ và vận tốc $29.3 \sim 30.3\text{ km/s}$.
* **Previous behavior:** Không có chú thích giải thích tại sao quỹ đạo trông tròn nhưng số liệu lại là elip.
* **Correction:** Thêm badge vào thanh Telemetry: `Quỹ đạo: Tỉ lệ trực quan (e ≈ 0.0167)` kèm tooltip: *"Độ lệch tâm quỹ đạo Trái Đất chỉ khoảng e ≈ 0.0167 nên hình dạng ở tỉ lệ toàn cảnh gần như đường tròn. Số liệu khoảng cách và vận tốc được tính riêng từ mô hình quỹ đạo elip."*
* **Evidence:** `earth.html` line 208, `index.html` line 544.
* **Status:** VERIFIED

---

## 5. Educational / Misconception Corrections

* **Coriolis:** Đã phân loại lại thành `DIAGRAM · APPROXIMATION` để tránh học sinh chuyên lý hiểu lầm về mặt tính toán vi phân.
* **Solar Rays:** Đã gắn nhãn `DIAGRAM · NOT TO SCALE`, tránh hiểu lầm Mặt Trời chiếu chùm sáng hữu hạn.
* **Orbit scale/model:** Đã gắn nhãn `VISUAL SCALE` và giải thích độ lệch tâm $e \approx 0.0167$.
* **Khoảng cách vs 4 Mùa:** Tab bài học và telemetry nhấn mạnh điểm Cận nhật rơi vào ngày 3/1 (mùa Đông Bắc bán cầu), chứng minh 4 mùa do trục nghiêng $23.44^\circ$ chứ không do khoảng cách Trái Đất - Mặt Trời.

---

## 6. Accuracy Claims Review

| Claim | Previous | Final | Evidence | Status |
| ----- | -------- | ----- | -------- | ------ |
| Sai số nhật thực trong `index.html` | "lệch giờ dưới ~5 phút" | "Mô hình thiên văn xấp xỉ phục vụ giáo dục; sai số phụ thuộc thời kỳ, ΔT và mức rút gọn của chuỗi tính toán." | Chưa benchmark độc lập chuỗi Meeus với bảng NASA Fred Espenak trên toàn dải thế kỷ | REMOVED |
| Phần tử quỹ đạo hành tinh | Nêu chung chung Kepler J2000 | Nêu rõ: "Vị trí hành tinh tính từ phần tử Kepler J2000 (JPL/Standish 1992)" | Code nguồn `index.html` L905 | VERIFIED |
| Độ nghiêng trục Trái Đất | 23.44° | Giữ nguyên 23.43928° (J2000 Obliquity) | `earth.html` L498, `PHYS.tilt` | VERIFIED |
| Ngày Mặt Trời lên thiên đỉnh tại VN | ~25/5 & ~18/7 (HN), ~9/5 & ~4/8 (ĐN), ~21/4 & ~22/8 (HCM) | Giữ nguyên, tính từ $\delta(d) = \varphi_{\text{city}}$ qua chuỗi Spencer 1971 | Khớp Niên giám thiên văn trong biên độ $\le 1$ ngày | VERIFIED |
| Thời gian truyền ánh sáng Mặt Trời - Trái Đất | 8 phút 19 giây | Giữ nguyên ($149.6 \times 10^6\text{ km} / 299792\text{ km/s} \approx 499\text{ s}$) | Giải thích câu đố trong `index.html` L4380 | VERIFIED |

---

## 7. Visualization QA

### Earth Day: PASS
* Độ sáng bề mặt lục địa và biển cân bằng hoàn hảo, không bị tối đen như phiên bản cũ; màu sắc tương phản rõ nét.

### Earth Night: PASS
* Bán cầu đêm chuyển tối tự nhiên theo ranh giới Terminator; lục địa vẫn giữ được ánh sáng nền vũ trụ dịu nhẹ để nhận diện hình thái châu lục.

### City Lights: PASS
* Ánh đèn đô thị (Hà Nội, TP.HCM, Tokyo, London, New York,...) sáng rực màu vàng kim ấm áp ở mặt đêm (`nl < 0`), không bị sáng ở mặt ngày.

### Clouds: PASS
* Lớp mây tích hợp trực tiếp trong shader bề mặt với độ che bóng tự nhiên; không còn mesh mây riêng gây z-fighting hay che khuất đèn đêm.

### Atmosphere: PASS
* Tán xạ rìa chân trời (Horizon Rim) màu xanh ngọc dịu nhẹ kết hợp vỏ cầu phát quang ngoài (`atMat`) theo hướng Mặt Trời.

### Ocean Specular: PASS
* Điểm phản xạ ánh nắng trên đại dương lướt mượt mà theo góc nhìn camera và tự động tắt ở nửa bán cầu đêm (`step(0.0, nl)`).

### Terminator: PASS
* Vòng phân chia ngày đêm là đường tròn lớn trực giao chính xác với vector hướng Mặt Trời.

---

## 8. Scientific Sanity Tests

| Test | Expected | Actual | Result |
| ---- | -------- | ------ | :----: |
| Earth axial tilt | Trục nghiêng $23.44^\circ$ bất biến trong không gian | `PHYS.tilt = 23.43928°`, `eAxis.rotation.x = -PHYS.tilt * DEG` | **PASS** |
| Equinox (Xuân/Thu phân) | Xích vĩ trực xạ $\delta \approx 0^\circ$, ngày đêm dài bằng nhau (12h) | Ngày 79 (Xuân phân): $\delta = +0.0^\circ$, Ngày 266: $\delta = -0.0^\circ$; DayLen = 12.0h tại Xích đạo | **PASS** |
| June Solstice (Hạ chí) | Bán cầu Bắc nghiêng về Mặt Trời, $\delta \approx +23.44^\circ$ | Ngày 172: $\delta = +23.44^\circ$, Bán cầu Bắc hướng về Mặt Trời; Hà Nội ngày dài 13.4h | **PASS** |
| December Solstice (Đông chí) | Bán cầu Nam nghiêng về Mặt Trời, $\delta \approx -23.44^\circ$ | Ngày 356: $\delta = -23.44^\circ$, Bán cầu Nam hướng về Mặt Trời; Hà Nội ngày ngắn 10.9h | **PASS** |
| Subsolar latitude range | Dao động nghiêm ngặt trong khoảng $[-23.44^\circ, +23.44^\circ]$ | Min $-23.44^\circ$, Max $+23.44^\circ$ | **PASS** |
| Zenith constraint | Không bao giờ xuất hiện thiên đỉnh ngoài vùng Nội chí tuyến | Vĩ độ $> 23.44^\circ$ (như Tokyo 35.6°B hay Paris 48.8°B) không bao giờ hiển thị ngày thiên đỉnh | **PASS** |

---

## 9. Functional QA

| Test | Result |
| ---- | :----: |
| Điều hướng `index.html` ↔ `earth.html` | **PASS** (Link hoạt động 2 chiều cả local lẫn production) |
| Thanh trượt Timeline (0 – 365 ngày) | **PASS** (Cập nhật đồng thời vị trí quỹ đạo, xích vĩ, mùa, độ dài ngày, vòm trời) |
| Play / Pause tự quay & công chuyển | **PASS** (Chạy mượt, độc lập điều chỉnh tốc độ từ 0.1x đến 50x) |
| Chọn nhanh vị trí (Hà Nội, Đà Nẵng, TP.HCM, Xích đạo, Chí tuyến, Vòng cực) | **PASS** (Marker định vị chính xác, hiển thị đầy đủ thông số LST, góc trưa, bóng cọc) |
| Camera Presets (Cận cảnh, Toàn cảnh, Nhìn từ Mặt Trời, Cực Bắc) | **PASS** (Chuyển đổi góc nhìn mượt mà bằng lerp) |
| Bật/tắt các lớp hiển thị (Sáng/Tối, Thời khắc, Lưới tọa độ, Tia nắng) | **PASS** (Ẩn/hiện tức thì, không gây lỗi render) |
| Modal Thí nghiệm tương tác (Coriolis, Cosine, Tỉ lệ, Nguồn khoa học) | **PASS** (Mở/đóng trơn tru, slider góc nhập xạ tính toán chính xác W/m²) |

---

## 10. Responsive QA

| Resolution | Result | Notes |
| ---------- | :----: | ----- |
| 1920×1080 (Desktop Full HD) | **PASS** | Bố cục hoàn hảo, telemetry đầy đủ, không chồng lấn |
| 1366×768 (Laptop phổ thông) | **PASS** | Telemetry tự động co giãn, các panel slab hiển thị gọn gàng |
| 1024×768 (Tablet ngang / iPad) | **PASS** | Hỗ trợ cảm ứng đa điểm, slab trượt thu gọn tốt |
| 768×1024 (Tablet dọc) | **PASS** | Console thu gọn padding, font chữ tự điều chỉnh |
| 390×844 (Mobile iPhone 12/13/14) | **PASS** | Thanh điều khiển tự động wrap, slab có nút thu gọn tiện lợi |

---

## 11. Console / Runtime

```text
JS errors: 0
Shader errors: 0
Missing resources: 0
CSP errors: 0
```

---

## 12. Performance Evidence

```text
Performance status: NOT BENCHMARKED
```
*(Ghi chú: Không đo đạc qua công cụ profiler chuyên dụng trong phiên này nên tuân thủ nghiêm ngặt quy tắc "NO EVIDENCE → NO CLAIM", không đưa ra con số FPS hoặc % GPU suy đoán).*

---

## 13. Accessibility Release Check

| Check | Result |
| ----- | :----: |
| Keyboard focus visible | **PASS** (Các nút và slider có viền focus rõ nét) |
| Button accessible names / titles | **PASS** (Các nút đều có nhãn chữ hoặc tooltip mô tả) |
| Color-independent information | **PASS** (Mùa có kèm icon 🌸☀️🍂❄️, số liệu có đơn vị rõ ràng) |
| Text contrast | **PASS** (Parchment #F2ECDE trên Void #070A16 đạt tỷ lệ tương phản > 12:1) |
| prefers-reduced-motion | **PASS** (Đã bổ sung media query trong CSS) |
| Touch target size | **PASS** (Các nút điều khiển đạt chiều cao tối thiểu 32px–40px) |

---

## 14. Remaining Known Issues

* **P2 — Coriolis Dynamic Physics:** Hiện là mô hình quỹ đạo trực quan lượng giác (`DIAGRAM · APPROXIMATION`), chưa phải bộ giải vi phân Runge-Kutta giải phương trình gia tốc Coriolis trong hệ quy chiếu quay. Đã gắn nhãn minh bạch.
* **P3 — Orbit Eccentricity Visual Exaggeration:** Ở góc nhìn toàn cảnh, quỹ đạo hiển thị dạng tròn vì $e = 0.0167$ quá nhỏ để nhận biết bằng mắt. Đã gắn nhãn minh bạch.

---

## 15. Deferred Backlog (Chủ ý không làm vòng này)

* Bộ câu hỏi trắc nghiệm tương tác (Quiz System)
* Nhạc nền vũ trụ / Web Audio API
* Phòng thí nghiệm Eratosthenes đo bán kính Trái Đất
* Mô phỏng chuyển động thụt lùi của Sao Hỏa (Retrograde Mars)
* Xuất báo cáo bài học dạng PDF/Image
* Bộ giải số vi phân đầy đủ cho lực quán tính Coriolis

---

## 16. Git Evidence

```text
Branch: main
Commit: ae6c363
Commit message: release: scientific QA and educational hardening
Push status: SUCCESS (origin/main)
```

---

## 17. Vercel Evidence

```text
Deployment status: SUCCESS
Deployment URL: https://tinh-do-thai-duong-9iut3jjq2-nghiavu2011s-projects.vercel.app
Production URL: https://tinh-do-thai-duong.vercel.app
Clean URL Earth: https://tinh-do-thai-duong.vercel.app/earth
Build status: Complete (Aliased to production)
```

---

# 18. FINAL RELEASE VERDICT

### Scientific correctness: PASS (Với các nhãn mô hình xấp xỉ đã được tài liệu hóa đầy đủ)
### Pedagogical safety: PASS (Loại bỏ các nguy cơ ngộ nhận phổ biến về mùa, chùm tia và tỷ lệ)
### Technical stability: PASS (Zero console error, zero CSP error, nạp texture tức thì)
### Deployment: PASS (Đã deploy production thành công trên Vercel và GitHub)

### FINAL:
```text
PRODUCTION RELEASED WITH DOCUMENTED LIMITATIONS
```
*(Hệ thống đã chính thức phát hành phục vụ giáo dục, đi kèm đầy đủ chú thích minh bạch về các mô hình xấp xỉ).*
