/* ═══ MENTE MV · motor (puro, sin DOM) ═══ */
(function (root) {
  'use strict';
  var P = null;
  var DAY = 86400000;

  function setProtocolo(p) { P = p; }
  function parse(s) { var a = s.split('-'); return Date.UTC(+a[0], +a[1] - 1, +a[2]); }
  function fmt(t) { var d = new Date(t); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); }
  function add(s, n) { return fmt(parse(s) + n * DAY); }
  function diff(a, b) { return Math.round((parse(b) - parse(a)) / DAY); } // b - a en días
  function dow(s) { return new Date(parse(s)).getUTCDay(); }
  /* El día de MENTE cambia a las 04:00 (la noche del viernes/sábado cierra después de medianoche) */
  function hoyLocal(now) {
    var d = new Date((now || Date.now()) - 4 * 3600000);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function enViaje(s) { var v = P.viaje; return v && s >= v.desde && s <= v.hasta; }
  function esTraslado(s) { return !!(P.viaje && P.viaje.traslado.indexOf(s) >= 0); }

  function dia(state, s) { return (state && state.dias && state.dias[s]) || {}; }
  function bloques(state, s) {
    var d = dia(state, s);
    return (d.m && d.m.done ? 1 : 0) + (d.i && d.i.done ? 1 : 0) + (d.n && d.n.done ? 1 : 0);
  }
  /* Día completo: 3/3. En viaje basta 🧘 + 🌙 (📖 opcional). */
  function completo(state, s) {
    var d = dia(state, s);
    if (enViaje(s)) return !!(d.m && d.m.done && d.n && d.n.done);
    return bloques(state, s) === 3;
  }
  function elegible(s) { return !esTraslado(s); }

  function evalFase(state, idx, ini, fin) {
    var f = P.fases[idx], n = diff(ini, fin), ok = 0, eleg = 0, doble = false, prevCero = false;
    var iv = 0, emos = {};
    for (var k = 0; k < n; k++) {
      var s = add(ini, k);
      var d = dia(state, s);
      if (d.v && d.v.done) { iv++; if (d.v.emo) emos[d.v.emo] = 1; }
      if (!elegible(s)) { continue; }
      eleg++;
      if (completo(state, s)) ok++;
      var cero = bloques(state, s) === 0;
      if (cero && prevCero) doble = true;
      prevCero = cero;
    }
    var pct = eleg ? ok / eleg : 0;
    var nEmos = Object.keys(emos).length;
    var cumple = pct >= f.min - 1e-9 && iv >= f.invivo && (!f.seisEmociones || nEmos >= 6) && (!f.noDobleCero || !doble);
    return { pct: pct, ok: ok, elegibles: eleg, invivo: iv, emociones: nEmos, dobleCero: doble, cumple: cumple };
  }

  /* Fase actual: avanza por logro. Fecha = meta; si no se cumple, +7 días (máx. 4). */
  function fase(state, hoy) {
    var s = P.inicio, sellos = [];
    if (hoy < s) return { modo: 'PRE', idx: -1, key: 'F1', faltan: diff(hoy, s), inicio: s, sellos: sellos, dosis: 'F1' };
    for (var idx = 0; idx < P.fases.length; idx++) {
      var f = P.fases[idx];
      for (var ext = 0; ; ext++) {
        var fin = add(s, f.dias + ext * P.extensionDias);
        if (hoy < fin) {
          var dEn = diff(s, hoy);
          return {
            modo: 'FASE', idx: idx, key: f.id, fase: f, inicio: s, fin: fin, ext: ext,
            dia: dEn + 1, semana: Math.floor(dEn / 7) + 1, total: diff(s, fin),
            parcial: evalFase(state, idx, s, add(hoy, 0)), sellos: sellos,
            dosis: enViaje(hoy) ? 'VIAJE' : f.id
          };
        }
        var ev = evalFase(state, idx, s, fin);
        if (ev.cumple || ext >= P.maxExtensiones) {
          sellos.push({ id: f.id, inicio: s, fin: fin, ext: ext, sellada: ev.cumple, ev: ev });
          s = fin; break;
        }
      }
    }
    return { modo: 'VIDA', idx: P.fases.length, key: 'VIDA', inicio: s, dia: diff(s, hoy) + 1, sellos: sellos, dosis: enViaje(hoy) ? 'VIAJE' : 'VIDA' };
  }

  function hora(bloque, s) {
    var h = P.horario[bloque], w = String(dow(s));
    if (h.desdeEne && s >= '2027-01-01' && h.desdeEne[w]) return h.desdeEne[w];
    return h[w];
  }
  function aMin(hhmm) { var a = hhmm.split(':'); return +a[0] * 60 + +a[1]; }

  function ordenDel(state, s, dosis) {
    var d = dia(state, s);
    if ((dosis === 'F3') && d.ordenPropia) return { t: d.ordenPropia, propia: true };
    var lista = P.intelecto.ordenes[dosis] || P.intelecto.ordenes.F1;
    var i = ((diff(P.inicio, s) % lista.length) + lista.length) % lista.length;
    return { t: lista[i], propia: false };
  }

  /* In Vivo programado: días por fase; emoción rota 2 por semana (mié, vie) */
  function invivoDel(s, f) {
    var dias = P.invivo.dias[f.dosis] || [];
    var w = dow(s);
    if (dias.indexOf(w) < 0) return null;
    var semana = Math.floor(diff(P.inicio, s) / 7);
    var k = ((semana * 2 + (w === 5 ? 1 : 0)) % 6 + 6) % 6;
    var emo = P.emociones[k];
    var nivel = f.key === 'F1' ? 0 : f.key === 'F2' ? 1 : 2;
    return { emo: emo, nivel: nivel, reto: P.invivo.escalera[emo.k][nivel] };
  }

  function racha(state, hoy) {
    var r = 0, s = completo(state, hoy) ? hoy : add(hoy, -1);
    for (var k = 0; k < 400; k++) {
      if (s < P.inicio) break;
      if (!elegible(s)) { s = add(s, -1); continue; }
      if (!completo(state, s)) break;
      r++; s = add(s, -1);
    }
    return r;
  }

  function corazonadas(state) {
    var a = 0, n = 0;
    Object.keys(state.dias || {}).forEach(function (s) {
      var c = state.dias[s].n && state.dias[s].n.corazonRes;
      if (c === 'ok' || c === 'no') { n++; if (c === 'ok') a++; }
    });
    return { aciertos: a, total: n, pct: n ? a / n : null };
  }

  /* Migración: las llaves nunca cambian; solo se agregan campos */
  function migrar(raw) {
    var s = raw && typeof raw === 'object' ? raw : {};
    if (!s.dias || typeof s.dias !== 'object') s.dias = {};
    if (!Array.isArray(s.citas)) s.citas = [];
    s.v = 1;
    return s;
  }

  root.MM = {
    setProtocolo: setProtocolo, parse: parse, fmt: fmt, add: add, diff: diff, dow: dow, hoyLocal: hoyLocal,
    enViaje: enViaje, esTraslado: esTraslado, dia: dia, bloques: bloques, completo: completo,
    evalFase: evalFase, fase: fase, hora: hora, aMin: aMin, ordenDel: ordenDel, invivoDel: invivoDel,
    racha: racha, corazonadas: corazonadas, migrar: migrar
  };
})(typeof window !== 'undefined' ? window : globalThis);
