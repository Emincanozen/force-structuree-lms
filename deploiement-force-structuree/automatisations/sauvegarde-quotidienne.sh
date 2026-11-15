#!/bin/sh
# ---------------------------------------------------------------------
# Sauvegarde quotidienne de la base, sur le serveur.
#
# Copie la base, verifie que la copie se relit, garde 30 jours d'archives
# et envoie un message si quelque chose se passe mal.
#
# Installe par installer.sh, lance chaque nuit a 3h15.
# ---------------------------------------------------------------------
set -eu

DOSSIER="${DOSSIER_SAUVEGARDES:-/var/sauvegardes/force-structuree}"
CONTENEUR="${CONTENEUR_MONGO:-force-structuree-mongo-1}"
BASE=courselit
JOURS=30
HORODATAGE=$(date +%Y-%m-%d-%H%M)
ARCHIVE="$DOSSIER/$HORODATAGE.archive"
JOURNAL="$DOSSIER/journal.txt"

mkdir -p "$DOSSIER"

dire() {
    echo "$(date '+%Y-%m-%d %H:%M:%S')  $*" | tee -a "$JOURNAL"
}

echouer() {
    dire "ECHEC : $*"
    # Si une adresse est configuree, prevenir. Sans mail installe, cette
    # ligne ne fait rien et n'interrompt pas le script.
    if [ -n "${ALERTE_EMAIL:-}" ] && command -v mail >/dev/null 2>&1; then
        echo "$*" | mail -s "Sauvegarde Force Structuree en echec" "$ALERTE_EMAIL" || true
    fi
    exit 1
}

# 1. copier
docker exec "$CONTENEUR" mongodump --db "$BASE" \
    --archive=/tmp/sauvegarde.archive --gzip >/dev/null 2>&1 \
    || echouer "mongodump n'a pas abouti"
docker cp "$CONTENEUR:/tmp/sauvegarde.archive" "$ARCHIVE" >/dev/null \
    || echouer "la copie hors du conteneur a echoue"
docker exec "$CONTENEUR" rm -f /tmp/sauvegarde.archive || true

TAILLE=$(wc -c < "$ARCHIVE")
[ "$TAILLE" -gt 10000 ] || echouer "archive suspecte : $TAILLE octets"

# 2. relire, dans une base jetable, jamais sur la vraie
docker cp "$ARCHIVE" "$CONTENEUR:/tmp/verif.archive" >/dev/null
docker exec "$CONTENEUR" mongosh verification --quiet \
    --eval 'db.dropDatabase()' >/dev/null 2>&1 || true
docker exec "$CONTENEUR" mongorestore --archive=/tmp/verif.archive --gzip \
    --nsFrom "$BASE.*" --nsTo 'verification.*' >/dev/null 2>&1 \
    || echouer "l'archive ne se relit pas"
COMPTE=$(docker exec "$CONTENEUR" mongosh verification --quiet \
    --eval 'print(db.lessons.countDocuments()+"/"+db.users.countDocuments())' \
    | tail -n 1)
docker exec "$CONTENEUR" mongosh verification --quiet \
    --eval 'db.dropDatabase()' >/dev/null 2>&1 || true
docker exec "$CONTENEUR" rm -f /tmp/verif.archive || true

case "$COMPTE" in
    0/*|"") echouer "l'archive se relit mais ne contient aucune lecon" ;;
esac

dire "sauvegarde $HORODATAGE ($(($TAILLE / 1024)) Ko), relue : $COMPTE lecons/comptes"

# 3. menage, en gardant toujours les cinq dernieres
cd "$DOSSIER"
GARDEES=$(ls -1t *.archive 2>/dev/null | head -n 5 || true)
for f in $(find . -maxdepth 1 -name '*.archive' -mtime +$JOURS -printf '%f\n' 2>/dev/null); do
    echo "$GARDEES" | grep -qx "$f" || { rm -f "$f"; dire "effacee : $f"; }
done

# 4. copie hors du serveur, si un depot distant est configure
if [ -n "${DESTINATION_DISTANTE:-}" ]; then
    if command -v rclone >/dev/null 2>&1; then
        rclone copy "$ARCHIVE" "$DESTINATION_DISTANTE" >/dev/null 2>&1 \
            && dire "copiee vers $DESTINATION_DISTANTE" \
            || dire "ATTENTION : la copie distante a echoue"
    else
        dire "ATTENTION : rclone n'est pas installe, pas de copie distante"
    fi
fi
