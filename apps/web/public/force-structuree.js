/* Force Structuree - direction 1b.
   GENERE depuis outils-site/direction-1b.js : ne pas editer ici. */

(function () {
    if (window.__fs1b) return;
    window.__fs1b = true;

    var reduit =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ═══════════ 1. Le logo qui se construit ═══════════
     Geometrie identique a la maquette (viewBox 66x64). Les durees et les
     decalages sont dans la feuille de style, classe par classe. */
    var SVG_LOGO =
        '<svg viewBox="0 0 66 64" aria-hidden="true">' +
        '<rect class="fs-seg fs-p1" x="2"  y="18" width="7"  height="28" rx="2"   fill="currentColor"/>' +
        '<rect class="fs-seg fs-p2" x="57" y="18" width="7"  height="28" rx="2"   fill="currentColor"/>' +
        '<rect class="fs-seg fs-p3" x="11" y="22" width="5"  height="20" rx="1.5" fill="currentColor"/>' +
        '<rect class="fs-seg fs-p4" x="50" y="22" width="5"  height="20" rx="1.5" fill="currentColor"/>' +
        '<rect class="fs-seg fs-b1" x="18" y="29" width="8"  height="6"  rx="1"   fill="currentColor"/>' +
        '<rect class="fs-seg fs-b2" x="40" y="29" width="8"  height="6"  rx="1"   fill="currentColor"/>' +
        '<rect class="fs-seg fs-center" x="28" y="29" width="10" height="6" rx="1" fill="#E8590C"/>' +
        "</svg>";

    /* Dans la direction 1b le logo anime est dans l'entete, a cote du mot
     « FORCE STRUCTUREE », et nulle part ailleurs. On remplace l'image
     posee par CourseLit par le SVG, qui seul peut se construire. */
    function poserLogo() {
        var entete = document.querySelector("header");
        if (!entete || entete.querySelector(".fs-logo")) return;
        var img = entete.querySelector("img");
        var hote = img && img.parentNode;
        if (!hote) return;
        var d = document.createElement("div");
        d.className = "fs-logo";
        d.innerHTML = SVG_LOGO;
        hote.replaceChild(d, img);
        if (reduit) return;
        d.getBoundingClientRect();
        d.className += " fs-go";
    }

    /* ═══════════ 2. La carte des chiffres (colonne droite du hero) ═══════════
     C'est l'element propre a la direction 1b. Les trois barres et leurs
     largeurs viennent de la maquette : 92 %, 59 %, 100 %. */
    var CARTE =
        '<div class="fs-kicker">Les chiffres de l\'auteur</div>' +
        '<div class="fs-total"><b data-counter="680">680</b><span>kg de total</span></div>' +
        '<div class="fs-barres">' +
        '<div class="fs-barre"><i>Squat 250</i><span class="fs-piste">' +
        '<b style="width:92%;background:#E8590C;animation-delay:.2s"></b></span></div>' +
        '<div class="fs-barre"><i>Dév. 160</i><span class="fs-piste">' +
        '<b style="width:59%;background:var(--color-accent-500);animation-delay:.35s"></b></span></div>' +
        '<div class="fs-barre"><i>Soulevé 270</i><span class="fs-piste">' +
        '<b style="width:100%;background:var(--color-accent-500);animation-delay:.5s"></b></span></div>' +
        "</div>" +
        "<p>Pas de visage, pas de nom. Des chiffres que tu peux juger.</p>";

    function poserCarte() {
        var ecran = document.getElementById("premier-ecran");
        if (!ecran || ecran.classList.contains("fs-vente")) return;
        if (ecran.querySelector(".fs-chiffres")) return;
        var rangee = ecran.querySelector("div > div.flex.flex-col");
        if (!rangee) return;
        var d = document.createElement("div");
        d.className = "fs-chiffres";
        d.innerHTML = CARTE;
        rangee.appendChild(d);
    }

    /* La ligne « 49 lecons, 12 semaines, Acces a vie », sous le bouton. */
    function poserMeta() {
        var ecran = document.getElementById("premier-ecran");
        if (!ecran || ecran.querySelector(".fs-meta")) return;
        var lien = ecran.querySelector("a");
        if (!lien) return;
        var conteneur = lien.parentNode && lien.parentNode.parentNode;
        if (!conteneur) return;
        var d = document.createElement("div");
        d.className = "fs-meta";
        d.innerHTML =
            "<span>49 leçons</span><span>12 semaines</span><span>Accès à vie</span>";
        conteneur.appendChild(d);
    }

    /* ═══════════ 3. Le compteur ═══════════
     Logique reprise telle quelle du document de conception : depart a
     14 % de la cible, 1000 ms, sortie cubique. */
    function lancerCompteurs(racine) {
        if (!racine || reduit) return;
        racine.querySelectorAll("[data-counter]").forEach(function (el) {
            if (el.getAttribute("data-fs-lance")) return;
            el.setAttribute("data-fs-lance", "1");
            var cible = parseInt(el.getAttribute("data-counter"), 10) || 0;
            var depart = Math.round(cible * 0.14);
            var duree = 1000;
            var t0 = performance.now();
            var tick = function (now) {
                var p = Math.min(1, (now - t0) / duree);
                var e = 1 - Math.pow(1 - p, 3);
                el.textContent = String(
                    Math.round(depart + (cible - depart) * e),
                );
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = String(cible);
            };
            requestAnimationFrame(tick);
        });
    }

    /* ═══════════ 4. Apparition au defilement ═══════════ */
    var aSurveiller = [];

    function preparerSections() {
        if (reduit) return;
        var h = window.innerHeight || document.documentElement.clientHeight;
        document.querySelectorAll("section").forEach(function (s) {
            if (s.hasAttribute("data-fs-reveal")) return;
            if (s.getBoundingClientRect().top < h * 0.85) {
                s.setAttribute("data-fs-reveal", "in");
            } else {
                s.setAttribute("data-fs-reveal", "pending");
                aSurveiller.push(s);
            }
        });
    }

    function verifier() {
        var h = window.innerHeight || document.documentElement.clientHeight;
        for (var i = aSurveiller.length - 1; i >= 0; i--) {
            var s = aSurveiller[i];
            if (s.isConnected === false) {
                aSurveiller.splice(i, 1);
                continue;
            }
            var r = s.getBoundingClientRect();
            if (r.top < h * 0.88 && r.bottom > 0) {
                aSurveiller.splice(i, 1);
                s.setAttribute("data-fs-reveal", "in");
                lancerCompteurs(s);
            }
        }
    }

    var planifiee = false;
    function planifier() {
        if (planifiee) return;
        planifiee = true;
        setTimeout(function () {
            planifiee = false;
            verifier();
        }, 40);
    }

    /* ═══════════ 5. La page de vente porte une classe a part ═══════════ */
    function marquerVente() {
        if (location.pathname.indexOf("/p/powerlifting") === 0) {
            var e = document.getElementById("premier-ecran");
            if (e) e.classList.add("fs-vente");
        }
    }

    /* ═══════════ 6. Page de vente : les trois graphiques animes ═══════════
     SVG repris caractere pour caractere du bloc 1b de la maquette : les
     barres montent (fsRise), la courbe se trace (fsDraw), les bandes
     s'etirent (fsGrow) et le repere RPE pulse (fsPulse). */
    var GRAPHIQUES = [
        {
            svg: '<svg viewBox="0 0 170 96" style="width:100%">\n                    <g fill="var(--color-neutral-800)">\n                      <rect x="4" y="38" width="9" height="46" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .1s both"/><rect x="16" y="33" width="9" height="51" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .14s both"/><rect x="28" y="28" width="9" height="56" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .18s both"/><rect x="40" y="60" width="9" height="24" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .22s both"/>\n                      <rect x="58" y="42" width="9" height="42" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .26s both"/><rect x="70" y="46" width="9" height="38" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .3s both"/><rect x="82" y="50" width="9" height="34" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .34s both"/><rect x="94" y="54" width="9" height="30" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .38s both"/><rect x="106" y="68" width="9" height="16" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .42s both"/>\n                      <rect x="124" y="58" width="9" height="26" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .46s both"/><rect x="136" y="64" width="9" height="20" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .5s both"/><rect x="148" y="72" width="9" height="12" style="transform-origin:50% 100%; animation:fsRise .4s ease-out .54s both"/>\n                    </g>\n                    <line x1="0" y1="84" x2="170" y2="84" stroke="var(--color-neutral-800)"/>\n                    <polyline points="8,74 20,70 32,66 44,76 62,56 74,50 86,44 98,38 110,52 128,28 140,22 152,14" fill="none" stroke="#E8590C" stroke-width="2" stroke-dasharray="900" style="animation:fsDraw 1.3s ease-out .6s both"/>\n                  </svg>',
            titre: "Le volume descend, l'intensité monte",
            texte: "Trois blocs, deux décharges (S4 et S9), un test en S12. Tu sais toujours à quel moment du cycle tu es.",
        },
        {
            svg: '<svg viewBox="0 0 170 96" style="width:100%">\n                    <g font-family="Inter" font-size="8">\n                      <rect x="0" y="4" width="150" height="14" fill="var(--color-neutral-900)" style="transform-origin:0 50%; animation:fsGrow .35s ease-out .1s both"/><text x="6" y="14" fill="var(--color-neutral-400)">RPE 10</text>\n                      <rect x="0" y="22" width="150" height="14" fill="var(--color-neutral-900)" style="transform-origin:0 50%; animation:fsGrow .35s ease-out .18s both"/><text x="6" y="32" fill="var(--color-neutral-400)">RPE 9</text>\n                      <rect x="0" y="40" width="150" height="14" fill="#E8590C" opacity="0.22" style="transform-origin:0 50%; animation:fsGrow .45s ease-out .3s both"/><text x="6" y="50" fill="var(--color-text)">RPE 7-8, zone de travail</text>\n                      <rect x="0" y="58" width="150" height="14" fill="var(--color-neutral-900)" style="transform-origin:0 50%; animation:fsGrow .35s ease-out .4s both"/><text x="6" y="68" fill="var(--color-neutral-400)">RPE 6</text>\n                      <rect x="0" y="76" width="150" height="14" fill="var(--color-neutral-900)" style="transform-origin:0 50%; animation:fsGrow .35s ease-out .48s both"/><text x="6" y="86" fill="var(--color-neutral-400)">RPE 5 et moins</text>\n                    </g>\n                    <rect x="0" y="40" width="3" height="14" fill="#E8590C" style="animation:fsPulse 2.4s ease-in-out 1s infinite"/>\n                  </svg>',
            titre: "Décider sans improviser",
            texte: "L'autorégulation par le RPE : tu ajustes la charge du jour sans casser le cycle.",
        },
        {
            svg: '<svg viewBox="0 0 170 96" style="width:100%">\n                    <g font-family="Inter" font-size="8">\n                      <rect x="0" y="8" width="45" height="12" fill="var(--color-neutral-700)" style="transform-origin:0 50%; animation:fsGrow .45s ease-out .15s both"/><text x="50" y="18" fill="var(--color-neutral-400)">10, entretien</text>\n                      <rect x="0" y="32" width="82" height="12" fill="#E8590C" opacity="0.65" style="transform-origin:0 50%; animation:fsGrow .55s ease-out .3s both"/><text x="87" y="42" fill="var(--color-text)">18, progression</text>\n                      <rect x="0" y="56" width="114" height="12" fill="var(--color-neutral-700)" style="transform-origin:0 50%; animation:fsGrow .65s ease-out .45s both"/><text x="119" y="66" fill="var(--color-neutral-400)">25, élevé</text>\n                      <rect x="0" y="80" width="140" height="12" fill="var(--color-neutral-800)" style="transform-origin:0 50%; animation:fsGrow .75s ease-out .6s both"/><text x="145" y="90" fill="var(--color-neutral-500)">trop</text>\n                    </g>\n                  </svg>',
            titre: "Le bon dosage, chiffré",
            texte: "Des repères de séries hebdomadaires par mouvement, pas un « écoute ton corps ».",
        },
    ];

    function poserGraphiques() {
        var hote = document.getElementById("graphiques");
        if (!hote || hote.querySelector(".fs-graph")) return;
        var cible = hote.querySelector("div") || hote;
        GRAPHIQUES.forEach(function (g) {
            var d = document.createElement("div");
            d.className = "fs-graph";
            d.innerHTML =
                g.svg +
                "<div><b>" +
                g.titre +
                "</b><p>" +
                g.texte +
                "</p></div>";
            cible.appendChild(d);
        });
    }

    /* ═══════════ 7. Le rail de prix collant ═══════════
     1b : colonne de 320 px a droite, collee en haut pendant le defilement.
     Contenu et libelles repris de la maquette. */
    var RAIL =
        '<div class="fs-kicker">L’offre</div>' +
        '<div class="fs-prix">97 €</div>' +
        "<p>Paiement en une fois. Pas d’abonnement, rien à résilier.</p>" +
        '<a href="/checkout?type=course&id=rrTYwGkwfvTnP5m9_J7BG">' +
        '<button class="bg-primary">Je commence ma formation</button></a>' +
        '<div class="fs-confiance">' +
        '<span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" ' +
        'height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>' +
        "Paiement sécurisé par Visa, Mastercard ou CB</span>" +
        "<span>Garantie 14 jours, sans justification</span>" +
        "<span>Accès à vie, mises à jour comprises</span>" +
        "<span>Certificat et PDF téléchargeable</span>" +
        "</div>" +
        '<div class="fs-rail-outils"><b>Et les outils ?</b>' +
        "<p>Tableau de bord, modèles vierges, module bonus : 50 €, " +
        "proposés après l’achat. La formation est complète sans lui.</p></div>";

    function poserRail() {
        if (location.pathname.indexOf("/p/powerlifting") !== 0) return;
        if (document.querySelector(".fs-vente-grille")) return;
        var premier = document.getElementById("premier-ecran");
        if (!premier || !premier.parentNode) return;
        var parent = premier.parentNode;

        var sections = [];
        var n = premier;
        while (n) {
            if (n.tagName === "SECTION") sections.push(n);
            n = n.nextElementSibling;
        }
        if (!sections.length) return;

        var grille = document.createElement("div");
        grille.className = "fs-vente-grille";
        var colonne = document.createElement("div");
        colonne.className = "fs-colonne";
        var rail = document.createElement("div");
        rail.className = "fs-rail";
        rail.innerHTML = RAIL;

        parent.insertBefore(grille, premier);
        sections.forEach(function (s) {
            colonne.appendChild(s);
        });
        grille.appendChild(colonne);
        grille.appendChild(rail);
    }

    /* ═══════════ 8. Les deux paquets ═══════════
     Rendu de AnimatedHikeCard (apps/web/components/ui/card-25.tsx).
     Les pages publiques sont construites par blocs : on pose donc le meme
     balisage ici, avec les memes transformations au survol. */
    var PAQUETS =
        '<a class="fs-pack" href="/p/powerlifting-construis-ta-force-comprends-ta-methode-1" aria-label="En savoir plus sur La formation"><div class="fs-pack-tete"><h3>La formation</h3><svg class="fs-pack-fleche" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></div><div class="fs-pack-images"><div class="fs-pack-img" style="transform:translateX(0%);--tx:0.0%;--r:-5deg;z-index:3"><img src="/marque/packs/formation-1.jpg" alt="La formation, vue 1" loading="lazy"></div><div class="fs-pack-img" style="transform:translateX(32%);--tx:75.0%;--r:0deg;z-index:2"><img src="/marque/packs/formation-2.jpg" alt="La formation, vue 2" loading="lazy"></div><div class="fs-pack-img" style="transform:translateX(64%);--tx:150.0%;--r:5deg;z-index:1"><img src="/marque/packs/formation-3.jpg" alt="La formation, vue 3" loading="lazy"></div></div><div class="fs-pack-stats"><div class="fs-pack-stat"><svg class="" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>12 semaines</span></div><div class="fs-pack-stat"><svg class="" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg><span>49 leçons</span></div><div class="fs-pack-stat"><svg class="" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg><span>97 €</span></div></div><p>Douze semaines expliquées séance par séance. Chaque instruction arrive avec la logique qui l’a choisie, et avec quoi faire quand la séance ne suit pas le plan.</p></a><a class="fs-pack" href="/p/outils-et-bonus-formule-complete" aria-label="En savoir plus sur Les outils"><div class="fs-pack-tete"><h3>Les outils</h3><svg class="fs-pack-fleche" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></div><div class="fs-pack-images"><div class="fs-pack-img" style="transform:translateX(0%);--tx:0.0%;--r:-5deg;z-index:3"><img src="/marque/packs/outils-1.jpg" alt="Les outils, vue 1" loading="lazy"></div><div class="fs-pack-img" style="transform:translateX(32%);--tx:75.0%;--r:0deg;z-index:2"><img src="/marque/packs/outils-2.jpg" alt="Les outils, vue 2" loading="lazy"></div><div class="fs-pack-img" style="transform:translateX(64%);--tx:150.0%;--r:5deg;z-index:1"><img src="/marque/packs/outils-3.jpg" alt="Les outils, vue 3" loading="lazy"></div></div><div class="fs-pack-stats"><div class="fs-pack-stat"><svg class="" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg><span>Excel ou Sheets</span></div><div class="fs-pack-stat"><svg class="" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="7" rx="1"/><rect x="12" y="7" width="3" height="11" rx="1"/><rect x="17" y="4" width="3" height="14" rx="1"/></svg><span>3 outils</span></div><div class="fs-pack-stat"><svg class="" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg><span>50 €</span></div></div><p>Le tableau de bord décide de ta charge à ta place : tu notes ta séance et ton RPE, il compte ton volume, trace ta courbe et te dit quoi faire la fois suivante.</p></a>';

    function poserPaquets() {
        var hote = document.getElementById("offre-phare");
        if (!hote || hote.querySelector(".fs-packs")) return;
        var cible = hote.querySelector("div") || hote;
        var d = document.createElement("div");
        d.className = "fs-packs";
        d.innerHTML = PAQUETS;
        cible.appendChild(d);
    }

    /* ═══════════ 9. Les trois dossiers ═══════════
     Rendu de AnimatedFolder (apps/web/components/ui/3d-folder.tsx).
     L'ouverture du dossier et l'eventail des photos sont en CSS pur
     (:hover) ; seule la visionneuse demande du JavaScript. */
    var DOSSIERS =
        '<div class="fs-dossier" data-dossier="quoi"><div class="fs-dos-scene"><div class="fs-dos-back"></div><div class="fs-dos-tab"></div><div class="fs-dos-cartes"><div class="fs-dos-carte" data-i="0" data-src="/marque/dossiers/quoi-1.jpg" data-titre="L’exécution expliquée" role="button" tabindex="0" aria-label="Ouvrir : L’exécution expliquée"><img src="/marque/dossiers/quoi-1.jpg" alt="L’exécution expliquée" loading="lazy"><span>L’exécution expliquée</span></div><div class="fs-dos-carte" data-i="1" data-src="/marque/dossiers/quoi-2.jpg" data-titre="Le choix de la charge" role="button" tabindex="0" aria-label="Ouvrir : Le choix de la charge"><img src="/marque/dossiers/quoi-2.jpg" alt="Le choix de la charge" loading="lazy"><span>Le choix de la charge</span></div><div class="fs-dos-carte" data-i="2" data-src="/marque/dossiers/quoi-3.jpg" data-titre="La mise en place" role="button" tabindex="0" aria-label="Ouvrir : La mise en place"><img src="/marque/dossiers/quoi-3.jpg" alt="La mise en place" loading="lazy"><span>La mise en place</span></div></div><div class="fs-dos-front"></div><div class="fs-dos-shine"></div></div><h3>Le quoi et le pourquoi</h3><p>Chaque série, chaque charge, chaque temps de repos arrive avec la raison qui l’a choisi. Tu ne suis pas un tableau : tu comprends le raisonnement, et tu peux l’adapter le jour où ta séance ne ressemble pas au plan.</p><div class="fs-dos-hint">Survole pour ouvrir</div></div><div class="fs-dossier" data-dossier="chiffres"><div class="fs-dos-scene"><div class="fs-dos-back"></div><div class="fs-dos-tab"></div><div class="fs-dos-cartes"><div class="fs-dos-carte" data-i="0" data-src="/marque/dossiers/chiffres-1.jpg" data-titre="Le tableau de bord" role="button" tabindex="0" aria-label="Ouvrir : Le tableau de bord"><img src="/marque/dossiers/chiffres-1.jpg" alt="Le tableau de bord" loading="lazy"><span>Le tableau de bord</span></div><div class="fs-dos-carte" data-i="1" data-src="/marque/dossiers/chiffres-2.jpg" data-titre="Tes courbes de progression" role="button" tabindex="0" aria-label="Ouvrir : Tes courbes de progression"><img src="/marque/dossiers/chiffres-2.jpg" alt="Tes courbes de progression" loading="lazy"><span>Tes courbes de progression</span></div><div class="fs-dos-carte" data-i="2" data-src="/marque/dossiers/chiffres-3.jpg" data-titre="Les repères chiffrés" role="button" tabindex="0" aria-label="Ouvrir : Les repères chiffrés"><img src="/marque/dossiers/chiffres-3.jpg" alt="Les repères chiffrés" loading="lazy"><span>Les repères chiffrés</span></div></div><div class="fs-dos-front"></div><div class="fs-dos-shine"></div></div><h3>Des chiffres sourcés</h3><p>Volumes hebdomadaires, profondeur, pourcentages, calories : chaque donnée arrive avec son origine et sa marge d’erreur. Rien n’est repris d’un post vu en ligne, et tu peux vérifier chaque chiffre toi-même.</p><div class="fs-dos-hint">Survole pour ouvrir</div></div><div class="fs-dossier" data-dossier="rate"><div class="fs-dos-scene"><div class="fs-dos-back"></div><div class="fs-dos-tab"></div><div class="fs-dos-cartes"><div class="fs-dos-carte" data-i="0" data-src="/marque/dossiers/rate-1.jpg" data-titre="La séance difficile" role="button" tabindex="0" aria-label="Ouvrir : La séance difficile"><img src="/marque/dossiers/rate-1.jpg" alt="La séance difficile" loading="lazy"><span>La séance difficile</span></div><div class="fs-dos-carte" data-i="1" data-src="/marque/dossiers/rate-2.jpg" data-titre="Ajuster la charge" role="button" tabindex="0" aria-label="Ouvrir : Ajuster la charge"><img src="/marque/dossiers/rate-2.jpg" alt="Ajuster la charge" loading="lazy"><span>Ajuster la charge</span></div><div class="fs-dos-carte" data-i="2" data-src="/marque/dossiers/rate-3.jpg" data-titre="Repartir au bon moment" role="button" tabindex="0" aria-label="Ouvrir : Repartir au bon moment"><img src="/marque/dossiers/rate-3.jpg" alt="Repartir au bon moment" loading="lazy"><span>Repartir au bon moment</span></div></div><div class="fs-dos-front"></div><div class="fs-dos-shine"></div></div><h3>Quoi faire quand ça rate</h3><p>La séance ratée fait partie du programme. Tu sais quand insister, quand baisser la charge de 5 %, et quand couper. C’est ce qui sépare douze semaines terminées de douze semaines abandonnées en semaine cinq.</p><div class="fs-dos-hint">Survole pour ouvrir</div></div>';

    function poserDossiers() {
        var hote = document.getElementById("trois-piliers");
        if (!hote || hote.querySelector(".fs-dossiers")) return;
        var cible = hote.querySelector("div") || hote;
        var d = document.createElement("div");
        d.className = "fs-dossiers";
        d.innerHTML = DOSSIERS;
        cible.appendChild(d);
        brancherVisionneuse(d);
    }

    /* ── la visionneuse ── */
    function brancherVisionneuse(racine) {
        var photos = [];
        var index = 0;
        var boite = null;

        function fermer() {
            if (!boite) return;
            boite.classList.remove("fs-vue-ouverte");
            document.body.style.overflow = "";
            var b = boite;
            setTimeout(function () {
                if (b && b.parentNode) b.parentNode.removeChild(b);
            }, 320);
            boite = null;
            document.removeEventListener("keydown", auClavier);
        }

        function afficher() {
            if (!boite) return;
            var p = photos[index];
            boite.querySelector(".fs-vue-img").src = p.src;
            boite.querySelector(".fs-vue-img").alt = p.titre;
            boite.querySelector(".fs-vue-titre").textContent = p.titre;
            var points = boite.querySelectorAll(".fs-vue-point");
            for (var i = 0; i < points.length; i++) {
                points[i].className =
                    "fs-vue-point" + (i === index ? " actif" : "");
            }
            boite.querySelector(".fs-vue-prec").disabled = index === 0;
            boite.querySelector(".fs-vue-suiv").disabled =
                index === photos.length - 1;
        }

        function aller(n) {
            if (n < 0 || n >= photos.length) return;
            index = n;
            afficher();
        }

        function auClavier(e) {
            if (e.key === "Escape") fermer();
            if (e.key === "ArrowRight") aller(index + 1);
            if (e.key === "ArrowLeft") aller(index - 1);
        }

        function ouvrir(cartes, i) {
            photos = [];
            for (var k = 0; k < cartes.length; k++) {
                photos.push({
                    src: cartes[k].getAttribute("data-src"),
                    titre: cartes[k].getAttribute("data-titre"),
                });
            }
            index = i;
            boite = document.createElement("div");
            boite.className = "fs-vue";
            boite.innerHTML =
                '<div class="fs-vue-fond"></div>' +
                '<button class="fs-vue-fermer" aria-label="Fermer">' +
                CROIX +
                "</button>" +
                '<button class="fs-vue-prec" aria-label="Photo precedente">' +
                CHEVRON_G +
                "</button>" +
                '<button class="fs-vue-suiv" aria-label="Photo suivante">' +
                CHEVRON_D +
                "</button>" +
                '<figure class="fs-vue-cadre">' +
                '<img class="fs-vue-img" alt="">' +
                '<figcaption><span class="fs-vue-titre"></span>' +
                '<span class="fs-vue-points">' +
                photos
                    .map(function (_, n) {
                        return (
                            '<span class="fs-vue-point' +
                            (n === i ? " actif" : "") +
                            '"></span>'
                        );
                    })
                    .join("") +
                "</span></figcaption>" +
                "</figure>";
            document.body.appendChild(boite);
            document.body.style.overflow = "hidden";
            afficher();
            boite.getBoundingClientRect();
            boite.classList.add("fs-vue-ouverte");

            boite
                .querySelector(".fs-vue-fond")
                .addEventListener("click", fermer);
            boite
                .querySelector(".fs-vue-fermer")
                .addEventListener("click", fermer);
            boite
                .querySelector(".fs-vue-prec")
                .addEventListener("click", function () {
                    aller(index - 1);
                });
            boite
                .querySelector(".fs-vue-suiv")
                .addEventListener("click", function () {
                    aller(index + 1);
                });
            var pts = boite.querySelectorAll(".fs-vue-point");
            for (var j = 0; j < pts.length; j++) {
                (function (n) {
                    pts[n].addEventListener("click", function () {
                        aller(n);
                    });
                })(j);
            }
            document.addEventListener("keydown", auClavier);
        }

        racine.querySelectorAll(".fs-dossier").forEach(function (dos) {
            var cartes = dos.querySelectorAll(".fs-dos-carte");
            cartes.forEach(function (c, i) {
                c.addEventListener("click", function (e) {
                    e.stopPropagation();
                    ouvrir(cartes, i);
                });
                c.addEventListener("keydown", function (e) {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        ouvrir(cartes, i);
                    }
                });
            });
        });
    }

    var CROIX =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
        '<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    var CHEVRON_G =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" ' +
        'stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
    var CHEVRON_D =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" ' +
        'stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

    /* ═══════════ orchestration ═══════════ */
    function passe() {
        marquerVente();
        poserLogo();
        poserCarte();
        poserMeta();
        poserGraphiques();
        poserRail();
        poserPaquets();
        poserDossiers();
        preparerSections();
        verifier();
        lancerCompteurs(document.getElementById("premier-ecran"));
    }

    function demarrer() {
        passe();
        window.addEventListener("scroll", planifier, { passive: true });
        window.addEventListener("resize", planifier, { passive: true });
        setInterval(verifier, 400);
        var mo = new MutationObserver(function () {
            clearTimeout(window.__fs1bT);
            window.__fs1bT = setTimeout(passe, 120);
        });
        mo.observe(document.body, { childList: true, subtree: true });
        /* filet : rien ne doit rester invisible */
        setTimeout(function () {
            document
                .querySelectorAll('[data-fs-reveal="pending"]')
                .forEach(function (s) {
                    s.setAttribute("data-fs-reveal", "in");
                });
        }, 20000);
    }

    /* Quand demarrer.
     Le script deplace et remplace des elements rendus par le serveur. S'il
     agit avant que React ait repris la main sur ce HTML, l'hydratation
     echoue. On attend donc la fin du chargement, puis un court moment sans
     aucune modification du DOM : c'est le signe que React a fini. Un delai
     maximum evite d'attendre indefiniment sur une page qui bouge tout le
     temps. */
    function amorcer() {
        var lance = false;
        function go() {
            if (lance) return;
            lance = true;
            demarrer();
        }
        function attendreLeCalme() {
            var mo = new MutationObserver(function () {
                clearTimeout(minuterie);
                minuterie = setTimeout(function () {
                    mo.disconnect();
                    go();
                }, 350);
            });
            var minuterie = setTimeout(function () {
                mo.disconnect();
                go();
            }, 350);
            mo.observe(document.body, { childList: true, subtree: true });
            setTimeout(function () {
                mo.disconnect();
                go();
            }, 3000);
        }
        if (document.readyState === "complete") {
            attendreLeCalme();
        } else {
            window.addEventListener("load", attendreLeCalme);
        }
    }
    amorcer();
})();
