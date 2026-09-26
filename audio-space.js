/* ══════════════════════════════════════════════════════════════
   HỆ THỐNG ÂM THANH VŨ TRỤ KỲ DIỆU (COSMIC WONDER AUDIO MIXER)
   Thiết kế riêng cho Học sinh & Phụ huynh trải nghiệm Tinh Đồ Thái Dương
   - Nhạc nền (BGM): Tuyệt tác không gian êm dịu, lặp vô tận (Loop)
   - SFX 1 (Warp): Gió sao vút êm khi phóng đến hành tinh (1.05s)
   - SFX 2 (Cross-Section): Chuông pha lê mở cấu trúc lõi (0.85s)
   - SFX 3 (Twinkle): Hạt sương sao trong trẻo khi chạm thiên thể (0.35s)
   - Công nghệ: Audio Ducking tự động & Bộ chống spam/chồng lấn tiếng
   ══════════════════════════════════════════════════════════════ */
(function(window){
  var AUDIO = {
    ctx: null,
    masterGain: null,
    bgmGain: null,
    sfxGain: null,
    bgmAudio: null,
    isPlaying: false,

    // Bộ nhớ đệm hiệu ứng âm thanh (AudioBuffers)
    buffers: {
      warp: null,
      cross: null,
      twinkle: null
    },

    // Quản lý chống chồng lấn (Anti-clash & Throttling)
    activeSources: {
      warp: null,
      cross: null,
      twinkle: null
    },
    lastPlayTime: {
      warp: 0,
      cross: 0,
      twinkle: 0
    },
    duckTimer: null,

    init: function(){
      if(this.ctx) return;
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if(!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain: bảo vệ tai người nghe, âm lượng tối đa êm dịu 0.50
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.50;
      this.masterGain.connect(this.ctx.destination);

      // Bus Nhạc nền BGM (0.38)
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.38;
      this.bgmGain.connect(this.masterGain);

      // Bus Hiệu ứng SFX (0.65)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.65;
      this.sfxGain.connect(this.masterGain);

      // Khởi tạo thẻ Audio HTML5 phát nhạc nền BGM (hỗ trợ stream ngay lập tức)
      try {
        var a = new Audio();
        a.src = "audio/bgm-space.mp3";
        a.loop = true;
        a.preload = "auto";
        a.crossOrigin = "anonymous";
        var src = this.ctx.createMediaElementSource(a);
        src.connect(this.bgmGain);
        this.bgmAudio = a;
      } catch(e){
        // Dự phòng nếu trình duyệt giới hạn createMediaElementSource
        if(!this.bgmAudio){
          this.bgmAudio = new Audio("audio/bgm-space.mp3");
          this.bgmAudio.loop = true;
          this.bgmAudio.volume = 0.38;
        }
      }

      // Nạp trước (Preload) 3 file SFX siêu nhẹ (~32 KB tổng cộng) vào RAM
      this.loadSfxBuffer("warp", "audio/sfx-warp.mp3");
      this.loadSfxBuffer("cross", "audio/sfx-cross.mp3");
      this.loadSfxBuffer("twinkle", "audio/sfx-twinkle.mp3");
    },

    loadSfxBuffer: function(key, url){
      var self = this;
      fetch(url)
        .then(function(res){ return res.arrayBuffer(); })
        .then(function(arr){
          if(self.ctx){
            return self.ctx.decodeAudioData(arr, function(decoded){
              self.buffers[key] = decoded;
            });
          }
        })
        .catch(function(){});
    },

    // ── AUDIO DUCKING (Hạ nhẹ nhạc nền để nhường chỗ cho hiệu ứng) ──
    duckBGM: function(targetLevel, holdMs){
      if(!this.ctx || !this.isPlaying || !this.bgmGain) return;
      var t = this.ctx.currentTime;
      var target = (targetLevel !== undefined) ? targetLevel : 0.16;
      var hold = (holdMs !== undefined) ? holdMs : 1100;

      this.bgmGain.gain.cancelScheduledValues(t);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, t);
      // Hạ êm trong 120ms
      this.bgmGain.gain.linearRampToValueAtTime(target, t + 0.12);

      var self = this;
      clearTimeout(this.duckTimer);
      this.duckTimer = setTimeout(function(){
        if(!self.ctx || !self.isPlaying) return;
        var t2 = self.ctx.currentTime;
        self.bgmGain.gain.cancelScheduledValues(t2);
        self.bgmGain.gain.setValueAtTime(self.bgmGain.gain.value, t2);
        // Hồi phục êm ái về mức ban đầu trong 500ms
        self.bgmGain.gain.linearRampToValueAtTime(0.38, t2 + 0.50);
      }, hold);
    },

    startAmbient: function(){
      this.init();
      if(!this.ctx) return;
      if(this.ctx.state === "suspended"){
        this.ctx.resume();
      }
      if(this.isPlaying) return;

      var now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(0, now);
      this.bgmGain.gain.linearRampToValueAtTime(0.38, now + 2.0);

      if(this.bgmAudio){
        var playPromise = this.bgmAudio.play();
        if(playPromise !== undefined){
          playPromise.catch(function(){});
        }
      }

      this.isPlaying = true;
      this.updateUI();
    },

    stopAmbient: function(){
      if(!this.isPlaying || !this.ctx) return;
      var now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
      this.bgmGain.gain.linearRampToValueAtTime(0, now + 1.0);

      var self = this;
      setTimeout(function(){
        if(!self.isPlaying && self.bgmAudio){
          try{ self.bgmAudio.pause(); }catch(e){}
        }
      }, 1100);

      this.isPlaying = false;
      this.updateUI();
    },

    toggle: function(){
      if(this.isPlaying){
        this.stopAmbient();
        try{ localStorage.setItem("tinhdo-audio", "off"); }catch(e){}
      } else {
        this.startAmbient();
        // Chào mừng bằng 1 tiếng chuông sao lấp lánh
        this.playTwinkle();
        try{ localStorage.setItem("tinhdo-audio", "on"); }catch(e){}
      }
    },

    // ── HÀM PHÁT SFX VỚI BỘ CHỐNG SPAM / CHỐNG CHỒNG LẤN ──
    playBuffer: function(key, duckLevel, holdMs, throttleMs){
      if(!this.isPlaying || !this.ctx) return;
      var nowMs = performance.now();
      var throttle = throttleMs || 150;

      // Chống bấm liên hoàn (Debounce)
      if(nowMs - this.lastPlayTime[key] < throttle) return;
      this.lastPlayTime[key] = nowMs;

      // Thực hiện nén nhạc nền BGM để tiếng SFX trong trẻo
      if(duckLevel) this.duckBGM(duckLevel, holdMs);

      var buffer = this.buffers[key];
      if(!buffer){
        // Dự phòng phát âm thanh thuần nếu file chưa kịp nạp xong
        this.playFallbackSound(key);
        return;
      }

      // Ngắt êm âm thanh cũ cùng loại nếu còn đang phát dở (Single-instance)
      if(this.activeSources[key]){
        try {
          var oldNode = this.activeSources[key];
          oldNode.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.08);
          setTimeout(function(){ try{ oldNode.src.stop(); }catch(e){} }, 90);
        } catch(e){}
      }

      var src = this.ctx.createBufferSource();
      var g = this.ctx.createGain();
      src.buffer = buffer;
      src.connect(g);
      g.connect(this.sfxGain);

      src.start();
      this.activeSources[key] = { src: src, gainNode: g };
    },

    // Tác vụ 1: Phóng đến hành tinh khi bấm tên dưới thanh công cụ (Warp Swoosh)
    playWarp: function(){
      this.playBuffer("warp", 0.18, 1100, 250);
    },

    // Tác vụ 2: Mở / Tương tác mặt cắt cấu trúc lõi 3D (Geode Reveal)
    playCrossSection: function(){
      this.playBuffer("cross", 0.20, 950, 300);
    },

    // Tác vụ 3: Bấm chạm thiên thể hoặc tương tác UI (Star Twinkle Ping)
    playTwinkle: function(){
      this.playBuffer("twinkle", null, null, 120);
    },

    // Tương thích ngược với các lệnh gọi cũ
    playChime: function(){
      this.playTwinkle();
    },

    // Dự phòng âm thanh tổng hợp siêu nhẹ nếu mạng chưa tải xong file
    playFallbackSound: function(type){
      if(!this.ctx) return;
      try {
        var now = this.ctx.currentTime;
        var osc = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        osc.type = "sine";

        if(type === "warp"){
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(380, now + 0.35);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.95);
          g.gain.setValueAtTime(0.08, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        } else if(type === "cross"){
          osc.frequency.setValueAtTime(659.25, now);
          osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.30);
          g.gain.setValueAtTime(0.09, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        } else {
          osc.frequency.setValueAtTime(2093.0, now);
          g.gain.setValueAtTime(0.06, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        }

        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 1.05);
      } catch(e){}
    },

    updateUI: function(){
      var btn = document.getElementById("btn-audio");
      if(!btn) return;
      var icon = document.getElementById("audio-icon");
      var txt = document.getElementById("audio-txt");
      var isVi = (window.LANG !== "en");

      if(this.isPlaying){
        if(icon) icon.textContent = "🔊";
        if(txt) txt.textContent = isVi ? "Nhạc: Bật" : "Audio: On";
        btn.classList.add("active");
        btn.style.borderColor = "var(--brass)";
        btn.style.color = "var(--brass)";
      } else {
        if(icon) icon.textContent = "🔇";
        if(txt) txt.textContent = isVi ? "Âm thanh" : "Sound";
        btn.classList.remove("active");
        btn.style.borderColor = "rgba(232,200,122,.45)";
        btn.style.color = "var(--parchment-dim)";
      }
    }
  };

  window.AUDIO = AUDIO;
})(window);
