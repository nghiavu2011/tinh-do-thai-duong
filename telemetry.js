/**
 * Tinh Đồ Thái Dương 3D — Telemetry & Analytics Engine
 * Phương pháp Ponytail: Siêu nhẹ, thuần Vanilla JS, zero dependencies, bảo mật cao.
 * Tự động đồng bộ với Vercel Web Analytics, Google Analytics 4 (GA4) và Local Hub.
 */
(function(window, document) {
  'use strict';

  var STORAGE_KEY = 'tinhdo_telemetry_v1';
  var GA4_KEY = 'tinhdo_ga4_id';

  // 1. Phân tích tham số URL & Nguồn truy cập
  function parseTrafficSource() {
    var params = new URLSearchParams(window.location.search);
    var utmSource = params.get('utm_source');
    var utmMedium = params.get('utm_medium');
    var utmCampaign = params.get('utm_campaign');
    var utmContent = params.get('utm_content');

    var referrer = document.referrer || '';
    var refSource = 'direct';

    if (utmSource) {
      refSource = utmSource.toLowerCase().trim();
    } else if (referrer) {
      var refLower = referrer.toLowerCase();
      if (refLower.indexOf('facebook.com') !== -1 || refLower.indexOf('fb.me') !== -1) {
        refSource = 'facebook';
      } else if (refLower.indexOf('zalo.me') !== -1) {
        refSource = 'zalo';
      } else if (refLower.indexOf('tiktok.com') !== -1) {
        refSource = 'tiktok';
      } else if (refLower.indexOf('google.') !== -1) {
        refSource = 'google';
      } else if (refLower.indexOf('youtube.com') !== -1 || refLower.indexOf('youtu.be') !== -1) {
        refSource = 'youtube';
      } else {
        try {
          refSource = new URL(referrer).hostname;
        } catch (e) {
          refSource = 'other_ref';
        }
      }
    }

    return {
      source: refSource,
      medium: utmMedium || (refSource === 'direct' ? 'direct' : 'referral'),
      campaign: utmCampaign || '(none)',
      content: utmContent || '(none)',
      referrer: referrer
    };
  }

  // 2. Nhận diện thiết bị & Trình duyệt nhúng (In-app browser)
  function detectDevice() {
    var ua = navigator.userAgent || '';
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);

    var appType = 'browser';
    if (ua.indexOf('Zalo') !== -1) appType = 'zalo_app';
    else if (ua.indexOf('FBAN') !== -1 || ua.indexOf('FBAV') !== -1) appType = 'facebook_app';
    else if (ua.indexOf('musical_ly') !== -1 || ua.indexOf('ByteLocale') !== -1) appType = 'tiktok_app';

    return {
      type: isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop'),
      app: appType,
      screen: window.screen ? (window.screen.width + 'x' + window.screen.height) : 'unknown'
    };
  }

  // 3. Quản lý kho dữ liệu nội bộ (Local Telemetry)
  function getRawStore() {
    try {
      var item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        return JSON.parse(item);
      }
    } catch (e) {}

    return {
      version: 1,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      total_views: 0,
      sessions_count: 0,
      sources: {},
      campaigns: {},
      devices: {},
      events: {
        page_view: 0,
        click_zalo: 0,
        click_camnang: 0,
        share_fb: 0,
        copy_link: 0,
        enter_surface: 0,
        open_lesson: 0,
        print_handbook: 0,
        search_planet: 0
      },
      recent_events: [],
      last_traffic: null
    };
  }

  function saveStore(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  // 4. Khởi tạo / Tích hợp Google Analytics 4 động (Dynamic GA4)
  function initGA4() {
    try {
      var gaId = localStorage.getItem(GA4_KEY) || window.TINHDO_GA4_ID;
      if (!gaId || !/^G-[A-Za-z0-9]+$/.test(gaId.trim())) return;
      gaId = gaId.trim();

      if (window._ga4_initialized) return;
      window._ga4_initialized = true;

      // Nạp script GA4
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
      document.head.appendChild(s);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId, { send_page_view: true });
    } catch (e) {}
  }

  // 5. Hàm ghi nhận sự kiện cốt lõi (Core Track Function)
  function trackAppEvent(eventName, customData) {
    customData = customData || {};
    var store = getRawStore();
    var traffic = parseTrafficSource();
    var device = detectDevice();

    store.last_seen = new Date().toISOString();
    store.events[eventName] = (store.events[eventName] || 0) + 1;

    // Ghi nhận nguồn
    var src = traffic.source;
    store.sources[src] = (store.sources[src] || 0) + 1;

    // Ghi nhận chiến dịch
    if (traffic.campaign && traffic.campaign !== '(none)') {
      store.campaigns[traffic.campaign] = (store.campaigns[traffic.campaign] || 0) + 1;
    }

    // Ghi nhận thiết bị
    store.devices[device.type] = (store.devices[device.type] || 0) + 1;

    // Lưu vào danh sách 60 sự kiện gần nhất
    var record = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      time: new Date().toISOString(),
      event: eventName,
      source: src,
      campaign: traffic.campaign,
      device: device.type,
      app: device.app,
      page: window.location.pathname,
      data: customData
    };

    store.recent_events.unshift(record);
    if (store.recent_events.length > 60) {
      store.recent_events = store.recent_events.slice(0, 60);
    }
    store.last_traffic = traffic;

    saveStore(store);

    // Bắn sang Vercel Web Analytics nếu có
    try {
      if (typeof window.va === 'function') {
        window.va('event', { name: eventName, data: Object.assign({}, customData, { source: src, device: device.type }) });
      }
    } catch (e) {}

    // Bắn sang Google Analytics 4 nếu có
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, Object.assign({}, customData, {
          traffic_source: src,
          traffic_campaign: traffic.campaign,
          device_type: device.type,
          app_type: device.app
        }));
      }
    } catch (e) {}

    // Kích hoạt custom event cho Dashboard cập nhật trực tiếp nếu đang mở
    try {
      window.dispatchEvent(new CustomEvent('tinhdo:telemetry', { detail: { event: eventName, data: customData, store: store } }));
    } catch (e) {}
  }

  // 6. Tự động ghi nhận Page View khi vào trang
  function initPageView() {
    var store = getRawStore();
    var traffic = parseTrafficSource();
    var device = detectDevice();

    store.total_views = (store.total_views || 0) + 1;

    // Đánh dấu session mới (nếu cách hơn 30 phút hoặc tab mới)
    var sessionKey = 'tinhdo_session_active';
    var isNewSession = false;
    try {
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, '1');
        store.sessions_count = (store.sessions_count || 0) + 1;
        isNewSession = true;
      }
    } catch (e) {}

    saveStore(store);

    trackAppEvent('page_view', {
      is_new_session: isNewSession,
      title: document.title,
      device_app: device.app
    });
  }

  // 7. Tự động gắn bộ lắng nghe click thông minh (Auto Delegate Listeners)
  function initClickDelegation() {
    document.addEventListener('click', function(ev) {
      var target = ev.target;
      var el = target.closest ? target.closest('a, button, [data-track]') : null;
      if (!el) return;

      var href = el.getAttribute('href') || '';
      var trackAttr = el.getAttribute('data-track');

      if (trackAttr) {
        trackAppEvent(trackAttr, { text: (el.textContent || '').trim().slice(0, 50) });
        return;
      }

      // Phát hiện click vào link Zalo
      if (href.indexOf('zalo.me') !== -1 || el.id === 'comm-btn-zalo' || el.id === 'footer-btn-zalo') {
        trackAppEvent('click_zalo', { href: href, location: el.id || 'body_link' });
      }
      // Phát hiện click vào Cẩm nang Thiên văn
      else if (href.indexOf('cam-nang-thien-van') !== -1) {
        trackAppEvent('click_camnang', { href: href, location: el.id || 'body_link' });
      }
      // Phát hiện click chia sẻ Facebook
      else if (el.id === 'comm-btn-share-fb' || href.indexOf('facebook.com/sharer') !== -1) {
        trackAppEvent('share_fb', { location: el.id || 'share_btn' });
      }
      // Phát hiện nút copy link
      else if (el.id === 'comm-btn-copy' || el.id === 'btn-copy-link') {
        trackAppEvent('copy_link', { location: el.id });
      }
    }, true);
  }

  // 8. Public API ra window
  window.trackAppEvent = trackAppEvent;
  window.getTelemetryData = getRawStore;
  window.resetTelemetryData = function() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  };
  window.setGA4MeasurementId = function(id) {
    try {
      if (id) localStorage.setItem(GA4_KEY, id.trim());
      else localStorage.removeItem(GA4_KEY);
      return true;
    } catch (e) {
      return false;
    }
  };
  window.getGA4MeasurementId = function() {
    try {
      return localStorage.getItem(GA4_KEY) || '';
    } catch (e) {
      return '';
    }
  };

  // Khởi động
  initGA4();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initPageView();
      initClickDelegation();
    });
  } else {
    initPageView();
    initClickDelegation();
  }

})(window, document);
