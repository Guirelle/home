# Mon coin d'étude

Site d'entraînement pour les enfants (de la 3e primaire à la 1re secondaire), à héberger sur GitHub Pages.

## Organisation des fichiers

Tous les fichiers sont à la racine du dépôt, sans sous-dossier, pour qu'un simple glisser-déposer sur GitHub suffise :

```
index.html            page de garde (les 9 matières)
style.css, moteur.js  communs à toutes les matières
logo-aia.png          (à ajouter) logo « Aide de l'IA »
conjugaison.html      page de la matière
conjugueur.js         données propres à la matière (les verbes)
matiere.js            thèmes, règles, synthèses, générateur de questions
```

Pour une nouvelle matière : `orthographe.html` et `orthographe.js`, et ainsi de suite.

## Ce que fait le moteur, pour toutes les matières

* **Menu à deux onglets**
  * 🎯 **Un seul thème** : une tuile par thème, avec Jouer ▶, la synthèse 📘 et la fiche imprimable 🖨.
  * 🎲 **Mélange** : on coche les thèmes à mélanger.
* **Partie** : 10 questions, et **+3 questions bonus à chaque faute** (du même thème, et la première avec le même verbe ou élément).
* **Correction immédiate**
  * Réponse juste : confettis, petit son et série 🔥.
  * Réponse fausse : la bonne réponse, le **rappel de la règle** du thème et un lien vers la synthèse complète.
* **Fin de partie** : feu d'artifice, de 1 à 3 étoiles et le meilleur score retenu sur l'appareil.
* **Types de questions**
  * saisie : réponse libre, éventuellement dans une phrase à trous
  * QCM
  * vrai / faux
  * relier
  * tableau à compléter
* **Valeurs aléatoires** : chaque partie et chaque fiche sont différentes.
* **Feuille de synthèse** pour chaque thème, imprimable.
* **Fiche d'exercices imprimable** pour un thème ou un mélange de thèmes : noir et blanc, zones de réponse sur fond gris, **corrigé après un saut de page**, et un bouton « Nouvelle fiche ».

## Ajouter une matière : ce que Céline fournit

1. La **liste des thèmes** (par ex. pour l'orthographe : « a / à », « son / sont », « accord du participe »…), regroupés si besoin, avec le niveau visé.
2. Pour chaque thème : **la règle telle qu'elle est enseignée** (vocabulaire de la classe), les pièges courants et quelques exemples.
3. Si possible : **le vocabulaire ou les données** à utiliser (listes de mots, verbes, tables, dates, cartes…).
4. Les éventuelles contraintes : niveau, ce qui est hors programme, les types de questions à privilégier.

Ensuite, je crée `<matière>/index.html` et `<matière>/matiere.js`, puis j'active la tuile sur la page de garde.

## Format d'une matière (pour le développeur)

```js
const MATIERE = {
  id: "orthographe", titre: "Orthographe", icone: "🔤", couleur: "#1971c2", couleurFoncee: "#1864ab",
  libSeul: "Un seul thème", libChoix: "les thèmes", nbBase: 10, parFaute: 3,
  groupes: [{ nom: "Homophones", c: "#1971c2", t: ["a-a", "son-sont"] }],
  themes: { "a-a": { nom: "a / à", rappel: "HTML court", synthese: () => "HTML complet" } },
  generer(themeId, { type, verbe, eviter, selection }) { return question; },
  fiche: [{ titre: "Complète", type: "saisie", n: 6 }]
};
```

Une question contient `type`, `consigne` et `enonce` (en HTML ; `___` y marque l'emplacement de la réponse), puis :

* **saisie** : `ok[]` (réponses acceptées), et éventuellement `avant` et `apres`
* **qcm** : `options[]` et `bonne[]`
* **vf** : `bonne` (vrai ou faux)
* **relier** : `paires[[gauche, droite]]`
* **tableau** : `lignes[{ label, ok[], aff }]`

Tous les types ont aussi `solution` (HTML affiché dans la correction) et `astuce` (facultatif).

## Mise en ligne (GitHub Pages)

Déposer tout le dossier à la racine du dépôt, puis aller dans **Settings → Pages → Deploy from a branch → main / (root)**.
Le site est **public** : n'y mettre ni nom complet, ni photo, ni nom d'école des enfants.
