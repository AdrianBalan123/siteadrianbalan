# Site Adrian Bălan, psiholog clinician

Site static (HTML, CSS, JavaScript), fără PHP și fără bază de date. Găzduit pe Vercel; admin-ul pentru articole folosește câteva funcții mici în `api/` și publică prin GitHub.

## Cum vezi site-ul pe calculator

În VS Code apasă **Go Live** (extensia Live Server, jos în dreapta). Se deschide site-ul în browser. Nu ai nevoie de XAMPP.

## Publicare pe Vercel (o singură dată)

1. **GitHub:** creează un repository nou (poate fi privat), de exemplu `site-adrian-balan`, și urcă tot conținutul acestui folder. Din VS Code: Source Control → Publish to GitHub.
2. **Vercel:** pe vercel.com → Add New → Project → alege repository-ul → Deploy. Nu schimba nicio setare: nu există pas de build.
3. Primești un link de forma `site-adrian-balan.vercel.app`. De acum, orice modificare urcată pe GitHub se publică automat.
4. **Domeniul de la cyber_Folks:** în Vercel, Project → Settings → Domains → adaugă domeniul. Vercel îți arată înregistrările DNS (un `A` și un `CNAME`), pe care le pui în panoul cyber_Folks la zona DNS a domeniului.
5. Pune domeniul real în `assets/js/content.js` (`url`) și în `robots.txt`, apoi rulează `npm run genereaza` (vezi mai jos).

## Admin articole: `/admin`

Login cu **utilizator și parolă**. Tokenul GitHub stă doar pe server (variabile de mediu în Vercel), nu în browser. Funcțiile din `api/` verifică parola, țin sesiunea (cookie securizat, 12 ore) și fac commit-urile; Vercel publică noua versiune în aproximativ un minut.

**Configurare (o singură dată), în Vercel → Project → Settings → Environment Variables:**

| Variabilă | Ce pui |
|---|---|
| `ADMIN_USER` | utilizatorul de administrare (ex. `adrian`) |
| `ADMIN_PASSWORD_HASH` | rezultatul comenzii `node scripts/parola-admin.mjs` (scrii parola, primești hash-ul) |
| `SESSION_SECRET` | tot din `node scripts/parola-admin.mjs` |
| `GITHUB_TOKEN` | token GitHub **fine-grained**: doar repository-ul site-ului, **Contents: Read and write** |
| `GITHUB_REPO` | `AdrianBalan123/siteadrianbalan` |

După ce le salvezi: Deployments → ultimul deploy → **Redeploy**. Pentru o parolă nouă rulezi din nou scriptul și înlocuiești `ADMIN_PASSWORD_HASH`.

Protecții: după 8 încercări greșite de pe aceeași adresă, login-ul se blochează 15 minute; serverul acceptă doar operațiile de care are nevoie editorul, doar pe repository-ul site-ului.

Din admin se pot scrie articole noi (cu thumbnail), edita, ascunde sau șterge. Textul se poate lipi direct din Word.

## Ce se modifică unde

| Ce | Unde |
|---|---|
| Telefon, adresă, recenzii, servicii, meniu | `assets/js/content.js` |
| Textele și structura paginilor | `assets/js/template.js` |
| Culori și stiluri | `assets/css/style.css` (variabilele de la început) |
| Fotografia | `assets/img/adrian-balan.jpg` |
| Articolele | din `/admin/` (sau `data/articole.json` + `data/continut/`) |

Paginile `.html` din rădăcină și din `articole/` sunt **generate**. După ce modifici `content.js` sau `template.js`, regenerează-le (ai nevoie doar de Node.js):

```
npm run genereaza
```

Admin-ul actualizează singur doar blocul de articole din `articole.html` (între comentariile `LISTA-ARTICOLE`), lista, sitemap-ul și paginile articolelor. Restul textului din pagini nu îl atinge.

## Structură

```
index.html, articole.html, despre.html, servicii.html, contact.html, 404.html
articole/            câte o pagină HTML pentru fiecare articol
data/articole.json   lista articolelor (titlu, rezumat, thumbnail, publicat)
data/continut/       textul fiecărui articol
uploads/articole/    thumbnail-uri
assets/              CSS, JS, fonturi locale, imagini, editorul Quill
admin/               panoul de administrare
scripts/genereaza.mjs  regenerează toate paginile
_versiune-php/       versiunea anterioară, în PHP (nu e folosită de site)
```
