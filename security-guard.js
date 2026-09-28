/**
 * ══════════════════════════════════════════════════════════════════════════════
 * BẢO MẬT & BẢO VỆ BẢN QUYỀN N&M STUDIO (SECURITY & INTEGRITY GUARD)
 * Dự án: Tinh Đồ Thái Dương 3D & Phòng Thí Nghiệm Địa Hình Trái Đất
 * Tác giả: N&M Studio (Hotline/Zalo: 0985578385)
 * ══════════════════════════════════════════════════════════════════════════════
 * Tính năng bảo vệ:
 * 1. Chống nhúng iFrame / Clickjacking (Frame Buster)
 * 2. Chống sao chép & nhân bản sang tên miền rác (Canonical Origin Verification)
 * 3. Chống trích xuất tài nguyên 3D & hình ảnh (Canvas & Media Asset Protection)
 * 4. Chặn phím tắt trích xuất mã nguồn (Ctrl+S, Ctrl+U)
 * 5. Cảnh báo bản quyền & sở hữu trí tuệ trên DevTools Console (Legal Watermark)
 * ══════════════════════════════════════════════════════════════════════════════
 */
(function(window, document){
  'use strict';

  var CANONICAL_HOST = 'tinh-do-thai-duong.vercel.app';
  var CANONICAL_URL = 'https://' + CANONICAL_HOST;

  // 1. CẢNH BÁO BẢN QUYỀN TRÊN DEVTOOLS CONSOLE
  try {
    var titleStyle = 'font-size:15px;font-weight:bold;color:#E8C87A;background:#080B16;padding:6px 12px;border:1px solid #E8C87A;border-radius:4px;';
    var textStyle = 'font-size:11.5px;color:#A9A292;line-height:1.6;';
    console.log('%c⚠️ BẢO MẬT & BẢN QUYỀN · N&M STUDIO', titleStyle);
    console.log('%cTinh Đồ Thái Dương 3D & Phòng Thí Nghiệm Địa Hình thuộc sở hữu trí tuệ của N&M Studio (Hotline: 0985578385).\nMọi hành vi sao chép, clone tên miền, giải mã mã nguồn hoặc khai thác thương mại trái phép đều vi phạm luật sở hữu trí tuệ.', textStyle);
  } catch(e){}

  // 2. CHỐNG NHÚNG TRÁI PHÉP VÀO IFRAME (ANTI-CLICKJACKING / FRAME BUSTER)
  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location.href;
    }
  } catch(e) {
    try {
      document.documentElement.innerHTML = '<div style="background:#04060E;color:#E8C87A;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px;"><h2>⚠️ Truy cập bị chặn</h2><p style="color:#BDB6A6;max-width:500px">Ứng dụng không cho phép nhúng qua iFrame để bảo vệ dữ liệu và an toàn của bạn.</p><a href="' + CANONICAL_URL + '" target="_top" style="margin-top:14px;padding:10px 20px;background:#E8C87A;color:#080B16;text-decoration:none;font-weight:bold;border-radius:4px">Mở trang web chính thức</a></div>';
    } catch(err){}
  }

  // 3. XÁC THỰC TÊN MIỀN GỐC (CANONICAL ORIGIN VERIFICATION - CHỐNG CLONE SITE)
  try {
    var host = (window.location.hostname || '').toLowerCase();
    var isAllowed = (
      host === '' || // local file://
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host.endsWith('.vercel.app') ||
      host.endsWith('.ngrok-free.app') ||
      host.endsWith('.github.io') ||
      host === CANONICAL_HOST
    );

    if (!isAllowed) {
      console.warn('[Security Guard] Phát hiện trang web chạy trên tên miền không được ủy quyền:', host);
      setTimeout(function(){
        alert('⚠️ CẢNH BÁO BẢO MẬT:\nTrang web này là bản sao chép trái phép (' + host + ').\nĐể đảm bảo an toàn và trải nghiệm phiên bản mới nhất, hệ thống sẽ tự động chuyển hướng về trang chủ chính thức.');
        window.location.replace(CANONICAL_URL + window.location.pathname);
      }, 1500);
    }
  } catch(e){}

  // 4. BẢO VỆ TÀI NGUYÊN 3D & CANVAS (CHỐNG LƯU TRỰC TIẾP & KÉO THẢ ASSET)
  function initAssetProtection(){
    // Chặn menu chuột phải trên Canvas 3D và các ảnh kết cấu
    document.addEventListener('contextmenu', function(e){
      var t = e.target;
      if (!t) return;
      var isProtected = (
        t.tagName === 'CANVAS' ||
        t.tagName === 'IMG' ||
        t.classList.contains('l3') ||
        (t.closest && (t.closest('#stage') || t.closest('#hud') || t.closest('#c')))
      );
      if (isProtected) {
        e.preventDefault();
      }
    }, { passive: false });

    // Chặn kéo thả ảnh kết cấu để trích xuất (Anti Drag-Drop Scraping)
    document.addEventListener('dragstart', function(e){
      if (e.target && e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    }, { passive: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAssetProtection);
  } else {
    initAssetProtection();
  }

  // 5. CHẶN PHÍM TẮT TRÍCH XUẤT SOURCE CODE TRÊN TRANG (Ctrl+S, Ctrl+U)
  document.addEventListener('keydown', function(e){
    // Ctrl+S / Cmd+S (Lưu trang)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
    }
    // Ctrl+U / Cmd+U (Xem nguồn trang web)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
    }
  });

})(window, document);
