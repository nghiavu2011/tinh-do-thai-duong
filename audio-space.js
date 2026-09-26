/* ══════════════════════════════════════════════════════════════
   HỆ THỐNG ÂM THANH VŨ TRỤ (COSMIC SOUNDSCAPE & PROCEDURAL AUDIO)
   Thuần Web Audio API: 0 KB tải thêm, không phụ thuộc file ngoài,
   không tốn băng thông, tự tổng hợp sóng âm theo thời gian thực.
   ══════════════════════════════════════════════════════════════ */
(function(window){
  var AUDIO = {
    ctx: null,
    master: null,
    ambientGain: null,
    isPlaying: false,
    oscillators: [],
    noiseNode: null,
    lfo: null,

    init: function(){
      if(this.ctx) return;
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if(!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain: bảo vệ tai người nghe, âm lượng tối đa êm dịu 0.45
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.45;
      this.master.connect(this.ctx.destination);

      // Ambient Bus: cho nhạc nền không gian
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0;
      this.ambientGain.connect(this.master);
    },

    startAmbient: function(){
      this.init();
      if(!this.ctx) return;
      if(this.ctx.state === "suspended"){
        this.ctx.resume();
      }
      if(this.isPlaying) return;

      var now = this.ctx.currentTime;

      // Bộ lọc cộng hưởng quét dải tần thấp (Lowpass Filter với resonance)
      var filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(260, now);
      filter.Q.setValueAtTime(3.2, now);
      filter.connect(this.ambientGain);

      // Dao động LFO siêu chậm (0.06 Hz ~ 16s/chu kỳ) mô phỏng nhịp thở vũ trụ
      var lfo = this.ctx.createOscillator();
      var lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.06, now);
      lfoGain.gain.setValueAtTime(140, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);
      this.lfo = lfo;

      // Hợp âm không gian (Harmonics of the Spheres):
      // A1 (55Hz - dải trầm sâu), A2 (110Hz - ấm áp), E3 (164.8Hz - quãng 5 hoàn hảo), C#4 (277.2Hz - ánh sáng sao)
      var freqs = [55.0, 110.0, 164.81, 277.18];
      var gains = [0.32, 0.20, 0.14, 0.08];
      this.oscillators = [];

      for(var i = 0; i < freqs.length; i++){
        var osc = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        osc.type = (i === 1) ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freqs[i], now);
        // detune nhẹ tạo hiệu ứng ngân vang không gian (chorus)
        osc.detune.setValueAtTime((i % 2 === 0 ? 1 : -1) * (i * 3.5), now);
        g.gain.setValueAtTime(gains[i], now);
        osc.connect(g);
        g.connect(filter);
        osc.start(now);
        this.oscillators.push(osc);
      }

      // Gió plasma vũ trụ (Pink Noise tự sinh qua thuật toán Paul Kellet)
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
          output[j] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
          b6 = white * 0.115926;
        }
        var noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        var noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(320, now);
        noiseFilter.Q.setValueAtTime(2.2, now);

        var noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.05, now);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ambientGain);
        noise.start(now);
        this.noiseNode = noise;
      } catch(e){}

      // Tăng âm lượng mượt mà (Fade in 2s)
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(0, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.40, now + 2.0);
      this.isPlaying = true;
      this.updateUI();
    },

    stopAmbient: function(){
      if(!this.isPlaying || !this.ctx) return;
      var now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.linearRampToValueAtTime(0, now + 1.2);

      var self = this;
      setTimeout(function(){
        if(!self.isPlaying){
          self.oscillators.forEach(function(o){ try{ o.stop(); }catch(e){} });
          self.oscillators = [];
          if(self.lfo){ try{ self.lfo.stop(); }catch(e){} self.lfo = null; }
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
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        osc.connect(g);
        g.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.90);
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
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(85, now + 0.95);
        f.type = "lowpass";
        f.frequency.setValueAtTime(320, now);
        g.gain.setValueAtTime(0.065, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        osc.connect(f);
        f.connect(g);
        g.connect(this.master);
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
