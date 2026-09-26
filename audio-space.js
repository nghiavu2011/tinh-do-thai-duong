/* ══════════════════════════════════════════════════════════════
   HỆ THỐNG ÂM THANH VŨ TRỤ (COSMIC SOUNDSCAPE & PROCEDURAL AUDIO)
   - Nhạc nền Cinematic Sci-Fi (Phong cách Organ/Piano Interstellar - Hans Zimmer)
   - Tín hiệu vô tuyến trạm điều khiển Apollo (NASA Quindar Tones 2524Hz/2475Hz & Radio Comms)
   - Hiệu ứng tương tác: Crystal Chime & Warp Drive
   - Thuần Web Audio API: 0 KB tải thêm, không lag, không phụ thuộc file ngoài.
   ══════════════════════════════════════════════════════════════ */
(function(window){
  var AUDIO = {
    ctx: null,
    master: null,
    musicGain: null,
    radioGain: null,
    sfxGain: null,
    isPlaying: false,

    // Node nhạc nền
    organNodes: [],
    arpTimer: null,
    chordTimer: null,
    radioTimer: null,
    filterNode: null,
    lfoNode: null,
    noiseNode: null,

    // Chuỗi hợp âm Interstellar (D minor -> Bb Major -> F Major -> C Major)
    // Tần số gốc (Hz): Bass, Quãng 5, Quãng 3, Bát độ, Quãng 9/bổ sung
    chords: [
      { name: "Dm", bass: 73.42, notes: [146.83, 220.00, 261.63, 293.66, 349.23, 440.00] }, // D2, D3, A3, C4, D4, F4, A4
      { name: "Bb", bass: 58.27, notes: [116.54, 174.61, 233.08, 293.66, 349.23, 466.16] }, // Bb1, Bb2, F3, Bb3, D4, F4, Bb4
      { name: "F",  bass: 43.65, notes: [87.31,  130.81, 174.61, 261.63, 349.23, 440.00] }, // F1, F2, C3, F3, C4, F4, A4
      { name: "C",  bass: 65.41, notes: [130.81, 196.00, 261.63, 329.63, 392.00, 523.25] }  // C2, C3, G3, C4, E4, G4, C5
    ],
    chordIdx: 0,
    arpStep: 0,

    init: function(){
      if(this.ctx) return;
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if(!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain: bảo vệ tai người nghe, âm lượng tối đa êm dịu 0.48
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.48;
      this.master.connect(this.ctx.destination);

      // Bus Nhạc nền Cinematic Organ/Piano
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;
      this.musicGain.connect(this.master);

      // Bus Radio NASA / Quindar Tones (có bộ lọc băng thông đàm thoại VHF 300Hz - 3200Hz)
      this.radioGain = this.ctx.createGain();
      this.radioGain.gain.value = 0.35;
      var radioFilter = this.ctx.createBiquadFilter();
      radioFilter.type = "bandpass";
      radioFilter.frequency.value = 1650;
      radioFilter.Q.value = 1.1;
      this.radioGain.connect(radioFilter);
      radioFilter.connect(this.master);

      // Bus Hiệu ứng tương tác (Chime, Warp)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.60;
      this.sfxGain.connect(this.master);
    },

    startAmbient: function(){
      this.init();
      if(!this.ctx) return;
      if(this.ctx.state === "suspended"){
        this.ctx.resume();
      }
      if(this.isPlaying) return;

      var now = this.ctx.currentTime;

      // ── 1. KHỞI TẠO BỘ LỌC KHÔNG GIAN VÀ LFO NHỊP THỞ VŨ TRỤ ──
      var filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(2.8, now);
      filter.connect(this.musicGain);
      this.filterNode = filter;

      var lfo = this.ctx.createOscillator();
      var lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.045, now); // 22 giây một chu kỳ nhịp thở
      lfoGain.gain.setValueAtTime(160, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);
      this.lfoNode = lfo;

      // ── 2. DÀN ORGAN INTERSTELLAR (DEEP SPACE HARMONICS) ──
      this.organNodes = [];
      this.chordIdx = 0;
      var curChord = this.chords[0];

      // Bass drone trầm sâu
      var bassOsc = this.ctx.createOscillator();
      var bassGain = this.ctx.createGain();
      bassOsc.type = "sawtooth";
      bassOsc.frequency.setValueAtTime(curChord.bass, now);
      bassGain.gain.setValueAtTime(0.22, now);
      var bassFilter = this.ctx.createBiquadFilter();
      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(110, now);
      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicGain);
      bassOsc.start(now);
      this.organNodes.push({ osc: bassOsc, gain: bassGain, type: "bass" });

      // Các bậc họa âm organ (Sine + Triangle ấm áp)
      for(var i = 0; i < 4; i++){
        var osc = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        osc.type = (i % 2 === 0) ? "sine" : "triangle";
        var freq = curChord.notes[i] || 220;
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((i % 2 === 0 ? 1 : -1) * (i * 2.8), now);
        g.gain.setValueAtTime(0.09 - i * 0.015, now);
        osc.connect(g);
        g.connect(filter);
        osc.start(now);
        this.organNodes.push({ osc: osc, gain: g, type: "voice", idx: i });
      }

      // ── 3. TIẾNG GIÓ PLASMA NỀN (PINK NOISE) ──
      try {
        var bufSize = this.ctx.sampleRate * 2;
        var noiseBuffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        var output = noiseBuffer.getChannelData(0);
        var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (var j = 0; j < bufSize; j++) {
          var white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[j] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.024;
          b6 = white * 0.115926;
        }
        var noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        var noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(280, now);
        noiseFilter.Q.setValueAtTime(1.8, now);

        var noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.04, now);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.musicGain);
        noise.start(now);
        this.noiseNode = noise;
      } catch(e){}

      // ── 4. TIẾN TRÌNH HỢP ÂM TỰ ĐỘNG (10 GIÂY MỖI HỢP ÂM) ──
      var self = this;
      this.chordTimer = setInterval(function(){
        if(!self.isPlaying || !self.ctx) return;
        self.chordIdx = (self.chordIdx + 1) % self.chords.length;
        var nextChord = self.chords[self.chordIdx];
        var t = self.ctx.currentTime;

        self.organNodes.forEach(function(item){
          if(item.type === "bass"){
            item.osc.frequency.setTargetAtTime(nextChord.bass, t, 1.8);
          } else if(item.type === "voice"){
            var targetFreq = nextChord.notes[item.idx] || 220;
            item.osc.frequency.setTargetAtTime(targetFreq, t, 1.6);
          }
        });
      }, 10000);

      // ── 5. NỐT RẢI ARPEGGIO HUYỀN ẢO NHƯ PHIM INTERSTELLAR ──
      this.arpStep = 0;
      this.arpTimer = setInterval(function(){
        if(!self.isPlaying || !self.ctx) return;
        var chord = self.chords[self.chordIdx];
        var note = chord.notes[self.arpStep % chord.notes.length];
        self.arpStep++;
        self.playArpNote(note * (self.arpStep % 2 === 0 ? 1 : 2));
      }, 1250);

      // ── 6. ĐỊNH KỲ PHÁT TÍN HIỆU ĐIỆN ĐÀM NASA APOLLO QUINDAR TONES ──
      this.scheduleNextRadioTransmission();

      // Fade in êm dịu 2.5 giây
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(0, now);
      this.musicGain.gain.linearRampToValueAtTime(0.42, now + 2.5);
      this.isPlaying = true;
      this.updateUI();
    },

    // Nốt rải organ/piano nhẹ nhàng trong không gian
    playArpNote: function(freq){
      if(!this.isPlaying || !this.ctx) return;
      try {
        var now = this.ctx.currentTime;
        var osc = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.045, now + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(g);
        g.connect(this.filterNode || this.musicGain);
        osc.start(now);
        osc.stop(now + 2.5);
      } catch(e){}
    },

    // ── NASA APOLLO QUINDAR TONE & RADIO COMMS ENGINE ──
    // Tiếng bíp chuẩn NASA Apollo: Intro = 2524 Hz (key-down), Outro = 2475 Hz (key-up)
    playQuindar: function(isIntro, timeOffset){
      if(!this.ctx) return;
      try {
        var t = (timeOffset !== undefined) ? timeOffset : this.ctx.currentTime;
        var freq = isIntro ? 2524 : 2475;
        var osc = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        var bp = this.ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);

        bp.type = "bandpass";
        bp.frequency.setValueAtTime(freq, t);
        bp.Q.setValueAtTime(10.0, t);

        // Chuẩn độ dài 250ms cho tiếng Quindar NASA
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.015);
        g.gain.setValueAtTime(0.05, t + 0.235);
        g.gain.linearRampToValueAtTime(0.0001, t + 0.250);

        osc.connect(bp);
        bp.connect(g);
        g.connect(this.radioGain || this.master);

        osc.start(t);
        osc.stop(t + 0.26);
      } catch(e){}
    },

    // Tiếng xào xạc vô tuyến điện đàm (Capsule communicator radio squelch & telemetry chirps)
    playRadioBurst: function(duration){
      if(!this.ctx) return;
      try {
        var now = this.ctx.currentTime;
        var dur = duration || 2.2;
        var bufLen = Math.floor(this.ctx.sampleRate * dur);
        var buffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        var data = buffer.getChannelData(0);

        for (var i = 0; i < bufLen; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.08;
        }

        var noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        var filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(2.5, now);

        var g = this.ctx.createGain();
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.035, now + 0.08);
        g.gain.setValueAtTime(0.030, now + dur - 0.15);
        g.gain.linearRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(g);
        g.connect(this.radioGain || this.master);
        noise.start(now);
        noise.stop(now + dur + 0.05);

        // Đi kèm 2-3 tiếng bíp số liệu viễn trắc (telemetry blips)
        for(var k = 0; k < 3; k++){
          var bleepTime = now + 0.35 + k * 0.55;
          var bleepOsc = this.ctx.createOscillator();
          var bleepG = this.ctx.createGain();
          bleepOsc.type = "sine";
          bleepOsc.frequency.setValueAtTime(1800 + (k % 2 === 0 ? 300 : -200), bleepTime);

          bleepG.gain.setValueAtTime(0.001, bleepTime);
          bleepG.gain.linearRampToValueAtTime(0.02, bleepTime + 0.02);
          bleepG.gain.exponentialRampToValueAtTime(0.0001, bleepTime + 0.14);

          bleepOsc.connect(bleepG);
          bleepG.connect(this.radioGain || this.master);
          bleepOsc.start(bleepTime);
          bleepOsc.stop(bleepTime + 0.16);
        }
      } catch(e){}
    },

    // Lên lịch ngẫu nhiên một phiên truyền tin điện đàm giữa Trạm mặt đất và Tàu vũ trụ
    scheduleNextRadioTransmission: function(){
      var self = this;
      var delay = 25000 + Math.random() * 25000; // Mỗi 25 - 50 giây phát 1 tín hiệu
      this.radioTimer = setTimeout(function(){
        if(!self.isPlaying || !self.ctx) return;
        var now = self.ctx.currentTime;
        var burstDur = 2.0 + Math.random() * 1.5;

        // 1. Quindar Intro (2524 Hz)
        self.playQuindar(true, now);

        // 2. Tiếng đàm thoại viễn trắc + xào xạc vô tuyến
        setTimeout(function(){
          if(self.isPlaying) self.playRadioBurst(burstDur);
        }, 280);

        // 3. Quindar Outro (2475 Hz)
        setTimeout(function(){
          if(self.isPlaying && self.ctx) self.playQuindar(false, self.ctx.currentTime);
        }, Math.floor((0.35 + burstDur) * 1000));

        self.scheduleNextRadioTransmission();
      }, delay);
    },

    stopAmbient: function(){
      if(!this.isPlaying || !this.ctx) return;
      var now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(0, now + 1.2);

      if(this.arpTimer) { clearInterval(this.arpTimer); this.arpTimer = null; }
      if(this.chordTimer) { clearInterval(this.chordTimer); this.chordTimer = null; }
      if(this.radioTimer) { clearTimeout(this.radioTimer); this.radioTimer = null; }

      var self = this;
      setTimeout(function(){
        if(!self.isPlaying){
          self.organNodes.forEach(function(o){ try{ o.osc.stop(); }catch(e){} });
          self.organNodes = [];
          if(self.lfoNode){ try{ self.lfoNode.stop(); }catch(e){} self.lfoNode = null; }
          if(self.noiseNode){ try{ self.noiseNode.stop(); }catch(e){} self.noiseNode = null; }
        }
      }, 1300);

      this.isPlaying = false;
      this.updateUI();
    },

    toggle: function(){
      if(this.isPlaying){
        this.stopAmbient();
        try{ localStorage.setItem("tinhdo-audio", "off"); }catch(e){}
      } else {
        this.startAmbient();
        // Chào mừng mở đầu bằng 1 tiếng Quindar tone NASA
        this.playQuindar(true);
        try{ localStorage.setItem("tinhdo-audio", "on"); }catch(e){}
      }
    },

    // Hiệu ứng tiếng chuông pha lê khi bấm chọn thiên thể
    playChime: function(freq){
      if(!this.isPlaying || !this.ctx) return;
      try {
        var now = this.ctx.currentTime;
        var osc = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq || 880, now);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.90);
        osc.connect(g);
        g.connect(this.sfxGain || this.master);
        osc.start(now);
        osc.stop(now + 0.95);

        // Kèm nhẹ một bíp viễn trắc vũ trụ
        var beep = this.ctx.createOscillator();
        var bg = this.ctx.createGain();
        beep.type = "sine";
        beep.frequency.setValueAtTime(2475, now + 0.05);
        bg.gain.setValueAtTime(0.02, now + 0.05);
        bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        beep.connect(bg);
        bg.connect(this.sfxGain || this.master);
        beep.start(now + 0.05);
        beep.stop(now + 0.24);
      } catch(e){}
    },

    // Hiệu ứng âm thanh khi camera dịch chuyển xuyên không gian (Warp Drive)
    playWarp: function(){
      if(!this.isPlaying || !this.ctx) return;
      try {
        var now = this.ctx.currentTime;
        var osc = this.ctx.createOscillator();
        var f = this.ctx.createBiquadFilter();
        var g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(75, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.95);
        f.type = "lowpass";
        f.frequency.setValueAtTime(340, now);
        g.gain.setValueAtTime(0.075, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        osc.connect(f);
        f.connect(g);
        g.connect(this.sfxGain || this.master);
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
