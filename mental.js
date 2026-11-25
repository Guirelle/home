/* =====================================================================
   MATIÈRE : Calcul mental (+ − × ÷, nombres entiers et à virgule)
   Niveau 1 : sans passage de la dizaine, le nombre cherché est le résultat
   Niveau 2 : sans passage de la dizaine, le nombre cherché est n'importe où
   Niveau 3 : avec passage de la dizaine, le nombre cherché est le résultat
   Niveau 4 : avec passage de la dizaine, le nombre cherché est n'importe où
   ===================================================================== */
const MATIERE = (() => {
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const R = x => Math.round(x * 10000) / 10000;
  const fmt = x => String(R(x)).replace(".", ",");
  const SIGNE = { "+": "+", "-": "−", "x": "×", "/": "÷" };
  const NIV = ["sans passage de la dizaine", "nombre caché, sans passage", "avec passage de la dizaine", "nombre caché, avec passage"];
  const COUL = ["#2b8a3e", "#1971c2", "#e8590c", "#c2255c"];
  const SORTES = { as: "+ et −", md: "× et ÷", dec: "Nombres à virgule" };
  const GROUPES = [1, 2, 3, 4].map(n => ({ nom: `Niveau ${n} · ${NIV[n - 1]}`, c: COUL[n - 1], t: ["as", "md", "dec"].map(k => k + n) }));
  const decimal = x => R(x) !== Math.round(x);
  const nbDec = x => (String(R(x)).split(".")[1] || "").length;

  /* ---------- tirage des calculs ---------- */
  function avecPassage(L) { return L >= 3 && (L === 3 || Math.random() < .8); }
  function tirAS(L) {
    const p = avecPassage(L), op = rnd(["+", "-"]);
    for (;;) {
      if (op === "+") {
        let t1, u1, t2, u2;
        if (!p) { t1 = ri(1, 8); u1 = ri(0, 8); t2 = ri(0, 8 - t1); u2 = ri(0, 9 - u1); }
        else { u1 = ri(1, 9); u2 = ri(10 - u1, 9); t1 = ri(1, 7); t2 = ri(0, 8 - t1); }
        const a = 10 * t1 + u1, b = 10 * t2 + u2; if (b < 2) continue;
        return { op, a, b, c: a + b };
      }
      let t1, u1, t2, u2;
      if (!p) { t1 = ri(2, 9); u1 = ri(1, 9); t2 = ri(0, t1 - 1); u2 = ri(0, u1); }
      else { u1 = ri(0, 8); u2 = ri(u1 + 1, 9); t1 = ri(2, 9); t2 = ri(0, t1 - 1); }
      const a = 10 * t1 + u1, b = 10 * t2 + u2; if (b < 2 || a - b < 1) continue;
      return { op, a, b, c: a - b };
    }
  }
  function tirMD(L) {
    const p = avecPassage(L), mult = Math.random() < .5;
    if (!p) { const x = ri(2, 10), y = ri(2, 10); return mult ? { op: "x", a: x, b: y, c: x * y } : { op: "/", a: x * y, b: x, c: y }; }
    const sorte = rnd(["2c", "2c", "dix", "div", "div"]);
    if (sorte === "dix") { const m = ri(2, 99), q = rnd([10, 100]); return mult ? { op: "x", a: m, b: q, c: m * q } : { op: "/", a: m * q, b: q, c: m }; }
    if (mult) { const k = ri(2, 9), m = ri(11, Math.floor(200 / k)); return Math.random() < .5 ? { op: "x", a: m, b: k, c: m * k } : { op: "x", a: k, b: m, c: m * k }; }
    const b = ri(2, 6), q = ri(11, Math.floor(99 / b)); return { op: "/", a: b * q, b, c: q };
  }
  function tirDEC(L) {
    const p = avecPassage(L), sorte = p ? rnd(["as", "as", "as", "p10", "md", "md"]) : rnd(["as", "as", "as", "p10"]);
    if (sorte === "p10") {
      const q = p ? rnd([10, 100, 1000]) : rnd([10, 100]);
      if (Math.random() < .5) { const x = p ? R(ri(1, 999) / 100) : R(ri(1, 99) / 10); if (!decimal(x)) return tirDEC(L); return { op: "x", a: x, b: q, c: R(x * q) }; }
      // division : au plus 3 chiffres après la virgule dans la réponse
      const x = q === 1000 ? ri(1, 999) : q === 100 ? (p ? R(ri(1, 999) / 10) : ri(1, 99)) : (p ? R(ri(1, 999) / 100) : R(ri(1, 99) / 10));
      return { op: "/", a: x, b: q, c: R(x / q) };
    }
    if (sorte === "md") {
      if (Math.random() < .5) { const m = R(ri(1, 39) / 10), k = ri(2, 9); if (!decimal(m)) return tirDEC(L); return { op: "x", a: m, b: k, c: R(m * k) }; }
      const c = R(ri(2, 39) / 10), b = ri(2, 5); if (!decimal(c)) return tirDEC(L); return { op: "/", a: R(c * b), b, c };
    }
    const op = rnd(["+", "-"]);
    for (;;) {
      let i1, d1, i2, d2;
      if (op === "+") {
        if (!p) { i1 = ri(0, 8); d1 = ri(0, 8); i2 = ri(0, 9 - i1 - 1); d2 = ri(0, 9 - d1); }
        else { d1 = ri(1, 9); d2 = ri(10 - d1, 9); i1 = ri(0, 8); i2 = ri(0, 8 - i1); }
        const a = R(i1 + d1 / 10), b = R(i2 + d2 / 10);
        if (!a || !b || (!decimal(a) && !decimal(b))) continue;
        return { op, a, b, c: R(a + b) };
      }
      if (!p) { i1 = ri(1, 9); d1 = ri(1, 9); i2 = ri(0, i1); d2 = ri(0, d1); }
      else { d1 = ri(0, 8); d2 = ri(d1 + 1, 9); i1 = ri(1, 9); i2 = ri(0, i1 - 1); }
      const a = R(i1 + d1 / 10), b = R(i2 + d2 / 10);
      if (!b || a - b <= 0 || (!decimal(a) && !decimal(b))) continue;
      return { op, a, b, c: R(a - b) };
    }
  }

  /* ---------- droite des nombres ---------- */
  // sauts : [{de, a, lab}] ; dessine les sauts en arcs au-dessus d'une droite graduée
  function droite(sauts) {
    const W = 360, H = 132, y = 92, x0 = 18, x1 = W - 18;
    const pts = [...new Set(sauts.flatMap(s => [R(s.de), R(s.a)]))].sort((p, q) => p - q);
    let mn = pts[0], mx = pts[pts.length - 1]; if (mn === mx) mx = mn + 1;
    const X = v => x0 + (v - mn) / (mx - mn) * (x1 - x0);
    const pas = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000].find(s => (mx - mn) / s <= 20) || 10000;
    let g = `<line x1="${x0 - 8}" y1="${y}" x2="${x1 + 10}" y2="${y}" stroke="#495057" stroke-width="2"/><path d="M${x1 + 10} ${y} l-7 -4 v8z" fill="#495057"/>`;
    for (let v = Math.ceil(mn / pas) * pas; v <= mx + 1e-9; v = R(v + pas)) g += `<line x1="${X(v)}" y1="${y - 4}" x2="${X(v)}" y2="${y + 4}" stroke="#adb5bd"/>`;
    let dernier = -99, rang = 0;
    pts.forEach(v => { const x = X(v); rang = x - dernier < 30 ? 1 - rang : 0; dernier = x;
      g += `<circle cx="${x}" cy="${y}" r="4" fill="#343a40"/><text x="${x}" y="${y + 18 + rang * 14}" font-size="12" text-anchor="middle" fill="#343a40" font-weight="700">${fmt(v)}</text>`; });
    let dl = -99, rl = 0;
    sauts.forEach(s => {
      const xa = X(s.de), xb = X(s.a), m = (xa + xb) / 2, h = Math.max(16, Math.min(46, Math.abs(xb - xa) * .55));
      const dir = xb >= xa ? 1 : -1;
      g += `<path d="M${xa} ${y - 3} Q ${m} ${y - 3 - 2 * h} ${xb} ${y - 3}" fill="none" stroke="var(--c,#7048e8)" stroke-width="2.5"/>`;
      g += `<path d="M${xb} ${y - 3} l${-dir * 7} -5 l${dir * 1} 7z" fill="var(--c,#7048e8)"/>`;
      rl = Math.abs(m - dl) < 34 ? 1 - rl : 0; dl = m;
      g += `<text x="${m}" y="${y - 6 - h - rl * 13}" font-size="12.5" text-anchor="middle" fill="var(--c,#7048e8)" font-weight="800">${s.lab}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Droite des nombres">${g}</svg>`;
  }

  // tableau des rangs pour × et ÷ par 10, 100, 1000
  function rangs(x, y, op, p) {
    const k = Math.round(Math.log10(p)), cols = ["milliers", "centaines", "dizaines", "unités", "dixièmes", "centièmes", "millièmes", "dix-millièmes"];
    const pos = v => { const [e, d = ""] = String(R(v)).split("."); const m = {}; e.split("").reverse().forEach((c, i) => m[3 - i] = c); d.split("").forEach((c, i) => m[4 + i] = c); return m; };
    const A = pos(x), B = pos(y), idx = [...Object.keys(A), ...Object.keys(B)].map(Number);
    const lo = Math.min(...idx, 3), hi = Math.max(...idx, 3);
    const ligne = (m, lab) => `<tr><th>${lab}</th>${cols.slice(lo, hi + 1).map((_, i) => `<td class="${lo + i === 4 ? "vg" : ""}">${m[lo + i] !== undefined ? m[lo + i] : (lo + i === 3 ? "0" : "")}</td>`).join("")}</tr>`;
    return `<table class="rangs"><tr><th></th>${cols.slice(lo, hi + 1).map(c => `<th>${c}</th>`).join("")}</tr>${ligne(A, fmt(x))}${ligne(B, fmt(y))}</table>
      <p>${op === "x" ? `× ${p} : chaque chiffre avance de <b>${k} rang${k > 1 ? "s" : ""} vers la gauche</b> (il vaut ${p} fois plus).` : `÷ ${p} : chaque chiffre recule de <b>${k} rang${k > 1 ? "s" : ""} vers la droite</b> (il vaut ${p} fois moins).`} Le trait rouge marque la virgule.</p>`;
  }

  /* ---------- explication d'un calcul x op y = z ---------- */
  function strategie(op, x, y) {
    const z = R(op === "+" ? x + y : op === "-" ? x - y : op === "x" ? x * y : x / y);
    const B = (decimal(x) || decimal(y) || decimal(z)) && (op === "+" || op === "-") ? 1 : 10; // « dizaine » : 10, ou 1 unité pour les dixièmes
    const sauts = [], etapes = [];
    if (op === "+" || op === "-") {
      const s = op === "+" ? 1 : -1, gros = Math.floor(R(y / B)) * B, petit = R(y - gros); let cur = x;
      const saut = (d, quoi) => { const n = R(cur + s * d); sauts.push({ de: cur, a: n, lab: (s > 0 ? "+" : "−") + fmt(d) }); etapes.push(`${fmt(cur)} ${s > 0 ? "+" : "−"} ${fmt(d)} = <b>${fmt(n)}</b>${quoi ? ` <small>(${quoi})</small>` : ""}`); cur = n; };
      if (gros > 0) saut(gros, B === 10 ? "les dizaines" : "les unités");
      if (petit > 0) {
        const reste = R(cur - Math.floor(R(cur / B)) * B), compl = s > 0 ? R(B - reste) : reste;
        if (reste > 0 && petit > compl) { saut(compl, `jusqu'à ${fmt(R(cur + s * compl))}`); saut(R(petit - compl), "le reste"); }
        else saut(petit, B === 10 ? "les unités" : "les dixièmes");
      }
      return { z, html: `<ol>${etapes.map(e => `<li>${e}</li>`).join("")}</ol>${droite(sauts)}` };
    }
    const P = [10, 100, 1000];
    if (op === "x" && (P.includes(x) || P.includes(y))) { const p = P.includes(y) ? y : x, v = p === y ? x : y; return { z, html: rangs(v, z, "x", p) }; }
    if (op === "/" && P.includes(y)) return { z, html: rangs(x, z, "/", y) };
    if (op === "x") {
      let k = !decimal(y) && y <= 10 ? y : x, m = k === y ? x : y; // k sauts de m
      if (decimal(k) || k > 10) { [k, m] = [m, k]; }
      if (m <= 10 || (decimal(m) && m < 10)) {
        let cur = 0; for (let i = 0; i < k; i++) { const n = R(cur + m); sauts.push({ de: cur, a: n, lab: "+" + fmt(m) }); cur = n; }
        return { z, html: `<p>${fmt(k)} × ${fmt(m)}, c'est <b>${fmt(k)} sauts de ${fmt(m)}</b> : ${sauts.map(s => fmt(s.a)).join(" ; ")}.</p>${droite(sauts)}` };
      }
      const gros = Math.floor(m / 10) * 10, petit = R(m - gros), g1 = gros * k, g2 = R(petit * k);
      sauts.push({ de: 0, a: g1, lab: `${fmt(gros)} × ${k}` }); if (petit) sauts.push({ de: g1, a: R(g1 + g2), lab: `${fmt(petit)} × ${k}` });
      return { z, html: `<p>On décompose : ${fmt(m)} × ${k} = ${fmt(gros)} × ${k} + ${fmt(petit)} × ${k} = ${fmt(g1)} + ${fmt(g2)} = <b>${fmt(z)}</b></p>${droite(sauts)}` };
    }
    // division : combien de sauts de y pour arriver à x ?
    if (!decimal(z) && z <= 10) {
      let cur = 0; for (let i = 0; i < z; i++) { const n = R(cur + y); sauts.push({ de: cur, a: n, lab: "+" + fmt(y) }); cur = n; }
      return { z, html: `<p>${fmt(x)} ÷ ${fmt(y)} : combien de <b>sauts de ${fmt(y)}</b> pour arriver à ${fmt(x)} ? On en compte <b>${fmt(z)}</b>.</p>${droite(sauts)}` };
    }
    const gros = decimal(z) ? Math.floor(z) : Math.floor(z / 10) * 10, petit = R(z - gros), v1 = R(gros * y);
    if (gros) sauts.push({ de: 0, a: v1, lab: `${fmt(gros)} × ${fmt(y)}` });
    sauts.push({ de: v1, a: x, lab: `${fmt(petit)} × ${fmt(y)}` });
    return { z, html: `<p>${fmt(x)} ÷ ${fmt(y)} : on cherche combien de fois ${fmt(y)}. ${gros ? `${fmt(gros)} fois ${fmt(y)} = ${fmt(v1)}, ` : ""}il reste ${fmt(R(x - v1))} = ${fmt(petit)} fois ${fmt(y)}. Donc ${fmt(gros)} + ${fmt(petit)} = <b>${fmt(z)}</b>.</p>${droite(sauts)}` };
  }
  function explication(cal, manque) {
    const { op, a, b, c } = cal; let o2 = op, x = a, y = b, phrase = "";
    if (manque === "a") {
      if (op === "+") { o2 = "-"; x = c; y = b; } else if (op === "-") { o2 = "+"; x = c; y = b; } else if (op === "x") { o2 = "/"; x = c; y = b; } else { o2 = "x"; x = c; y = b; }
    } else if (manque === "b") {
      if (op === "+") { o2 = "-"; x = c; y = a; } else if (op === "-") { o2 = "-"; x = a; y = c; } else if (op === "x") { o2 = "/"; x = c; y = a; } else { o2 = "/"; x = a; y = c; }
    }
    if (manque !== "c") phrase = `<p>Le nombre caché se trouve avec l'<b>opération inverse</b> : on calcule <b>${fmt(x)} ${SIGNE[o2]} ${fmt(y)}</b>.</p>`;
    const st = strategie(o2, x, y);
    return phrase + st.html;
  }

  /* ---------- questions ---------- */
  const tagT = t => { const L = +t.slice(-1); return `<span class="tag" style="--c:${COUL[L - 1]}">${SORTES[t.slice(0, -1)]} · niveau ${L}</span>`; };
  function ecrire(cal, manque, rep) {
    const v = { a: fmt(cal.a), b: fmt(cal.b), c: fmt(cal.c) }; v[manque] = rep;
    return `${v.a} ${SIGNE[cal.op]} ${v.b} = ${v.c}`;
  }
  function generer(t, o = {}) {
    const L = +t.slice(-1), sorte = t.slice(0, -1);
    const cal = sorte === "as" ? tirAS(L) : sorte === "md" ? tirMD(L) : tirDEC(L);
    const manque = (L === 2 || L === 4) ? rnd(["a", "b", "c", "c"]) : "c";
    const val = cal[manque], dec = [cal.a, cal.b, cal.c].some(decimal);
    const base = {
      theme: t, numerique: true, decimal: dec, nombre: val, ok: [fmt(val)],
      ligne: ecrire(cal, manque, "___"), solution: ecrire(cal, manque, `<b>${fmt(val)}</b>`),
      explication: explication(cal, manque)
    };
    const q = Object.assign({}, base, {
      type: "saisie", genre: "calcul", consigne: manque === "c" ? "Calcule" : "Trouve le nombre caché",
      enonce: tagT(t) + `<div class="big" style="font-size:30px">${base.ligne}</div>`
    });
    if (!o.papier && !o.type && Math.random() < .2) {
      const pas = dec ? (nbDec(val) > 1 ? 0.01 : 0.1) : 1;
      const d = new Set([val + pas, val - pas, val + 10 * pas, val - 10 * pas, val * 10, val / 10].map(R).filter(x => x > 0 && x !== R(val)));
      const opts = shuffle([R(val), ...shuffle([...d]).slice(0, 3)]).map(fmt);
      Object.assign(q, { type: "qcm", genre: "qcm", consigne: "Choisis le bon nombre", options: opts, bonne: [fmt(val)] });
      delete q.nombre;
    }
    return q;
  }

  /* ---------- rappels et synthèses ---------- */
  const RAPPEL = {
    as1: "Sans passer la dizaine : dizaines avec dizaines, unités avec unités. 34 + 25 → 30 + 20 = 50 et 4 + 5 = 9 → 59.",
    md1: "Ce sont les tables ! La division est le contraire de la multiplication : 42 ÷ 6 = ? ↔ 6 × ? = 42.",
    dec1: "Unités avec unités, dixièmes avec dixièmes : 3,2 + 1,5 = 4,7. × 10 : chaque chiffre avance d'un rang vers la gauche (2,5 × 10 = 25).",
    as3: "On passe par la dizaine : 37 + 8 = 37 + 3 + 5 = 45 · 52 − 7 = 52 − 2 − 5 = 45.",
    md3: "On décompose : 23 × 4 = 20 × 4 + 3 × 4 = 80 + 12 = 92 · 84 ÷ 4 = 80 ÷ 4 + 4 ÷ 4 = 20 + 1 = 21.",
    dec3: "10 dixièmes = 1 unité : 2,7 + 0,5 = 2,7 + 0,3 + 0,2 = 3,2 · 1,2 × 3 = 3 sauts de 1,2 = 3,6."
  };
  const INV = "<br><b>Nombre caché ?</b> Opération inverse : ? + 25 = 59 → 59 − 25 · ? − 7 = 45 → 45 + 7 · 6 × ? = 42 → 42 ÷ 6 · ? ÷ 4 = 21 → 21 × 4.";
  const rappel = t => { const L = +t.slice(-1), s = t.slice(0, -1); return RAPPEL[s + (L <= 2 ? 1 : 3)] + (L === 2 || L === 4 ? INV : ""); };
  const EX = {
    1: { as: [["+", 34, 25], ["-", 58, 23]], md: [["x", 6, 4], ["/", 42, 6]], dec: [["+", 3.2, 1.5], ["-", 5.8, 2.3], ["x", 2.5, 10]] },
    3: { as: [["+", 37, 48], ["-", 52, 27]], md: [["x", 23, 4], ["/", 84, 4], ["x", 35, 100]], dec: [["+", 2.7, 1.5], ["-", 4.3, 1.8], ["x", 1.2, 3], ["/", 4.8, 2], ["/", 3.6, 100]] }
  };
  const PIEGES = {
    as: ["En soustraction, on enlève toujours au premier nombre : 52 − 7 = 45 (et pas 55).", "Vérifie avec l'opération inverse : 45 + 7 = 52 ✔"],
    md: ["Une division se vérifie par une multiplication : 84 ÷ 4 = 21 car 21 × 4 = 84.", "× 10 n'est pas « ajouter un zéro » pour les nombres à virgule : 2,5 × 10 = 25."],
    dec: ["10 dixièmes font 1 unité : 0,7 + 0,3 = 1.", "2,5 × 10 = 25 (et pas 2,50) : c'est la virgule qui bouge, pas un zéro qu'on ajoute.", "Avec un nombre entier, la virgule est cachée : 3 = 3,0 → 3 − 0,4 = 2,6."]
  };
  function synthese(t) {
    const L = +t.slice(-1), s = t.slice(0, -1), ex = EX[L <= 2 ? 1 : 3][s];
    let h = `<h1>${SORTES[s]} · niveau ${L}</h1><section><h2>🎯 Ce qu'on travaille</h2><p>${NIV[L - 1]} · ${rappel(t)}</p></section>`;
    h += `<section><h2>📏 Sur la droite des nombres</h2>${ex.map(([op, x, y]) => { const st = strategie(op, x, y); return `<div class="explic" style="--c:var(--c)"><b>${fmt(x)} ${SIGNE[op]} ${fmt(y)} = ${fmt(st.z)}</b>${st.html}</div>`; }).join("")}</section>`;
    if (L === 2 || L === 4) h += `<section><h2>🕵️ Le nombre caché</h2><table class="term"><tr><th>Si on cherche…</th><th>on calcule</th></tr>
      <tr><td>? + 25 = 59</td><td>59 − 25 = 34</td></tr><tr><td>34 + ? = 59</td><td>59 − 34 = 25</td></tr>
      <tr><td>? − 7 = 45</td><td>45 + 7 = 52</td></tr><tr><td>52 − ? = 45</td><td>52 − 45 = 7</td></tr>
      <tr><td>? × 6 = 42</td><td>42 ÷ 6 = 7</td></tr><tr><td>? ÷ 4 = 21</td><td>21 × 4 = 84</td></tr><tr><td>84 ÷ ? = 21</td><td>84 ÷ 21 = 4</td></tr></table></section>`;
    h += `<section class="pieges"><h2>⚠️ Attention</h2><ul>${PIEGES[s].map(x => `<li>${x}</li>`).join("")}</ul></section>`;
    return h;
  }

  const themes = {};
  GROUPES.forEach(g => g.t.forEach(t => themes[t] = { nom: SORTES[t.slice(0, -1)], rappel: rappel(t), synthese: () => synthese(t) }));

  return {
    id: "mental", titre: "Calcul mental", icone: "🧠", couleur: "#0c8599", couleurFoncee: "#0b7285",
    libSeul: "Un seul exercice", libChoix: "les exercices", nbBase: 10, parFaute: 3,
    retour: { href: "calculs.html", titre: "Calculs" },
    liens: [{ href: "tables.html", icone: "✖️", titre: "Tables de multiplication", sous: "jeux sur les tables de 1 à 10", c: "#c2255c" }],
    groupes: GROUPES, themes, generer,
    duree: q => ({ saisie: 20, qcm: 12 })[q.type],
    ficheGrille: { colonnes: 5, lignes: 20 },
    _test: { strategie, explication, tirAS, tirMD, tirDEC, fmt }
  };
})();
if (typeof module !== "undefined") module.exports = MATIERE;
