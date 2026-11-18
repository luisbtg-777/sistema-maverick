/* ═══ MENTE MV · interfaz ═══ */
(function () {
  'use strict';
  var P = JSON.parse(document.getElementById('protocolo').textContent);
  MM.setProtocolo(P);
  var KEY = 'mentemv_v1'; // NUNCA cambiar
  var COL = P.colores;
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  /* ── estado ── */
  var memoria = null;
  function cargar() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = memoria; }
    return MM.migrar(raw);
  }
  var S = cargar();
  function guardar() {
    S.updated = new Date().toISOString();
    memoria = S;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('⚠️ No se pudo guardar: exporta un respaldo'); }
  }
  function hoyStr() {
    var q = /[?&]hoy=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    return q ? q[1] : MM.hoyLocal();
  }
  var HOY = hoyStr();
  function D(s) { s = s || HOY; if (!S.dias[s]) S.dias[s] = {}; return S.dias[s]; }
  function B(b, s) { var d = D(s); if (!d[b]) d[b] = {}; return d[b]; }
  function F() { return MM.fase(S, HOY); }

  /* ── utilidades ── */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fechaLarga(s) { var d = new Date(MM.parse(s)); return [DIAS[d.getUTCDay()], d.getUTCDate() + ' ' + MESES[d.getUTCMonth()]]; }
  function fechaCorta(s) { var d = new Date(MM.parse(s)); return d.getUTCDate() + ' ' + MESES[d.getUTCMonth()]; }
  function colorFase(key) { return COL[key] || COL.base; }
  var tt;
  function toast(t) { var e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { e.classList.remove('on'); }, 1900); }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function nombreFase(f) { return f.modo === 'VIDA' ? '♾️ Modo Vida' : (f.key + ' ' + (f.fase ? f.fase.nombre : 'Cimiento')); }

  /* ═══ HOY ═══ */
  function bloquesHoy(f) {
    var viaje = MM.enViaje(HOY), tras = MM.esTraslado(HOY);
    var mm = P.manana.min[f.dosis], im = P.intelecto.min[f.dosis], tm = P.noche.trataka[f.dosis], nm = P.noche.min[f.dosis];
    return [
      { k: 'm', e: '🧘', n: 'Conciencia', h: MM.hora('m', HOY), dur: sum(mm), sub: viaje ? 'Tripartita mínima · cualquier hora' : 'Meditación Tripartita · yo → mundo → totalidad' },
      { k: 'i', e: '📖', n: 'Intelecto', h: MM.hora('i', HOY), dur: sum(im), sub: viaje ? 'Opcional en viaje · 1 página' : '⚔️ ' + MM.ordenDel(S, HOY, f.dosis).t, opcional: viaje },
      { k: 'n', e: '🌙', n: 'La Noche', h: MM.hora('n', HOY), dur: tm + nm, sub: '🕯️ Flama ' + tm + ' min · luna · 4 pasos · Sen' }
    ].map(function (b) { b.done = !!(D()[b.k] && D()[b.k].done); b.tras = tras; return b; });
  }
  function siguiente(bs) {
    var ahora = new Date(), min = ahora.getHours() * 60 + ahora.getMinutes();
    var q = /[?&]hora=(\d{2}:\d{2})/.exec(location.search); if (q) min = MM.aMin(q[1]);
    if (min < 240) min += 1440; // antes de las 4 am sigue siendo "hoy"
    var pend = bs.filter(function (b) { return !b.done && !b.opcional; });
    if (!pend.length) return null;
    // el bloque pendiente cuya hora ya pasó más reciente, o el próximo
    var pasados = pend.filter(function (b) { return MM.aMin(b.h) <= min + 20; });
    return pasados.length ? pasados[pasados.length - 1] : pend[0];
  }

  function dialSVG(bs, f) {
    var c = 150, NS = '', out = [];
    var gym = P.horario.gym[String(MM.dow(HOY))];
    var rangos = [];
    if (gym && !MM.enViaje(HOY)) rangos.push([MM.aMin(gym[0]) / 60, MM.aMin(gym[1]) / 60, 'rgba(200,200,212,.28)']);
    bs.forEach(function (b) {
      var h0 = MM.aMin(b.h) / 60, h1 = h0 + Math.max(b.dur, 10) / 60;
      rangos.push([h0, h1, b.done ? colorFase(f.key === 'VIDA' ? 'base' : f.key) : 'rgba(234,223,200,.55)']);
    });
    rangos.push([22.75, 24, 'rgba(255,255,255,.13)'], [0, 4.9, 'rgba(255,255,255,.13)']);
    for (var r = 0; r < 4; r++) {
      var R = 128 - r * 11, n = Math.round(R * 0.9);
      for (var i = 0; i < n; i++) {
        var h = i / n * 24, a = h / 24 * Math.PI * 2 - Math.PI / 2, col = 'rgba(255,255,255,.07)';
        for (var j = 0; j < rangos.length; j++) if (h >= rangos[j][0] && h < rangos[j][1]) col = rangos[j][2];
        out.push('<circle cx="' + (c + R * Math.cos(a)).toFixed(1) + '" cy="' + (c + R * Math.sin(a)).toFixed(1) + '" r="2.1" fill="' + col + '"/>');
      }
    }
    var marcas = bs.map(function (b) { return [b.e, MM.aMin(b.h) / 60 + 0.15]; });
    if (gym && !MM.enViaje(HOY)) marcas.push(['🏋️', (MM.aMin(gym[0]) + 60) / 60]);
    marcas.forEach(function (m) {
      var a = m[1] / 24 * Math.PI * 2 - Math.PI / 2, R = 146;
      out.push('<text x="' + (c + R * Math.cos(a)).toFixed(1) + '" y="' + (c + R * Math.sin(a) + 5).toFixed(1) + '" text-anchor="middle" font-size="14">' + m[0] + '</text>');
    });
    // aguja (hora actual)
    var ahora = new Date(), hh = ahora.getHours() + ahora.getMinutes() / 60;
    var q = /[?&]hora=(\d{2}):(\d{2})/.exec(location.search); if (q) hh = +q[1] + q[2] / 60;
    var na = hh / 24 * Math.PI * 2 - Math.PI / 2;
    out.push('<line x1="' + (c + 66 * Math.cos(na)).toFixed(1) + '" y1="' + (c + 66 * Math.sin(na)).toFixed(1) + '" x2="' + (c + 120 * Math.cos(na)).toFixed(1) + '" y2="' + (c + 120 * Math.sin(na)).toFixed(1) + '" stroke="#F0E4CC" stroke-width="1.5" stroke-linecap="round"/>');
    // centro
    var hechos = bs.filter(function (b) { return b.done; }).length;
    var meta = MM.enViaje(HOY) ? 2 : 3, frac = Math.min(1, hechos / meta);
    out.push('<circle cx="150" cy="150" r="62" fill="rgba(255,255,255,.03)" stroke="rgba(214,194,161,.25)"/>');
    out.push('<circle cx="150" cy="150" r="48" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="5"/>');
    if (frac > 0) {
      if (frac >= 1) out.push('<circle cx="150" cy="150" r="48" fill="none" stroke="#E6D3B0" stroke-width="5"/>');
      else {
        var ea = -Math.PI / 2 + frac * Math.PI * 2;
        out.push('<path d="M 150 102 A 48 48 0 ' + (frac > .5 ? 1 : 0) + ' 1 ' + (150 + 48 * Math.cos(ea)).toFixed(1) + ' ' + (150 + 48 * Math.sin(ea)).toFixed(1) + '" fill="none" stroke="#E6D3B0" stroke-width="5" stroke-linecap="round"/>');
      }
    }
    out.push('<text x="150" y="152" text-anchor="middle" font-size="30" font-weight="300" fill="#F4EAD2">' + hechos + '/' + meta + '</text>');
    out.push('<text x="150" y="170" text-anchor="middle" font-size="7.5" letter-spacing="1.2" fill="#D6C2A1">' + (hechos >= meta ? 'DÍA SELLADO' : 'SISTEMAS') + '</text>');
    return '<svg class="dial" viewBox="0 0 300 300" aria-label="Reloj del día">' + out.join('') + '</svg>';
  }

  function renderHoy() {
    var f = F(), fl = fechaLarga(HOY), bs = bloquesHoy(f), sig = siguiente(bs);
    document.documentElement.style.setProperty('--fase', colorFase(f.modo === 'VIDA' ? 'base' : f.key));
    var eb;
    if (f.modo === 'PRE') eb = 'Mente MV · arranca en <b>' + f.faltan + ' días</b>';
    else if (f.modo === 'VIDA') eb = 'Mente MV · <b>♾️ Modo Vida</b> · día ' + f.dia;
    else eb = 'Mente MV · <b>' + f.key + ' ' + f.fase.nombre + '</b> · S' + f.semana + (f.ext ? ' · +' + f.ext + ' sem' : '');
    var h = '<div class="top"><div><div class="eyebrow">' + eb + '</div><div class="title">' + fl[0] + ' <b>' + fl[1] + '</b></div></div>' +
      '<button class="x" data-act="valores" aria-label="Valores">⚖︎</button></div>';
    if (MM.enViaje(HOY)) h += '<div class="g flat" style="margin-top:12px;padding:11px 16px"><div class="row"><div style="font-size:18px">✈️</div><div class="grow"><div class="lbl" style="font-size:13px">Modo viaje · ' + esc(P.viaje.nombre) + '</div><div class="sub">' + (MM.esTraslado(HOY) ? 'Día de traslado: no cuenta. Si puedes, 🧘 7 min.' : '🧘 + 🌙 = día completo. 📖 opcional') + '</div></div></div></div>';
    h += '<div class="dialwrap">' + dialSVG(bs, f) + '</div>';
    if (sig) h += trayBloque(sig, f, true);
    else h += '<div class="g accent"><div class="row"><div class="ico">🦅</div><div class="grow"><div class="lbl">Día sellado</div><div class="sub">' + esc(P.credo.t) + '</div></div></div></div>';
    h += '<div class="row" style="gap:10px;margin-top:10px;align-items:stretch">';
    bs.filter(function (b) { return !sig || b.k !== sig.k; }).forEach(function (b) {
      h += '<button class="g" data-act="abrir" data-b="' + b.k + '" style="flex:1;text-align:left;padding:13px 14px">' +
        '<div class="row" style="justify-content:space-between"><span style="font-size:19px">' + b.e + '</span><span class="check' + (b.done ? ' on' : '') + '">' + (b.done ? '✓' : '') + '</span></div>' +
        '<div class="lbl" style="margin-top:6px;font-size:13px">' + b.n + '</div><div class="sub">' + b.h + ' · ' + b.dur + ' min' + (b.opcional ? ' · opc.' : '') + '</div></button>';
    });
    h += '</div>';
    var iv = f.modo === 'PRE' ? null : MM.invivoDel(HOY, f);
    var ivd = D().v || {};
    if (iv || ivd.done) {
      var ivx = iv || { emo: P.emociones.filter(function (e) { return e.k === ivd.emo; })[0] || P.emociones[0], reto: ivd.reto || 'Exposición espontánea' };
      h += '<button class="g" data-act="invivo" style="margin-top:10px;width:100%;text-align:left;padding:13px 16px"><div class="row">' +
        '<div style="font-size:20px">🔥</div><div class="grow"><div class="lbl" style="font-size:13.5px">In Vivo · ' + ivx.emo.e + ' ' + ivx.emo.t + '</div><div class="sub">' + esc(ivd.reto || ivx.reto) + '</div></div>' +
        '<span class="check' + (ivd.done ? ' on' : '') + '">' + (ivd.done ? '✓' : '') + '</span></div></button>';
    }
    if (f.modo !== 'PRE') {
      var sh = P.manana.shoshin[f.dosis];
      if (!S.ocultar || !S.ocultar['shoshin-' + HOY]) h += '<div class="g flat" style="margin-top:10px;padding:12px 44px 12px 16px"><button class="x" data-act="ocultar" data-k="shoshin-' + HOY + '" aria-label="Cerrar">✕</button><div class="mini" style="text-transform:uppercase;letter-spacing:.16em">⚡ Shoshin · durante el día</div><div class="sub" style="color:var(--t2);margin-top:4px">' + esc(sh) + '</div></div>';
    }
    $('#hoy').innerHTML = h;
  }

  function trayBloque(b, f, grande) {
    var pres = (D()[b.k] && D()[b.k].pres) || 0;
    var h = '<div class="g accent" style="margin-top:4px"><div class="row"><div class="ico">' + b.e + '</div><div class="grow"><div class="lbl">' + b.n + ' · ' + b.dur + ' min</div><div class="sub">' + b.h + ' · ' + esc(b.sub) + '</div></div></div>';
    if (b.k === 'm') h += sliderHTML('pres', pres || 3, ['Disperso', 'Presente']);
    h += '<button class="btn" data-act="abrir" data-b="' + b.k + '" style="margin-top:14px">Comenzar ' + b.e + ' ' + b.n + '</button></div>';
    return h;
  }
  function sliderHTML(name, val, ticks) {
    var pct = (val - 1) / 4 * 100;
    return '<div class="slider" data-slider="' + name + '"><div class="track"></div><div class="fill" style="width:' + pct + '%"></div><div class="knob" style="left:' + pct + '%"></div><div class="ticks"><span>' + ticks[0] + '</span><span>' + ticks[1] + '</span></div></div>';
  }

  /* ═══ HOJAS ═══ */
  var hojaActual = null;
  function abrirHoja(html, id) {
    hojaActual = id;
    $('#sheet').innerHTML = '<div class="grab"></div>' + html;
    $('#sheet').scrollTop = 0;
    $('#veil').classList.add('on'); $('#sheet').classList.add('on');
  }
  function cerrarHoja() {
    detenerTimer(true);
    hojaActual = null;
    $('#veil').classList.remove('on'); $('#sheet').classList.remove('on');
    render();
  }
  function cabecera(eb, t1, t2) {
    return '<div class="top"><div><div class="eyebrow">' + eb + '</div><h2>' + t1 + ' <b>' + t2 + '</b></h2></div><button class="x" data-act="cerrar" aria-label="Cerrar">✕</button></div>';
  }
  function pasosHTML(pasos, mins, activo) {
    return pasos.map(function (p, i) {
      if (!mins[i]) return '';
      var cls = activo == null ? '' : (i < activo ? ' past' : i === activo ? ' now' : '');
      return '<div class="paso' + cls + '" data-paso="' + i + '"><div class="n">' + (i + 1) + '</div><div class="grow"><div class="lbl" style="font-size:14px">' + esc(p.t) + '</div><div class="sub">' + esc(p.d) + '</div></div><div class="m">' + mins[i] + ' min</div></div>';
    }).join('');
  }
  function timerHTML(id, segs, etiqueta) {
    return '<div class="timer" data-timer="' + id + '"><svg viewBox="0 0 170 170"><circle cx="85" cy="85" r="76" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="5"/>' +
      '<circle class="arc" cx="85" cy="85" r="76" fill="none" stroke="#E6D3B0" stroke-width="5" stroke-linecap="round" stroke-dasharray="477.5" stroke-dashoffset="477.5" transform="rotate(-90 85 85)"/>' +
      '<text class="tt" x="85" y="92" text-anchor="middle" font-size="32" font-weight="200" fill="#F6F2EA" font-family="-apple-system,Inter,sans-serif">' + mmss(segs) + '</text>' +
      '<text x="85" y="114" text-anchor="middle" font-size="9" letter-spacing="1.5" fill="#D6C2A1" font-family="-apple-system,Inter,sans-serif">' + esc(etiqueta) + '</text></svg>' +
      '<div class="tbtns"><button class="btn" data-act="timer" data-id="' + id + '" data-s="' + segs + '">▶︎ Iniciar</button><button class="btn ghost" data-act="timer-reset" data-id="' + id + '" data-s="' + segs + '" style="width:40%">↺</button></div></div>';
  }
  function mmss(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  /* timer único, basado en reloj (sobrevive a pausas de pantalla) */
  var T = null;
  function iniciarTimer(id, segs) {
    if (T && T.id === id && T.corriendo) { T.acum += (Date.now() - T.t0) / 1000; T.corriendo = false; pintarTimer(); return; }
    if (!T || T.id !== id) T = { id: id, total: segs, acum: 0 };
    T.t0 = Date.now(); T.corriendo = true;
    tick();
  }
  function detenerTimer(borrar) { if (T) T.corriendo = false; if (borrar) T = null; }
  function transcurrido() { return T ? T.acum + (T.corriendo ? (Date.now() - T.t0) / 1000 : 0) : 0; }
  function tick() {
    if (!T || !T.corriendo) return;
    pintarTimer();
    if (transcurrido() >= T.total) { T.acum = T.total; T.corriendo = false; pintarTimer(); finTimer(T.id); return; }
    setTimeout(tick, 250);
  }
  function pintarTimer() {
    if (!T) return;
    var el = document.querySelector('[data-timer="' + T.id + '"]'); if (!el) return;
    var e = transcurrido(), rest = T.total - e;
    el.querySelector('.tt').textContent = mmss(rest);
    el.querySelector('.arc').setAttribute('stroke-dashoffset', (477.5 * (1 - Math.min(1, e / T.total))).toFixed(1));
    var b = el.querySelector('[data-act="timer"]');
    b.textContent = T.corriendo ? '❚❚ Pausa' : (rest <= 0 ? '✓ Listo' : '▶︎ Seguir');
    if (T.id === 'm') {
      var f = F(), mins = P.manana.min[f.dosis], acc = 0, idx = 0;
      for (var i = 0; i < mins.length; i++) { acc += mins[i] * 60; if (e < acc) { idx = i; break; } idx = i; }
      document.querySelectorAll('#sheet .paso').forEach(function (p) {
        var k = +p.dataset.paso; p.classList.toggle('past', k < idx); p.classList.toggle('now', k === idx);
      });
    }
    var fl = document.querySelector('#sheet .flama'); if (fl && T.id === 't') fl.classList.toggle('off', !T.corriendo && e < T.total);
  }
  function finTimer(id) {
    try { if (navigator.vibrate) navigator.vibrate([120, 80, 120]); } catch (e) { }
    toast(id === 't' ? '🕯️ Cierra los ojos y sostén la imagen' : '🔔 Tiempo');
  }

  /* ── 🧘 mañana ── */
  function hojaManana() {
    var f = F(), d = B('m'), mins = P.manana.min[f.dosis], w = String(MM.dow(HOY));
    var h = cabecera('🧘 Conciencia · ' + MM.hora('m', HOY) + ' · ' + sum(mins) + ' min', 'Yo → mundo →', 'totalidad');
    h += '<div class="sub" style="margin-top:6px">' + esc(P.manana.nivel[f.dosis]) + ' · ' + esc(P.manana.cal) + '</div>';
    if (P.manana.finDeSemana[w] && !MM.enViaje(HOY)) h += '<div class="g flat" style="margin-top:12px;padding:11px 14px"><div class="sub" style="color:var(--t2)">' + P.manana.finDeSemana[w] + '</div></div>';
    h += timerHTML('m', sum(mins) * 60, 'TRIPARTITA');
    h += '<div class="g flat" style="margin-top:10px;padding:6px 16px">' + pasosHTML(P.manana.pasos, mins, 0) + '</div>';
    h += '<div class="sec"><span class="mini">Presencia</span><div class="g flat">' + sliderHTML('pres', d.pres || 3, ['Disperso', 'Presente']) + '</div></div>';
    h += '<div class="sec"><span class="mini">El valor que manda hoy</span><div class="chips">' + P.valores.map(function (v, i) {
      return '<button class="chip' + (d.valor === i ? ' on' : '') + '" data-act="valor" data-i="' + i + '">' + v.e + ' ' + v.t + '</button>';
    }).join('') + '</div></div>';
    h += '<div class="sec"><button class="chip' + (d.sueno ? ' on' : '') + '" data-act="toggle" data-b="m" data-k="sueno">🌌 Soñé algo → diario de sueños (Six Rites)</button></div>';
    h += '<div class="sec">' + botonHecho('m') + '</div>';
    abrirHoja(h, 'm');
  }

  /* ── 📖 intelecto ── */
  function hojaIntelecto() {
    var f = F(), d = B('i'), mins = P.intelecto.min[f.dosis], o = MM.ordenDel(S, HOY, f.dosis);
    var h = cabecera('📖 Intelecto · ' + MM.hora('i', HOY) + ' · ' + sum(mins) + ' min', 'Orden dada,', 'orden cumplida');
    h += '<div class="g accent" style="margin-top:14px"><div class="mini" style="text-transform:uppercase;letter-spacing:.16em">⚔️ Orden de Musashi' + (o.propia ? ' · dictada por ti' : '') + '</div>' +
      '<div class="lbl" style="font-size:18px;font-weight:400;margin-top:6px;line-height:1.3">' + esc(o.t) + '</div>' +
      '<div class="sub" style="margin-top:8px">' + esc(P.intelecto.sukushin) + '</div>' +
      '<div class="chips" style="margin-top:12px"><button class="chip' + (d.orden === 'ok' ? ' on' : '') + '" data-act="set" data-b="i" data-k="orden" data-v="ok">⚔️ Cumplida en ≤3 s</button>' +
      '<button class="chip' + (d.orden === 'rep' ? ' on' : '') + '" data-act="set" data-b="i" data-k="orden" data-v="rep">🔁 Dudé · la repetí</button></div></div>';
    if (mins[1]) h += '<div class="sec"><span class="mini">🪨 Quietud · ' + mins[1] + ' min</span>' + timerHTML('q', mins[1] * 60, 'QUIETUD') + '<button class="chip" data-act="timer-reset" data-id="q" data-s="' + mins[1] * 60 + '" style="margin:6px auto 0;display:flex">↺ Divagué: reinicio sin negociar</button></div>';
    h += '<div class="g flat" style="margin-top:12px;padding:6px 16px">' + pasosHTML(P.intelecto.pasos, mins, null) + '</div>';
    var libro = f.modo === 'VIDA' ? P.vida.libro : (f.fase ? f.fase.libro : P.fases[0].libro);
    h += '<div class="sec"><span class="mini">📖 Libro de la fase</span><div class="g flat"><div class="row"><div class="grow"><div class="lbl" style="font-size:14px">' + esc(libro) + '</div><div class="sub">El ancla, no una obligación. Lee lo que te llame.</div></div>' +
      '<button class="chip' + (d.leido ? ' on' : '') + '" data-act="toggle" data-b="i" data-k="leido">' + (d.leido ? '✓ Leí hoy' : '📖 Leí hoy') + '</button></div>' +
      '<input class="in" data-in="i.cita" placeholder="Una cita que te quedó (opcional)" value="' + esc(d.cita || '') + '" style="margin-top:10px"></div></div>';
    h += '<div class="sec"><span class="mini">🏛️ Dicotomía · ♟ Maquiavelo</span><textarea class="in" rows="2" data-in="i.ctrl" placeholder="Controlo… / suelto… · ¿qué movimiento es inteligente aquí?">' + esc(d.ctrl || '') + '</textarea></div>';
    if (P.intelecto.deber[f.dosis]) h += '<div class="sec"><span class="mini">🏛️ ' + esc(P.intelecto.deber[f.dosis]) + '</span><input class="in" data-in="i.deber" value="' + esc(d.deber || '') + '" placeholder="Hoy mi deber es…"></div>';
    h += '<div class="sec">' + botonHecho('i') + '</div>';
    abrirHoja(h, 'i');
  }

  /* ── 🕯️🌙 noche ── */
  function hojaNoche() {
    var f = F(), d = B('n'), tm = P.noche.trataka[f.dosis], viaje = MM.enViaje(HOY);
    var h = cabecera('🌙 La Noche · ' + MM.hora('n', HOY) + ' · ' + (tm + P.noche.min[f.dosis]) + ' min · antes de 🦅', '¿Cómo', 'la viviste?');
    h += '<div class="sec"><span class="mini">🕯️ Trataka · atención enfocada · ' + tm + ' min</span><div class="g flat">' +
      '<div class="flama off"><div class="halo"></div><div class="fuego"></div><div class="mecha"></div><div class="cera"></div></div>' +
      '<div class="sub" style="text-align:center;margin-top:6px">' + esc(P.noche.tratakaGuia) + '</div>' + timerHTML('t', tm * 60, 'FLAMA') +
      '<div class="mini" style="text-align:center;margin-top:12px">¿Cuántas veces se fue la mente?</div><div class="chips" style="justify-content:center;margin-top:8px">' +
      ['0', '1–2', '3+'].map(function (v) { return '<button class="chip' + (d.dist === v ? ' on' : '') + '" data-act="set" data-b="n" data-k="dist" data-v="' + v + '">' + v + '</button>'; }).join('') + '</div></div></div>';
    var luna = d.luna == null ? -1 : d.luna;
    h += '<div class="sec"><span class="mini">1 toque · presencia ante la emoción del día</span><div class="g flat">' +
      '<div class="lunas">' + P.noche.lunas.map(function (l, i) { return '<button class="' + (i === luna ? 'on' : '') + '" data-act="luna" data-i="' + i + '" aria-label="' + esc(l.t) + '">' + l.e + '</button>'; }).join('') + '</div>' +
      '<div class="sub" style="margin-top:8px;min-height:16px;color:var(--t2)">' + (luna >= 0 ? esc(P.noche.lunas[luna].t) : 'Mide qué tanto la observaste, no si fue un buen día') + '</div>' +
      '<div class="chips" style="margin-top:12px">' + P.emociones.map(function (e) { return '<button class="chip' + (d.emo === e.k ? ' on' : '') + '" data-act="set" data-b="n" data-k="emo" data-v="' + e.k + '">' + e.e + ' ' + e.t + '</button>'; }).join('') + '</div></div></div>';
    if (!viaje) {
      h += '<div class="sec"><span class="mini">Los 4 pasos</span><div class="g flat stack">' +
        '<div><div class="lbl" style="font-size:13px">① Separación</div><input class="in" data-in="n.sep" style="margin-top:6px" value="' + esc(d.sep || '') + '" placeholder="Hubo una sensación de ___ cuando ___"></div>' +
        '<div><div class="lbl" style="font-size:13px">② Pausa de 3 s · ③ ¿Dónde en el cuerpo?</div><div class="chips" style="margin-top:6px">' + P.noche.cuerpo.map(function (c) { return '<button class="chip' + ((d.cuerpo || []).indexOf(c) >= 0 ? ' on' : '') + '" data-act="multi" data-b="n" data-k="cuerpo" data-v="' + c + '">' + c + '</button>'; }).join('') + '</div></div>' +
        '<div><div class="lbl" style="font-size:13px">④ Valor &gt; ánimo · ¿reaccioné o respondí?</div><div class="chips" style="margin-top:6px"><button class="chip' + (d.reac === 'reac' ? ' on' : '') + '" data-act="set" data-b="n" data-k="reac" data-v="reac">⚡ Reaccioné</button><button class="chip' + (d.reac === 'resp' ? ' on' : '') + '" data-act="set" data-b="n" data-k="reac" data-v="resp">🛡️ Respondí</button></div></div></div></div>';
      var ayer = MM.add(HOY, -1), dAyer = (S.dias[ayer] && S.dias[ayer].n) || {};
      h += '<div class="sec"><span class="mini">🔮 Intuición</span><div class="g flat">';
      if (dAyer.corazon) h += '<div class="row" style="margin-bottom:10px"><div class="grow"><div class="sub">Ayer sentiste:</div><div class="lbl" style="font-size:13px">' + esc(dAyer.corazon) + '</div></div><button class="chip' + (dAyer.corazonRes === 'ok' ? ' on' : '') + '" data-act="corazon" data-v="ok">✓</button><button class="chip' + (dAyer.corazonRes === 'no' ? ' on' : '') + '" data-act="corazon" data-v="no">✗</button></div>';
      h += '<input class="in" data-in="n.corazon" value="' + esc(d.corazon || '') + '" placeholder="¿Qué sabías antes de saberlo? Una corazonada"></div></div>';
      if (f.key === 'F3' || f.modo === 'VIDA') h += '<div class="sec"><span class="mini">🌑 Sombra · Jung</span><div class="g flat"><div class="lbl" style="font-size:14px;font-weight:400">' + esc(P.noche.sombra) + '</div><input class="in" data-in="n.sombra" style="margin-top:8px" value="' + esc(d.sombra || '') + '" placeholder="Si sale algo grande → Six Rites › Sombra del sábado"></div></div>';
    }
    var sen = viaje ? P.noche.senViaje : P.noche.sen;
    h += '<div class="sec"><span class="mini">⚔️ Sen · corta las vías de escape de mañana</span><div class="g flat stack">' + sen.map(function (t, i) {
      var on = (d.sen || []).indexOf(i) >= 0;
      return '<button class="row" data-act="sen" data-i="' + i + '" style="text-align:left"><span class="check' + (on ? ' on' : '') + '">' + (on ? '✓' : '') + '</span><span class="grow" style="font-size:14px">' + esc(t) + '</span></button>';
    }).join('') + '</div></div>';
    if (f.key === 'F3') {
      var man = MM.add(HOY, 1), op = (S.dias[man] && S.dias[man].ordenPropia) || '';
      h += '<div class="sec"><span class="mini">⚔️ Dicta tu orden de mañana</span><input class="in" data-in="orden-propia" value="' + esc(op) + '" placeholder="Mañana, sin negociar: …"></div>';
    }
    h += '<div class="sec">' + botonHecho('n', 'Cerrar el día → 🦅') + '</div>';
    abrirHoja(h, 'n');
  }

  /* ── 🔥 in vivo ── */
  function hojaInVivo() {
    var f = F(), d = B('v'), iv = MM.invivoDel(HOY, f);
    var emo = d.emo ? P.emociones.filter(function (e) { return e.k === d.emo; })[0] : (iv ? iv.emo : P.emociones[0]);
    var nivel = iv ? iv.nivel : (f.key === 'F1' ? 0 : f.key === 'F2' ? 1 : 2);
    var reto = d.reto || P.invivo.escalera[emo.k][Math.max(0, nivel)];
    var h = cabecera('🔥 In Vivo · HART · ' + emo.e + ' ' + emo.t, 'Exposición', 'voluntaria');
    h += '<div class="g accent" style="margin-top:14px"><div class="mini" style="text-transform:uppercase;letter-spacing:.16em">⚡ Nietzsche</div><div class="lbl" style="font-size:18px;font-weight:400;margin-top:6px">«' + esc(P.filosofos[2].q) + '»</div>' +
      '<div class="lbl" style="margin-top:14px;font-size:15px">' + esc(reto) + '</div><div class="sub" style="margin-top:6px">' + esc(P.invivo.regla) + '</div></div>';
    h += '<div class="sec"><span class="mini">Cambiar emoción</span><div class="chips">' + P.emociones.map(function (e) { return '<button class="chip' + (emo.k === e.k ? ' on' : '') + '" data-act="ivemo" data-v="' + e.k + '">' + e.e + ' ' + e.t + '</button>'; }).join('') + '</div></div>';
    ['antes', 'despues'].forEach(function (k) {
      var v = d[k] == null ? -1 : d[k];
      h += '<div class="sec"><span class="mini">Luna ' + (k === 'antes' ? 'antes' : 'después') + '</span><div class="g flat"><div class="lunas" style="margin-top:0">' + P.noche.lunas.map(function (l, i) { return '<button class="' + (i === v ? 'on' : '') + '" data-act="ivluna" data-k="' + k + '" data-i="' + i + '">' + l.e + '</button>'; }).join('') + '</div></div></div>';
    });
    h += '<div class="sec"><input class="in" data-in="v.nota" value="' + esc(d.nota || '') + '" placeholder="1 línea: qué pasó (opcional)"></div>';
    h += '<div class="sec"><button class="btn' + (d.done ? ' done' : '') + '" data-act="ivdone" data-emo="' + emo.k + '" data-reto="' + esc(reto) + '">' + (d.done ? '✓ Hecha · tocar para deshacer' : '🔥 La hice') + '</button></div>';
    abrirHoja(h, 'v');
  }

  /* ── ⚖︎ valores ── */
  function hojaValores() {
    var h = cabecera('⚖︎ Antes de decidir', 'Los valores', 'manejan');
    h += '<div class="g accent credo" style="margin-top:14px"><div class="c1">' + esc(P.credo.t).replace('. ', '.<br>') + '</div><div class="sub" style="margin-top:10px">' + esc(P.credo.s) + '</div><div class="mini" style="margin-top:8px">— ' + esc(P.credo.a) + '</div></div>';
    h += '<div class="sec"><span class="mini">Pregunta-filtro</span><div class="g flat"><div class="lbl" style="font-weight:400">«' + esc(P.filtro) + '»</div></div></div>';
    h += '<div class="sec"><span class="mini">Jerarquía · un valor inferior nunca rompe uno superior</span><div class="g flat stack">' + P.valores.map(function (v, i) {
      return '<div class="row"><div class="n" style="width:24px;font-size:11px;color:var(--t3)">' + (i + 1) + '</div><div style="font-size:18px">' + v.e + '</div><div class="grow"><div class="lbl" style="font-size:14px">' + v.t + '</div><div class="sub">' + v.r + '</div></div></div>';
    }).join('') + '<div class="sub" style="margin-top:4px">La comodidad no está en la lista.</div></div></div>';
    h += '<div class="sec"><span class="mini">Ritual de los tres filósofos</span><div class="stack">' + P.filosofos.map(function (p) {
      return '<div class="g flat"><div class="row"><div style="font-size:20px">' + p.e + '</div><div class="grow"><div class="mini" style="text-transform:uppercase;letter-spacing:.14em">' + p.t + '</div><div class="lbl" style="font-size:14px;font-weight:400;margin-top:3px">«' + esc(p.q) + '»</div></div></div></div>';
    }).join('') + '</div></div>';
    h += '<div class="sec" style="text-align:center"><div class="mini">☠️ Memento mori</div></div>';
    abrirHoja(h, 'valores');
  }

  function botonHecho(b, txt) {
    var done = D()[b] && D()[b].done;
    return '<button class="btn' + (done ? ' done' : '') + '" data-act="hecho" data-b="' + b + '">' + (done ? '✓ Hecho · tocar para deshacer' : (txt || '✓ Bloque hecho')) + '</button>' +
      (done ? '' : '<div class="sub" style="text-align:center;margin-top:8px">¿Poco tiempo? La versión de 2 min también cuenta.</div>');
  }

  /* ═══ CAMINO ═══ */
  function renderCamino() {
    var f = F();
    var h = '<div class="top"><div><div class="eyebrow">' + fechaCorta(P.inicio) + ' 2026 → por logro</div><div class="title">El <b>Camino</b></div></div></div>';
    h += '<div class="ph">' + P.fases.map(function (x, i) {
      var w = i < f.idx || f.modo === 'VIDA' ? 100 : i === f.idx ? Math.round(100 * Math.min(1, (f.dia || 0) / (f.total || 28))) : 0;
      return '<i><span style="width:' + w + '%;background:' + COL[x.id] + '"></span></i>';
    }).join('') + '<i><span style="width:' + (f.modo === 'VIDA' ? 100 : 0) + '%;background:' + COL.base + '"></span></i></div>';
    h += '<div class="row" style="justify-content:space-between;margin-top:6px">' + P.fases.map(function (x) { return '<span class="mini">' + x.nombre.toUpperCase() + '</span>'; }).join('') + '<span class="mini">♾️ VIDA</span></div>';
    h += '<div class="stack" style="margin-top:14px">';
    P.fases.forEach(function (x, i) {
      var sello = f.sellos[i], activa = f.idx === i && f.modo === 'FASE';
      var ini = sello ? sello.inicio : activa ? f.inicio : null, fin = sello ? sello.fin : activa ? f.fin : null;
      var estado = sello ? (sello.sellada ? '<span class="tag">✓ sellada</span>' : '<span class="tag">→ pasó</span>') : activa ? '<span class="tag" style="color:#fff;background:' + COL[x.id] + '55">activa</span>' : '<span style="opacity:.4">🔒</span>';
      var pm = P.manana.min[x.id], im = P.intelecto.min[x.id];
      h += '<div class="g' + (activa ? ' accent' : '') + '" style="padding:14px 16px;--fase:' + COL[x.id] + '"><div class="row"><div class="ico" style="background:' + COL[x.id] + '30;color:' + COL[x.id] + ';font-weight:700;font-size:13px">' + x.id + '</div>' +
        '<div class="grow"><div class="lbl">' + x.nombre + ' <span class="sub" style="font-size:11px">· ' + (ini ? fechaCorta(ini) + ' → ' + fechaCorta(MM.add(fin, -1)) : x.dias + ' días') + '</span></div><div class="sub">' + x.lema + ' · 🧘 ' + sum(pm) + ' · 📖 ' + sum(im) + ' · 🕯️ ' + P.noche.trataka[x.id] + ' · 🌙 ' + P.noche.min[x.id] + ' min</div></div>' + estado + '</div>';
      var req = '🏁 ≥' + Math.round(x.min * 100) + ' % días completos' + (x.noDobleCero ? ' · nunca 2 días en 0' : '') + (x.invivo ? ' · ≥' + x.invivo + ' In Vivo' : '') + (x.seisEmociones ? ' (las 6 emociones)' : '');
      h += '<div class="sub" style="margin-top:10px;color:var(--t2)">' + req + '</div>';
      var ev = sello ? sello.ev : activa ? f.parcial : null;
      if (ev) {
        h += '<div class="bar"><span style="width:' + Math.round(ev.pct * 100) + '%;background:' + COL[x.id] + '"></span></div><div class="row" style="justify-content:space-between;margin-top:4px"><span class="mini">' + ev.ok + '/' + ev.elegibles + ' días · ' + Math.round(ev.pct * 100) + ' %</span><span class="mini">🔥 ' + ev.invivo + (x.invivo ? '/' + x.invivo : '') + (x.seisEmociones ? ' · ' + ev.emociones + '/6 emociones' : '') + '</span></div>';
        if (activa && f.ext) h += '<div class="sub" style="margin-top:6px">⏳ Extendida +' + f.ext + ' semana(s): sin castigo, solo más camino.</div>';
      }
      h += '<div class="sub" style="margin-top:6px">📖 ' + esc(x.libro) + '</div></div>';
    });
    h += '<div class="g' + (f.modo === 'VIDA' ? ' accent' : '') + '" style="padding:14px 16px"><div class="row"><div class="ico">♾️</div><div class="grow"><div class="lbl">Modo Vida</div><div class="sub">El mismo ritual, en dosis de mantenimiento, para siempre. 🔥 1 In Vivo por semana.</div></div>' + (f.modo === 'VIDA' ? '<span class="tag">activo</span>' : '<span style="opacity:.4">🔒</span>') + '</div></div>';
    if (P.viaje) h += '<div class="g flat" style="padding:13px 16px"><div class="row"><div style="font-size:19px">✈️</div><div class="grow"><div class="lbl" style="font-size:13.5px">Modo viaje · ' + esc(P.viaje.nombre) + '</div><div class="sub">' + fechaCorta(P.viaje.desde) + ' → ' + fechaCorta(P.viaje.hasta) + ' · 🧘 7 min + 🌙 3 min = día completo · traslados no cuentan</div></div></div></div>';
    h += '<div class="g flat" style="padding:13px 16px"><div class="mini" style="text-transform:uppercase;letter-spacing:.16em">Revisión semanal · 10 min dentro de la W de SELF</div>' + P.revision.map(function (q, i) { return '<div class="sub" style="color:var(--t2);margin-top:6px">' + (i + 1) + '. ' + esc(q) + '</div>'; }).join('') + '</div>';
    if (!S.ocultar || !S.ocultar.limites) h += '<div class="g flat" style="padding:13px 44px 13px 16px"><button class="x" data-act="ocultar" data-k="limites" aria-label="Cerrar">✕</button><div class="mini" style="text-transform:uppercase;letter-spacing:.16em">⚠️ Límites</div><div class="sub" style="margin-top:6px">' + esc(P.limites) + '</div></div>';
    h += '</div>';
    $('#camino').innerHTML = h;
  }

  /* ═══ REGISTRO ═══ */
  function renderRegistro() {
    var r = MM.racha(S, HOY), cz = MM.corazonadas(S);
    var h = '<div class="top"><div><div class="eyebrow">Tu huella</div><div class="title">El <b>Registro</b></div></div></div>';
    h += '<div class="row" style="gap:10px;margin-top:14px;align-items:stretch">' +
      stat('🔥', r, 'días seguidos') + stat('🔮', cz.pct == null ? '—' : Math.round(cz.pct * 100) + '%', 'corazonadas') + stat('⚔️', contar(function (d) { return d.i && d.i.orden === 'ok'; }), 'órdenes ≤3 s') + '</div>';
    // 28 días
    h += '<div class="g" style="margin-top:10px"><div class="mini" style="text-transform:uppercase;letter-spacing:.16em">Últimos 28 días</div><div class="grid28">';
    for (var k = 27; k >= 0; k--) {
      var s = MM.add(HOY, -k), n = MM.bloques(S, s), c = MM.completo(S, s);
      var bg = s < P.inicio ? 'rgba(255,255,255,.02)' : c ? 'var(--fase)' : n ? 'rgba(214,194,161,' + (0.1 + n * 0.12) + ')' : 'rgba(255,255,255,.05)';
      var lun = S.dias[s] && S.dias[s].n && S.dias[s].n.luna != null ? P.noche.lunas[S.dias[s].n.luna].e : '';
      h += '<div title="' + s + '" style="background:' + bg + (s === HOY ? ';outline:1px solid var(--ch)' : '') + '">' + (MM.esTraslado(s) ? '✈️' : lun || new Date(MM.parse(s)).getUTCDate()) + '</div>';
    }
    h += '</div></div>';
    // emociones in vivo
    var porEmo = {}; P.emociones.forEach(function (e) { porEmo[e.k] = 0; });
    Object.keys(S.dias).forEach(function (s) { var v = S.dias[s].v; if (v && v.done && v.emo) porEmo[v.emo]++; });
    h += '<div class="g" style="margin-top:10px"><div class="mini" style="text-transform:uppercase;letter-spacing:.16em">🔥 Exposiciones In Vivo</div><div class="stack" style="margin-top:10px">' + P.emociones.map(function (e) {
      return '<div class="row"><span style="width:24px">' + e.e + '</span><span class="grow" style="font-size:13px">' + e.t + '</span><span class="mini">' + porEmo[e.k] + '</span></div>';
    }).join('') + '</div><button class="btn ghost" data-act="invivo-libre" style="margin-top:12px;padding:12px;font-size:13px">+ Exposición espontánea hoy</button></div>';
    var citas = Object.keys(S.dias).sort().reverse().map(function (s) { return S.dias[s].i && S.dias[s].i.cita ? [s, S.dias[s].i.cita] : null; }).filter(Boolean).slice(0, 8);
    if (citas.length) h += '<div class="g" style="margin-top:10px"><div class="mini" style="text-transform:uppercase;letter-spacing:.16em">📜 Citas del Sensei</div>' + citas.map(function (c) { return '<div class="sub" style="color:var(--t2);margin-top:8px">«' + esc(c[1]) + '» <span class="mini">· ' + fechaCorta(c[0]) + '</span></div>'; }).join('') + '</div>';
    $('#registro').innerHTML = h;
  }
  function stat(e, v, t) { return '<div class="g" style="flex:1;padding:13px;text-align:center"><div style="font-size:16px">' + e + '</div><div style="font-size:24px;font-weight:300;margin-top:2px">' + v + '</div><div class="mini">' + t + '</div></div>'; }
  function contar(fn) { return Object.keys(S.dias).filter(function (s) { return fn(S.dias[s]); }).length; }

  /* ═══ RESPALDO ═══ */
  function renderAjustes() {
    var n = Object.keys(S.dias).length;
    var h = '<div class="top"><div><div class="eyebrow">Tus datos viven en este iPhone</div><div class="title">Res<b>paldo</b></div></div></div>';
    h += '<div class="g" style="margin-top:14px"><div class="lbl">💾 Exportar respaldo</div><div class="sub">Descarga un archivo con todo (' + n + ' días). Guárdalo en Archivos o mándatelo.</div><button class="btn" data-act="export" style="margin-top:12px">Exportar</button></div>';
    h += '<div class="g" style="margin-top:10px"><div class="lbl">📥 Importar respaldo</div><div class="sub">Restaura un archivo exportado. Se combina con lo que ya hay; lo más nuevo gana por día.</div><label class="btn ghost" style="margin-top:12px">Elegir archivo<input type="file" accept="application/json,.json" data-act="import" class="hidden"></label></div>';
    h += '<div class="g flat" style="margin-top:10px"><div class="sub">📱 Usa siempre la app instalada desde el ícono: iOS separa los datos de Safari y de la app.<br>Último guardado: ' + (S.updated ? new Date(S.updated).toLocaleString('es-MX') : '—') + '</div></div>';
    h += '<div class="g flat" style="margin-top:10px"><div class="sub">📅 Calendarios: 🧘 vive en ☕ (MIND) · 📖 en MIND · 🌙 antes de 🦅 · 🔥 In Vivo en HART.</div></div>';
    $('#ajustes').innerHTML = h;
  }

  /* ═══ navegación y eventos ═══ */
  var tab = 'hoy';
  function render() {
    if (tab === 'hoy') renderHoy(); else if (tab === 'camino') renderCamino(); else if (tab === 'registro') renderRegistro(); else renderAjustes();
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('on', s.id === tab); });
    document.querySelectorAll('.nav button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tab); });
  }
  function reabrir() { if (hojaActual === 'm') hojaManana(); else if (hojaActual === 'i') hojaIntelecto(); else if (hojaActual === 'n') hojaNoche(); else if (hojaActual === 'v') hojaInVivo(); }
  function refrescarHoja() { var y = $('#sheet').scrollTop; var t = T; reabrir(); T = t; pintarTimer(); $('#sheet').scrollTop = y; }

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-act],[data-tab]'); if (!el) return;
    if (el.dataset.tab) { tab = el.dataset.tab; render(); $('#' + tab).scrollTop = 0; return; }
    var a = el.dataset.act, b = el.dataset.b, k = el.dataset.k, v = el.dataset.v;
    switch (a) {
      case 'abrir': if (b === 'm') hojaManana(); else if (b === 'i') hojaIntelecto(); else hojaNoche(); break;
      case 'invivo': hojaInVivo(); break;
      case 'invivo-libre': hojaInVivo(); break;
      case 'valores': hojaValores(); break;
      case 'cerrar': cerrarHoja(); break;
      case 'ocultar': S.ocultar = S.ocultar || {}; S.ocultar[k] = 1; guardar(); render(); break;
      case 'timer': iniciarTimer(el.dataset.id, +el.dataset.s); break;
      case 'timer-reset': T = null; T = { id: el.dataset.id, total: +el.dataset.s, acum: 0, corriendo: false }; pintarTimer(); var bt = document.querySelector('[data-timer="' + el.dataset.id + '"] [data-act="timer"]'); if (bt) bt.textContent = '▶︎ Iniciar'; break;
      case 'valor': B('m').valor = +el.dataset.i; guardar(); refrescarHoja(); break;
      case 'toggle': B(b)[k] = !B(b)[k]; guardar(); refrescarHoja(); break;
      case 'set': B(b)[k] = B(b)[k] === v ? null : v; guardar(); refrescarHoja(); break;
      case 'multi': var arr = B(b)[k] || []; var ix = arr.indexOf(v); if (ix >= 0) arr.splice(ix, 1); else arr.push(v); B(b)[k] = arr; guardar(); refrescarHoja(); break;
      case 'luna': var n = B('n'); n.luna = n.luna === +el.dataset.i ? null : +el.dataset.i; guardar(); refrescarHoja(); break;
      case 'corazon': var ay = B('n', MM.add(HOY, -1)); ay.corazonRes = ay.corazonRes === v ? null : v; guardar(); refrescarHoja(); break;
      case 'sen': var nn = B('n'); nn.sen = nn.sen || []; var si = nn.sen.indexOf(+el.dataset.i); if (si >= 0) nn.sen.splice(si, 1); else nn.sen.push(+el.dataset.i); guardar(); refrescarHoja(); break;
      case 'hecho':
        var bb = B(b); bb.done = !bb.done; bb.t = bb.done ? new Date().toISOString() : null;
        if (b === 'm' && bb.pres == null) bb.pres = 3;
        guardar();
        if (bb.done) { toast(b === 'n' ? '🦅 Día cerrado. ' + P.credo.t : '✓ ' + ({ m: '🧘 Conciencia', i: '📖 Intelecto' }[b]) + ' hecho'); cerrarHoja(); } else refrescarHoja();
        break;
      case 'ivemo': var vv = B('v'); vv.emo = v; var ff = F(); var nv = ff.key === 'F1' ? 0 : ff.key === 'F2' ? 1 : 2; vv.reto = P.invivo.escalera[v][nv]; guardar(); refrescarHoja(); break;
      case 'ivluna': var v2 = B('v'); v2[k] = v2[k] === +el.dataset.i ? null : +el.dataset.i; guardar(); refrescarHoja(); break;
      case 'ivdone': var v3 = B('v'); v3.done = !v3.done; if (!v3.emo) v3.emo = el.dataset.emo; if (!v3.reto) v3.reto = el.dataset.reto; guardar(); if (v3.done) { toast('🔥 Hecha. Eso es osadía.'); cerrarHoja(); } else refrescarHoja(); break;
      case 'export': exportar(); break;
    }
  });
  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (el.dataset.act === 'import' && el.files && el.files[0]) importar(el.files[0]);
  });
  document.addEventListener('input', function (ev) {
    var el = ev.target, k = el.dataset.in; if (!k) return;
    if (k === 'orden-propia') { D(MM.add(HOY, 1)).ordenPropia = el.value.trim() || null; }
    else { var p = k.split('.'); B(p[0])[p[1]] = el.value; }
    guardar();
  });
  $('#veil').addEventListener('click', cerrarHoja);

  /* slider con perilla (toque y arrastre) */
  function sliderDesde(ev) {
    var sl = ev.target.closest('[data-slider]'); if (!sl) return null;
    return sl;
  }
  function moverSlider(sl, x) {
    var r = sl.getBoundingClientRect(), p = Math.max(0, Math.min(1, (x - r.left) / r.width));
    var val = Math.round(p * 4) + 1, pct = (val - 1) / 4 * 100;
    sl.querySelector('.fill').style.width = pct + '%'; sl.querySelector('.knob').style.left = pct + '%';
    B('m').pres = val; guardar();
  }
  var arrastre = null;
  document.addEventListener('pointerdown', function (ev) { var sl = sliderDesde(ev); if (!sl) return; arrastre = sl; moverSlider(sl, ev.clientX); });
  document.addEventListener('pointermove', function (ev) { if (arrastre) moverSlider(arrastre, ev.clientX); });
  document.addEventListener('pointerup', function () { arrastre = null; });

  function exportar() {
    var blob = new Blob([JSON.stringify({ app: 'MENTE MV', key: KEY, exportado: new Date().toISOString(), state: S }, null, 1)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mente-mv-respaldo-' + HOY + '.json';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast('💾 Respaldo exportado');
  }
  function importar(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var j = JSON.parse(r.result), st = MM.migrar(j.state || j);
        Object.keys(st.dias).forEach(function (s) {
          var a = S.dias[s], b = st.dias[s];
          if (!a) { S.dias[s] = b; return; }
          ['m', 'i', 'n', 'v'].forEach(function (bk) {
            if (!b[bk]) return; if (!a[bk]) { a[bk] = b[bk]; return; }
            if ((b[bk].t || '') > (a[bk].t || '') || (!a[bk].done && b[bk].done)) a[bk] = b[bk];
          });
          if (b.ordenPropia && !a.ordenPropia) a.ordenPropia = b.ordenPropia;
        });
        guardar(); render(); toast('📥 Respaldo importado');
      } catch (e) { toast('⚠️ Archivo no válido'); }
    };
    r.readAsText(file);
  }

  /* cambio de día con la app abierta */
  setInterval(function () { var h = hoyStr(); if (h !== HOY) { HOY = h; if (!hojaActual) render(); } else if (!hojaActual && tab === 'hoy') renderHoy(); }, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { HOY = hoyStr(); if (!hojaActual) render(); else pintarTimer(); if (T && T.corriendo) tick(); } });

  window.__MM_UI = { S: function () { return S; }, render: render, abrir: function (b) { if (b === 'v') hojaInVivo(); else if (b === 'valores') hojaValores(); else ({ m: hojaManana, i: hojaIntelecto, n: hojaNoche })[b](); }, cerrar: cerrarHoja, tab: function (t) { tab = t; render(); } };
  var q = /[?&]tab=(\w+)/.exec(location.search); if (q) tab = q[1];
  render();
})();
