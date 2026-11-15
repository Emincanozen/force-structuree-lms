import { headers as headersType } from "next/headers";

/**
 * Adresse que le serveur utilise pour s'appeler lui-meme.
 *
 * CourseLit rend ses pages en interrogeant son propre /api/graph par HTTP.
 * L'adresse est reconstruite a partir des en-tetes du visiteur. Deux
 * corrections par rapport a l'original :
 *
 * 1. Sans reverse proxy devant l'application, l'en-tete
 *    « x-forwarded-proto » est absent. Le gabarit produisait alors
 *    litteralement « null://mon-site.fr » : toutes les requetes
 *    echouaient et la page d'accueil renvoyait 404. On retombe sur http.
 *
 * 2. INTERNAL_BASE_URL court-circuite le detour par l'exterieur quand
 *    l'adresse publique n'est pas joignable depuis le conteneur. Non
 *    definie, rien ne change.
 */
export async function getBackendAddress(
    headers: Headers,
): Promise<`${string}://${string}`> {
    const interne = process.env.INTERNAL_BASE_URL;
    if (interne) {
        return interne as `${string}://${string}`;
    }
    const protocole = headers.get("x-forwarded-proto") || "http";
    return `${protocole}://${headers.get("host")}`;
}

export async function getAddressFromHeaders(headers: typeof headersType) {
    const headersList = await headers();
    const address = await getBackendAddress(headersList);
    return address;
}
