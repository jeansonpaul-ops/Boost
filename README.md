# Boost — PWA (application web installable)

Application **prête à déployer** : tâches ménagères d'équipe rémunérées en points, avec récompenses, classement, validation manager, salles à QR. Fonctionne **plein écran**, **installable** sur l'écran d'accueil (iOS/Android), et **hors-ligne** après la première visite.

> ⚠️ **Important sur les données.** Cette version stocke tout **dans le navigateur de l'appareil** (localStorage). C'est une vraie PWA installable, mais **chaque téléphone a ses propres données** — il n'y a pas encore de serveur partagé. Pour un usage multi-personnes réel (comptes, validation manager d'un appareil à l'autre, classement commun), il faudra brancher un backend (voir « Étape suivante »).

---

## Contenu du dossier
```
boost-pwa/
├─ index.html             ← l'application
├─ support.js             ← moteur d'affichage (à garder à côté de index.html)
├─ manifest.webmanifest   ← métadonnées d'installation (nom, icônes, couleurs)
├─ sw.js                  ← service worker (hors-ligne)
└─ icons/
   ├─ icon-192.png
   └─ icon-512.png
```
**Garde tous ces fichiers ensemble**, à la racine du dépôt.

---

## Déployer sur GitHub Pages (gratuit)

1. Crée un dépôt GitHub, par ex. **`boost`**.
2. Mets **le contenu de ce dossier à la racine** du dépôt (`index.html` doit être à la racine, pas dans un sous-dossier).
   - Soit en glissant les fichiers sur github.com → *Add file → Upload files*.
   - Soit en ligne de commande :
     ```bash
     git init
     git add .
     git commit -m "Boost PWA"
     git branch -M main
     git remote add origin https://github.com/<ton-compte>/boost.git
     git push -u origin main
     ```
3. Sur GitHub : **Settings → Pages**.
4. *Build and deployment* → **Source : Deploy from a branch** → Branch : **main** / **/(root)** → **Save**.
5. Attends ~1 minute. Ton appli est en ligne sur :
   `https://<ton-compte>.github.io/boost/`

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
- **Salles à QR** : chaque salle a un QR à imprimer ; à la déclaration, « Scanner le QR de la salle » présélectionne la zone.
- Bouton « Réinitialiser les données de démo » dans la vue Manager.

---

## Étape suivante : passer en multi-utilisateurs (backend)
Quand tu voudras un vrai partage entre personnes, remplace le stockage local par un backend. Le plus simple en solo : **Supabase** (base PostgreSQL + authentification + stockage photos, hébergé). Le modèle de données et les endpoints sont décrits dans le package de remise **`design_handoff_boost/`** (fichiers `README.md` et `API_SPEC.md`). Tu pourras confier cette étape à **Claude Code** en lui donnant ce dossier + le handoff.

À ce moment-là tu garderas exactement la même interface (ce `index.html`) et tu remplaceras les lectures/écritures `localStorage` par des appels à l'API.
