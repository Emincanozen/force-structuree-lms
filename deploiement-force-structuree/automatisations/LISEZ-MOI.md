# Les automatisations du serveur

Ces trois fichiers ne servent que **sur le serveur**, une fois le site en
ligne. Ils ne font rien sur ton ordinateur.

## Installation, une seule fois

Une fois que le site tourne sur le serveur :

```bash
sh automatisations/installer.sh
```

Il installe quatre choses et vérifie tout de suite que la première
fonctionne.

| Quand                | Quoi                                               | Pourquoi                                                     |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| Chaque nuit à 3h15   | Sauvegarde de la base, **relue pour vérification** | Une copie qu'on n'a jamais rouverte n'est pas une sauvegarde |
| Toutes les 5 minutes | Le site répond-il ? Sinon, relance                 | Une panne à 3h du matin se répare sans toi                   |
| En continu           | Correctifs de sécurité du système                  | C'est la porte d'entrée la plus courante                     |
| Chaque dimanche      | Ménage des images Docker abandonnées               | Elles remplissent le disque en silence                       |

## La sauvegarde, en détail

Elle ne se contente pas de copier. Elle **relit l'archive** dans une base
jetable, compte les leçons et les comptes, et n'accepte le résultat que
si les chiffres sont crédibles. Une archive vide ou tronquée est signalée
comme un échec, pas rangée sagement à côté des bonnes.

Les archives vivent dans `/var/sauvegardes/force-structuree`, gardées
30 jours, avec toujours les cinq dernières même si elles sont plus
vieilles. Le compte rendu de chaque passage va dans `journal.txt` du même
dossier.

## La copie hors du serveur

**C'est le seul point que l'installation ne peut pas régler pour toi, et
c'est le plus important.**

Une sauvegarde posée sur la machine qu'elle protège ne sert à rien le
jour où cette machine disparaît : disque mort, compte fermé, erreur de
manipulation. Il faut qu'une copie parte ailleurs.

Trois façons, de la plus simple à la plus solide :

1. **MongoDB Atlas** plutôt que la base dans le serveur. Les sauvegardes
   deviennent leur travail, pas le tien. C'est ce que recommande le guide
   de mise en ligne.
2. **rclone** vers un espace de stockage (Cloudflare R2, Backblaze,
   OneDrive). Installe rclone, configure une destination, puis ajoute
   dans le fichier de configuration du serveur :
    ```
    DESTINATION_DISTANTE=nom-de-la-destination:force-structuree
    ```
    Le script de sauvegarde s'en sert tout seul.
3. **Récupérer l'archive à la main** de temps en temps :
    ```bash
    scp root@ton-serveur:/var/sauvegardes/force-structuree/*.archive .
    ```
    Ça marche, mais ça repose sur ta mémoire.

## Être prévenu quand quelque chose casse

Ajoute une adresse dans la configuration du serveur :

```
ALERTE_EMAIL=ton-adresse@exemple.fr
```

Les scripts écriront à cette adresse si une sauvegarde échoue ou si le
site ne repart pas après un redémarrage. Il faut que la commande `mail`
soit installée sur le serveur, sinon la ligne est ignorée sans casser
quoi que ce soit.

## Vérifier que ça tourne

```bash
crontab -l                                              # les tâches installées
tail -20 /var/sauvegardes/force-structuree/journal.txt  # les sauvegardes
tail -20 /var/log/force-structuree-surveillance.log     # la surveillance
ls -lh /var/sauvegardes/force-structuree/               # les archives
```

## Tout retirer

```bash
crontab -e                                    # effacer les lignes « force-structuree »
dpkg-reconfigure unattended-upgrades          # remettre les mises à jour en manuel
```

## Restaurer une sauvegarde

```bash
docker cp /var/sauvegardes/force-structuree/LA-DATE.archive force-structuree-mongo-1:/tmp/r.archive
docker exec force-structuree-mongo-1 mongorestore --archive=/tmp/r.archive --gzip --drop
docker compose restart app
```

`--drop` remplace la base actuelle. Fais d'abord une sauvegarde de l'état
présent : c'est exactement le genre de commande qu'on regrette.
