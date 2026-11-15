"use client";

import { useEffect } from "react";

/**
 * Charge les comportements de la charte (public/force-structuree.js).
 *
 * Pourquoi passer par un effet plutot que par une balise <script> :
 * le script deplace et remplace des elements rendus par le serveur. S'il
 * s'execute avant que React ait fini de reprendre la main sur ce HTML,
 * l'hydratation echoue. Un effet ne se declenche qu'apres, ce qui donne
 * exactement la garantie qu'offrait l'ancien injecteur de CourseLit.
 */
export default function CharteForceStructuree() {
    useEffect(() => {
        if (document.getElementById("fs-charte")) {
            return;
        }
        const script = document.createElement("script");
        script.id = "fs-charte";
        script.src = "/force-structuree.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return null;
}
