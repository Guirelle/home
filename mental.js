/* =====================================================================
   MATIÈRE : Calcul mental (+ − × :, nombres entiers et à virgule)
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
  const fmt = x => (R(x) < 0 ? "−" : "") + String(Math.abs(R(x))).replace(".", ",");
  const opd = (x, premier) => R(x) < 0 && !premier ? `(${fmt(x)})` : fmt(x); // un négatif au milieu d'un calcul se met entre parenthèses
  const SIGNE = { "+": "+", "-": "−", "x": "×", "/": ":" };
  const NIV = ["sans passage de la dizaine", "nombre caché, sans passage", "avec passage de la dizaine", "nombre caché, avec passage"];
  const COUL = ["#2b8a3e", "#1971c2", "#e8590c", "#c2255c"];
  const SORTES = { as: "+ et −", md: "× et :", dec: "Nombres à virgule" };
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
  // nombres à virgule : 1, 2 ou 3 décimales ; passage éventuel des millièmes aux centièmes,
  // des centièmes aux dixièmes ou des dixièmes à l'unité (un seul passage par calcul)
  const RANGS = { 0: "unités", 1: "dixièmes", 2: "centièmes", 3: "millièmes" };
  function chiffres(n, dmax, cond) { // n chiffres (rangs 0..dmax) tirés avec une condition par rang
    for (let essai = 0; essai < 200; essai++) { const r = cond(); if (r) return r; } return null;
  }
  function tirDEC(L) {
    const p = avecPassage(L), sorte = rnd(["as", "as", "as", "as", "md", "md", "md", "p10"]);
    if (sorte === "p10") {
      const q = p ? rnd([10, 100, 1000]) : rnd([10, 100]);
      if (Math.random() < .5) { const x = p ? R(ri(1, 999) / 100) : R(ri(1, 99) / 10); if (!decimal(x)) return tirDEC(L); return { op: "x", a: x, b: q, c: R(x * q) }; }
      const x = q === 1000 ? ri(1, 999) : q === 100 ? (p ? R(ri(1, 999) / 10) : ri(1, 99)) : (p ? R(ri(1, 999) / 100) : R(ri(1, 99) / 10));
      return { op: "/", a: x, b: q, c: R(x / q) };
    }
    const r = ri(1, 3), u = Math.pow(10, -r);            // rang où se joue le calcul (ou le passage)
    if (sorte === "md") {
      let g, k; do { g = ri(1, 9); k = ri(2, 9); } while (p ? g * k < 10 : g * k > 9);
      const base = Math.random() < .3 && r < 3 ? ri(1, 3) * u * 10 : 0;     // parfois 0,24 × 3 au lieu de 0,04 × 3
      const m = R(base + g * u);
      if (p ? false : Math.round(m / u / 10) * k > 9) return tirDEC(L);
      return Math.random() < .5 ? { op: "x", a: m, b: k, c: R(m * k) } : { op: "/", a: R(m * k), b: k, c: m };
    }
    // + et − : on travaille en « unités du dernier rang » d (entier), chiffre par chiffre
    const d = p ? ri(r, 3) : ri(1, 3), op = rnd(["+", "-"]), S = Math.pow(10, d);
    const rp = p ? d - r : -1;                            // indice (depuis la droite) du rang du passage
    for (let essai = 0; essai < 500; essai++) {
      const A = [], B = []; let ok = true;
      for (let k = 0; k <= d; k++) {                       // k = 0 : dernier rang décimal … k = d : unités
        let a = ri(0, 9), b = ri(0, 9);
        if (k === d) { a = ri(0, 9); b = ri(0, 9); }
        if (op === "+") {
          const retenue = k - 1 === rp ? 1 : 0;
          if (k === rp) { if (a + b < 10) { a = ri(1, 9); b = ri(10 - a, 9); } }
          else if (a + b + retenue > 9) { b = ri(0, Math.max(0, 9 - a - retenue)); if (a + b + retenue > 9) ok = false; }
        } else {
          const emprunt = k - 1 === rp ? 1 : 0;
          if (k === rp) { if (a >= b) { a = ri(0, 8); b = ri(a + 1, 9); } }
          else if (a - emprunt < b) { b = ri(0, Math.max(0, a - emprunt)); if (a - emprunt < b) ok = false; }
        }
        A.push(a); B.push(b);
      }
      if (!ok) continue;
      const val = T => T.reduce((s, c, k) => s + c * Math.pow(10, k), 0);
      const a = R(val(A) / S), b = R(val(B) / S), c = R(op === "+" ? a + b : a - b);
      if (!b || !a || c <= 0) continue;
      if (nbDec(a) < Math.min(d, 1) && nbDec(b) < Math.min(d, 1)) continue;
      if (Math.max(nbDec(a), nbDec(b)) !== d) continue;     // au moins un nombre va jusqu'au rang choisi
      return { op, a, b, c };
    }
    return tirDEC(L);
  }

  /* ---------- droite des nombres ---------- */
  // sauts : [{de, a, lab}] ; dessine les sauts en arcs au-dessus d'une droite graduée
  function droite(sauts, unite) {
    // graduations : petit trait à chaque « unité » du rang (1 ; 0,1 ; 0,01…), trait moyen tous les 5, grand trait + nombre tous les 10
    const W = 560, H = 150, y = 100, x0 = 22, x1 = W - 22;
    const pts = [...new Set(sauts.flatMap(s => [R(s.de), R(s.a)]))].sort((p, q) => p - q);
    let lo = pts[0], hi = pts[pts.length - 1]; if (lo === hi) hi = lo + 1;
    unite = unite || Math.pow(10, -Math.max(...pts.map(nbDec)));
    let pas = unite; while ((hi - lo) / pas > 60) pas *= 10;
    pas = R(pas);
    const mn = R(Math.floor(R(lo / pas) - 1) * pas), mx = R(Math.ceil(R(hi / pas) + 1) * pas);
    const X = v => x0 + (v - mn) / (mx - mn) * (x1 - x0);
    const ecart = (x1 - x0) / ((mx - mn) / pas);
    let g = `<line x1="${x0 - 6}" y1="${y}" x2="${x1 + 12}" y2="${y}" stroke="#495057" stroke-width="2"/><path d="M${x1 + 12} ${y} l-8 -5 v10z" fill="#495057"/>`;
    const etiquettes = [];
    for (let k = Math.round(mn / pas); k <= Math.round(mx / pas); k++) {
      const v = R(k * pas), grand = k % 10 === 0, moyen = k % 5 === 0;
      const h = grand ? 9 : moyen ? 6 : 4;
      g += `<line x1="${X(v)}" y1="${y - h}" x2="${X(v)}" y2="${y + h}" stroke="${grand ? "#343a40" : "#868e96"}" stroke-width="${grand ? 2 : 1.5}"/>`;
      if (grand || ecart >= 34) etiquettes.push({ v, gris: true });   // si la place le permet, chaque graduation a son nombre
    }
    pts.forEach(v => etiquettes.push({ v, gris: false }));
    // étiquettes : les points du calcul en gras ; les nombres ronds en gris s'ils ne gênent pas
    const pris = [];
    etiquettes.sort((a, b) => a.gris - b.gris).forEach(e => {
      const x = X(e.v); let rang = 0;
      while (pris.some(p => p.rang === rang && Math.abs(p.x - x) < 34)) rang++;
      if (e.gris && rang > 0) return;
      pris.push({ x, rang });
      if (!e.gris) g += `<circle cx="${x}" cy="${y}" r="5" fill="#343a40"/>`;
      g += `<text x="${x}" y="${y + 24 + rang * 15}" font-size="${e.gris ? 12 : 13.5}" text-anchor="middle" fill="${e.gris ? "#868e96" : "#212529"}" font-weight="${e.gris ? 400 : 800}">${fmt(e.v)}</text>`;
    });
    let dl = -99, rl = 0;
    sauts.forEach(s => {
      if (s.de === s.a) return;
      const xa = X(s.de), xb = X(s.a), m = (xa + xb) / 2, h = Math.max(16, Math.min(52, Math.abs(xb - xa) * .5)), dir = xb >= xa ? 1 : -1;
      g += `<path d="M${xa} ${y - 4} Q ${m} ${y - 4 - 2 * h} ${xb} ${y - 4}" fill="none" stroke="var(--c,#7048e8)" stroke-width="2.5"/>`;
      g += `<path d="M${xb} ${y - 4} l${-dir * 8} -5 l${dir * 1} 8z" fill="var(--c,#7048e8)"/>`;
      rl = Math.abs(m - dl) < 40 ? 1 - rl : 0; dl = m;
      g += `<text x="${m}" y="${y - 8 - h - rl * 14}" font-size="14" text-anchor="middle" fill="var(--c,#7048e8)" font-weight="800">${s.lab}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px" role="img" aria-label="Droite des nombres">${g}</svg>`;
  }

  // calcul posé en colonnes : chaque chiffre dans son rang (sert quand il n'y a pas de passage)
  function colonnes(x, y, z, op) {
    const noms = { 3: "milliers", 2: "centaines", 1: "dizaines", 0: "unités", "-1": "dixièmes", "-2": "centièmes", "-3": "millièmes" };
    const dmax = Math.max(nbDec(x), nbDec(y), nbDec(z)), emax = Math.max(...[x, y, z].map(v => String(Math.floor(Math.abs(v))).length)) - 1;
    const chiffre = (v, e) => { const s = Math.round(Math.abs(v) * Math.pow(10, dmax)); const n = Math.floor(s / Math.pow(10, e + dmax)) % 10;
      return (e > 0 && Math.abs(v) < Math.pow(10, e)) || (e < 0 && -e > nbDec(v)) ? "" : String(n); };
    const rangs = []; for (let e = emax; e >= -dmax; e--) rangs.push(e);
    const ligne = (v, sg) => `<tr><th>${sg}</th>${rangs.map(e => `<td class="${e === -1 ? "vg" : ""}">${chiffre(v, e)}</td>`).join("")}</tr>`;
    const detail = rangs.filter(e => chiffre(y, e) !== "" && +chiffre(y, e)).map(e => `${noms[e]} : ${chiffre(x, e) || 0} ${op === "+" ? "+" : "−"} ${chiffre(y, e)} = ${chiffre(z, e)}`).join(" · ");
    return `<table class="rangs"><tr><th></th>${rangs.map(e => `<th>${noms[e]}</th>`).join("")}</tr>${ligne(x, "")}${ligne(y, op === "+" ? "+" : "−")}<tr style="border-top:3px solid #343a40">${ligne(z, "=").slice(4)}</table>
      <p>Pas de passage : on calcule <b>rang par rang</b>${detail ? " — " + detail : ""}. Résultat : <b>${fmt(z)}</b>.</p>${dmax ? "<p>Avec la virgule, on aligne les rangs : unités sous les unités, dixièmes sous les dixièmes…</p>" : ""}`;
  }

  // tableau des rangs pour × et : par 10, 100, 1000
  function rangs(x, y, op, p) {
    const k = Math.round(Math.log10(p)), cols = ["milliers", "centaines", "dizaines", "unités", "dixièmes", "centièmes", "millièmes", "dix-millièmes"];
    const pos = v => { const [e, d = ""] = String(R(v)).split("."); const m = {}; e.split("").reverse().forEach((c, i) => m[3 - i] = c); d.split("").forEach((c, i) => m[4 + i] = c); return m; };
    const A = pos(x), B = pos(y), idx = [...Object.keys(A), ...Object.keys(B)].map(Number);
    const lo = Math.min(...idx, 3), hi = Math.max(...idx, 3);
    const ligne = (m, lab) => `<tr><th>${lab}</th>${cols.slice(lo, hi + 1).map((_, i) => `<td class="${lo + i === 4 ? "vg" : ""}">${m[lo + i] !== undefined ? m[lo + i] : (lo + i === 3 ? "0" : "")}</td>`).join("")}</tr>`;
    return `<table class="rangs"><tr><th></th>${cols.slice(lo, hi + 1).map(c => `<th>${c}</th>`).join("")}</tr>${ligne(A, fmt(x))}${ligne(B, fmt(y))}</table>
      <p>${op === "x" ? `× ${p} : chaque chiffre avance de <b>${k} rang${k > 1 ? "s" : ""} vers la gauche</b> (il vaut ${p} fois plus).` : `: ${p} : chaque chiffre recule de <b>${k} rang${k > 1 ? "s" : ""} vers la droite</b> (il vaut ${p} fois moins).`} Le trait rouge marque la virgule.</p>`;
  }

  /* ---------- explication d'un calcul x op y = z ---------- */
  function strategie(op, x, y) {
    const z = R(op === "+" ? x + y : op === "-" ? x - y : op === "x" ? x * y : x / y);
    if (x < 0 || y < 0 || z < 0) return strategieZ(op, x, y, z);
    const B = (decimal(x) || decimal(y) || decimal(z)) && (op === "+" || op === "-") ? 1 : 10; // « dizaine » : 10, ou 1 unité pour les dixièmes
    const sauts = [], etapes = [];
    if (op === "+" || op === "-") {
      // rang par rang (du plus grand au plus petit) ; si on dépasse le rang supérieur, on s'arrête d'abord au nombre « rond »
      const d = Math.max(nbDec(x), nbDec(y)), Sc = Math.pow(10, d), sg = op === "+" ? 1 : -1;
      let cur = Math.round(x * Sc); const Y = Math.round(y * Sc);
      const nom = p => { const e = Math.round(Math.log10(p)) - d; return { 2: "les centaines", 1: "les dizaines", 0: "les unités", "-1": "les dixièmes", "-2": "les centièmes", "-3": "les millièmes" }[e] || ""; };
      const saut = (q, quoi) => { const n = cur + sg * q; sauts.push({ de: cur / Sc, a: n / Sc, lab: (sg > 0 ? "+" : "−") + fmt(q / Sc) });
        etapes.push(`${fmt(cur / Sc)} ${sg > 0 ? "+" : "−"} ${fmt(q / Sc)} = <b>${fmt(n / Sc)}</b>${quoi ? ` <small>(${quoi})</small>` : ""}`); cur = n; };
      for (let p = Math.pow(10, String(Y).length - 1); p >= 1; p /= 10) {
        const dg = Math.floor(Y / p) % 10; if (!dg) continue;
        const cd = Math.floor(cur / p) % 10, q = dg * p;
        if (sg > 0 && cd + dg >= 10 && cd > 0) { const c1 = (10 - cd) * p; saut(c1, `jusqu'à ${fmt((cur + c1) / Sc)}`); saut(q - c1, "le reste"); }
        else if (sg < 0 && cd < dg && cd > 0) { const c1 = cd * p; saut(c1, `jusqu'à ${fmt((cur - c1) / Sc)}`); saut(q - c1, "le reste"); }
        else saut(q, nom(p));
      }
      const passage = etapes.some(e => e.includes("jusqu'à"));
      if (!passage && d === 0) return { z, html: colonnes(x, y, z, op) };                       // entiers sans passage : le tableau suffit
      if (!passage) return { z, html: colonnes(x, y, z, op) };
      return { z, html: `<ol>${etapes.map(e => `<li>${e}</li>`).join("")}</ol>${droite(sauts, 1 / Sc)}` };
    }
    const P = [10, 100, 1000];
    if (op === "x" && (P.includes(x) || P.includes(y))) { const p = P.includes(y) ? y : x, v = p === y ? x : y; return { z, html: rangs(v, z, "x", p) }; }
    if (op === "/" && P.includes(y)) return { z, html: rangs(x, z, "/", y) };
    const unites = (v, dd) => `${Math.round(v * Math.pow(10, dd))} ${RANGS[dd]}`;
    if (op === "x" && (decimal(x) !== decimal(y)) && (decimal(x) ? x : y) < 1 && (decimal(x) ? y : x) <= 10) {
      const m = decimal(x) ? x : y, k = m === x ? y : x, dd = nbDec(m), sts = []; let cur = 0;
      if (k <= 10) for (let i = 0; i < k; i++) { sts.push({ de: cur, a: R(cur + m), lab: "+" + fmt(m) }); cur = R(cur + m); }
      return { z, html: `<p>${fmt(m)}, c'est <b>${unites(m, dd)}</b>. ${unites(m, dd)} × ${k} = <b>${unites(z, dd)}</b> = <b>${fmt(z)}</b>.</p>${Math.round(z * Math.pow(10, dd)) >= Math.pow(10, Math.max(1, String(Math.round(m * Math.pow(10, dd))).length)) ? `<p>10 ${RANGS[dd]} font 1 ${RANGS[dd - 1] ? RANGS[dd - 1].replace(/s$/, "") : "unité"} : on change de rang.</p>` : ""}${sts.length ? droite(sts) : ""}` };
    }
    if (op === "/" && decimal(x) && !decimal(y) && y <= 10 && x < 1) {
      const dd = Math.max(nbDec(x), nbDec(z)), sts = []; let cur = 0;
      for (let i = 0; i < y; i++) { sts.push({ de: cur, a: R(cur + z), lab: "+" + fmt(z) }); cur = R(cur + z); }
      return { z, html: `<p>${fmt(x)}, c'est <b>${unites(x, dd)}</b>. ${unites(x, dd)} : ${y} = <b>${unites(z, dd)}</b> = <b>${fmt(z)}</b>.</p><p>Vérification : ${y} sauts de ${fmt(z)} arrivent à ${fmt(x)}.</p>${droite(sts)}` };
    }
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
      return { z, html: `<p>${fmt(x)} : ${fmt(y)} : combien de <b>sauts de ${fmt(y)}</b> pour arriver à ${fmt(x)} ? On en compte <b>${fmt(z)}</b>.</p>${droite(sauts)}` };
    }
    const gros = decimal(z) ? Math.floor(z) : Math.floor(z / 10) * 10, petit = R(z - gros), v1 = R(gros * y);
    if (gros) sauts.push({ de: 0, a: v1, lab: `${fmt(gros)} × ${fmt(y)}` });
    sauts.push({ de: v1, a: x, lab: `${fmt(petit)} × ${fmt(y)}` });
    return { z, html: `<p>${fmt(x)} : ${fmt(y)} : on cherche combien de fois ${fmt(y)}. ${gros ? `${fmt(gros)} fois ${fmt(y)} = ${fmt(v1)}, ` : ""}il reste ${fmt(R(x - v1))} = ${fmt(petit)} fois ${fmt(y)}. Donc ${fmt(gros)} + ${fmt(petit)} = <b>${fmt(z)}</b>.</p>${droite(sauts)}` };
  }
  function explication(cal, manque) {
    const { op, a, b, c } = cal; let o2 = op, x = a, y = b, phrase = "";
    if (manque === "a") {
      if (op === "+") { o2 = "-"; x = c; y = b; } else if (op === "-") { o2 = "+"; x = c; y = b; } else if (op === "x") { o2 = "/"; x = c; y = b; } else { o2 = "x"; x = c; y = b; }
    } else if (manque === "b") {
      if (op === "+") { o2 = "-"; x = c; y = a; } else if (op === "-") { o2 = "-"; x = a; y = c; } else if (op === "x") { o2 = "/"; x = c; y = a; } else { o2 = "/"; x = a; y = c; }
    }
    if (manque !== "c") phrase = `<p>Le nombre caché se trouve avec l'<b>opération inverse</b> : on calcule <b>${opd(x, true)} ${SIGNE[o2]} ${opd(y)}</b>.</p>`;
    const st = strategie(o2, x, y);
    return phrase + st.html;
  }

  /* ---------- questions ---------- */
  const tagT = t => { const L = +t.slice(-1); return `<span class="tag" style="--c:${COUL[L - 1]}">${SORTES[t.slice(0, -1)]} · niveau ${L}</span>`; };
  function ecrire(cal, manque, rep) {
    const v = { a: opd(cal.a, true), b: opd(cal.b), c: fmt(cal.c) };
    v[manque] = rep.includes("<b>") && R(cal[manque]) < 0 && manque === "b" ? `(${rep})` : rep;
    return `${v.a} ${SIGNE[cal.op]} ${v.b} = ${v.c}`;
  }
  function generer(t, o = {}) {
    if (SEC[t]) return genSec(t, o);
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
    md1: "Ce sont les tables ! La division est le contraire de la multiplication : 42 : 6 = ? ↔ 6 × ? = 42.",
    dec1: "Chaque rang avec son rang : unités, dixièmes, centièmes, millièmes. 3,24 + 1,05 = 4,29 · 0,008 : 2 = 0,004. × 10 : chaque chiffre avance d'un rang vers la gauche (2,5 × 10 = 25).",
    as3: "On passe par la dizaine : 37 + 8 = 37 + 3 + 5 = 45 · 52 − 7 = 52 − 2 − 5 = 45.",
    md3: "On décompose : 23 × 4 = 20 × 4 + 3 × 4 = 80 + 12 = 92 · 84 : 4 = 80 : 4 + 4 : 4 = 20 + 1 = 21.",
    dec3: "10 millièmes = 1 centième · 10 centièmes = 1 dixième · 10 dixièmes = 1 unité. On s'arrête au nombre « rond » : 0,08 + 0,05 = 0,08 + 0,02 + 0,03 = 0,13 · 0,04 × 3 = 12 centièmes = 0,12."
  };
  const INV = "<br><b>Nombre caché ?</b> Opération inverse : ? + 25 = 59 → 59 − 25 · ? − 7 = 45 → 45 + 7 · 6 × ? = 42 → 42 : 6 · ? : 4 = 21 → 21 × 4.";
  const rappel = t => { const L = +t.slice(-1), s = t.slice(0, -1); return RAPPEL[s + (L <= 2 ? 1 : 3)] + (L === 2 || L === 4 ? INV : ""); };
  const EX = {
    1: { as: [["+", 34, 25], ["-", 58, 23]], md: [["x", 6, 4], ["/", 42, 6]], dec: [["+", 3.24, 1.05], ["-", 5.87, 2.34], ["/", 0.008, 2], ["x", 2.5, 10]] },
    3: { as: [["+", 37, 48], ["-", 52, 27]], md: [["x", 23, 4], ["/", 84, 4], ["x", 35, 100]], dec: [["+", 0.007, 0.005], ["+", 0.08, 0.05], ["+", 2.7, 1.5], ["-", 0.13, 0.05], ["x", 0.04, 3], ["/", 0.035, 5], ["/", 3.6, 100]] }
  };
  const PIEGES = {
    as: ["En soustraction, on enlève toujours au premier nombre : 52 − 7 = 45 (et pas 55).", "Vérifie avec l'opération inverse : 45 + 7 = 52 ✔"],
    md: ["Une division se vérifie par une multiplication : 84 : 4 = 21 car 21 × 4 = 84.", "× 10 n'est pas « ajouter un zéro » pour les nombres à virgule : 2,5 × 10 = 25."],
    dec: ["10 millièmes font 1 centième (0,007 + 0,003 = 0,01), 10 centièmes font 1 dixième (0,08 + 0,02 = 0,1), 10 dixièmes font 1 unité (0,7 + 0,3 = 1).", "0,1 + 0,03 = 0,13 (et pas 0,4) : on aligne les rangs, pas les chiffres.", "2,5 × 10 = 25 (et pas 2,50) : c'est la virgule qui bouge, pas un zéro qu'on ajoute.", "Avec un nombre entier, la virgule est cachée : 3 = 3,0 → 3 − 0,4 = 2,6."]
  };
  function synthese(t) {
    const L = +t.slice(-1), s = t.slice(0, -1), ex = EX[L <= 2 ? 1 : 3][s];
    let h = `<h1>${SORTES[s]} · niveau ${L}</h1><section><h2>🎯 Ce qu'on travaille</h2><p>${NIV[L - 1]} · ${rappel(t)}</p></section>`;
    h += `<section><h2>📏 Sur la droite des nombres</h2>${ex.map(([op, x, y]) => { const st = strategie(op, x, y); return `<div class="explic" style="--c:var(--c)"><b>${fmt(x)} ${SIGNE[op]} ${fmt(y)} = ${fmt(st.z)}</b>${st.html}</div>`; }).join("")}</section>`;
    if (L === 2 || L === 4) h += `<section><h2>🕵️ Le nombre caché</h2><table class="term"><tr><th>Si on cherche…</th><th>on calcule</th></tr>
      <tr><td>? + 25 = 59</td><td>59 − 25 = 34</td></tr><tr><td>34 + ? = 59</td><td>59 − 34 = 25</td></tr>
      <tr><td>? − 7 = 45</td><td>45 + 7 = 52</td></tr><tr><td>52 − ? = 45</td><td>52 − 45 = 7</td></tr>
      <tr><td>? × 6 = 42</td><td>42 : 6 = 7</td></tr><tr><td>? : 4 = 21</td><td>21 × 4 = 84</td></tr><tr><td>84 : ? = 21</td><td>84 : 21 = 4</td></tr></table></section>`;
    h += `<section class="pieges"><h2>⚠️ Attention</h2><ul>${PIEGES[s].map(x => `<li>${x}</li>`).join("")}</ul></section>`;
    return h;
  }

  /* ================= 1re SECONDAIRE ================= */
  const SEC = {
    z_as: { nom: "+ et − avec des négatifs", g: 4 }, z_md: { nom: "× et : avec des négatifs", g: 4 }, z_dec: { nom: "Décimaux négatifs (+ et −)", g: 4 },
    carres: { nom: "Carrés de 1 à 15", g: 5 }, puis: { nom: "Puissances", g: 5 }, prio: { nom: "Priorités des opérations", g: 5 }, astuces: { nom: "Astuces ×5, ×9, ×11, ×25", g: 5 }
  };
  GROUPES.push({ nom: "1re secondaire · nombres négatifs", c: "#5f3dc4", t: ["z_as", "z_md", "z_dec"] },
               { nom: "1re secondaire · puissances, priorités, astuces", c: "#364fc7", t: ["carres", "puis", "prio", "astuces"] });
  const tagS = t => `<span class="tag" style="--c:${GROUPES[SEC[t].g].c}">${SEC[t].nom}</span>`;
  const nz = (a, b) => { let x; do x = ri(a, b); while (x === 0); return x; };
  const regleSignes = `<table class="rangs" style="font-size:16px"><tr><th>×  ou  :</th><th>+</th><th>−</th></tr><tr><th>+</th><td>+</td><td>−</td></tr><tr><th>−</th><td>−</td><td>+</td></tr></table>
    <p><b>Mêmes signes → résultat positif. Signes différents → résultat négatif.</b></p>`;

  // + et − dans Z : déplacements sur la droite (en passant par 0 si on le traverse)
  function strategieZ(op, x, y, z) {
    if (op === "x" || op === "/") {
      const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z), neg = z < 0;
      let h = `<p>On calcule sans les signes : ${fmt(ax)} ${SIGNE[op]} ${fmt(ay)} = <b>${fmt(az)}</b>.<br>Puis le signe : ${x < 0 ? "−" : "+"} ${SIGNE[op]} ${y < 0 ? "−" : "+"} → <b>${neg ? "négatif" : "positif"}</b>, donc ${fmt(z)}.</p>` + regleSignes;
      if (op === "x" && Number.isInteger(x) && Number.isInteger(y) && ((x < 0 && y > 0 && y <= 8) || (y < 0 && x > 0 && x <= 8))) {
        const k = x > 0 ? x : y, m = x > 0 ? y : x, sauts = []; let cur = 0;
        for (let i = 0; i < k; i++) { sauts.push({ de: cur, a: R(cur + m), lab: fmt(m) }); cur = R(cur + m); }
        h += `<p>${fmt(k)} sauts de ${fmt(m)} à partir de 0 : on recule.</p>` + droite(sauts);
      }
      return { z, html: h };
    }
    let h = "", d = y;
    if (op === "-") { d = R(-y); h += `<p>Soustraire, c'est <b>additionner l'opposé</b> : ${opd(x, true)} − ${opd(y)} = ${opd(x, true)} + ${opd(d)}.</p>`; }
    const sauts = [], fin = R(x + d), signe = v => (v >= 0 ? "+" : "−") + fmt(Math.abs(v));
    if (x !== 0 && fin !== 0 && Math.sign(x) !== Math.sign(fin)) { sauts.push({ de: x, a: 0, lab: signe(-x) }); sauts.push({ de: 0, a: fin, lab: signe(fin) }); }
    else sauts.push({ de: x, a: fin, lab: signe(d) });
    h += `<p>On part de <b>${fmt(x)}</b> et on ${d >= 0 ? "avance" : "recule"} de <b>${fmt(Math.abs(d))}</b>${sauts.length > 1 ? ` (en passant par 0 : ${fmt(Math.abs(x))} puis ${fmt(Math.abs(fin))})` : ""} → on arrive à <b>${fmt(fin)}</b>.</p>`;
    const pts = sauts.concat(x !== 0 && fin !== 0 && sauts.length === 1 ? [{ de: 0, a: 0, lab: "" }] : []);
    return { z, html: h + droite(pts.filter(s => s.de !== s.a || s.de === 0)) };
  }

  // évaluation pas à pas d'une expression (priorités des opérations)
  const PRIO = { "^": 3, "x": 2, "/": 2, "+": 1, "-": 1 };
  const N = v => ({ v }), O = (op, l, r, par) => ({ op, l, r, par });
  function ecrit(n, premier = true) {
    if (n.v !== undefined) return premier || n.v >= 0 ? fmt(n.v) : `(${fmt(n.v)})`;
    if (n.op === "^") return `${ecrit(n.l)}<sup>${fmt(n.r.v)}</sup>`;
    const s = `${ecrit(n.l, premier && !n.par)} ${SIGNE[n.op]} ${ecrit(n.r, false)}`;
    return n.par ? `(${s})` : s;
  }
  const val = (op, a, b) => R(op === "+" ? a + b : op === "-" ? a - b : op === "x" ? a * b : op === "/" ? a / b : Math.pow(a, b));
  function etapes(arbre) {
    const lignes = [ecrit(arbre)];
    const cands = (n, prof, out) => { if (n.v !== undefined) return; const p = prof + (n.par ? 1 : 0);
      if (n.l.v !== undefined && n.r.v !== undefined) out.push({ n, p }); cands(n.l, p, out); cands(n.r, p, out); return out; };
    let ordre = 0;
    while (arbre.v === undefined) {
      const c = cands(arbre, 0, []); c.forEach((x, i) => x.i = i);
      c.sort((a, b) => b.p - a.p || PRIO[b.n.op] - PRIO[a.n.op] || a.i - b.i);
      const n = c[0].n, marque = `<u>${ecrit({ op: n.op, l: n.l, r: n.r })}</u>`;
      const v = val(n.op, n.l.v, n.r.v);
      Object.keys(n).forEach(k => delete n[k]); n.v = v; ordre++;
      lignes.push(ecrit(arbre)); lignes[lignes.length - 2] = lignes[lignes.length - 2] + `   <small>(${marque.replace(/<\/?u>/g, "")} = ${fmt(v)})</small>`;
    }
    return lignes;
  }
  function tirPrio() {
    const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9), d = ri(2, 6), neg = Math.random() < .3, m = neg ? -ri(2, 9) : ri(2, 9);
    const T = [
      () => O("+", N(a), O("x", N(b), N(c))), () => O("-", N(a * c + ri(1, 9)), O("x", N(b), N(c))),
      () => O("x", O("+", N(a), N(b), true), N(c)), () => O("-", O("x", N(a), N(b)), O("x", N(c), N(d))),
      () => O("+", N(a), O("^", N(b), N(2))), () => O("^", O("-", N(a + b), N(b), true), N(2)),
      () => O("+", O("x", N(a), O("-", N(b + c), N(c), true)), N(d)), () => O("+", O("/", N(b * c), N(c)), N(a)),
      () => O("-", O("^", N(a), N(2)), O("x", N(b), N(c))), () => O("+", O("x", N(m), N(b)), N(a)),
      () => O("-", N(m), O("x", N(a), N(b))), () => O("x", N(m), O("-", N(a), N(b), true))
    ];
    return rnd(T)();
  }
  function astuce(k, a) {
    const r = a * k;
    if (k === 5) return `${a} × 5 = ${a} × 10 : 2 = ${a * 10} : 2 = <b>${r}</b>`;
    if (k === 9) return `${a} × 9 = ${a} × 10 − ${a} = ${a * 10} − ${a} = <b>${r}</b>`;
    if (k === 11) return `${a} × 11 = ${a} × 10 + ${a} = ${a * 10} + ${a} = <b>${r}</b>`;
    return `${a} × 25 = ${a} × 100 : 4 = ${a * 100} : 4 = <b>${r}</b>`;
  }
  function puissanceExpl(b, e) {
    if (e === 0) return `<p>Tout nombre (non nul) exposant 0 vaut <b>1</b> : ${b}<sup>0</sup> = 1.</p>`;
    if (e === 1) return `<p>Exposant 1 : le nombre lui-même : ${b}<sup>1</sup> = <b>${b}</b>.</p>`;
    const prod = Array(e).fill(b).join(" × "); let cur = b; const ch = [b];
    for (let i = 1; i < e; i++) { cur *= b; ch.push(cur); }
    let h = `<p>${b}<sup>${e}</sup>, c'est <b>${e} facteurs ${b}</b> : ${prod} = <b>${cur}</b><br>On multiplie pas à pas : ${ch.join(" → ")}.</p><p>⚠️ ${b}<sup>${e}</sup> n'est <b>pas</b> ${b} × ${e} = ${b * e}.</p>`;
    if (e === 2 && b <= 12) h += `<p>Un carré, c'est un carré de points : ${b} rangées de ${b}.</p>` + carrePoints(b);
    if (e === 3) h += `<p>Un cube : ${b} couches de ${b} × ${b} = ${b * b} petits cubes → ${b} × ${b * b} = ${cur}.</p>`;
    return h;
  }
  function carrePoints(n) { const d = Math.min(14, Math.floor(180 / n)); let c = ""; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c += `<circle cx="${j * d + d / 2}" cy="${i * d + d / 2}" r="${d * .36}" fill="var(--c,#364fc7)"/>`; return `<svg width="${n * d}" height="${n * d}" viewBox="0 0 ${n * d} ${n * d}">${c}</svg>`; }

  function genSec(t, o) {
    let ligne, valeur, expl, consigne = "Calcule", signe = false;
    const fini = (ln, v, ex, extra = {}) => {
      const q = Object.assign({ theme: t, type: "saisie", genre: t, numerique: true, decimal: true, signe: signe || v < 0, nombre: v, ok: [fmt(v)], ligne: ln,
        solution: ln.replace("___", `<b>${opd(v, ln.trim().startsWith("___"))}</b>`), explication: ex, consigne,
        enonce: tagS(t) + `<div class="big" style="font-size:28px">${ln}</div>` }, extra);
      if (!o.papier && !o.type && Math.random() < .2) {
        const d = new Set([-v, v + 1, v - 1, v + 2, v - 2, v * 10].map(R).filter(x => x !== R(v)));
        Object.assign(q, { type: "qcm", genre: "qcm", options: shuffle([R(v), ...shuffle([...d]).slice(0, 3)]).map(fmt), bonne: [fmt(v)] }); delete q.nombre;
      }
      return q;
    };
    if (t === "z_as" || t === "z_md" || t === "z_dec") {
      signe = true; let cal;
      if (t === "z_as") { const a = nz(-20, 20), b = nz(-20, 20), op = rnd(["+", "-"]); cal = { op, a, b, c: R(op === "+" ? a + b : a - b) }; }
      else if (t === "z_dec") { const a = R(nz(-99, 99) / 10), b = R(nz(-99, 99) / 10), op = rnd(["+", "-"]); cal = { op, a, b, c: R(op === "+" ? a + b : a - b) }; }
      else { const x = nz(-10, 10), y = nz(-10, 10); if (Math.abs(x) === 1 && Math.random() < .7) return genSec(t, o);
        cal = Math.random() < .5 ? { op: "x", a: x, b: y, c: x * y } : { op: "/", a: x * y, b: x, c: y };
        if (cal.op === "/" && cal.a === 0) return genSec(t, o); }
      const manque = Math.random() < .3 ? rnd(["a", "b"]) : "c";
      if (manque !== "c") consigne = "Trouve le nombre caché";
      return fini(ecrire(cal, manque, "___"), cal[manque], explication(cal, manque), { solution: ecrire(cal, manque, `<b>${fmt(cal[manque])}</b>`) });
    }
    if (t === "carres") {
      const n = ri(1, 15);
      if (Math.random() < .3) { consigne = "Quel nombre au carré ?"; return fini(`___<sup>2</sup> = ${n * n}`, n, puissanceExpl(n, 2)); }
      return fini(`${n}<sup>2</sup> = ___`, n * n, puissanceExpl(n, 2));
    }
    if (t === "puis") {
      let b, e; do { b = rnd([2, 2, 3, 3, 4, 5, 10, 10, 6, 7, 1, 0]); e = rnd([0, 1, 2, 2, 3, 3, 4, 5, 6]); } while (Math.pow(b, e) > 10000 || (b === 0 && e === 0));
      if (b >= 2 && e >= 2 && Math.random() < .15) { consigne = "Trouve l'exposant"; return fini(`${b}<sup>?</sup> = ${Math.pow(b, e)} → exposant = ___`, e, puissanceExpl(b, e)); }
      return fini(`${b}<sup>${e}</sup> = ___`, Math.pow(b, e), puissanceExpl(b, e));
    }
    if (t === "prio") {
      const arbre = tirPrio(), ln = ecrit(arbre) + " = ___", ls = etapes(JSON.parse(JSON.stringify(arbre)));
      const v = R(ls.length ? +(ls[ls.length - 1].replace("−", "-").replace(",", ".")) : 0);
      const ordre = `<p>Ordre : <b>1.</b> parenthèses · <b>2.</b> puissances · <b>3.</b> × et : (de gauche à droite) · <b>4.</b> + et − (de gauche à droite)</p>`;
      return fini(ln, v, ordre + `<ol style="list-style:none;padding-left:4px">${ls.map((l, i) => `<li>${i ? "= " : ""}${l}</li>`).join("")}</ol>`);
    }
    // astuces
    const k = rnd([5, 9, 11, 25]), a = k === 25 ? ri(3, 40) : ri(12, 99);
    return fini(`${a} × ${k} = ___`, a * k, `<p>${astuce(k, a)}</p>`);
  }
  const RAPPEL_SEC = {
    z_as: "Sur la droite : + un positif → on avance ; + un négatif → on recule. Soustraire = additionner l'opposé : 3 − (−5) = 3 + 5 = 8.",
    z_md: "Mêmes signes → positif, signes différents → négatif : (−4) × (−3) = 12 · (−20) : 4 = −5.",
    z_dec: "Comme avec les entiers, sur la droite graduée : −2,5 + 4 = 1,5 · 1,2 − 3 = −1,8.",
    carres: "n² = n × n : 11² = 121 · 12² = 144 · 13² = 169 · 14² = 196 · 15² = 225.",
    puis: "aⁿ = a × a × … × a (n facteurs). 2⁵ = 32 (pas 10 !). a¹ = a, a⁰ = 1.",
    prio: "1. parenthèses · 2. puissances · 3. × et : de gauche à droite · 4. + et − de gauche à droite.",
    astuces: "× 5 = × 10 : 2 · × 9 = × 10 − le nombre · × 11 = × 10 + le nombre · × 25 = × 100 : 4."
  };
  function syntheseSec(t) {
    const ex = { z_as: [["+", -4, 7], ["-", 3, -5], ["+", 2, -6]], z_md: [["x", 3, -4], ["/", -20, 4], ["x", -4, -3]], z_dec: [["+", -2.5, 4], ["-", 1.2, 3]] }[t];
    let h = `<h1>${SEC[t].nom}</h1><section><h2>🎯 La règle</h2><p>${RAPPEL_SEC[t]}</p></section>`;
    if (ex) h += `<section><h2>📏 Exemples sur la droite des nombres</h2>${ex.map(([op, x, y]) => { const st = strategie(op, x, y); return `<div class="explic"><b>${opd(x, true)} ${SIGNE[op]} ${opd(y)} = ${fmt(st.z)}</b>${st.html}</div>`; }).join("")}</section>`;
    if (t === "carres") h += `<section><h2>📋 Les carrés à connaître</h2><table class="term">${Array.from({ length: 15 }, (_, i) => `<tr><td>${i + 1}<sup>2</sup> = ${i + 1} × ${i + 1}</td><td><b>${(i + 1) ** 2}</b></td></tr>`).join("")}</table></section><section><h2>🧱 Un carré, c'est un carré</h2>${carrePoints(5)}<p>5² = 25 points rangés en carré.</p></section>`;
    if (t === "puis") h += `<section><h2>🔧 Exemples</h2><div class="explic">${puissanceExpl(2, 5)}</div><div class="explic">${puissanceExpl(3, 3)}</div><div class="explic">${puissanceExpl(10, 4)}<p>Puissance de 10 : l'exposant donne le nombre de zéros (10⁴ = 10 000).</p></div></section>`;
    if (t === "prio") { const ar = O("-", O("x", N(3), O("+", N(2), N(4), true)), O("^", N(2), N(3))); h += `<section><h2>🔧 Un exemple pas à pas</h2><ol style="list-style:none">${etapes(ar).map((l, i) => `<li>${i ? "= " : ""}${l}</li>`).join("")}</ol></section>`; }
    if (t === "astuces") h += `<section><h2>🔧 Pourquoi ça marche</h2><ul><li>${astuce(5, 46)} · car 5 = 10 : 2</li><li>${astuce(9, 37)} · car 9 = 10 − 1</li><li>${astuce(11, 24)} · car 11 = 10 + 1</li><li>${astuce(25, 28)} · car 25 = 100 : 4</li></ul></section>`;
    h += `<section class="pieges"><h2>⚠️ Attention</h2><ul>${({ z_as: ["−3 − 5 = −8 (on recule encore), pas −2.", "Deux signes qui se suivent : on met des parenthèses : 4 + (−2)."], z_md: ["La règle des signes vaut pour × et : , PAS pour + et − : −3 − 4 = −7 (et pas 7)."], z_dec: ["Repère d'abord le signe du plus « grand » nombre (sans signe) : −2,5 + 4 → positif."], carres: ["n² ≠ n × 2 : 7² = 49 (pas 14)."], puis: ["2⁵ ≠ 2 × 5 ; 10³ = 1 000 (3 zéros) ; 5⁰ = 1."], prio: ["3 + 4 × 2 = 3 + 8 = 11 (pas 14) : la multiplication d'abord.", "Une puissance ne porte que sur le nombre juste avant : 2 × 3² = 2 × 9 = 18."], astuces: ["Vérifie l'ordre de grandeur : 37 × 9 doit être un peu moins que 37 × 10 = 370."] })[t].map(x => `<li>${x}</li>`).join("")}</ul></section>`;
    return h;
  }

  const themes = {};
  GROUPES.forEach(g => g.t.forEach(t => themes[t] = SEC[t] ? { nom: SEC[t].nom, rappel: RAPPEL_SEC[t], synthese: () => syntheseSec(t) } : { nom: SORTES[t.slice(0, -1)], rappel: rappel(t), synthese: () => synthese(t) }));

  return {
    id: "mental", titre: "Calcul mental", icone: "🧠", couleur: "#0c8599", couleurFoncee: "#0b7285",
    libSeul: "Un seul exercice", libChoix: "les exercices", nbBase: 10, parFaute: 3,
    retour: { href: "calculs.html", titre: "Calculs" },
    liens: [{ href: "tables.html", icone: "✖️", titre: "Tables de multiplication", sous: "jeux sur les tables de 1 à 10", c: "#c2255c" }],
    groupes: GROUPES, themes, generer,
    duree: q => ({ saisie: 20, qcm: 12 })[q.type],
    ficheGrille: { colonnes: 5, lignes: 20 },
    _test: { strategie, explication, tirAS, tirMD, tirDEC, fmt, etapes, tirPrio, val, ecrit }
  };
})();
if (typeof module !== "undefined") module.exports = MATIERE;
