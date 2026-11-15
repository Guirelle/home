/* =====================================================================
   MATIÈRE : Conjugaison  (s'appuie sur conjugueur.js)
   ===================================================================== */
const MATIERE = (() => {
  const C = CONJ;
  const TPS = ["pr", "im", "ps", "fs", "pc", "pqp", "pa", "fa", "cp", "cpa", "ip", "sp", "spa"];
  const COMPOSE = new Set(C.COMPOSE);
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const rint = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const join = (s, f) => !s ? f : (s.endsWith("'") ? s + f : s + " " + f);

  const GROUPES = [
    { nom: "Indicatif · temps simples", c: "#2b8a3e", t: ["pr", "im", "ps", "fs"] },
    { nom: "Indicatif · temps composés", c: "#1971c2", t: ["pc", "pqp", "pa", "fa"] },
    { nom: "Conditionnel", c: "#7048e8", t: ["cp", "cpa"] },
    { nom: "Impératif", c: "#e8590c", t: ["ip"] },
    { nom: "Subjonctif", c: "#c2255c", t: ["sp", "spa"] }
  ];
  const COL = {}; GROUPES.forEach(g => g.t.forEach(t => COL[t] = g.c));

  const META = {
    pr: { nom: "Présent", long: "Le présent de l'indicatif", au: "au présent de l'indicatif" },
    im: { nom: "Imparfait", long: "L'imparfait de l'indicatif", au: "à l'imparfait" },
    ps: { nom: "Passé simple", long: "Le passé simple", au: "au passé simple" },
    fs: { nom: "Futur simple", long: "Le futur simple", au: "au futur simple" },
    pc: { nom: "Passé composé", long: "Le passé composé", au: "au passé composé" },
    pqp: { nom: "Plus-que-parfait", long: "Le plus-que-parfait", au: "au plus-que-parfait" },
    pa: { nom: "Passé antérieur", long: "Le passé antérieur", au: "au passé antérieur" },
    fa: { nom: "Futur antérieur", long: "Le futur antérieur", au: "au futur antérieur" },
    cp: { nom: "Conditionnel présent", long: "Le conditionnel présent", au: "au conditionnel présent" },
    cpa: { nom: "Conditionnel passé", long: "Le conditionnel passé", au: "au conditionnel passé" },
    ip: { nom: "Impératif présent", long: "L'impératif présent", au: "à l'impératif présent" },
    sp: { nom: "Subjonctif présent", long: "Le subjonctif présent", au: "au subjonctif présent" },
    spa: { nom: "Subjonctif passé", long: "Le subjonctif passé", au: "au subjonctif passé" }
  };

  /* ---------- rappels courts (affichés après une faute) ---------- */
  const RAPPEL = {
    pr: "1er groupe : -e, -es, -e, -ons, -ez, -ent · 2e groupe : -is, -is, -it, -issons, -issez, -issent · 3e groupe le plus souvent : -s, -s, -t (-d pour les verbes en -dre), -ons, -ez, -ent.",
    im: "Radical de « nous » au présent + <b class='t'>-ais, -ais, -ait, -ions, -iez, -aient</b> (nous finiss<s>ons</s> → je finissais). Seul être change : j'étais.",
    ps: "1er groupe et aller : <b class='t'>-ai, -as, -a, -âmes, -âtes, -èrent</b> · autres verbes : -is… (il prit), -us… (il voulut) ou -ins… (il vint). Accent circonflexe à nous et vous.",
    fs: "Infinitif + <b class='t'>-ai, -as, -a, -ons, -ez, -ont</b> (verbes en -re : on enlève le e). Radicaux spéciaux : ser-, aur-, ir-, fer-, viendr-, verr-, pourr-, voudr-, saur-…",
    pc: "Auxiliaire <b>avoir</b> ou <b>être</b> au <b>présent</b> + participe passé. Avec être, le participe s'accorde avec le sujet (elles sont parti<b class='t'>es</b>).",
    pqp: "Auxiliaire avoir ou être à l'<b>imparfait</b> + participe passé (j'avais chanté, elle était parti<b class='t'>e</b>).",
    pa: "Auxiliaire avoir ou être au <b>passé simple</b> + participe passé (il eut chanté, elle fut parti<b class='t'>e</b>).",
    fa: "Auxiliaire avoir ou être au <b>futur simple</b> + participe passé (j'aurai fini, nous serons parti<b class='t'>s</b>).",
    cp: "Radical du <b>futur</b> + terminaisons de l'<b>imparfait</b> : <b class='t'>-ais, -ais, -ait, -ions, -iez, -aient</b> (je chanterais, nous ferions).",
    cpa: "Auxiliaire avoir ou être au <b>conditionnel présent</b> + participe passé (j'aurais chanté, elle serait venu<b class='t'>e</b>).",
    ip: "3 personnes (tu, nous, vous), pas de sujet. Pas de -s à « tu » quand le présent finit par -es : Chante ! Ouvre ! Va ! (mais Finis ! Prends !).",
    sp: "Après « que ». Radical de « ils » au présent + <b class='t'>-e, -es, -e, -ions, -iez, -ent</b> (ils finiss<s>ent</s> → que je finisse). Irréguliers : sois, aie, aille, fasse, puisse, sache, veuille.",
    spa: "Auxiliaire avoir ou être au <b>subjonctif présent</b> + participe passé (que j'aie fini, qu'elle soit venu<b class='t'>e</b>)."
  };

  /* ---------- contenu des synthèses ---------- */
  const TERM = (titres, lignes) => `<table class="term"><tr><th></th>${titres.map(t => `<th>${t}</th>`).join("")}</tr>${lignes.map(l => `<tr><th>${l[0]}</th>${l.slice(1).map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</table>`;
  const P6 = ["je", "tu", "il / elle", "nous", "vous", "ils / elles"];
  const SYN = {
    pr: {
      usage: "Pour dire ce qui se passe <b>maintenant</b>, une <b>habitude</b> (<i>chaque matin, je déjeune</i>) ou une <b>vérité</b> (<i>la Terre tourne</i>).",
      formation: "<p>On garde le radical et on ajoute la terminaison du groupe :</p>" + TERM(["1er groupe<br><small>-er</small>", "2e groupe<br><small>-ir, nous -issons</small>", "3e groupe<br><small>le plus souvent</small>"],
        P6.map((p, i) => [p, ["e", "es", "e", "ons", "ez", "ent"][i], ["is", "is", "it", "issons", "issez", "issent"][i], ["s", "s", "t / d", "ons", "ez", "ent"][i]].map((x, k) => k ? `<b class='t'>-${x}</b>` : x))),
      modeles: ["chanter", "finir", "prendre", "être", "avoir", "aller", "faire"],
      pieges: ["-cer : nous commen<b class='t'>ç</b>ons · -ger : nous mang<b class='t'>e</b>ons", "appeler, jeter : j'appe<b class='t'>ll</b>e, je je<b class='t'>tt</b>e · acheter, lever : j'ach<b class='t'>è</b>te · envoyer : j'envo<b class='t'>i</b>e", "Verbes en -dre : il pren<b class='t'>d</b>, il ren<b class='t'>d</b> (pas de t) · pouvoir, vouloir : je peu<b class='t'>x</b>, je veu<b class='t'>x</b>", "Vous <b>faites</b>, vous <b>dites</b>, vous <b>êtes</b> (jamais « faisez »)", "Ouvrir, offrir se conjuguent comme chanter : j'ouvr<b class='t'>e</b>", "ils / elles : le <b class='t'>-ent</b> ne s'entend pas, mais il s'écrit !"],
      indices: "aujourd'hui, maintenant, en ce moment, chaque jour, toujours"
    },
    im: {
      usage: "Pour raconter au passé une <b>habitude</b> (<i>chaque été, nous allions à la mer</i>), une <b>description</b> (<i>il faisait beau</i>) ou une action qui <b>dure</b> (<i>je lisais quand le téléphone a sonné</i>).",
      formation: "<p>Radical de « <b>nous</b> » au présent + les mêmes terminaisons pour <b>tous</b> les verbes :</p>" + TERM(["terminaison", "exemple"], P6.map((p, i) => [p, `<b class='t'>-${["ais", "ais", "ait", "ions", "iez", "aient"][i]}</b>`, ["je finissais", "tu finissais", "il finissait", "nous finissions", "vous finissiez", "ils finissaient"][i]])) + "<p>nous finiss<s>ons</s> → je finiss<b class='t'>ais</b> · nous pren<s>ons</s> → je pren<b class='t'>ais</b></p>",
      modeles: ["chanter", "finir", "prendre", "être", "avoir", "faire", "manger"],
      pieges: ["Seul <b>être</b> a un radical spécial : j'<b class='t'>ét</b>ais", "-cer et -ger devant a : je commen<b class='t'>ç</b>ais, je mang<b class='t'>e</b>ais (mais nous commencions, nous mangions)", "Verbes en -ier, -yer : nous cri<b class='t'>i</b>ons, nous envo<b class='t'>yi</b>ons (on entend mal le i, mais il est là)", "je / tu <b class='t'>-ais</b>, il <b class='t'>-ait</b> : même son, il faut regarder le sujet"],
      indices: "autrefois, avant, d'habitude, chaque été, quand j'étais petit"
    },
    ps: {
      usage: "Temps du <b>récit</b> (contes, romans) pour des actions <b>courtes et terminées</b> qui se suivent : <i>Il ouvrit la porte, entra et cria.</i> On le rencontre surtout à la 3e personne (il, ils).",
      formation: TERM(["1er groupe + aller", "-is", "-us", "-ins"], P6.map((p, i) => [p, ...["a", "i", "u", "in"].map(k => `<b class='t'>-${({ a: ["ai", "as", "a", "âmes", "âtes", "èrent"], i: ["is", "is", "it", "îmes", "îtes", "irent"], u: ["us", "us", "ut", "ûmes", "ûtes", "urent"], in: ["ins", "ins", "int", "înmes", "întes", "inrent"] })[k][i]}</b>`)])) +
        "<p><b>-is</b> : 2e groupe et beaucoup de verbes du 3e (il finit, il prit, il fit, il dit, il vit) · <b>-us</b> : il fut, il eut, il voulut, il put, il lut, il but · <b>-ins</b> : venir, tenir (il vint)</p>",
      modeles: ["chanter", "finir", "prendre", "être", "avoir", "vouloir", "venir"],
      pieges: ["Accent circonflexe à nous et vous : nous chant<b class='t'>â</b>mes, vous f<b class='t'>î</b>tes", "il chant<b class='t'>a</b> (1er groupe) ≠ il fin<b class='t'>it</b>", "ils chant<b class='t'>èrent</b> (jamais « chantirent »)", "je chantai (passé simple) ≠ je chantais (imparfait)", "Au singulier, finir donne la même forme au présent et au passé simple : il finit"],
      indices: "soudain, tout à coup, ce jour-là, le lendemain, il était une fois"
    },
    fs: {
      usage: "Pour dire ce qui se passera <b>plus tard</b>.",
      formation: "<p><b>Infinitif</b> + terminaisons (on entend toujours un <b>r</b> juste avant) :</p>" + TERM(["terminaison", "chanter", "prendre"], P6.map((p, i) => [p, `<b class='t'>-${["ai", "as", "a", "ons", "ez", "ont"][i]}</b>`, "chanter" + ["ai", "as", "a", "ons", "ez", "ont"][i], "prendr" + ["ai", "as", "a", "ons", "ez", "ont"][i]])) + "<p>Verbes en <b>-re</b> : on enlève le e (prendr<s>e</s> → je prendrai).</p>",
      modeles: ["chanter", "finir", "prendre", "être", "avoir", "aller", "faire"],
      pieges: ["Radicaux spéciaux : je <b class='t'>ser</b>ai, j'<b class='t'>aur</b>ai, j'<b class='t'>ir</b>ai, je <b class='t'>fer</b>ai, je <b class='t'>viendr</b>ai, je <b class='t'>verr</b>ai, je <b class='t'>pourr</b>ai, je <b class='t'>voudr</b>ai, je <b class='t'>saur</b>ai, je <b class='t'>devr</b>ai", "Deux r : je cou<b class='t'>rr</b>ai, je ve<b class='t'>rr</b>ai, j'enve<b class='t'>rr</b>ai, je pou<b class='t'>rr</b>ai", "e muet : je jou<b class='t'>e</b>rai, je cri<b class='t'>e</b>rai", "j'appe<b class='t'>ll</b>erai, j'ach<b class='t'>è</b>terai, je netto<b class='t'>i</b>erai", "je chanter<b class='t'>ai</b> (futur) ≠ je chanter<b class='t'>ais</b> (conditionnel)"],
      indices: "demain, bientôt, plus tard, l'année prochaine"
    },
    pc: {
      usage: "Pour dire qu'une action est <b>terminée</b> dans le passé : <i>Hier, j'ai mangé une glace.</i>",
      formation: "<p>Auxiliaire <b>avoir</b> ou <b>être</b> au <b>présent</b> + <b>participe passé</b> : j'<span class='aux'>ai</span> chanté · elle <span class='aux'>est</span> partie.</p>",
      modeles: ["chanter", "finir", "prendre", "aller", "venir", "être", "avoir"],
      pieges: ["Avec <b>être</b>, le participe s'accorde avec le sujet : elle est parti<b class='t'>e</b>, ils sont venu<b class='t'>s</b>", "Avec <b>avoir</b>, pas d'accord avec le sujet : elles ont chanté", "Participe en -é ou -er ? Remplace par « vendu » : il a chanté → il a vendu ✔", "Être et avoir se conjuguent avec avoir : j'ai été, j'ai eu"],
      indices: "hier, ce matin, la semaine dernière, déjà"
    },
    pqp: {
      usage: "Pour une action passée qui a eu lieu <b>avant</b> une autre action passée : <i>Quand je suis arrivé, le film avait commencé.</i>",
      formation: "<p>Auxiliaire avoir ou être à l'<b>imparfait</b> + participe passé : j'<span class='aux'>avais</span> chanté · elle <span class='aux'>était</span> partie.</p>",
      modeles: ["chanter", "finir", "prendre", "aller", "venir", "être", "avoir"],
      pieges: ["Mêmes accords qu'au passé composé : elles étaient parti<b class='t'>es</b>", "j'avai<b class='t'>s</b>, il avai<b class='t'>t</b>, ils avai<b class='t'>ent</b> : terminaisons de l'imparfait"],
      indices: "déjà, la veille, avant, plus tôt"
    },
    pa: {
      usage: "Dans un récit au passé simple, pour une action terminée <b>juste avant</b> une autre : <i>Dès qu'il eut fini, il sortit.</i>",
      formation: "<p>Auxiliaire avoir ou être au <b>passé simple</b> + participe passé : il <span class='aux'>eut</span> chanté · elle <span class='aux'>fut</span> partie.</p>",
      modeles: ["chanter", "finir", "prendre", "aller", "venir", "être", "avoir"],
      pieges: ["On le trouve souvent après <b>dès que, quand, lorsque, après que, aussitôt que</b>", "il eu<b class='t'>t</b> chanté : pas d'accent circonflexe", "Accord avec être : elles furent parti<b class='t'>es</b>"],
      indices: "dès que, quand, lorsque, après que, aussitôt que (+ passé simple)"
    },
    fa: {
      usage: "Pour une action future qui sera <b>terminée avant</b> une autre action future : <i>Quand tu rentreras, j'aurai fini mes devoirs.</i>",
      formation: "<p>Auxiliaire avoir ou être au <b>futur simple</b> + participe passé : j'<span class='aux'>aurai</span> fini · nous <span class='aux'>serons</span> partis.</p>",
      modeles: ["chanter", "finir", "prendre", "aller", "venir", "être", "avoir"],
      pieges: ["j'aur<b class='t'>ai</b> fini (futur antérieur) ≠ j'aur<b class='t'>ais</b> fini (conditionnel passé)", "Accord avec être : nous serons parti<b class='t'>s</b>"],
      indices: "quand, dès que, lorsque (+ futur), d'ici demain, avant ce soir"
    },
    cp: {
      usage: "Pour une action qui dépend d'une <b>condition</b> (<i>si j'étais riche, j'achèterais un bateau</i>), un <b>souhait</b> (<i>j'aimerais…</i>) ou une demande <b>polie</b> (<i>pourrais-tu… ?</i>).",
      formation: "<p><b>Radical du futur</b> + <b>terminaisons de l'imparfait</b> :</p>" + TERM(["terminaison", "chanter", "être"], P6.map((p, i) => [p, `<b class='t'>-${["ais", "ais", "ait", "ions", "iez", "aient"][i]}</b>`, "chanter" + ["ais", "ais", "ait", "ions", "iez", "aient"][i], "ser" + ["ais", "ais", "ait", "ions", "iez", "aient"][i]])),
      modeles: ["chanter", "finir", "prendre", "être", "avoir", "aller", "faire"],
      pieges: ["Si + imparfait → conditionnel : <i>Si j'avais le temps, je viendrais</i> (jamais « si j'aurais »)", "Mêmes radicaux spéciaux qu'au futur : je serais, j'aurais, j'irais, je ferais, je pourrais…", "je chanterais (conditionnel) ≠ je chanterai (futur) : passe à « nous » pour entendre la différence (nous chanterions / nous chanterons)"],
      indices: "si + imparfait, j'aimerais, à ta place, volontiers"
    },
    cpa: {
      usage: "Pour une action passée qui <b>ne s'est pas réalisée</b> parce qu'une condition manquait, ou pour un regret : <i>Si j'avais su, je serais venu.</i>",
      formation: "<p>Auxiliaire avoir ou être au <b>conditionnel présent</b> + participe passé : j'<span class='aux'>aurais</span> chanté · elle <span class='aux'>serait</span> venue.</p>",
      modeles: ["chanter", "finir", "prendre", "aller", "venir", "être", "avoir"],
      pieges: ["Si + plus-que-parfait → conditionnel passé : <i>Si tu étais venu, tu aurais ri</i>", "Accord avec être : elle serait venu<b class='t'>e</b>", "j'aur<b class='t'>ais</b> chanté (conditionnel passé) ≠ j'aur<b class='t'>ai</b> chanté (futur antérieur)"],
      indices: "si + plus-que-parfait, sans…, à ta place"
    },
    ip: {
      usage: "Pour donner un <b>ordre</b>, un <b>conseil</b> ou une <b>interdiction</b> (forme négative : <i>Ne cours pas !</i>).",
      formation: "<p>Seulement <b>3 personnes</b> (tu, nous, vous) et <b>pas de sujet</b>. On prend les formes du présent.</p>",
      modeles: ["chanter", "finir", "prendre", "aller", "être", "avoir", "savoir"],
      pieges: ["Pas de -s à « tu » quand le présent finit par -es : tu chantes → <b>Chante !</b> · tu ouvres → <b>Ouvre !</b> · tu vas → <b>Va !</b>", "Mais on garde le s : <b>Finis ! Prends ! Fais !</b>", "Devant en et y : <b>Vas-y ! Manges-en !</b>", "Trait d'union avec un pronom : Regarde-moi ! Donne-le-moi !", "Formes spéciales : sois, soyons, soyez · aie, ayons, ayez · sache… · veuillez"],
      indices: "pas de sujet, souvent un point d'exclamation"
    },
    sp: {
      usage: "Après <b>que</b>, pour une <b>obligation</b>, un <b>souhait</b>, un sentiment ou un doute : <i>Il faut que tu viennes. Je veux que tu saches.</i>",
      formation: "<p>Radical de « <b>ils</b> » au présent + terminaisons :</p>" + TERM(["terminaison", "finir"], P6.map((p, i) => [p.replace(/^(il|ils)/, "qu'$1").replace(/^(je|tu|nous|vous)/, "que $1"), `<b class='t'>-${["e", "es", "e", "ions", "iez", "ent"][i]}</b>`, "finiss" + ["e", "es", "e", "ions", "iez", "ent"][i]])) + "<p>ils finiss<s>ent</s> → que je finiss<b class='t'>e</b> · Avec nous et vous, on retrouve souvent la forme de l'imparfait.</p>",
      modeles: ["chanter", "finir", "prendre", "être", "avoir", "aller", "faire"],
      pieges: ["Très irréguliers : que je <b>sois</b>, que j'<b>aie</b>, que j'<b>aille</b>, que je <b>fasse</b>, que je <b>puisse</b>, que je <b>sache</b>, que je <b>veuille</b>", "que j'ai<b class='t'>e</b>, qu'il ai<b class='t'>t</b> (pas « que j'ai »)", "que nous soyons, que nous ayons : <b>pas de i</b> après le y", "Truc : remplace par « faire » → si tu dis « que je fasse », c'est le subjonctif"],
      indices: "il faut que, je veux que, avant que, pour que, bien que"
    },
    spa: {
      usage: "Après <b>que</b>, pour une action <b>déjà terminée</b> : <i>Je suis content que tu aies réussi.</i>",
      formation: "<p>Auxiliaire avoir ou être au <b>subjonctif présent</b> + participe passé : que j'<span class='aux'>aie</span> fini · qu'elle <span class='aux'>soit</span> venue.</p>",
      modeles: ["chanter", "finir", "prendre", "aller", "venir", "être", "avoir"],
      pieges: ["que j'ai<b class='t'>e</b> fini, qu'il ai<b class='t'>t</b> fini", "Accord avec être : qu'elle soit venu<b class='t'>e</b>"],
      indices: "je suis content que, il est dommage que, bien que, avant que"
    }
  };
  const AUXBOX = `<section><h2>🤔 Avoir ou être ?</h2><ul>
    <li>La plupart des verbes se conjuguent avec <b>avoir</b>.</li>
    <li>Avec <b>être</b> : aller, venir, arriver, partir, entrer, sortir, rester, tomber, naître, mourir, devenir, monter, descendre, retourner… et les verbes pronominaux (je me suis lavé).</li>
    <li><b>Participe passé</b> : 1er groupe <b>-é</b> (chanté) · 2e groupe <b>-i</b> (fini) · 3e groupe -i, -is, -it, -u, -ert… (parti, pris, dit, vu, ouvert).<br>Astuce : mets-le au féminin pour entendre la lettre finale : pri<b>s</b>e → pris · di<b>t</b>e → dit.</li></ul></section>`;

  function tableVerbe(v, t) {
    const pers = t === "ip" ? [0, 1, 2] : [0, 1, 2, 3, 4, 5];
    const formes = pers.map(p => C.conj(v, t, p, "x")); if (formes.some(f => !f)) return "";
    let pref = "";
    if (!COMPOSE.has(t)) { pref = formes[0].aff; formes.forEach(f => { while (!f.aff.startsWith(pref)) pref = pref.slice(0, -1); }); if (pref.length < 2) pref = ""; }
    const rows = pers.map((p, i) => {
      const f = formes[i];
      let lab = t === "ip" ? ["(tu)", "(nous)", "(vous)"][p] : C.sujet(t, p, "m", f.ok[0]);
      if (p === 2 && t !== "ip") lab = lab.replace(/il$/, "il/elle"); if (p === 5) lab = lab.replace(/ils$/, "ils/elles");
      let txt;
      if (COMPOSE.has(t)) { const [a, ...r] = f.aff.split(" "); txt = `<span class="aux">${a}</span> ${r.join(" ")}`; }
      else txt = pref ? pref + `<b class="t">${f.aff.slice(pref.length)}</b>` : f.aff;
      return `<tr><td class="pro">${lab}</td><td>${txt}${t === "ip" ? " !" : ""}</td></tr>`;
    }).join("");
    return `<table class="conj"><caption>${v}</caption>${rows}</table>`;
  }
  function synthese(t) {
    const s = SYN[t];
    return `<h1>${META[t].long}</h1>
      <section><h2>🕐 Quand l'utiliser ?</h2><p>${s.usage}</p></section>
      <section><h2>🔧 Comment le former ?</h2>${s.formation}</section>
      ${COMPOSE.has(t) ? AUXBOX : ""}
      <section><h2>📋 Modèles</h2><div class="tables">${s.modeles.map(v => tableVerbe(v, t)).join("")}</div></section>
      <section class="pieges"><h2>⚠️ Attention, pièges !</h2><ul>${s.pieges.map(x => `<li>${x}</li>`).join("")}</ul></section>
      <section><h2>🔎 Mots-indices</h2><p>${s.indices}</p></section>`;
  }

  /* ---------- fabrication des items ---------- */
  const IPL = ["(tu)", "(nous)", "(vous)"];
  const IPP = ["2e pers. du singulier (tu)", "1re pers. du pluriel (nous)", "2e pers. du pluriel (vous)"];
  const CUE = {
    pr: ["Aujourd'hui,", "En ce moment,", "Chaque matin,", "Maintenant,"],
    im: ["Autrefois,", "Quand nous étions petits,", "Chaque été,", "D'habitude,"],
    ps: ["Ce jour-là,", "Soudain,", "Tout à coup,", "Le lendemain,"],
    fs: ["Demain,", "L'année prochaine,", "Plus tard,", "Dimanche prochain,"],
    pc: ["Hier,", "Ce matin,", "La semaine dernière,", "Samedi dernier,"],
    pqp: ["La veille,", "Avant la fête,", "Une heure plus tôt,", "Le jour d'avant,"],
    fa: ["Avant ce soir,", "D'ici demain,", "Quand tu rentreras,", "Dans une heure,"],
    cp: ["Si c'était possible,", "Avec un peu de chance,", "Si nous avions le temps,", "S'il faisait beau,"],
    cpa: ["Si nous avions su,", "Sans la pluie,", "Avec plus de temps,", "Sans cet orage,"],
    sp: ["Il faut", "Maman veut", "Il est important", "Papa souhaite"],
    spa: ["Je suis content", "Il est dommage", "Nous sommes ravis", "Il est possible"]
  };
  const verbesPour = t => C.verbes().filter(v => C.conj(v, t, 0, "m"));
  function pickVerb(t, v) { return v && C.conj(v, t, 0, "m") ? v : rnd(verbesPour(t)); }
  function pickPers(t) { if (t === "ip") return rint(3); if (t === "ps" || t === "pa") return Math.random() < .6 ? rnd([2, 5]) : rint(6); return rint(6); }
  function item(t, v, p, g) {
    v = pickVerb(t, v); p = p === undefined ? pickPers(t) : p; g = g || (Math.random() < .5 ? "m" : "f");
    const c = C.conj(v, t, p, g); return { t, v, p, g, ok: c.ok, aff: c.aff, suj: C.sujet(t, p, g, c.ok[0]) };
  }
  const disp = (it, f) => { f = f || it.ok[0]; return it.t === "ip" ? cap(f) + " !" : join(it.suj, f); };
  const dispAff = it => it.t === "ip" ? cap(it.aff) + " !" : join(it.suj, it.aff);
  function disps(v, t, p, g) { const c = C.conj(v, t, p, g); if (!c) return []; return c.ok.map(f => (t === "ip" ? cap(f) + " !" : join(C.sujet(t, p, g, f), f)).toLowerCase()); }
  function ambigu(it, t2) { if (t2 === it.t) return true; const a = disps(it.v, it.t, it.p, it.g), b = disps(it.v, t2, it.p, it.g); return a.some(x => b.includes(x)); }
  const tag = t => `<span class="tag" style="--c:${COL[t]}">${META[t].nom}</span>`;
  function compl(it) { const d = C.info(it.v); return rnd(it.t === "ip" && d.cip ? d.cip : d.c); }
  function cadre(it, comp, avecIndice) {
    const t = it.t;
    if (t === "ip") return { avant: "", apres: " " + comp + " !" };
    if (t === "sp" || t === "spa") return { avant: rnd(CUE[t]) + " " + it.suj, apres: " " + comp + "." };
    if (t === "pa") return { avant: (/^[aeiouy]/.test(it.suj) ? "Dès qu'" : "Dès que ") + it.suj, apres: " " + comp + ", tout le monde applaudit." };
    return { avant: avecIndice ? rnd(CUE[t]) + " " + it.suj : cap(it.suj), apres: " " + comp + "." };
  }
  const phraseSol = (fr, it) => fr.avant ? join(fr.avant, `<b>${it.aff}</b>`) + fr.apres : `<b>${cap(it.aff)}</b>` + fr.apres;
  const autres = (t, sel) => { const pool = (sel && sel.length > 1 ? sel : TPS).filter(x => x !== t); return pool.length ? pool : TPS.filter(x => x !== t); };

  // mauvaises formes plausibles (pour QCM et vrai/faux)
  function fautes(it) {
    const out = [], f = it.ok[0], b = C.base(it.v);
    if (COMPOSE.has(it.t)) {
      const aux = f.split(" ")[0], pp = b.pp;
      const a2 = C.simple(b.aux === "e" ? "avoir" : "être", C.AUXT[it.t], it.p);
      out.push(a2 + " " + pp);
      if (pp.endsWith("é")) out.push(aux + " " + pp.slice(0, -1) + "er", aux + " " + pp.slice(0, -1) + "ez");
      if (/i$/.test(pp)) out.push(aux + " " + pp + "t", aux + " " + pp + "s");
      if (/[st]$/.test(pp)) out.push(aux + " " + pp.slice(0, -1), aux + " " + pp.slice(0, -1) + (pp.endsWith("s") ? "t" : "s"));
      if (/u$/.test(pp)) out.push(aux + " " + pp + "t", aux + " " + pp + "s");
      if (b.aux === "a" && it.p >= 3) out.push(f + "s");
    } else {
      if (/ais$/.test(f)) out.push(f.slice(0, -1), f.slice(0, -1) + "t");
      else if (/ait$/.test(f)) out.push(f.slice(0, -1) + "s");
      else if (/ai$/.test(f)) out.push(f + "s");
      else if (/es$/.test(f)) out.push(f.slice(0, -1));
      else if (/s$/.test(f)) out.push(f.slice(0, -1) + "t", f.slice(0, -1));
      else if (/t$/.test(f)) out.push(f.slice(0, -1) + "s");
      if (/e$/.test(f)) out.push(f + "s");
      if (/èrent$/.test(f)) out.push(f.replace(/èrent$/, "irent"), f.replace(/èrent$/, "arent"));
      if (/[âîû](mes|tes)$/.test(f)) out.push(f.replace(/[âîû]/, m => ({ "â": "a", "î": "i", "û": "u" })[m]));
      if (/ent$/.test(f) && it.t !== "ps") out.push(f.replace(/ent$/, "es"));
      if (it.t === "ps" && /a$/.test(f)) out.push(f + "t");
      if (/(ons|ez)$/.test(f) && it.t === "sp") out.push(f.replace(/ons$/, "ions").replace(/ez$/, "iez"));
    }
    return [...new Set(out)].filter(x => !it.ok.includes(x) && !/undefined|null/.test(x));
  }
  function distracteurs(it, n) {
    const pers = it.t === "ip" ? [1, 3, 4][it.p] : it.p, cands = [];
    const ft = fautes(it); cands.push(...shuffle(ft).slice(0, 2));
    shuffle(TPS.filter(t => t !== it.t)).forEach(t2 => { const c = C.conj(it.v, t2, t2 === "ip" ? it.p : pers, it.g); if (c && !COMPOSE.has(t2) === !COMPOSE.has(it.t)) cands.push(c.ok[0]); });
    for (let p = 0; p < (it.t === "ip" ? 3 : 6); p++) if (p !== it.p) { const c = C.conj(it.v, it.t, p, it.g); if (c) cands.push(c.ok[0]); }
    cands.push(...ft);
    return [...new Set(cands)].filter(x => x && !it.ok.includes(x)).slice(0, n);
  }

  /* ---------- types de questions ---------- */
  const GEN = {
    saisie(t, o) {
      const it = item(t, o.verbe);
      return { type: "saisie", consigne: "Conjugue", verbe: it.v,
        enonce: `${tag(t)}<div class="big">Verbe <b class="verbe">${it.v}</b>${t === "ip" ? `<br><small>${IPP[it.p]}</small>` : ""}</div>`,
        avant: it.suj, apres: t === "ip" ? " !" : "", ok: it.ok, solution: `<b>${dispAff(it)}</b>` };
    },
    phrase(t, o) {
      const it = item(t, o.verbe), fr = cadre(it, compl(it), true);
      return { type: "saisie", consigne: "Complète la phrase", verbe: it.v, ok: it.ok,
        enonce: `${tag(t)}<div class="big">${fr.avant} ___${fr.apres} <span class="inf">(${it.v}${t === "ip" ? ", " + IPL[it.p].slice(1, -1) : ""})</span></div>`,
        solution: phraseSol(fr, it) };
    },
    transfo(t, o) {
      const it = item(t, o.verbe), comp = compl(it), st = t === "pr" ? "fs" : "pr", sp = t === "ip" ? [1, 3, 4][it.p] : it.p;
      const sc = C.conj(it.v, st, sp, it.g), src = cap(join(C.sujet(st, sp, it.g, sc.ok[0]), sc.ok[0])) + " " + comp + ".";
      const fr = cadre(it, comp, false);
      return { type: "saisie", consigne: "Transforme la phrase", verbe: it.v, ok: it.ok,
        enonce: `${tag(t)}<div class="src">${src}</div><div class="arrow">➜ ${t === "ip" ? "Transforme en ordre (impératif)" : "Mets " + META[t].au} :</div><div class="big">${fr.avant} ___${fr.apres}</div>`,
        solution: phraseSol(fr, it) };
    },
    qcm(t, o) {
      const it = item(t, o.verbe), fr = cadre(it, compl(it), true), d = distracteurs(it, 3);
      if (d.length < 3) throw 0;
      return { type: "qcm", consigne: "Choisis la bonne forme", verbe: it.v, options: shuffle([it.ok[0], ...d]), bonne: it.ok,
        enonce: `${tag(t)}<div class="big">${fr.avant} ___${fr.apres} <span class="inf">(${it.v}${t === "ip" ? ", " + IPL[it.p].slice(1, -1) : ""})</span></div>`, solution: phraseSol(fr, it) };
    },
    temps(t, o) {
      const it = item(t, o.verbe);
      if (TPS.some(x => x !== t && ambigu(it, x))) throw 0; // ex. « il finit » : présent ou passé simple → on évite
      let pool = shuffle(autres(t, o.selection)).filter(x => !ambigu(it, x));
      if (pool.length < 3) pool = pool.concat(shuffle(TPS).filter(x => x !== t && !pool.includes(x) && !ambigu(it, x)));
      if (pool.length < 3) throw 0;
      return { type: "qcm", consigne: "À quel temps est ce verbe ?", verbe: it.v,
        options: shuffle([t, ...pool.slice(0, 3)]).map(x => META[x].nom), bonne: [META[t].nom],
        enonce: `<div class="big forme">${disp(it)}</div><span class="inf">(verbe ${it.v})</span>`,
        solution: `« ${disp(it)} » est <b>${META[t].au}</b>.` };
    },
    relier(t, o) {
      const v = pickVerb(t, o.verbe), g = Math.random() < .5 ? "m" : "f", vus = new Set(), paires = [];
      for (const p of shuffle(t === "ip" ? [0, 1, 2] : [0, 1, 2, 3, 4, 5])) {
        const c = C.conj(v, t, p, g); const droite = t === "ip" ? cap(c.aff) + " !" : c.aff;
        if (vus.has(droite)) continue; vus.add(droite);
        paires.push([t === "ip" ? IPL[p] : C.sujet(t, p, g, c.ok[0]), droite]); if (paires.length === 4) break;
      }
      if (paires.length < 3) throw 0;
      return { type: "relier", consigne: "Relie chaque sujet à la bonne forme", verbe: v, paires,
        enonce: `${tag(t)}<div class="big">Verbe <b class="verbe">${v}</b></div>`,
        solution: paires.map(p => `${p[0]} → <b>${p[1]}</b>`).join(" · ") };
    },
    relierT(t, o) {
      const sel = o.selection || []; if (sel.length < 2) throw 0;
      const v = pickVerb(t, o.verbe), g = Math.random() < .5 ? "m" : "f";
      const p0 = pickPers(t), choisis = [];
      for (const t2 of [t, ...shuffle(sel.filter(x => x !== t))]) {
        const p = t2 === "ip" ? Math.min(p0, 2) : (t === "ip" ? [1, 3, 4][p0] : p0);
        const c = C.conj(v, t2, p, g); if (!c) continue;
        const it = { t: t2, v, p, g, ok: c.ok, aff: c.aff, suj: C.sujet(t2, p, g, c.ok[0]) };
        if (choisis.some(x => ambigu(x, t2) || ambigu(it, x.t) || disp(x) === disp(it))) continue;
        choisis.push(it); if (choisis.length === 4) break;
      }
      if (choisis.length < 2 || !choisis.find(x => x.t === t)) throw 0;
      const paires = choisis.map(x => [disp(x), META[x.t].nom]);
      return { type: "relier", consigne: "Relie chaque forme à son temps", verbe: v, paires, enonce: `<div class="big">Verbe <b class="verbe">${v}</b></div>`,
        solution: paires.map(p => `${p[0]} → <b>${p[1]}</b>`).join(" · ") };
    },
    vf(t, o) {
      const it = item(t, o.verbe);
      if (Math.random() < .5) {
        const vrai = Math.random() < .5; let claim = t;
        if (!vrai) { const pool = shuffle(autres(t, o.selection)).filter(x => !ambigu(it, x)); if (!pool.length) throw 0; claim = pool[0]; }
        return { type: "vf", consigne: "Vrai ou faux ?", verbe: it.v, bonne: vrai,
          enonce: `<div class="big">« ${disp(it)} »</div><div class="big" style="font-size:19px">est conjugué ${META[claim].au}.</div>`,
          solution: `« ${disp(it)} » est <b>${META[t].au}</b>.` };
      }
      const vrai = Math.random() < .5, ft = fautes(it); if (!vrai && !ft.length) throw 0;
      const forme = vrai ? it.ok[0] : rnd(ft);
      return { type: "vf", consigne: "Vrai ou faux ?", verbe: it.v, bonne: vrai,
        enonce: `${tag(t)}<div class="big">« ${disp(it, forme)} »</div><div class="big" style="font-size:19px">Est-ce bien écrit ? <span class="inf">(${it.v})</span></div>`,
        solution: vrai ? `C'est bien écrit : <b>${dispAff(it)}</b>` : `Il faut écrire : <b>${dispAff(it)}</b>` };
    },
    intrus(t, o) {
      const bons = [], vus = new Set();
      for (let k = 0; k < 20 && bons.length < 3; k++) { const it = item(t, k === 0 ? o.verbe : undefined); const d = disp(it); if (!vus.has(d)) { vus.add(d); bons.push(it); } }
      let intr = null;
      for (let k = 0; k < 20 && !intr; k++) { const t2 = rnd(autres(t, o.selection)); const it = item(t2); if (!ambigu(it, t) && !vus.has(disp(it))) intr = it; }
      if (!intr || bons.length < 3) throw 0;
      return { type: "qcm", consigne: `Trouve l'intrus : la forme qui n'est pas ${META[t].au}`, verbe: bons[0].v,
        options: shuffle([...bons.map(x => disp(x)), disp(intr)]), bonne: [disp(intr)], enonce: tag(t),
        solution: `L'intrus est <b>${disp(intr)}</b> : c'est ${META[intr.t].au}.` };
    },
    tableau(t, o) {
      const v = pickVerb(t, o.verbe), pers = t === "ip" ? [0, 1, 2] : [0, 1, 2, 3, 4, 5];
      const lignes = pers.map(p => {
        const c = C.conj(v, t, p, "x");
        let lab = t === "ip" ? IPL[p] : C.sujet(t, p, "m", c.ok[0]);
        if (p === 2 && t !== "ip") lab = lab.replace(/il$/, "il / elle"); if (p === 5) lab = lab.replace(/ils$/, "ils / elles");
        return { label: lab, ok: c.ok, aff: c.aff + (t === "ip" ? " !" : "") };
      });
      return { type: "tableau", consigne: "Complète le tableau", verbe: v, lignes,
        enonce: `${tag(t)}<div class="big">Verbe <b class="verbe">${v}</b></div>`,
        solution: lignes.map(l => `${l.label} <b>${l.aff}</b>`).join(" · ") };
    }
  };

  function generer(t, o = {}) {
    const mix = o.selection && o.selection.length > 1;
    const W = { saisie: 2, phrase: 3, transfo: 1.5, qcm: 2.5, temps: mix ? 1.5 : .8, relier: 1, vf: 1.2, intrus: .8, tableau: .6 };
    if (mix) W.relierT = 1.2;
    let force = o.type;
    for (let k = 0; k < 25; k++) {
      let ty = force;
      if (!ty) { const ks = Object.keys(W).filter(x => x !== o.eviter); let r = Math.random() * ks.reduce((s, x) => s + W[x], 0); ty = ks.find(x => (r -= W[x]) < 0) || ks[0]; }
      try { const q = GEN[ty](t, o); q.theme = t; q.genre = ty; return q; }
      catch (e) { if (force && k > 8) force = null; }
    }
    throw new Error("génération impossible");
  }

  const themes = {};
  TPS.forEach(t => themes[t] = { nom: META[t].nom, rappel: RAPPEL[t], synthese: () => synthese(t) });

  return {
    id: "conjugaison", titre: "Conjugaison", icone: "✍️", couleur: "#7048e8", couleurFoncee: "#5235c4",
    libSeul: "Un seul temps", libChoix: "les temps",
    nbBase: 10, parFaute: 3,
    groupes: GROUPES, themes, generer,
    fiche: [
      { titre: "Complète les tableaux", type: "tableau", n: 2 },
      { titre: "Complète les phrases", type: "phrase", n: 6 },
      { titre: "Transforme les phrases", type: "transfo", n: 3 },
      { titre: "Entoure la bonne forme", type: "qcm", n: 4 },
      { titre: "Relie (trace un trait)", type: "relier", n: 2 },
      { titre: "Vrai ou faux ? Entoure.", type: "vf", n: 4 },
      { titre: "Trouve l'intrus et entoure-le", type: "intrus", n: 3 }
    ],
    _test: { GEN, item, fautes, distracteurs, TPS, META }
  };
})();
if (typeof module !== "undefined") module.exports = MATIERE;
