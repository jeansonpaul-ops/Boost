# Clean Check — PWA (application web installable)

Application **prête à déployer** : tâches ménagères d'équipe rémunérées en points, avec récompenses, classement, validation manager, salles à QR. Fonctionne **plein écran**, **installable** sur l'écran d'accueil (iOS/Android), et **hors-ligne** après la première visite.

> ✅ **Multi-utilisateurs via Firebase.** Cette version stocke les données dans **Firestore** (base partagée). Tous les appareils voient les mêmes employés, tâches, salles, déclarations et le même classement, en temps réel. La validation manager faite sur un appareil apparaît immédiatement chez l'employé.

---

## ⚙️ Configuration Firebase (à faire une fois)

L'app est déjà reliée au projet Firebase `clean-check-7a672`. Il reste **trois choses à activer dans la console Firebase** (https://console.firebase.google.com) :

### 1. Activer l'authentification anonyme
Authentication → Sign-in method → **Anonyme** → Activer.
(L'app crée un identifiant par appareil ; sans ça, aucune lecture/écriture ne marche.)

### 2. Coller les règles de sécurité
Firestore Database → Règles → colle le contenu de **`firestore.rules`** → Publier.
⚠️ Ne laisse **jamais** les règles en « mode test » ouvert : la config Firebase est publique (visible dans le code), seules les règles protègent ta base.

### 3. Créer l'index composite (au premier lancement)
La vérification anti-rejeu « 1×/jour » fait une requête sur `userId` + `taskId` + `ts`. Au premier scan-déclaration, **Firestore affichera une erreur dans la console du navigateur avec un lien** « créer l'index » → clique dessus → Créer. Une fois l'index construit (~1 min), l'anti-rejeu fonctionne. C'est normal et attendu.

---

## 🚀 Premier démarrage (base vide)

La base démarre **vide**. Pour créer les données de départ :

1. Ouvre l'app → onglet **Manager** (en bas) → code **`1234`** (à changer en prod, voir `this.PIN` dans `index.html`).
2. **Crée les salles** (section Salles), **les tâches** (avec leur lieu), et **les employés** (section Équipe → Nouvel employé : nom + code à 4 chiffres).
3. Chaque employé se connecte ensuite avec **son code à 4 chiffres** sur son téléphone.

> ⚠️ **Limite de sécurité connue.** Le code 4 chiffres n'est pas vérifié côté serveur : qui connaît le code de quelqu'un peut se connecter en son nom. Le code manager est en clair dans le code. Acceptable pour un usage interne à faible enjeu ; à durcir (vraie auth) si les récompenses prennent de la valeur.

---

## Modèle de données Firestore
```
/teams/luxvisual/
  users/{id}         {name, code, color, initials, role, xp, points, photo}
  zones/{id}         {name}
  tasks/{id}         {name, pts, zoneId}
  declarations/{id}  {userId, taskId, zoneId, pts, ts, status, photo, ...}
  rewards/{id}       {name, desc, cost, color}
  redemptions/{id}   {userId, rewardId, cost, ts}
```

---

## Contenu du dossier
```
clean-check-pwa/
├─ index.html             ← l'application
├─ support.js             ← moteur d'affichage (à garder à côté de index.html)
├─ manifest.webmanifest   ← métadonnées d'installation (nom, icônes, couleurs)
├─ sw.js                  ← service worker (hors-ligne)
├─ firestore.rules        ← règles de sécurité (à coller dans la console Firebase)
├─ vendor/
│  ├─ qrcode.js           ← génération des QR (impression salles/tâches)
│  └─ jsQR.js             ← lecture des QR (scan caméra)
└─ icons/
   ├─ icon-192.png
   └─ icon-512.png
```
**Garde tous ces fichiers ensemble**, à la racine du dépôt. (`firestore.rules` se colle dans la console Firebase, il n'a pas besoin d'être déployé sur GitHub Pages mais ça ne gêne pas de le laisser.)

---

## Déployer sur GitHub Pages (gratuit)

1. Crée un dépôt GitHub, par ex. **`clean-check`**.
2. Mets **le contenu de ce dossier à la racine** du dépôt (`index.html` doit être à la racine, pas dans un sous-dossier).
   - Soit en glissant les fichiers sur github.com → *Add file → Upload files*.
   - Soit en ligne de commande :
     ```bash
     git init
     git add .
     git commit -m "Clean Check PWA"
     git branch -M main
     git remote add origin https://github.com/<ton-compte>/clean-check.git
     git push -u origin main
     ```
3. Sur GitHub : **Settings → Pages**.
4. *Build and deployment* → **Source : Deploy from a branch** → Branch : **main** / **/(root)** → **Save**.
5. Attends ~1 minute. Ton appli est en ligne sur :
   `https://<ton-compte>.github.io/clean-check/`

### Installer sur le téléphone
- **Android (Chrome)** : ouvre l'URL → menu ⋮ → *Installer l'application* / *Ajouter à l'écran d'accueil*.
- **iPhone (Safari)** : ouvre l'URL → bouton Partager → *Sur l'écran d'accueil*.

---

## Tester en local (optionnel)
Une PWA a besoin d'être **servie** (pas ouverte en `file://`) pour que le service worker marche :
```bash
# avec Python
python3 -m http.server 8080
# puis ouvre http://localhost:8080
```
(Le `https` requis par le service worker est fourni automatiquement par GitHub Pages.)

---

## Utilisation
- **Connexion** : code perso à 4 chiffres (en démo, touche le cercle pour entrer).
- **Manager** : onglet Manager en bas → code **`1234`** (à changer en prod). Permet de valider les tâches, gérer l'équipe, **créer/supprimer les salles** et imprimer leur QR, gérer le catalogue de tâches.
- **QR par tâche (principal)** : à la création d'une tâche, on peut lui associer un **lieu** (salle, optionnel). Chaque tâche a un bouton **« Imprimer QR »** : ce QR encode la tâche + le lieu et se colle sur la machine/l'endroit concerné.
- **Déclaration par scan** : l'employé scanne le QR sur place → la tâche **et** le lieu sont présélectionnés → il confirme (photo possible) → la tâche part en **validation manager**.
- **Salles à QR (fallback)** : chaque salle garde son propre QR ; à la déclaration, « Scanner le QR de la salle » présélectionne seulement la zone, l'employé choisit ensuite la tâche.
- **Anti-rejeu** : une même tâche ne peut être déclarée qu'**une fois par jour** (en plus d'un délai de 2 h entre deux déclarations et d'un plafond quotidien). ⚠️ Ce contrôle est **par appareil** tant qu'il n'y a pas de backend : il n'empêche pas le même QR d'être scanné depuis deux téléphones différents.
- Bouton « Réinitialiser les données de démo » dans la vue Manager.

---

## Limites connues & pistes d'amélioration

- **Sécurité d'identité** : le code 4 chiffres n'est pas vérifié côté serveur. Pour durcir : passer à une vraie auth (e-mail/mot de passe Firebase, ou custom tokens), et déplacer le crédit de points dans une **Cloud Function** pour qu'un client ne puisse pas s'auto-créditer.
- **Code manager en clair** : `this.PIN = '1234'` dans `index.html`. À changer, et idéalement à remplacer par un rôle stocké en base plutôt qu'un code partagé.
- **Photos-preuve** : stockées en base64 dans le document de déclaration (limite Firestore 1 Mo/doc). Si tu veux des photos plus lourdes, passe à **Firebase Storage**.
- **Index composite** : la requête anti-rejeu nécessite un index (`userId`+`taskId`+`ts`). Firestore te donne le lien de création au premier lancement (voir plus haut).
- **Hors-ligne** : React, Babel et Firebase sont chargés depuis des CDN. L'app n'est donc pas réellement hors-ligne. Pour un vrai hors-ligne, il faudrait vendoriser ces libs et activer la persistance Firestore (`enableIndexedDbPersistence`).

> ⚠️ **Cette intégration Firestore n'a pas été testée contre une vraie base avant livraison** (seulement en simulation). Au premier lancement réel, attends-toi à de petits ajustements — surtout l'index composite ci-dessus. Teste d'abord avec 2 comptes sur 2 appareils avant de déployer à toute l'équipe.
