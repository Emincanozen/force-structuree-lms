#!/bin/sh
# ---------------------------------------------------------------------
# Installe les automatisations du serveur. A lancer une seule fois, sur
# le serveur, apres que le site tourne :
#
#     sh automatisations/installer.sh
#
# Ce qu'il met en place :
#   - sauvegarde de la base chaque nuit a 3h15, verifiee et tournante
#   - surveillance du site toutes les 5 minutes, avec redemarrage
#   - mises a jour de securite automatiques du systeme
#   - nettoyage hebdomadaire des images Docker abandonnees
#
# Tout est reversible : crontab -e pour les taches, et
# dpkg-reconfigure unattended-upgrades pour les mises a jour.
# ---------------------------------------------------------------------
set -eu

ICI=$(cd "$(dirname "$0")" && pwd)
DOSSIER_COMPOSE=$(dirname "$ICI")

echo "Dossier de deploiement : $DOSSIER_COMPOSE"

# --- 1. les scripts doivent etre executables -------------------------
chmod +x "$ICI/sauvegarde-quotidienne.sh" "$ICI/surveillance.sh"
mkdir -p /var/sauvegardes/force-structuree

# --- 2. les mises a jour de securite ---------------------------------
echo "Installation des mises a jour de securite automatiques..."
DEBIAN_FRONTEND=noninteractive apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    unattended-upgrades curl >/dev/null
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'FIN'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
FIN
echo "  fait : le systeme installera seul ses correctifs de securite."

# --- 3. les taches regulieres ----------------------------------------
# On reecrit uniquement nos lignes, reperees par un marqueur, pour ne pas
# effacer d'eventuelles taches deja presentes.
MARQUEUR="# force-structuree"
TMP=$(mktemp)
crontab -l 2>/dev/null | grep -v "$MARQUEUR" > "$TMP" || true

cat >> "$TMP" <<FIN
15 3 * * *  DOSSIER_COMPOSE=$DOSSIER_COMPOSE sh $ICI/sauvegarde-quotidienne.sh  $MARQUEUR
*/5 * * * * DOSSIER_COMPOSE=$DOSSIER_COMPOSE sh $ICI/surveillance.sh            $MARQUEUR
30 4 * * 0  docker image prune -af >/dev/null 2>&1                              $MARQUEUR
FIN

crontab "$TMP"
rm -f "$TMP"

echo
echo "Taches installees :"
crontab -l | grep "$MARQUEUR" | sed 's/^/  /'

echo
echo "Verification immediate de la sauvegarde..."
DOSSIER_COMPOSE="$DOSSIER_COMPOSE" sh "$ICI/sauvegarde-quotidienne.sh"

echo
echo "Termine."
echo
echo "Il reste UNE chose que ce script ne peut pas faire a ta place :"
echo "envoyer une copie des sauvegardes AILLEURS que sur ce serveur."
echo "Une sauvegarde posee a cote de la machine qu'elle protege ne sert"
echo "a rien le jour ou la machine disparait. Voir automatisations/"
echo "LISEZ-MOI.md, section « la copie hors du serveur »."
