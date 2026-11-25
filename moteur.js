/* =====================================================================
   Coin d'étude – MOTEUR COMMUN (identique pour toutes les matières)
   Une matière fournit un objet MATIERE (voir LISEZMOI.md) :
     id, titre, icone, couleur, couleurFoncee, groupes, themes, generer(), fiche
   Le moteur gère : menu (un thème / mélange), session de 10 questions
   + 3 par faute, correction immédiate avec rappel de la règle,
   feux d'artifice, synthèses, fiches imprimables avec corrigé.
   ===================================================================== */
const Moteur = (() => {
  let M = null, S = null, F = null, onglet = "seul", choix = new Set(), son = true;
  let cur = {}, fbOuvert = false, dernierInput = null;

  /* ---------- utilitaires ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = () => $("#app");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function norm(s) {
    return String(s).normalize("NFC").toLowerCase()
      .replace(/[’‘`´]/g, "'").replace(/ /g, " ")
      .replace(/\s*'\s*/g, "'").replace(/[!?.;,:]+/g, " ")
      .replace(/\s+/g, " ").trim();
  }
  const etoiles = n => n == null ? "" : "★".repeat(n) + "☆".repeat(3 - n);
  const couleurTheme = id => (M.groupes.find(g => g.t.includes(id)) || {}).c || M.couleur;

  /* ---------- sons (WebAudio, petits bips) ---------- */
  let actx = null;
  function bip(ok) {
    if (!son) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = ok ? [660, 880, 1320] : [220, 180];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = ok ? "triangle" : "sawtooth"; o.frequency.value = f;
        const t = actx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(ok ? 0.18 : 0.08, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.2);
      });
    } catch (e) {}
  }

  /* ---------- feux d'artifice & confettis ---------- */
  let cv, cx, parts = [], fusees = [], anim = null, finFeu = 0;
  function initFx() {
    cv = document.createElement("canvas"); cv.id = "fx"; document.body.appendChild(cv);
    cx = cv.getContext("2d");
    const r = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
    r(); addEventListener("resize", r);
  }
  const COUL = ["#ff6b6b", "#ffd43b", "#69db7c", "#4dabf7", "#da77f2", "#ffa94d", "#f783ac"];
  function eclat(x, y, n, vit) {
    const c1 = rnd(COUL), c2 = rnd(COUL);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (0.4 + Math.random()) * vit;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vie: 60 + Math.random() * 40, c: Math.random() < .5 ? c1 : c2, t: 2 + Math.random() * 3 });
    }
    boucle();
  }
  function confettis(el) {
    const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    eclat((r.left + r.width / 2) * devicePixelRatio, (r.top + r.height / 2) * devicePixelRatio, 45, 7 * devicePixelRatio);
  }
  function feuDArtifice(ms) {
    finFeu = performance.now() + ms;
    const lancer = () => {
      if (performance.now() > finFeu) return;
      fusees.push({ x: (0.15 + Math.random() * 0.7) * cv.width, y: cv.height, vy: -(9 + Math.random() * 5) * devicePixelRatio, cible: (0.15 + Math.random() * 0.35) * cv.height, c: rnd(COUL) });
      boucle(); setTimeout(lancer, 250 + Math.random() * 300);
    };
    lancer();
  }
  function boucle() {
    if (anim) return;
    const pas = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      fusees = fusees.filter(f => {
        f.y += f.vy; cx.fillStyle = f.c; cx.beginPath(); cx.arc(f.x, f.y, 3 * devicePixelRatio, 0, 7); cx.fill();
        if (f.y <= f.cible) { eclat(f.x, f.y, 70, 6 * devicePixelRatio); return false; } return true;
      });
      parts = parts.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12 * devicePixelRatio; p.vx *= 0.985; p.vie--;
        cx.globalAlpha = Math.max(0, Math.min(1, p.vie / 40)); cx.fillStyle = p.c;
        cx.fillRect(p.x, p.y, p.t * devicePixelRatio, p.t * devicePixelRatio);
        return p.vie > 0 && p.y < cv.height;
      });
      cx.globalAlpha = 1;
      if (parts.length || fusees.length || performance.now() < finFeu) anim = requestAnimationFrame(pas);
      else { anim = null; cx.clearRect(0, 0, cv.width, cv.height); }
    };
    anim = requestAnimationFrame(pas);
  }

  /* ---------- entête ---------- */
  function entete() {
    return `<header class="top"><a href="index.html" title="Accueil">🏠</a><h1>${M.icone} ${M.titre}</h1>
      <button data-son title="Son">${son ? "🔊" : "🔇"}</button></header>`;
  }

  /* ---------- routeur ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    fermerFb(); fermerModal();
    if (h.startsWith("synthese/")) vueSynthese(h.slice(9));
    else if (h === "syntheses") vueSyntheses();
    else if (h === "fiche") vueFiche();
    else if (h === "jeu" && S) vueQuestion();
    else vueMenu();
    scrollTo(0, 0);
  }
  const aller = h => { if (location.hash === "#" + h) route(); else location.hash = h; };

  /* ---------- menu ---------- */
  function vueMenu() {
    let h = entete() + `<main class="wrap">
      <div class="tabs"><button class="${onglet === "seul" ? "on" : ""}" data-tab="seul">🎯 ${M.libSeul || "Un seul thème"}</button>
      <button class="${onglet === "mix" ? "on" : ""}" data-tab="mix">🎲 Mélange</button></div>`;
    if (onglet === "seul") {
      M.groupes.forEach(g => {
        h += `<h2 class="grp" style="--c:${g.c}">${g.nom}</h2><div class="tiles">`;
        g.t.forEach(id => {
          h += `<div class="tile" style="--c:${g.c}"><div class="tn">${M.themes[id].nom}</div>
            <div class="stars">${etoiles(store.get(`${M.id}:best:${id}`, null))}</div>
            <div class="tb"><button class="play" data-play="${id}">▶ Jouer</button>
            <a class="mini" href="#synthese/${id}" title="Feuille de synthèse">📘</a>
            <button class="mini" data-fiche="${id}" title="Fiche d'exercices à imprimer">🖨</button></div></div>`;
        });
        h += `</div>`;
      });
    } else {
      h += `<p class="aide">Coche ${M.libChoix || "les thèmes"} à mélanger :</p>
        <div class="tout"><button data-all="1">✔ Tout cocher</button><button data-all="0">✘ Tout décocher</button></div>`;
      M.groupes.forEach(g => {
        h += `<h2 class="grp" style="--c:${g.c}">${g.nom}</h2><div class="chips">`;
        g.t.forEach(id => { const on = choix.has(id); h += `<button class="chip ${on ? "on" : ""}" style="--c:${g.c}" data-chip="${id}">${on ? "✔ " : ""}${M.themes[id].nom}</button>`; });
        h += `</div>`;
      });
      const n = choix.size;
      h += `<div class="actions"><button class="btn" data-mix ${n ? "" : "disabled"}>🎲 Jouer le mélange (${n})</button>
        <button class="btn sec" data-fichemix ${n ? "" : "disabled"}>🖨 Fiche d'exercices à imprimer</button></div>`;
    }
    h += `<p class="regle">🎮 ${M.nbBase || 10} questions · ➕ ${M.parFaute || 3} questions bonus à chaque faute<br>📘 <a href="#syntheses">Toutes les feuilles de synthèse</a></p></main>`;
    app().innerHTML = h;
  }

  /* ---------- session ---------- */
  function genQ(theme, opt = {}) {
    for (let k = 0; k < 15; k++) {
      try {
        const q = M.generer(theme, Object.assign({ selection: S ? S.themes : [theme] }, opt));
        if (q) { q.theme = q.theme || theme; return q; }
      } catch (e) { console.warn(e); }
    }
    throw new Error("Impossible de générer une question pour " + theme);
  }
  function demarrer(themes) {
    S = { themes, liste: [], i: 0, fautes: 0, justes: 0, serie: 0, maxSerie: 0, cle: themes.slice().sort().join("+") };
    let ordre = [], dernier = null;
    for (let i = 0; i < (M.nbBase || 10); i++) {
      if (!ordre.length) ordre = shuffle(themes);
      const q = genQ(ordre.pop(), { eviter: dernier }); dernier = q.genre; S.liste.push(q);
    }
    aller("jeu");
  }

  function vueQuestion() {
    const q = S.liste[S.i]; cur = { sel: null, relSel: null, faits: 0, err: 0 };
    const th = M.themes[q.theme], c = couleurTheme(q.theme);
    let h = entete() + `<main class="wrap">
      <div class="qtop"><button class="x" data-quit title="Quitter">✕</button>
      <div class="bar"><div style="width:${100 * S.i / S.liste.length}%"></div></div>
      <span class="cpt">${S.i + 1} / ${S.liste.length}</span></div>
      <div class="infos"><span>✅ ${S.justes}</span><span class="flamme">${S.serie >= 2 ? "🔥 série de " + S.serie : ""}</span><span>❌ ${S.fautes}</span></div>
      <div class="card" style="--c:${c}"><div class="consigne">${q.consigne}</div>`;
    h += rendu(q) + `</div>`;
    if (q.type !== "relier") h += `<button class="btn" data-check>Vérifier</button>`;
    h += `</main>`;
    app().innerHTML = h;
    const inp = $("input.rep"); if (inp) inp.focus({ preventScroll: true });
  }

  const ACC = ["é", "è", "ê", "à", "â", "ç", "î", "ï", "ô", "û", "ù", "ë", "'"];
  const clavierAcc = () => `<div class="accents">${ACC.map(c => `<button data-acc="${esc(c)}">${c}</button>`).join("")}</div>`;
  let numerique = false; // vrai pour les réponses en nombres : clavier numérique, pas d'accents
  const champ = (cls = "") => `<input class="rep ${cls}" ${numerique ? 'inputmode="numeric" pattern="[0-9]*"' : ""} enterkeyhint="next" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">`;

  function rendu(q) {
    numerique = !!q.numerique;
    const clavier = () => numerique ? "" : clavierAcc();
    switch (q.type) {
      case "saisie":
        if (q.enonce.includes("___")) return q.enonce.replace("___", champ("inline")) + clavier();
        return q.enonce + `<div class="row">${q.avant ? `<span>${q.avant}</span>` : ""}${champ()}${q.apres ? `<span>${q.apres}</span>` : ""}</div>` + clavier();
      case "qcm":
        return q.enonce.replace("___", `<span class="blank"></span>`) +
          `<div class="opts">${q.options.map((o, i) => `<button data-opt="${i}">${o}</button>`).join("")}</div>`;
      case "vf":
        return q.enonce + `<div class="vf"><button data-vf="1">👍 Vrai</button><button data-vf="0">👎 Faux</button></div>`;
      case "tableau":
        return q.enonce + `<table class="tab-in">${q.lignes.map((l, i) => `<tr><td class="lab">${l.label}</td><td>${champ()}</td></tr>`).join("")}</table>` + clavier();
      case "relier":
        q._R = q._R || shuffle(q.paires.map(p => p[1]));
        q._L = q._L || shuffle(q.paires.map((p, i) => i));
        return q.enonce + `<div class="relier"><div class="col">${q._L.map(i => `<button data-l="${i}">${q.paires[i][0]}</button>`).join("")}</div>
          <div class="col">${q._R.map((r, j) => `<button data-r="${j}">${r}</button>`).join("")}</div></div>
          <p style="color:#868e96;font-size:14px;margin:10px 0 0">Touche un élément à gauche, puis sa paire à droite.</p>`;
    }
    return "";
  }

  function verifier() {
    if (fbOuvert) return;
    const q = S.liste[S.i]; let ok;
    if (q.type === "saisie") {
      const inp = $("input.rep"); let v = norm(inp.value); if (!v) { inp.focus(); return; }
      if (q.avant) { const a = norm(q.avant); if (v.startsWith(a + " ")) v = v.slice(a.length + 1); else if (a.endsWith("'") && v.startsWith(a)) v = v.slice(a.length); }
      ok = q.ok.some(a => norm(a) === v);
      inp.classList.add(ok ? "ok-in" : "ko-in");
    } else if (q.type === "qcm") {
      if (cur.sel == null) return; ok = q.bonne.includes(q.options[cur.sel]);
    } else if (q.type === "vf") {
      if (cur.sel == null) return; ok = (cur.sel === "1") === q.bonne;
    } else if (q.type === "tableau") {
      const ins = $$(".tab-in input"), vide = ins.find(i => !i.value.trim());
      if (vide) { // pas de faute pour une case oubliée : on la montre
        ins.forEach(i => i.classList.toggle("vide", !i.value.trim())); vide.focus();
        const m = $(".msg-vide") || $(".tab-in").insertAdjacentElement("afterend", Object.assign(document.createElement("p"), { className: "msg-vide" }));
        m.textContent = "Remplis toutes les cases avant de vérifier 🙂"; return;
      }
      ok = true;
      ins.forEach((inp, i) => {
        const l = q.lignes[i]; let v = norm(inp.value); const a = norm(l.label.replace(/<[^>]+>/g, "").split("/")[0]);
        if (v.startsWith(a + " ")) v = v.slice(a.length + 1);
        const b = l.ok.some(x => norm(x) === v); inp.classList.add(b ? "ok-in" : "ko-in"); if (!b) ok = false;
      });
    } else if (q.type === "relier") ok = cur.err === 0;
    correction(ok, q);
  }

  function correction(ok, q) {
    if (!S || location.hash !== "#jeu" || S.liste[S.i] !== q) return; // partie quittée entre-temps
    fbOuvert = true;
    const fb = $("#fb"), th = M.themes[q.theme], c = couleurTheme(q.theme);
    let h = `<div class="in">`;
    if (ok) {
      S.justes++; S.serie++; S.maxSerie = Math.max(S.maxSerie, S.serie);
      h += `<h3>${rnd(["Bravo !", "Super !", "Génial !", "Bien joué !", "Parfait !", "Champion !"])} ${rnd(["🎉", "⭐", "🚀", "🌟", "👏"])}</h3>`;
      if (q.solution) h += `<p>${q.solution}</p>`;
      if (S.serie >= 3 && S.serie % 3 === 0) h += `<p class="flamme"><b>🔥 ${S.serie} bonnes réponses d'affilée !</b></p>`;
      bip(true); confettis($("[data-check]") || $(".card"));
    } else {
      S.fautes++; S.serie = 0;
      h += `<h3>Oups ! 😬</h3><p><b>Bonne réponse :</b> ${q.solution || ""}</p>`;
      h += `<div class="rappel" style="--c:${c}">📘 <b>Rappel – ${th.nom}</b><br>${th.rappel}</div>`;
      if (q.astuce) h += `<p>💡 ${q.astuce}</p>`;
      h += `<p><button class="lien" data-synmodal="${q.theme}">Voir la feuille de synthèse complète</button></p>`;
      const n = M.parFaute || 3;
      h += `<p class="bonus">➕ ${n} questions bonus ajoutées</p>`;
      for (let k = 0; k < n; k++) S.liste.push(genQ(q.theme, { verbe: k === 0 ? q.verbe : undefined, eviter: q.genre }));
      bip(false);
    }
    h += `<button class="btn" data-next>Continuer</button></div>`;
    fb.innerHTML = h; fb.className = "fb on " + (ok ? "ok" : "ko");
    $(".bar>div").style.width = (100 * (S.i + 1) / S.liste.length) + "%";
    $(".cpt").textContent = `${S.i + 1} / ${S.liste.length}`;
    setTimeout(() => { const b = $("[data-next]"); b && b.focus({ preventScroll: true }); }, 50);
  }
  function fermerFb() { const f = $("#fb"); if (f) f.className = "fb"; fbOuvert = false; }
  function suivant() { fermerFb(); S.i++; if (S.i >= S.liste.length) vueFin(); else { vueQuestion(); scrollTo(0, 0); } }

  function vueFin() {
    const et = S.fautes === 0 ? 3 : S.fautes <= 2 ? 2 : 1;
    if (S.themes.length === 1) { const k = `${M.id}:best:${S.themes[0]}`; store.set(k, Math.max(store.get(k, 0), et)); }
    const msg = et === 3 ? "Zéro faute ! Tu es un champion ! 🏆" : et === 2 ? "Très bien joué ! 🎉" : "Bravo, tu as tenu bon jusqu'au bout ! 💪";
    app().innerHTML = entete() + `<main class="wrap fin">
      <div class="trophee">${et === 3 ? "🏆" : et === 2 ? "🥈" : "🎖️"}</div>
      <h2>${msg}</h2><div class="stars">${etoiles(et)}</div>
      <div><span class="stat">✅ ${S.justes} bonne${S.justes > 1 ? "s" : ""} réponse${S.justes > 1 ? "s" : ""}</span><span class="stat">❌ ${S.fautes} faute${S.fautes > 1 ? "s" : ""}</span><span class="stat">🔥 meilleure série : ${S.maxSerie}</span></div>
      <button class="btn" data-rejouer>🔁 Rejouer</button>
      ${S.themes.length === 1 ? `<button class="btn sec" data-train-syn="${S.themes[0]}">📘 Revoir la synthèse</button>` : ""}
      <button class="btn vio" data-menu>🏠 Retour au menu</button></main>`;
    feuDArtifice(et === 3 ? 6000 : 3500); if (son) bip(true);
  }

  /* ---------- synthèses ---------- */
  function vueSynthese(id) {
    const th = M.themes[id]; if (!th) return vueMenu();
    app().innerHTML = entete() + `<main class="wrap">
      <div class="barre-outils noprint"><a href="#">← Menu</a><button data-play="${id}">🎯 M'entraîner</button>
      <button data-print>🖨 Imprimer</button><button data-fiche="${id}">📝 Fiche d'exercices</button></div>
      <div class="syn" style="--c:${couleurTheme(id)}">${th.synthese()}</div>
      <div class="aia-print">${aia()}</div></main>`;
  }
  function vueSyntheses() {
    let h = entete() + `<main class="wrap"><div class="barre-outils noprint"><a href="#">← Menu</a></div><h2>📘 Feuilles de synthèse</h2><div class="synlist">`;
    M.groupes.forEach(g => g.t.forEach(id => { h += `<a style="--c:${g.c}" href="#synthese/${id}">${M.themes[id].nom} <small style="color:#868e96">· ${g.nom}</small></a>`; }));
    app().innerHTML = h + `</div></main>`;
  }
  function ouvrirModal(id) {
    const m = $("#modal");
    m.innerHTML = `<div class="box"><button class="fermer" data-close>✕</button><div class="syn" style="--c:${couleurTheme(id)}">${M.themes[id].synthese()}</div></div>`;
    m.classList.add("on");
  }
  function fermerModal() { const m = $("#modal"); if (m) m.classList.remove("on"); }
  const aia = () => `<img class="fiche-logo" src="logo-aia.png" alt="" onerror="this.remove()"> Aide de l'IA (AIA)`;

  /* ---------- fiche imprimable ---------- */
  function preparerFiche(themes) { store.set(M.id + ":fiche", themes); F = null; aller("fiche"); }
  function construireFiche(themes) {
    const sections = []; let n = 0; S = S || null;
    const saveS = S; S = { themes };
    M.fiche.forEach(sec => {
      const items = []; let ordre = [];
      for (let i = 0; i < sec.n; i++) {
        if (!ordre.length) ordre = shuffle(themes);
        try { items.push(genQ(ordre.pop(), { type: sec.type, papier: true })); } catch (e) {}
      }
      if (items.length) sections.push({ titre: sec.titre, items });
    });
    S = saveS;
    return { themes, sections };
  }
  const zone = (txt) => `<span class="zone" style="min-width:${Math.max(5, Math.min(14, (txt || "").length * 0.62 + 2))}em"></span>`;
  function papier(q) {
    const long = (q.ok ? q.ok[0] : "") || "";
    switch (q.type) {
      case "saisie":
        if (q.enonce.includes("___")) return q.enonce.replace("___", zone(long));
        return q.enonce + ` ${q.avant || ""} ${zone(long)}${q.apres || ""}`;
      case "qcm": return q.enonce.replace("___", zone("……")) + `<div class="choix">${q.options.map(o => `<span>○ ${o}</span>`).join(" ")}</div>`;
      case "vf": return q.enonce + `<div class="choix"><span>○ VRAI</span><span>○ FAUX</span></div>`;
      case "tableau": return q.enonce + `<table class="pt">${q.lignes.map(l => `<tr><td style="text-align:right">${l.label}</td><td>${zone(l.ok[0])}</td></tr>`).join("")}</table>`;
      case "relier": {
        q._R = shuffle(q.paires.map(p => p[1]));
        return q.enonce + `<div class="rel">${q.paires.map((p, i) => `<span>${i + 1}. ${p[0]} •</span><span></span><span class="r">• ${String.fromCharCode(97 + i)}. ${q._R[i]}</span>`).join("")}</div>`;
      }
    }
    return q.enonce;
  }
  function corrige(q) {
    switch (q.type) {
      case "qcm": return q.solution || q.bonne[0];
      case "vf": return (q.bonne ? "VRAI" : "FAUX") + (q.solution ? " – " + q.solution : "");
      case "tableau": return q.lignes.map(l => `${l.label} <b>${l.aff}</b>`).join(" ; ");
      case "relier": return q.paires.map((p, i) => `${i + 1} → ${String.fromCharCode(97 + q._R.indexOf(p[1]))}`).join(", ");
      default: return q.solution || q.ok[0];
    }
  }
  function vueFiche() {
    const themes = store.get(M.id + ":fiche", []); if (!themes.length) return vueMenu();
    if (!F || F.themes.join() !== themes.join()) F = construireFiche(themes);
    const noms = themes.map(t => M.themes[t].nom).join(", ");
    let h = `<div class="barre-outils noprint" style="max-width:800px;margin:10px auto;padding:0 16px">
      <a href="#">← Menu</a><button data-print>🖨 Imprimer</button><button data-newfiche>🔄 Nouvelle fiche (autres exercices)</button></div>
      <div class="fiche"><h1>${M.icone} ${M.titre} – Fiche d'exercices</h1><div class="sous">${noms}</div>
      <div class="ident"><span>Nom :</span><span>Date :</span></div>`;
    let num = 0, corr = "";
    F.sections.forEach((s, k) => {
      h += `<h2>${k + 1}. ${s.titre}</h2>`; corr += `<h2>${k + 1}. ${s.titre}</h2>`;
      s.items.forEach(q => { num++; h += `<div class="it"><span class="num">${num}.</span> ${papier(q)}</div>`; corr += `<div class="it"><span class="num">${num}.</span> ${corrige(q)}</div>`; });
    });
    h += `<div class="saut"></div><div class="corr"><h1>Corrigé</h1>${corr}</div>
      <p style="text-align:right;margin-top:20px;font-size:12px">${aia()}</p></div>`;
    app().innerHTML = h;
  }

  /* ---------- événements ---------- */
  function clic(e) {
    const b = e.target.closest("button,a"); if (!b) return;
    const d = b.dataset;
    if ("son" in d) { son = !son; store.set("son", son); b.textContent = son ? "🔊" : "🔇"; return; }
    if (d.tab) { onglet = d.tab; store.set(M.id + ":onglet", onglet); vueMenu(); return; }
    if (d.play) { demarrer([d.play]); return; }
    if (d.fiche) { preparerFiche([d.fiche]); return; }
    if (d.chip) { choix.has(d.chip) ? choix.delete(d.chip) : choix.add(d.chip); store.set(M.id + ":choix", [...choix]); vueMenu(); return; }
    if (d.all) { choix = new Set(d.all === "1" ? M.groupes.flatMap(g => g.t) : []); store.set(M.id + ":choix", [...choix]); vueMenu(); return; }
    if ("mix" in d) { const ordre = M.groupes.flatMap(g => g.t).filter(t => choix.has(t)); if (ordre.length) demarrer(ordre); return; }
    if ("fichemix" in d) { const ordre = M.groupes.flatMap(g => g.t).filter(t => choix.has(t)); if (ordre.length) preparerFiche(ordre); return; }
    if ("quit" in d) { if (confirm("Quitter la partie ?")) { S = null; aller(""); } return; }
    if (d.opt !== undefined) { cur.sel = +d.opt; $$("[data-opt]").forEach(x => x.classList.toggle("sel", x === b)); return; }
    if (d.vf !== undefined) { cur.sel = d.vf; $$("[data-vf]").forEach(x => x.classList.toggle("sel", x === b)); return; }
    if (d.acc !== undefined) { insere(d.acc); return; }
    if (d.l !== undefined) { if (b.classList.contains("fait") || fbOuvert) return; cur.relSel = +d.l; $$("[data-l]").forEach(x => x.classList.toggle("sel", x === b)); return; }
    if (d.r !== undefined) { relier(b); return; }
    if ("check" in d) { verifier(); return; }
    if ("next" in d) { suivant(); return; }
    if ("rejouer" in d) { demarrer(S.themes); return; }
    if ("menu" in d) { S = null; aller(""); return; }
    if (d.trainSyn) { aller("synthese/" + d.trainSyn); return; }
    if (d.synmodal) { ouvrirModal(d.synmodal); return; }
    if ("close" in d) { fermerModal(); return; }
    if ("print" in d) { print(); return; }
    if ("newfiche" in d) { F = null; vueFiche(); return; }
  }
  function relier(b) {
    if (fbOuvert || b.classList.contains("fait")) return;
    const q = S.liste[S.i]; if (cur.relSel == null) return;
    const gauche = $(`[data-l="${cur.relSel}"]`), bonne = q.paires[cur.relSel][1] === q._R[+b.dataset.r];
    if (bonne) {
      [gauche, b].forEach(x => { x.classList.remove("sel"); x.classList.add("fait"); });
      cur.faits++; cur.relSel = null; confettis(b);
      if (cur.faits === q.paires.length) setTimeout(() => correction(cur.err === 0, q), 350);
    } else {
      cur.err++; bip(false);
      [gauche, b].forEach(x => { x.classList.remove("err"); void x.offsetWidth; x.classList.add("err"); });
    }
  }
  function insere(c) {
    const inp = (dernierInput && document.body.contains(dernierInput)) ? dernierInput : $("input.rep"); if (!inp) return;
    const s = inp.selectionStart ?? inp.value.length, f = inp.selectionEnd ?? s;
    inp.value = inp.value.slice(0, s) + c + inp.value.slice(f); inp.focus(); inp.selectionStart = inp.selectionEnd = s + c.length;
  }

  /* ---------- démarrage ---------- */
  function init(matiere) {
    M = matiere;
    document.documentElement.style.setProperty("--m", M.couleur);
    document.documentElement.style.setProperty("--m-f", M.couleurFoncee || M.couleur);
    document.title = M.titre + " – Mon coin d'étude";
    son = store.get("son", true);
    onglet = store.get(M.id + ":onglet", "seul");
    choix = new Set(store.get(M.id + ":choix", M.groupes[0].t));
    document.body.insertAdjacentHTML("beforeend", `<div class="fb" id="fb"></div><div class="modal" id="modal"></div>`);
    initFx();
    document.addEventListener("click", clic);
    document.addEventListener("focusin", e => { if (e.target.matches("input.rep")) dernierInput = e.target; });
    document.addEventListener("mousedown", e => { if (e.target.closest("[data-acc]")) e.preventDefault(); });
    document.addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      if (fbOuvert) { e.preventDefault(); suivant(); return; }
      const ins = $$(".tab-in input");
      if (ins.length && e.target.matches(".tab-in input")) {
        // tableau : Entrée passe à la case suivante ; on ne vérifie que quand tout est rempli
        e.preventDefault();
        const vide = ins.find(i => !i.value.trim());
        if (vide) vide.focus(); else $("[data-check]").focus();
        return;
      }
      if ($("[data-check]")) { e.preventDefault(); verifier(); }
    });
    addEventListener("hashchange", route);
    route();
  }
  return { init, norm, shuffle, rnd, _debug: () => ({ S, M }) };
})();
