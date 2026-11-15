#!/bin/sh
# ---------------------------------------------------------------------
# Verifie toutes les cinq minutes que le site repond, et le relance s'il
# est tombe.
#
# Trois echecs de suite avant d'agir : une seule reponse lente ne doit pas
# declencher un redemarrage, qui coupe les visiteurs en train de lire.
#
# Installe par installer.sh.
# ---------------------------------------------------------------------
set -u

ADRESSE="${ADRESSE_SITE:-http://localhost}"
DOSSIER_COMPOSE="${DOSSIER_COMPOSE:-/root/force-structuree/deploiement-force-structuree}"
ETAT=/var/run/force-structuree-echecs
JOURNAL="${JOURNAL_SURVEILLANCE:-/var/log/force-structuree-surveillance.log}"
SEUIL=3

dire() {
    echo "$(date '+%Y-%m-%d %H:%M:%S')  $*" >> "$JOURNAL"
}

CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$ADRESSE/" || echo 000)

if [ "$CODE" = "200" ] || [ "$CODE" = "304" ]; then
    if [ -f "$ETAT" ] && [ "$(cat "$ETAT")" != "0" ]; then
        dire "le site repond de nouveau (code $CODE)"
    fi
    echo 0 > "$ETAT"
    exit 0
fi

ECHECS=$(cat "$ETAT" 2>/dev/null || echo 0)
ECHECS=$((ECHECS + 1))
echo "$ECHECS" > "$ETAT"
dire "pas de reponse (code $CODE), echec $ECHECS sur $SEUIL"

if [ "$ECHECS" -lt "$SEUIL" ]; then
    exit 0
fi

dire "redemarrage du site"
cd "$DOSSIER_COMPOSE" || { dire "dossier introuvable : $DOSSIER_COMPOSE"; exit 1; }
docker compose restart app >> "$JOURNAL" 2>&1
echo 0 > "$ETAT"

sleep 45
CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$ADRESSE/" || echo 000)
if [ "$CODE" = "200" ]; then
    dire "le site est reparti (code $CODE)"
else
    dire "TOUJOURS EN PANNE apres redemarrage (code $CODE)"
    if [ -n "${ALERTE_EMAIL:-}" ] && command -v mail >/dev/null 2>&1; then
        echo "Le site ne repond plus et le redemarrage n'a rien change." \
            | mail -s "Force Structuree : site en panne" "$ALERTE_EMAIL" || true
    fi
fi
