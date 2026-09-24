/**
 * ════════════════════════════════════════════════════════════════════════════
 * N&Mstudio SolarSystem — MODULE B: TRÁI ĐẤT SỐNG (LIVING EARTH GEO-OVERLAY)
 * Phiên bản: v1.2
 * Tác quyền: N&Mstudio · Kỹ sư trưởng Nghĩa Vũ
 * Đặc tính: Thuần WebGL2 + Vanilla JS (Ponytail Standard, zero-bloat, 60fps)
 * Chức năng:
 *   1. 486 rãnh nứt ranh giới mảng kiến tạo 3D (Tectonic Plate Boundaries)
 *   2. Vành đai lửa Thái Bình Dương (Pacific Ring of Fire)
 *   3. Dữ liệu Động đất thời gian thực từ USGS (Real-time USGS Earthquakes)
 *   4. Bản đồ 22 siêu núi lửa hoạt động mạnh nhất hành tinh (Active Volcanoes)
 *   5. Tương tác fly-to quay quả địa cầu tới tâm chấn/núi lửa
 * ════════════════════════════════════════════════════════════════════════════
 */

(function(global){
  "use strict";

  var GEO_LINE_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec4 aCol;
uniform mat4 uModel, uVP;
out vec4 vCol;
void main(){
  vCol = aCol;
  gl_Position = uVP * (uModel * vec4(aPos, 1.0));
}`;

  var GEO_LINE_FS = `#version 300 es
precision highp float;
in vec4 vCol;
out vec4 oCol;
uniform float uAlpha;
void main(){
  oCol = vec4(vCol.rgb, vCol.a * uAlpha);
}`;

  var GEO_POINT_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec4 aCol;
layout(location=2) in float aSize;
uniform mat4 uModel, uVP;
uniform float uScale;
out vec4 vCol;
void main(){
  vCol = aCol;
  vec4 wPos = uModel * vec4(aPos, 1.0);
  gl_Position = uVP * wPos;
  gl_PointSize = clamp(aSize * uScale, 5.0, 36.0);
}`;

  var GEO_POINT_FS = `#version 300 es
precision highp float;
in vec4 vCol;
out vec4 oCol;
uniform float uTime;
uniform int   uType; // 0: quake (concentric shockwave), 1: volcano (fire diamond)
void main(){
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = length(p);
  if(d > 1.0) discard;

  if(uType == 0){
    // Quake: inner solid core + animated expanding shockwave ring
    float core = smoothstep(0.40, 0.18, d);
    float wave = fract(uTime * 1.4);
    float ring = smoothstep(0.12, 0.01, abs(d - wave)) * (1.0 - wave);
    vec3 c = mix(vCol.rgb, vec3(1.0, 1.0, 0.8), core * 0.7);
    float a = clamp(core * 0.95 + ring * 0.85, 0.0, 1.0);
    oCol = vec4(c, a * vCol.a);
  } else {
    // Volcano: diamond fiery shape + pulsating heat core
    float dia = abs(p.x) + abs(p.y);
    if(dia > 1.05) discard;
    float core = smoothstep(0.60, 0.05, dia);
    float pulse = 0.80 + 0.20 * sin(uTime * 3.5);
    vec3 c = mix(vCol.rgb, vec3(1.0, 0.9, 0.3), core * 0.75);
    oCol = vec4(c, clamp(core * pulse, 0.0, 1.0) * vCol.a);
  }
}`;

  function ll2xyz(lat, lon, r){
    r = r || 1.0025;
    var la = lat * Math.PI / 180.0;
    var lo = lon * Math.PI / 180.0;
    return [
      r * Math.cos(la) * Math.cos(lo),
      r * Math.sin(la),
      r * Math.cos(la) * Math.sin(lo)
    ];
  }

  function slerpVec3(v1, v2, t, r){
    var dot = v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
    dot = Math.max(-1, Math.min(1, dot));
    var theta = Math.acos(dot);
    if(Math.abs(theta) < 1e-4) return [v1[0]*r, v1[1]*r, v1[2]*r];
    var sinT = Math.sin(theta);
    var a = Math.sin((1 - t) * theta) / sinT;
    var b = Math.sin(t * theta) / sinT;
    var x = a * v1[0] + b * v2[0];
    var y = a * v1[1] + b * v2[1];
    var z = a * v1[2] + b * v2[2];
    var len = Math.hypot(x, y, z) || 1;
    return [(x / len) * r, (y / len) * r, (z / len) * r];
  }

  var GEO = {
    active: false,
    showPlates: true,
    showRingOfFire: true,
    showQuakes: true,
    showVolcanoes: true,
    quakeRange: "day", // "day" (24h) | "week" (7d)

    gl: null,
    progLine: null,
    progPoint: null,

    // Buffers & Counts
    plateVao: null,
    plateCount: 0,
    ringVao: null,
    ringCount: 0,
    volcanoVao: null,
    volcanoCount: 0,
    quakeVao: null,
    quakeCount: 0,

    quakes: [],
    quakesLoading: false,
    lastQuakeFetch: 0,
    selectedItem: null,

    buildProg: function(vs, fs, name){
      var gl = this.gl;
      if(!gl) return null;
      function sh(type, src){
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
          console.error("GEO shader " + name + ":\n" + gl.getShaderInfoLog(s));
        }
        return s;
      }
      var p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
        console.error("GEO Link " + name + ": " + gl.getProgramInfoLog(p));
      }
      p.u = {}; p.a = {};
      var nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for(var i = 0; i < nu; i++){
        var inf = gl.getActiveUniform(p, i);
        p.u[inf.name] = gl.getUniformLocation(p, inf.name);
      }
      var na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
      for(var j = 0; j < na; j++){
        var infA = gl.getActiveAttrib(p, j);
        p.a[infA.name] = gl.getAttribLocation(p, infA.name);
      }
      return p;
    },

    makeVao: function(attrs, index){
      var gl = this.gl;
      if(!gl) return null;
      var vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      attrs.forEach(function(a){
        var b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, a.data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(a.loc);
        gl.vertexAttribPointer(a.loc, a.size, gl.FLOAT, false, 0, 0);
      });
      var cnt = 0;
      if(index){
        var ib = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
        cnt = index.length;
      }
      gl.bindVertexArray(null);
      return { vao: vao, count: cnt, indexed: !!index };
    },

    init: function(gl, _prog, _makeVao){
      if(this.gl) return;
      this.gl = gl;
      var pr = _prog || (typeof prog === "function" ? prog : (window.prog || null));
      try {
        this.progLine = pr ? pr(GEO_LINE_VS, GEO_LINE_FS, "geoLine") : this.buildProg(GEO_LINE_VS, GEO_LINE_FS, "geoLine");
        this.progPoint = pr ? pr(GEO_POINT_VS, GEO_POINT_FS, "geoPoint") : this.buildProg(GEO_POINT_VS, GEO_POINT_FS, "geoPoint");
      } catch(e){
        console.error("GEO shader init error:", e);
      }
      this.buildPlateVAO();
      this.buildRingOfFireVAO();
      this.buildVolcanoVAO();
      this.fetchEarthquakes("day");
    },

    buildPlateVAO: function(){
      var gl = this.gl;
      if(!gl || !window.GEO_DATA || !window.GEO_DATA.boundaries) return;
      var pos = [], col = [];
      var bList = window.GEO_DATA.boundaries;
      var r = 1.0025;

      for(var i = 0; i < bList.length; i++){
        var b = bList[i];
        var p1 = b.p1, p2 = b.p2;
        // Determine color based on boundary type
        var c = [0.0, 0.9, 1.0, 0.85]; // divergent (tách giãn - cyan)
        if(b.type === "convergent") c = [1.0, 0.35, 0.15, 0.90]; // convergent (hút chìm - đỏ cam)
        else if(b.type === "transform") c = [1.0, 0.85, 0.28, 0.90]; // transform (trượt bằng - vàng)
        else if(b.type === "other") c = [0.75, 0.45, 0.85, 0.75]; // other (tím)

        var v1 = ll2xyz(p1[0], p1[1], 1.0);
        var v2 = ll2xyz(p2[0], p2[1], 1.0);
        // Interpolate along great-circle arc
        var dot = v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
        var segs = (dot < 0.98) ? 4 : ((dot < 0.998) ? 2 : 1);

        for(var s = 0; s < segs; s++){
          var tA = s / segs, tB = (s + 1) / segs;
          var ptA = slerpVec3(v1, v2, tA, r);
          var ptB = slerpVec3(v1, v2, tB, r);
          pos.push(ptA[0], ptA[1], ptA[2], ptB[0], ptB[1], ptB[2]);
          col.push(c[0], c[1], c[2], c[3], c[0], c[1], c[2], c[3]);
        }
      }

      this.plateCount = pos.length / 3;
      this.plateVao = this.makeVao([
        { loc: 0, size: 3, data: new Float32Array(pos) },
        { loc: 1, size: 4, data: new Float32Array(col) }
      ], null);
    },

    buildRingOfFireVAO: function(){
      var gl = this.gl;
      if(!gl || !window.GEO_DATA || !window.GEO_DATA.ringOfFire) return;
      var pts = window.GEO_DATA.ringOfFire;
      var pos = [], col = [];
      var r = 1.0032;
      var c = [1.0, 0.18, 0.28, 0.95]; // glowing fiery red

      for(var i = 0; i < pts.length; i++){
        var p1 = pts[i];
        var p2 = pts[(i + 1) % pts.length];
        var v1 = ll2xyz(p1[0], p1[1], 1.0);
        var v2 = ll2xyz(p2[0], p2[1], 1.0);
        var segs = 5;
        for(var s = 0; s < segs; s++){
          var ptA = slerpVec3(v1, v2, s / segs, r);
          var ptB = slerpVec3(v1, v2, (s + 1) / segs, r);
          pos.push(ptA[0], ptA[1], ptA[2], ptB[0], ptB[1], ptB[2]);
          col.push(c[0], c[1], c[2], c[3], c[0], c[1], c[2], c[3]);
        }
      }

      this.ringCount = pos.length / 3;
      this.ringVao = this.makeVao([
        { loc: 0, size: 3, data: new Float32Array(pos) },
        { loc: 1, size: 4, data: new Float32Array(col) }
      ], null);
    },

    buildVolcanoVAO: function(){
      var gl = this.gl;
      if(!gl || !window.GEO_DATA || !window.GEO_DATA.volcanoes) return;
      var vols = window.GEO_DATA.volcanoes;
      var pos = [], col = [], sizes = [];
      var r = 1.0036;

      for(var i = 0; i < vols.length; i++){
        var v = vols[i];
        var p = ll2xyz(v.lat, v.lon, r);
        pos.push(p[0], p[1], p[2]);
        // Fiery gold-orange color
        col.push(1.0, 0.45, 0.08, 0.96);
        sizes.push(13.0);
      }

      this.volcanoCount = vols.length;
      this.volcanoVao = this.makeVao([
        { loc: 0, size: 3, data: new Float32Array(pos) },
        { loc: 1, size: 4, data: new Float32Array(col) },
        { loc: 2, size: 1, data: new Float32Array(sizes) }
      ], null);
    },

    fetchEarthquakes: function(range){
      var self = this;
      range = range || self.quakeRange;
      self.quakeRange = range;
      self.quakesLoading = true;
      self.updatePanelUI();

      var feedUrl = (range === "week")
        ? "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"
        : "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

      fetch(feedUrl)
        .then(function(res){
          if(!res.ok) throw new Error("USGS feed status: " + res.status);
          return res.json();
        })
        .then(function(data){
          self.quakes = (data.features || []).map(function(f){
            var c = f.geometry.coordinates; // [lon, lat, depth_km]
            return {
              id: f.id,
              mag: f.properties.mag || 2.5,
              place: f.properties.place || "Unknown location",
              time: f.properties.time,
              url: f.properties.url,
              depth: c[2] || 10.0,
              lat: c[1],
              lon: c[0]
            };
          });
          self.quakes.sort(function(a, b){ return b.mag - a.mag; });
          self.lastQuakeFetch = Date.now();
          self.quakesLoading = false;
          self.buildQuakeVAO();
          self.updatePanelUI();
        })
        .catch(function(err){
          console.warn("USGS earthquake fetch fallback:", err);
          self.quakesLoading = false;
          // Fallback recent historic representative quakes if offline
          if(!self.quakes.length){
            self.quakes = [
              { id:"fb1", mag: 6.8, place: "Offshore Maule, Chile", time: Date.now() - 3600000, depth: 25.0, lat: -35.2, lon: -72.6 },
              { id:"fb2", mag: 5.7, place: "Honshu, Japan", time: Date.now() - 7200000, depth: 42.0, lat: 37.5, lon: 141.8 },
              { id:"fb3", mag: 5.2, place: "Banda Sea, Indonesia", time: Date.now() - 14400000, depth: 150.0, lat: -6.4, lon: 129.8 },
              { id:"fb4", mag: 4.8, place: "Reykjanes Ridge, Iceland", time: Date.now() - 21600000, depth: 10.0, lat: 63.8, lon: -22.5 },
              { id:"fb5", mag: 4.5, place: "Southern California, USA", time: Date.now() - 28800000, depth: 12.0, lat: 34.2, lon: -117.5 }
            ];
            self.buildQuakeVAO();
          }
          self.updatePanelUI();
        });
    },

    buildQuakeVAO: function(){
      var gl = this.gl;
      if(!gl || !this.quakes.length) return;
      var pos = [], col = [], sizes = [];
      var r = 1.0040;

      for(var i = 0; i < this.quakes.length; i++){
        var q = this.quakes[i];
        var p = ll2xyz(q.lat, q.lon, r);
        pos.push(p[0], p[1], p[2]);

        // Color by depth:
        // Shallow (< 70 km): bright red/pink
        // Intermediate (70-300 km): fiery orange
        // Deep (> 300 km): electric indigo/purple
        var c;
        if(q.depth < 70) c = [1.0, 0.12, 0.22, 0.95];
        else if(q.depth < 300) c = [1.0, 0.58, 0.05, 0.92];
        else c = [0.55, 0.30, 1.0, 0.88];

        col.push(c[0], c[1], c[2], c[3]);
        // Size proportional to magnitude
        var sz = Math.max(7.0, Math.min(26.0, q.mag * 3.5));
        sizes.push(sz);
      }

      this.quakeCount = this.quakes.length;
      this.quakeVao = this.makeVao([
        { loc: 0, size: 3, data: new Float32Array(pos) },
        { loc: 1, size: 4, data: new Float32Array(col) },
        { loc: 2, size: 1, data: new Float32Array(sizes) }
      ], null);
    },

    draw: function(mModel, mVP, uTime){
      if(!this.active || !this.gl) return;
      var gl = this.gl;

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);

      // 1. Draw Plate Boundaries (Lines)
      if(this.showPlates && this.plateVao && this.progLine){
        gl.useProgram(this.progLine);
        gl.uniformMatrix4fv(this.progLine.u.uModel, false, mModel);
        gl.uniformMatrix4fv(this.progLine.u.uVP, false, mVP);
        gl.uniform1f(this.progLine.u.uAlpha, 0.85);
        gl.bindVertexArray(this.plateVao.vao || this.plateVao);
        gl.drawArrays(gl.LINES, 0, this.plateCount);
      }

      // 2. Draw Ring of Fire (Lines)
      if(this.showRingOfFire && this.ringVao && this.progLine){
        gl.useProgram(this.progLine);
        gl.uniformMatrix4fv(this.progLine.u.uModel, false, mModel);
        gl.uniformMatrix4fv(this.progLine.u.uVP, false, mVP);
        var rofAlpha = 0.70 + 0.30 * Math.sin(uTime * 3.0);
        gl.uniform1f(this.progLine.u.uAlpha, rofAlpha);
        gl.bindVertexArray(this.ringVao.vao || this.ringVao);
        gl.drawArrays(gl.LINES, 0, this.ringCount);
      }

      // 3. Draw Volcanoes (Points - Diamond Shimmer)
      if(this.showVolcanoes && this.volcanoVao && this.progPoint){
        gl.useProgram(this.progPoint);
        gl.uniformMatrix4fv(this.progPoint.u.uModel, false, mModel);
        gl.uniformMatrix4fv(this.progPoint.u.uVP, false, mVP);
        gl.uniform1f(this.progPoint.u.uScale, 1.0);
        gl.uniform1f(this.progPoint.u.uTime, uTime);
        gl.uniform1i(this.progPoint.u.uType, 1); // volcano
        gl.bindVertexArray(this.volcanoVao.vao || this.volcanoVao);
        gl.drawArrays(gl.POINTS, 0, this.volcanoCount);
      }

      // 4. Draw Earthquakes (Points - Concentric Shockwaves)
      if(this.showQuakes && this.quakeVao && this.progPoint){
        gl.useProgram(this.progPoint);
        gl.uniformMatrix4fv(this.progPoint.u.uModel, false, mModel);
        gl.uniformMatrix4fv(this.progPoint.u.uVP, false, mVP);
        gl.uniform1f(this.progPoint.u.uScale, 1.0);
        gl.uniform1f(this.progPoint.u.uTime, uTime);
        gl.uniform1i(this.progPoint.u.uType, 0); // earthquake
        gl.bindVertexArray(this.quakeVao.vao || this.quakeVao);
        gl.drawArrays(gl.POINTS, 0, this.quakeCount);
      }

      gl.depthMask(true);
      gl.disable(gl.BLEND);
    },

    open: function(){
      this.active = true;
      var btn = document.getElementById("btn-geo");
      if(btn){
        btn.classList.remove("ghost");
        btn.classList.add("solid");
      }
      var p = document.getElementById("geo-panel");
      if(p) p.classList.add("open");
      // Close other panels if open
      if(typeof closePanels === "function") closePanels();
      if(p) p.classList.add("open");
      document.body.classList.add("panel");
      this.updatePanelUI();

      // Check if quakes need refreshing (> 5 min)
      if(Date.now() - this.lastQuakeFetch > 300000){
        this.fetchEarthquakes(this.quakeRange);
      }
    },

    close: function(){
      this.active = false;
      var btn = document.getElementById("btn-geo");
      if(btn){
        btn.classList.remove("solid");
        btn.classList.add("ghost");
      }
      var p = document.getElementById("geo-panel");
      if(p) p.classList.remove("open");
      document.body.classList.remove("panel");
    },

    toggle: function(){
      if(this.active) this.close();
      else this.open();
    },

    flyTo: function(lat, lon){
      if(!window.V || !window.BY || !window.BY.earth) return;
      var S = typeof stateAt === "function" ? stateAt(V.jd) : null;
      if(!S || !S.earth) return;

      var b = BY.earth;
      var spin = typeof spinOf === "function" ? spinOf(b, V.jd, S) : 0;
      var la = lat * (Math.PI / 180.0);
      var lo = lon * (Math.PI / 180.0) + spin;

      var f = b.frame;
      // World-space surface normal vector from Earth center
      var norm = [
        f.u[0] * Math.cos(la) * Math.cos(lo) + f.n[0] * Math.sin(la) + f.v[0] * Math.cos(la) * Math.sin(lo),
        f.u[1] * Math.cos(la) * Math.cos(lo) + f.n[1] * Math.sin(la) + f.v[1] * Math.cos(la) * Math.sin(lo),
        f.u[2] * Math.cos(la) * Math.cos(lo) + f.n[2] * Math.sin(la) + f.v[2] * Math.cos(la) * Math.sin(lo)
      ];

      // Aim camera towards Earth surface point from front
      var wantYaw = Math.atan2(norm[0], norm[2]);
      var wantPitch = Math.asin(Math.max(-0.95, Math.min(0.95, norm[1])));

      V.wantYaw = wantYaw;
      V.wantPitch = wantPitch;
      var r = typeof dispRadius === "function" ? dispRadius(b) : 1000;
      V.wantDist = Math.max(r * 2.2, r * 2.2);
    },

    updatePanelUI: function(){
      var el = document.getElementById("geo-content");
      if(!el) return;
      var lang = (typeof LANG !== "undefined") ? LANG : "vi";

      var maxMag = 0;
      for(var i = 0; i < this.quakes.length; i++){
        if(this.quakes[i].mag > maxMag) maxMag = this.quakes[i].mag;
      }

      var html = '';
      // Status & Stats bar
      html += '<div class="geo-stats-card">';
      html += '  <div class="geo-stat-col">';
      html += '    <span class="geo-stat-num">' + this.quakes.length + '</span>';
      html += '    <span class="geo-stat-lbl">' + (lang === "en" ? "Earthquakes" : "Trận động đất") + '</span>';
      html += '  </div>';
      html += '  <div class="geo-stat-col">';
      html += '    <span class="geo-stat-num" style="color:#FF5252">M' + (maxMag ? maxMag.toFixed(1) : "—") + '</span>';
      html += '    <span class="geo-stat-lbl">' + (lang === "en" ? "Max Mag" : "Lớn nhất") + '</span>';
      html += '  </div>';
      html += '  <div class="geo-stat-col">';
      html += '    <span class="geo-stat-num" style="color:#FFB74D">22</span>';
      html += '    <span class="geo-stat-lbl">' + (lang === "en" ? "Volcanoes" : "Núi lửa lớn") + '</span>';
      html += '  </div>';
      html += '</div>';

      // Layer Toggles
      html += '<div class="geo-layer-list">';
      html += '  <label class="geo-layer-row">';
      html += '    <input type="checkbox" id="chk-geo-plates"' + (this.showPlates ? " checked" : "") + '>';
      html += '    <span class="geo-dot" style="background:#00E5FF;box-shadow:0 0 6px #00E5FF"></span>';
      html += '    <span class="geo-layer-title">' + (lang === "en" ? "Tectonic Plate Boundaries" : "Ranh giới Mảng Kiến Tạo (486 rãnh)") + '</span>';
      html += '  </label>';

      html += '  <label class="geo-layer-row">';
      html += '    <input type="checkbox" id="chk-geo-rof"' + (this.showRingOfFire ? " checked" : "") + '>';
      html += '    <span class="geo-dot" style="background:#FF1744;box-shadow:0 0 6px #FF1744"></span>';
      html += '    <span class="geo-layer-title">' + (lang === "en" ? "Pacific Ring of Fire" : "Vành Đai Lửa Thái Bình Dương") + '</span>';
      html += '  </label>';

      html += '  <label class="geo-layer-row">';
      html += '    <input type="checkbox" id="chk-geo-quakes"' + (this.showQuakes ? " checked" : "") + '>';
      html += '    <span class="geo-dot" style="background:#FF5252;box-shadow:0 0 6px #FF5252"></span>';
      html += '    <span class="geo-layer-title">' + (lang === "en" ? "USGS Real-time Quakes (M≥2.5)" : "Động Đất Thời Gian Thực (USGS)") + '</span>';
      html += '  </label>';

      html += '  <div class="geo-sub-row" style="margin-left:24px;margin-bottom:6px;display:flex;gap:6px">';
      html += '    <button type="button" class="geo-chip' + (this.quakeRange === "day" ? " active" : "") + '" id="btn-q-day">' + (lang === "en" ? "24 Hours" : "24 Giờ qua") + '</button>';
      html += '    <button type="button" class="geo-chip' + (this.quakeRange === "week" ? " active" : "") + '" id="btn-q-week">' + (lang === "en" ? "7 Days" : "7 Ngày qua") + '</button>';
      html += '    <button type="button" class="geo-chip" id="btn-q-refresh" title="Làm mới dữ liệu">🔄</button>';
      html += '  </div>';

      html += '  <label class="geo-layer-row">';
      html += '    <input type="checkbox" id="chk-geo-volcanoes"' + (this.showVolcanoes ? " checked" : "") + '>';
      html += '    <span class="geo-dot" style="background:#FFA726;box-shadow:0 0 6px #FFA726"></span>';
      html += '    <span class="geo-layer-title">' + (lang === "en" ? "Active Global Volcanoes" : "Núi Lửa Hoạt Động (22 đỉnh)") + '</span>';
      html += '  </label>';
      html += '</div>';

      // Tabs: Earthquakes List & Volcanoes List
      html += '<div class="geo-tabs">';
      html += '  <button class="geo-tab-btn active" id="tab-geo-quakes">🔴 ' + (lang === "en" ? "Recent Quakes" : "Động Đất Gần Đây") + '</button>';
      html += '  <button class="geo-tab-btn" id="tab-geo-vols">🌋 ' + (lang === "en" ? "Volcanoes" : "Danh Sách Núi Lửa") + '</button>';
      html += '</div>';

      // Feed Box
      html += '<div class="geo-feed-box" id="geo-feed-box">';
      if(this.quakesLoading){
        html += '<p class="geo-loading">' + (lang === "en" ? "Connecting to USGS Satellite Feed..." : "Đang kết nối trạm địa chấn USGS...") + '</p>';
      } else {
        html += this.renderQuakeList(lang);
      }
      html += '</div>';

      el.innerHTML = html;
      this.wirePanelEvents();
    },

    renderQuakeList: function(lang){
      if(!this.quakes.length){
        return '<p class="geo-empty">' + (lang === "en" ? "No recent earthquakes reported." : "Không có dữ liệu địa chấn mới.") + '</p>';
      }
      var out = '';
      for(var i = 0; i < Math.min(25, this.quakes.length); i++){
        var q = this.quakes[i];
        var magClass = q.mag >= 6 ? "mag-high" : (q.mag >= 4.5 ? "mag-med" : "mag-low");
        var depthCol = q.depth < 70 ? "#FF5252" : (q.depth < 300 ? "#FFA726" : "#7C4DFF");
        var depthName = lang === "en" ? ("Depth: " + Math.round(q.depth) + " km") : ("Độ sâu: " + Math.round(q.depth) + " km");

        out += '<div class="geo-item geo-item-quake" data-idx="' + i + '">';
        out += '  <div class="geo-item-top">';
        out += '    <span class="geo-mag-badge ' + magClass + '">M' + q.mag.toFixed(1) + '</span>';
        out += '    <span class="geo-item-place" title="' + q.place + '">' + q.place + '</span>';
        out += '  </div>';
        out += '  <div class="geo-item-sub">';
        out += '    <span style="color:' + depthCol + '">● ' + depthName + '</span>';
        out += '    <span>' + q.lat.toFixed(1) + '°, ' + q.lon.toFixed(1) + '°</span>';
        out += '  </div>';
        out += '</div>';
      }
      return out;
    },

    renderVolcanoList: function(lang){
      var vols = window.GEO_DATA ? window.GEO_DATA.volcanoes : [];
      if(!vols.length) return '';
      var out = '';
      for(var i = 0; i < vols.length; i++){
        var v = vols[i];
        var name = (lang === "en" && v.name_en) ? v.name_en : v.name_vi;
        var desc = (lang === "en" && v.desc_en) ? v.desc_en : v.desc_vi;

        out += '<div class="geo-item geo-item-vol" data-vidx="' + i + '">';
        out += '  <div class="geo-item-top">';
        out += '    <span class="geo-mag-badge mag-vol">🌋 ' + v.elev + 'm</span>';
        out += '    <span class="geo-item-place">' + name + ' <small>(' + v.country + ')</small></span>';
        out += '  </div>';
        out += '  <div class="geo-item-desc">' + desc + '</div>';
        out += '  <div class="geo-item-sub">';
        out += '    <span>' + v.type + '</span>';
        out += '    <span>' + v.lat.toFixed(1) + '°, ' + v.lon.toFixed(1) + '°</span>';
        out += '  </div>';
        out += '</div>';
      }
      return out;
    },

    wirePanelEvents: function(){
      var self = this;
      var chkPlates = document.getElementById("chk-geo-plates");
      if(chkPlates) chkPlates.onchange = function(){ self.showPlates = this.checked; };

      var chkRof = document.getElementById("chk-geo-rof");
      if(chkRof) chkRof.onchange = function(){ self.showRingOfFire = this.checked; };

      var chkQuakes = document.getElementById("chk-geo-quakes");
      if(chkQuakes) chkQuakes.onchange = function(){ self.showQuakes = this.checked; };

      var chkVol = document.getElementById("chk-geo-volcanoes");
      if(chkVol) chkVol.onchange = function(){ self.showVolcanoes = this.checked; };

      var btnDay = document.getElementById("btn-q-day");
      if(btnDay) btnDay.onclick = function(){ self.fetchEarthquakes("day"); };

      var btnWeek = document.getElementById("btn-q-week");
      if(btnWeek) btnWeek.onclick = function(){ self.fetchEarthquakes("week"); };

      var btnRef = document.getElementById("btn-q-refresh");
      if(btnRef) btnRef.onclick = function(){ self.fetchEarthquakes(self.quakeRange); };

      var tabQuakes = document.getElementById("tab-geo-quakes");
      var tabVols = document.getElementById("tab-geo-vols");
      var feedBox = document.getElementById("geo-feed-box");
      var lang = (typeof LANG !== "undefined") ? LANG : "vi";

      if(tabQuakes && tabVols && feedBox){
        tabQuakes.onclick = function(){
          tabQuakes.classList.add("active");
          tabVols.classList.remove("active");
          feedBox.innerHTML = self.renderQuakeList(lang);
          self.wireFeedClicks();
        };
        tabVols.onclick = function(){
          tabVols.classList.add("active");
          tabQuakes.classList.remove("active");
          feedBox.innerHTML = self.renderVolcanoList(lang);
          self.wireFeedClicks();
        };
      }

      this.wireFeedClicks();
    },

    wireFeedClicks: function(){
      var self = this;
      document.querySelectorAll(".geo-item-quake").forEach(function(item){
        item.onclick = function(){
          var idx = parseInt(this.getAttribute("data-idx"), 10);
          var q = self.quakes[idx];
          if(q) self.flyTo(q.lat, q.lon);
        };
      });

      document.querySelectorAll(".geo-item-vol").forEach(function(item){
        item.onclick = function(){
          var idx = parseInt(this.getAttribute("data-vidx"), 10);
          var v = window.GEO_DATA.volcanoes[idx];
          if(v) self.flyTo(v.lat, v.lon);
        };
      });
    }
  };

  global.GEO = GEO;
})(typeof window !== "undefined" ? window : this);
