# Site Adrian Bălan, psiholog clinician

Site 100% static (HTML, CSS, JavaScript), fără PHP, fără server și fără bază de date. Găzduit pe Vercel, cu admin pentru articole care publică prin GitHub.

## Cum vezi site-ul pe calculator

În VS Code apasă **Go Live** (extensia Live Server, jos în dreapta). Se deschide site-ul în browser. Nu ai nevoie de XAMPP.

## Publicare pe Vercel (o singură dată)

1. **GitHub:** creează un repository nou (poate fi privat), de exemplu `site-adrian-balan`, și urcă tot conținutul acestui folder. Din VS Code: Source Control → Publish to GitHub.
2. **Vercel:** pe vercel.com → Add New → Project → alege repository-ul → Deploy. Nu schimba nicio setare: nu există pas de build.
3. Primești un link de forma `site-adrian-balan.vercel.app`. De acum, orice modificare urcată pe GitHub se publică automat.
4. **Domeniul de la cyber_Folks:** în Vercel, Project → Settings → Domains → adaugă domeniul. Vercel îți arată înregistrările DNS (un `A` și un `CNAME`), pe care le pui în panoul cyber_Folks la zona DNS a domeniului.
5. Pune domeniul real în `assets/js/content.js` (`url`) și în `robots.txt`, apoi rulează `npm run genereaza` (vezi mai jos).

## Admin articole: `/admin/`

Admin-ul nu are server: scrie fișierele direct în repository-ul GitHub, iar Vercel publică noua versiune în aproximativ un minut.

**Cheia de acces (o dată pe calculator):**
1. Mergi la github.com → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: **Only select repositories** → doar repository-ul site-ului.
3. Permissions → Repository permissions → **Contents: Read and write**.
4. Copiază tokenul și introdu-l în `/admin/`, împreună cu repository-ul (`utilizator/site-adrian-balan`).

Cheia rămâne salvată doar în browserul acelui calculator. „Ieși din cont” o șterge. Tokenul are acces doar la acest repository.

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
