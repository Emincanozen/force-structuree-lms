# Force structurée

Plateforme de formation et de vente de contenus construite à partir de **CourseLit**. Elle réunit un site public, un espace apprenant, une administration de cours, des paiements, des communautés et des traitements de fond. Les mentions et la [licence MIT d'origine](LICENSE.md) sont conservées ; le dépôt de travail reste privé.

## Comprendre les composants

- `apps/web` : application Next.js, interface d'administration et d'apprentissage, GraphQL et API REST.
- `apps/queue` : tâches asynchrones, séquences, notifications et traitements différés.
- `apps/docs-new` : nouvelle documentation ; `apps/docs` contient l'ancien site Astro.
- `packages` : modèles, accès MongoDB, logique commune, composants et éditeurs réutilisés.
- `deployment` et `services` : exemples d'exploitation et images. Leur présence ne prouve pas qu'un service est déployé.

Le produit est multi-tenant : chaque école possède son domaine, ses utilisateurs et son contenu. L'invariant de propriété du domaine est documenté dans [AGENTS.md](AGENTS.md) et doit être conservé dans les opérations de maintenance.

## Installer et vérifier

Utiliser Node.js 24 pour cette revue et la version déclarée de pnpm, **10.22.0**. Un pnpm plus récent n'applique pas nécessairement la configuration des overrides de la même façon.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm --filter './packages/**' -r run build
corepack pnpm test --runInBand
corepack pnpm lint
```

Les tests serveur lancent une base MongoDB éphémère ; le premier passage télécharge son binaire. Ils ne nécessitent pas de base de production. Les paiements et intégrations externes sont simulés : une suite verte n'atteste pas un encaissement réel.

Pour travailler sur l'interface : copier `apps/web/.env.example` vers une configuration locale non suivie, renseigner les services de développement et lancer `pnpm dev`. Consulter les exemples d'environnement de la queue et la documentation de déploiement avant de démarrer les workers. Ne jamais brancher les tests sur les données réelles.

## Corrections proposées

Voir [REVIEW.md](REVIEW.md) : tests adaptés à la traduction française, liens locaux réparés, environnement local retiré de Git, actions CodeQL modernisées et mises à jour de dépendances ciblées. Les résultats de validation sont séparés des fonctions simplement présentes dans le code.

## Avant toute ouverture publique

Achever les migrations de dépendances signalées par l'audit, renouveler les identifiants réels éventuellement présents dans l'ancien `.env`, vérifier les accès entre écoles et exercer les parcours navigateur avec les services de test. Les configurations de livraison du dépôt ne sont pas exécutées pendant cette revue. Aucune visibilité n'est modifiée.

La [documentation historique de CourseLit](docs/README.md) reste disponible comme référence amont ; elle ne doit pas être lue comme la preuve que cette instance est en production.
