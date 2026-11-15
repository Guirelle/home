/* =====================================================================
   Conjugueur – calcule toutes les formes des verbes de la liste.
   Temps : pr im ps fs (indicatif simples) · pc pqp pa fa (composés)
           cp cpa (conditionnel) · ip (impératif) · sp spa (subjonctif)
   Personnes : 0 je · 1 tu · 2 il/elle · 3 nous · 4 vous · 5 ils/elles
   (impératif : 0 tu · 1 nous · 2 vous)
   Genre : "m", "f" ou "x" (indéterminé → accepte les deux)
   ===================================================================== */
const CONJ = (() => {
  // g : groupe · aux "e" = être · pr : présent · ps : "radical type(a|i|u|in)"
  // fu : radical du futur · pp : participe passé · sub/imp : formes irrégulières
  // c : compléments pour les phrases · cip : compléments pour l'impératif
  // alt : remplacements donnant une autre orthographe acceptée
  const V = {
    chanter: { g: 1, c: ["une chanson", "une comptine"] },
    parler: { g: 1, c: ["au professeur", "avec le voisin"] },
    jouer: { g: 1, c: ["au ballon", "dans le jardin"] },
    regarder: { g: 1, c: ["les étoiles", "un dessin animé"] },
    aimer: { g: 1, c: ["les bonbons", "la musique"] },
    crier: { g: 1, c: ["très fort", "de joie"] },
    manger: { g: 1, c: ["une pomme", "des frites"] },
    commencer: { g: 1, c: ["le puzzle", "la course"] },
    appeler: { g: 1, pr: "appelle appelles appelle appelons appelez appellent", fu: "appeller", c: ["le chien", "la voisine"] },
    jeter: { g: 1, pr: "jette jettes jette jetons jetez jettent", fu: "jetter", c: ["les papiers", "la balle"] },
    acheter: { g: 1, pr: "achète achètes achète achetons achetez achètent", fu: "achèter", c: ["du pain", "un cadeau"] },
    lever: { g: 1, pr: "lève lèves lève levons levez lèvent", fu: "lèver", c: ["la main", "le doigt"] },
    "espérer": { g: 1, pr: "espère espères espère espérons espérez espèrent", alt: [["espérer", "espèrer"]], c: ["gagner", "réussir"] },
    envoyer: { g: 1, pr: "envoie envoies envoie envoyons envoyez envoient", fu: "enverr", c: ["une carte postale", "un message"] },
    nettoyer: { g: 1, pr: "nettoie nettoies nettoie nettoyons nettoyez nettoient", fu: "nettoier", c: ["la cuisine", "le vélo"] },
    arriver: { g: 1, aux: "e", c: ["à la gare", "en avance"] },
    tomber: { g: 1, aux: "e", c: ["dans la boue", "du vélo"] },
    rester: { g: 1, aux: "e", c: ["à la maison", "au lit"] },
    entrer: { g: 1, aux: "e", c: ["dans la classe", "dans le magasin"] },
    finir: { g: 2, c: ["le repas", "les devoirs"] },
    choisir: { g: 2, c: ["un dessert", "un livre"] },
    grandir: { g: 2, c: ["très vite", "beaucoup"] },
    "réussir": { g: 2, c: ["le test", "l'examen"] },
    "obéir": { g: 2, c: ["aux règles", "au professeur"] },
    remplir: { g: 2, c: ["le verre", "la bouteille"] },
    "être": { g: 3, pr: "suis es est sommes êtes sont", ps: "f u", fu: "ser", pp: "été", imparf: "ét", sub: "sois sois soit soyons soyez soient", imp: "sois soyons soyez", c: ["à l'heure", "au rendez-vous"] },
    avoir: { g: 3, pr: "ai as a avons avez ont", ps: "e u", fu: "aur", pp: "eu", sub: "aie aies ait ayons ayez aient", imp: "aie ayons ayez", c: ["confiance", "un chat"], cip: ["confiance", "du courage"] },
    aller: { g: 3, aux: "e", pr: "vais vas va allons allez vont", ps: "all a", fu: "ir", pp: "allé", sub: "aille ailles aille allions alliez aillent", imp: "va allons allez", c: ["à l'école", "au marché"] },
    faire: { g: 3, pr: "fais fais fait faisons faites font", ps: "f i", fu: "fer", pp: "fait", sub: "fasse fasses fasse fassions fassiez fassent", c: ["un gâteau", "du vélo"] },
    dire: { g: 3, pr: "dis dis dit disons dites disent", ps: "d i", fu: "dir", pp: "dit", c: ["la vérité", "bonjour"] },
    prendre: { g: 3, pr: "prends prends prend prenons prenez prennent", ps: "pr i", fu: "prendr", pp: "pris", c: ["le bus", "une photo"] },
    mettre: { g: 3, pr: "mets mets met mettons mettez mettent", ps: "m i", fu: "mettr", pp: "mis", c: ["un manteau", "la table"] },
    venir: { g: 3, aux: "e", pr: "viens viens vient venons venez viennent", ps: "v in", fu: "viendr", pp: "venu", c: ["à la fête", "en train"] },
    tenir: { g: 3, pr: "tiens tiens tient tenons tenez tiennent", ps: "t in", fu: "tiendr", pp: "tenu", c: ["la porte", "le parapluie"] },
    partir: { g: 3, aux: "e", pr: "pars pars part partons partez partent", ps: "part i", fu: "partir", pp: "parti", c: ["en vacances", "très tôt"] },
    sortir: { g: 3, aux: "e", pr: "sors sors sort sortons sortez sortent", ps: "sort i", fu: "sortir", pp: "sorti", c: ["de la maison", "dans la cour"] },
    dormir: { g: 3, pr: "dors dors dort dormons dormez dorment", ps: "dorm i", fu: "dormir", pp: "dormi", c: ["dans la tente", "sous les étoiles"] },
    courir: { g: 3, pr: "cours cours court courons courez courent", ps: "cour u", fu: "courr", pp: "couru", c: ["très vite", "dans le parc"] },
    lire: { g: 3, pr: "lis lis lit lisons lisez lisent", ps: "l u", fu: "lir", pp: "lu", c: ["un livre", "une bande dessinée"] },
    "écrire": { g: 3, pr: "écris écris écrit écrivons écrivez écrivent", ps: "écriv i", fu: "écrir", pp: "écrit", c: ["un poème", "une lettre"] },
    voir: { g: 3, pr: "vois vois voit voyons voyez voient", ps: "v i", fu: "verr", pp: "vu", c: ["un arc-en-ciel", "la mer"] },
    boire: { g: 3, pr: "bois bois boit buvons buvez boivent", ps: "b u", fu: "boir", pp: "bu", c: ["un verre d'eau", "du jus"] },
    pouvoir: { g: 3, pr: "peux peux peut pouvons pouvez peuvent", ps: "p u", fu: "pourr", pp: "pu", sub: "puisse puisses puisse puissions puissiez puissent", imp: "", c: ["partir tôt", "jouer dehors"] },
    vouloir: { g: 3, pr: "veux veux veut voulons voulez veulent", ps: "voul u", fu: "voudr", pp: "voulu", sub: "veuille veuilles veuille voulions vouliez veuillent", imp: "veuille veuillons veuillez", c: ["un chien", "une glace"], cip: ["bien patienter", "bien attendre"] },
    savoir: { g: 3, pr: "sais sais sait savons savez savent", ps: "s u", fu: "saur", pp: "su", sub: "sache saches sache sachions sachiez sachent", imp: "sache sachons sachez", c: ["la leçon", "nager"] },
    devoir: { g: 3, pr: "dois dois doit devons devez doivent", ps: "d u", fu: "devr", pp: "dû", imp: "", c: ["ranger la chambre", "partir"] },
    recevoir: { g: 3, pr: "reçois reçois reçoit recevons recevez reçoivent", ps: "reç u", fu: "recevr", pp: "reçu", c: ["un cadeau", "une lettre"] },
    ouvrir: { g: 3, pr: "ouvre ouvres ouvre ouvrons ouvrez ouvrent", ps: "ouvr i", fu: "ouvrir", pp: "ouvert", c: ["la fenêtre", "la porte"] },
    offrir: { g: 3, pr: "offre offres offre offrons offrez offrent", ps: "offr i", fu: "offrir", pp: "offert", c: ["des fleurs", "un livre"] },
    rendre: { g: 3, pr: "rends rends rend rendons rendez rendent", ps: "rend i", fu: "rendr", pp: "rendu", c: ["les livres", "la monnaie"] },
    attendre: { g: 3, pr: "attends attends attend attendons attendez attendent", ps: "attend i", fu: "attendr", pp: "attendu", c: ["le train", "le bus"] },
    "répondre": { g: 3, pr: "réponds réponds répond répondons répondez répondent", ps: "répond i", fu: "répondr", pp: "répondu", c: ["à la question", "au téléphone"] },
    peindre: { g: 3, pr: "peins peins peint peignons peignez peignent", ps: "peign i", fu: "peindr", pp: "peint", c: ["un tableau", "la porte"] },
    "connaître": { g: 3, pr: "connais connais connaît connaissons connaissez connaissent", ps: "conn u", fu: "connaîtr", pp: "connu", alt: [["î", "i"]], c: ["la réponse", "le chemin"] }
  };

  const END = {
    im: ["ais", "ais", "ait", "ions", "iez", "aient"], fs: ["ai", "as", "a", "ons", "ez", "ont"],
    a: ["ai", "as", "a", "âmes", "âtes", "èrent"], i: ["is", "is", "it", "îmes", "îtes", "irent"],
    u: ["us", "us", "ut", "ûmes", "ûtes", "urent"], in: ["ins", "ins", "int", "înmes", "întes", "inrent"]
  };
  const AUXT = { pc: "pr", pqp: "im", pa: "ps", fa: "fs", cpa: "cp", spa: "sp" };
  const COMPOSE = Object.keys(AUXT);

  function base(inf) {
    const d = V[inf]; if (!d) throw new Error("verbe inconnu " + inf);
    if (d._b) return d._b;
    const r = inf.slice(0, -2); let pr;
    if (d.pr) pr = d.pr.split(" ");
    else if (d.g === 1) { const rn = r.endsWith("c") ? r.slice(0, -1) + "ç" : r.endsWith("g") ? r + "e" : r; pr = [r + "e", r + "es", r + "e", rn + "ons", r + "ez", r + "ent"]; }
    else pr = [r + "is", r + "is", r + "it", r + "issons", r + "issez", r + "issent"];
    const imA = d.imparf || pr[3].slice(0, -3);
    const imI = d.imparf || imA.replace(/ç$/, "c").replace(/ge$/, "g");
    let psR = r, psT = d.g === 1 ? "a" : "i"; if (d.ps) [psR, psT] = d.ps.split(" ");
    const s5 = pr[5].replace(/ent$/, "");
    const sub = d.sub ? d.sub.split(" ") : [s5 + "e", s5 + "es", s5 + "e", imI + "ions", imI + "iez", s5 + "ent"];
    let ip = null;
    if (d.imp === undefined) ip = [pr[1].endsWith("es") ? pr[1].slice(0, -1) : pr[1], pr[3], pr[4]];
    else if (d.imp) ip = d.imp.split(" ");
    return d._b = { pr, imA, imI, psR, psT, fu: d.fu || inf, pp: d.pp || (d.g === 1 ? r + "é" : r + "i"), sub, ip, aux: d.aux || "a" };
  }

  function simple(inf, t, p) {
    const b = base(inf);
    switch (t) {
      case "pr": return b.pr[p];
      case "im": return (END.im[p][0] === "i" ? b.imI : b.imA) + END.im[p];
      case "ps": {
        const e = END[b.psT][p]; let s = b.psR;
        if (b.psT === "a" && /^[aâ]/.test(e)) { if (s.endsWith("c")) s = s.slice(0, -1) + "ç"; else if (s.endsWith("g")) s += "e"; }
        return s + e;
      }
      case "fs": return b.fu + END.fs[p];
      case "cp": return b.fu + END.im[p];
      case "sp": return b.sub[p];
      case "ip": return b.ip && p < 3 ? b.ip[p] : null;
    }
    return null;
  }

  // accords du participe avec être selon personne et genre
  function accords(p, g) {
    if (p === 0 || p === 1) return { ok: ["", "e"], aff: "(e)" }; // je / tu : garçon ou fille
    if (p === 2) return g === "f" ? { ok: ["e"], aff: "e" } : g === "m" ? { ok: [""], aff: "" } : { ok: ["", "e"], aff: "(e)" };
    if (p === 3) return { ok: ["s", "es"], aff: "(e)s" };
    if (p === 4) return { ok: ["", "e", "s", "es"], aff: "(e)(s)" };
    return g === "f" ? { ok: ["es"], aff: "es" } : g === "m" ? { ok: ["s"], aff: "s" } : { ok: ["s", "es"], aff: "(e)s" };
  }

  // renvoie { ok:[formes acceptées], aff:"forme affichée" } ou null
  function conj(inf, t, p, g = "x") {
    const d = V[inf], b = base(inf); let ok, aff;
    if (AUXT[t]) {
      const a = simple(b.aux === "e" ? "être" : "avoir", AUXT[t], p);
      if (b.aux === "e") { const ac = accords(p, g); ok = ac.ok.map(e => a + " " + b.pp + e); aff = a + " " + b.pp + ac.aff; }
      else { ok = [a + " " + b.pp]; aff = ok[0]; }
    } else {
      const f = simple(inf, t, p); if (!f) return null; ok = [f]; aff = f;
    }
    if (d.alt) ok.slice().forEach(f => d.alt.forEach(([x, y]) => { const n = f.split(x).join(y); if (n !== f && !ok.includes(n)) ok.push(n); }));
    return { ok, aff };
  }

  // sujet à afficher devant la forme (élision, « que » au subjonctif)
  function sujet(t, p, g, forme) {
    if (t === "ip") return "";
    let s = ["je", "tu", g === "f" ? "elle" : "il", "nous", "vous", g === "f" ? "elles" : "ils"][p];
    if (p === 0 && /^[aeiouyhéèêâîôû]/i.test(forme || "")) s = "j'";
    if (t === "sp" || t === "spa") s = (/^[aeiouy]/i.test(s) ? "qu'" : "que ") + s;
    return s;
  }

  return { V, verbes: () => Object.keys(V), info: v => V[v], base, simple, conj, sujet, AUXT, COMPOSE };
})();
if (typeof module !== "undefined") module.exports = CONJ;
