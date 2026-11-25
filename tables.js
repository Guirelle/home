/* =====================================================================
   MATIÈRE : Calculs – pour commencer, les tables de multiplication
   ===================================================================== */
const MATIERE = (() => {
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const X = " × ";

  const GROUPES = [
    { nom: "Tables faciles", c: "#2b8a3e", t: ["t1", "t2", "t5", "t10"] },
    { nom: "Tables moyennes", c: "#1971c2", t: ["t3", "t4", "t6"] },
    { nom: "Tables difficiles", c: "#c2255c", t: ["t7", "t8", "t9"] }
  ];
  const ASTUCE = {
    1: "Multiplier par 1 ne change rien : 1 × 7 = 7.",
    2: "× 2, c'est le <b>double</b> : 2 × 7 = 7 + 7 = 14.",
    3: "Compte de 3 en 3 : 3, 6, 9, 12, 15, 18, 21, 24, 27, 30.",
    4: "× 4, c'est le <b>double du double</b> : 4 × 7 → 14 → 28.",
    5: "Les résultats finissent toujours par <b>0 ou 5</b>. 5 × 8, c'est la moitié de 10 × 8 = 80, donc 40.",
    6: "6 × un nombre = 5 × ce nombre + ce nombre : 6 × 7 = 35 + 7 = 42.",
    7: "Les plus durs : 7 × 7 = 49 et 7 × 8 = 56 (5, 6, 7, 8 : <b>56 = 7 × 8</b>).",
    8: "× 8, c'est <b>doubler 3 fois</b> : 8 × 6 → 12 → 24 → 48.",
    9: "9 × un nombre = 10 × ce nombre − ce nombre : 9 × 7 = 70 − 7 = 63. Et 6 + 3 = 9 !",
    10: "× 10 : on <b>ajoute un 0</b> : 10 × 7 = 70."
  };
  const num = t => +t.slice(1);
  const ligne = n => Array.from({ length: 10 }, (_, i) => `${n} × ${i + 1} = <b>${n * (i + 1)}</b>`).join(" · ");

  // rectangle de points : « n × k », c'est n rangées de k points
  function points(n, k, d = 7) {
    let c = "";
    for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) c += `<circle cx="${j * d + d / 2}" cy="${i * d + d / 2}" r="${d * 0.36}" fill="var(--c)"/>`;
    return `<svg width="${k * d}" height="${n * d}" viewBox="0 0 ${k * d} ${n * d}" aria-hidden="true">${c}</svg>`;
  }
  function synthese(t) {
    const n = num(t);
    const lignes = Array.from({ length: 10 }, (_, i) => `<tr><td style="white-space:nowrap;font-size:18px">${n} × ${i + 1} = <b class="t">${n * (i + 1)}</b></td><td>${points(n, i + 1)}</td></tr>`).join("");
    return `<h1>La table de ${n}</h1>
      <section><h2>🧱 Une multiplication, c'est un rectangle</h2>
        <p>${n} × 4, c'est <b>${n} rangées de 4</b> points : on compte ${n * 4} points.</p>
        <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">${points(n, 4, 14)}<span style="font-size:22px">=</span>${points(4, n, 14)}</div>
        <p>Si on tourne le rectangle, on a <b>4 rangées de ${n}</b> : le nombre de points ne change pas. Donc <b>${n} × 4 = 4 × ${n}</b>.</p></section>
      <section><h2>📋 La table</h2><table class="term" style="text-align:left">${lignes}</table></section>
      <section class="pieges"><h2>💡 Astuce</h2><p>${ASTUCE[n]}</p></section>`;
  }

  function facteurs(n) {
    const k = Math.random() < .15 ? rnd([1, 10]) : rint(2, 9);
    return Math.random() < .5 ? { a: n, b: k, k } : { a: k, b: n, k };
  }
  const tag = t => { const g = GROUPES.find(g => g.t.includes(t)); return `<span class="tag" style="--c:${g.c}">Table de ${num(t)}</span>`; };
  const big = h => `<div class="big" style="font-size:30px">${h}</div>`;

  const GEN = {
    calcul(t) {
      const n = num(t), f = facteurs(n), r = f.a * f.b;
      return { type: "saisie", numerique: true, consigne: "Calcule", ligne: `${f.a}${X}${f.b} = ___`, enonce: tag(t) + big(`${f.a}${X}${f.b} = ___`), ok: [String(r)], solution: `${f.a}${X}${f.b} = <b>${r}</b>` };
    },
    manquant(t) {
      const n = num(t), k = rint(2, 10), r = n * k;
      const avant = Math.random() < .5;
      return { type: "saisie", numerique: true, consigne: "Trouve le nombre qui manque", ligne: avant ? `${n}${X}___ = ${r}` : `___${X}${n} = ${r}`, enonce: tag(t) + big(avant ? `${n}${X}___ = ${r}` : `___${X}${n} = ${r}`), ok: [String(k)],
        solution: avant ? `${n}${X}<b>${k}</b> = ${r}` : `<b>${k}</b>${X}${n} = ${r}` };
    },
    division(t) {
      const n = num(t); if (n === 1) throw 0; const k = rint(2, 10), r = n * k;
      return { type: "saisie", numerique: true, consigne: "Divise (pense à la table !)", ligne: `${r} ÷ ${n} = ___`, enonce: tag(t) + big(`${r} ÷ ${n} = ___`), ok: [String(k)], solution: `${r} ÷ ${n} = <b>${k}</b> car ${n}${X}${k} = ${r}`, astuce: "Diviser, c'est chercher le nombre qui manque dans la multiplication." };
    },
    qcm(t) {
      const n = num(t), f = facteurs(n), r = f.a * f.b;
      const d = new Set([r + n, r - n, r + f.k, r - f.k, (f.k + 1) * (n + 1), r + 1, r - 2, r + 3, r + 10, +String(r).split("").reverse().join("")].filter(x => x > 0 && x !== r));
      const opts = shuffle([r, ...shuffle([...d]).slice(0, 3)]).map(String);
      return { type: "qcm", consigne: "Choisis le bon résultat", enonce: tag(t) + big(`${f.a}${X}${f.b} = ___`), options: opts, bonne: [String(r)], solution: `${f.a}${X}${f.b} = <b>${r}</b>` };
    },
    vf(t) {
      const n = num(t), f = facteurs(n), r = f.a * f.b, vrai = Math.random() < .5;
      const aff = vrai ? r : rnd([r + n, r - n, r + 1, r - 1, r + 2].filter(x => x > 0 && x !== r));
      return { type: "vf", consigne: "Vrai ou faux ?", enonce: tag(t) + big(`${f.a}${X}${f.b} = ${aff}`), bonne: vrai, solution: `${f.a}${X}${f.b} = <b>${r}</b>` };
    },
    relier(t) {
      const n = num(t), ks = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 4);
      const paires = ks.map(k => [Math.random() < .5 ? `${n}${X}${k}` : `${k}${X}${n}`, String(n * k)]);
      if (new Set(paires.map(p => p[1])).size < 4) throw 0;
      return { type: "relier", consigne: "Relie chaque calcul à son résultat", enonce: tag(t), paires, solution: paires.map(p => `${p[0]} = <b>${p[1]}</b>`).join(" · ") };
    },
    tableau(t) {
      const n = num(t), ks = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 5).sort((a, b) => a - b);
      return { type: "tableau", numerique: true, consigne: "Complète la table", enonce: tag(t),
        lignes: ks.map(k => ({ label: `${n}${X}${k} =`, ok: [String(n * k)], aff: String(n * k) })), solution: ks.map(k => `${n}${X}${k} = <b>${n * k}</b>`).join(" · ") };
    }
  };

  function generer(t, o = {}) {
    const W = { calcul: 4, manquant: 2, qcm: 2, vf: 1.2, relier: 1, tableau: .7, division: .8 };
    let force = o.type || (o.grille ? rnd(["calcul", "calcul", "calcul", "manquant", "division"]) : undefined);
    for (let i = 0; i < 25; i++) {
      let ty = force;
      if (!ty) { const ks = Object.keys(W).filter(x => x !== o.eviter); let r = Math.random() * ks.reduce((s, x) => s + W[x], 0); ty = ks.find(x => (r -= W[x]) < 0) || ks[0]; }
      try { const q = GEN[ty](t, o); q.theme = t; q.genre = ty; return q; } catch (e) { if (force && i > 8) force = null; }
    }
    throw new Error("génération impossible");
  }

  const themes = {};
  for (let n = 1; n <= 10; n++) themes["t" + n] = { nom: "Table de " + n, rappel: ASTUCE[n] + "<br><small>" + ligne(n) + "</small>", synthese: () => synthese("t" + n) };

  return {
    id: "tables", titre: "Tables de multiplication", icone: "🧮", couleur: "#c2255c", couleurFoncee: "#a61e4d",
    libSeul: "Une seule table", libChoix: "les tables", nbBase: 10, parFaute: 3,
    retour: { href: "calcul-mental.html", titre: "Calcul mental" },
    ficheGrille: { colonnes: 5, lignes: 20 },
    groupes: GROUPES, themes, generer,
    duree: q => ({ saisie: 10, qcm: 8, vf: 6, tableau: 5 * (q.lignes || []).length + 4, relier: 5 * (q.paires || []).length + 3 })[q.type],
    fiche: [
      { titre: "Complète les tables", type: "tableau", n: 2 },
      { titre: "Calcule", type: "calcul", n: 10 },
      { titre: "Trouve le nombre qui manque", type: "manquant", n: 6 },
      { titre: "Divise", type: "division", n: 4 },
      { titre: "Entoure le bon résultat", type: "qcm", n: 4 },
      { titre: "Relie (trace un trait)", type: "relier", n: 2 },
      { titre: "Vrai ou faux ? Entoure.", type: "vf", n: 4 }
    ]
  };
})();
if (typeof module !== "undefined") module.exports = MATIERE;
