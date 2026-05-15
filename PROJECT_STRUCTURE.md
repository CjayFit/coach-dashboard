# Architecture du Projet Coach Dashboard

Ce document explique la structure du projet et le rôle de chaque fichier principal, destiné à un développeur qui ne connaît pas nécessairement Svelte ou SvelteKit.

### Fichiers de Configuration (Le Cerveau du Projet)

-   **`package.json`**: C'est la carte d'identité du projet. Il liste toutes les technologies utilisées (les "dépendances" comme Svelte, Vite, Tailwind CSS) et définit des commandes utiles (comme `npm run dev` pour démarrer le projet et `npm run build` pour le préparer à la mise en ligne).
-   **`vite.config.ts`**: Vite est l'outil qui construit et sert votre application très rapidement pendant le développement. Ce fichier contient la configuration pour Vite.
-   **`svelte.config.js`**: Fichier de configuration spécifique à SvelteKit. Il indique comment le projet doit être "compilé" pour être mis en ligne (par exemple, pour un hébergeur comme Vercel ou Netlify).
-   **`tailwind.config.js`**: Tailwind est un outil pour styliser l'application (couleurs, espacements, etc.) sans écrire beaucoup de CSS. Ce fichier personnalise le style.

### Le Dossier `src` (Le Cœur de l'Application)

C'est ici que se trouve tout le code que vous écrivez.

-   **`app.html`**: C'est le squelette HTML de base de toute votre application. Toutes les pages seront injectées à l'intérieur de ce fichier.
-   **`app.css`**: Contient les styles CSS qui s'appliquent à l'ensemble du site.

#### `src/routes/` (La Navigation et les Pages)

C'est la partie la plus importante de SvelteKit. La structure des dossiers et fichiers ici définit automatiquement les URLs de votre site.

-   **Un fichier `+page.svelte`** : Représente une page visible par l'utilisateur.
    -   `src/routes/+page.svelte` est la page d'accueil (`/`).
    -   `src/routes/login/+page.svelte` est la page de connexion (`/login`).
-   **Un fichier `+layout.svelte`** : C'est un gabarit (template) pour un ensemble de pages. Par exemple, `src/routes/+layout.svelte` pourrait contenir votre menu de navigation et votre pied de page, qui apparaîtront sur toutes les pages du site.
-   **Un dossier `[id]`** : C'est une route dynamique. Par exemple, `src/routes/clients/[id]/+page.svelte` est le template pour afficher la page d'un client spécifique. L'URL ressemblerait à `/clients/123`, où `123` est l'ID du client.

#### `src/routes/api/` (Le Backend de votre Application)

Cette partie gère la logique "côté serveur", comme parler à la base de données. Elle n'affiche pas de pages, mais fournit des données.

-   **Un fichier `+server.ts`** : Définit un point d'API. Par exemple, `src/routes/api/entries/+server.ts` gère les requêtes pour créer ou lire des entrées quotidiennes. Il répond aux requêtes `GET` (pour lire) et `POST` (pour écrire) à l'URL `/api/entries`.

#### `src/lib/` (La Boîte à Outils)

Ce dossier contient du code réutilisable que vous pouvez importer n'importe où dans votre application.

-   `supabase.ts`: Contient la logique pour se connecter à votre base de données Supabase.
-   `types.ts`: Définit les "formes" de vos données (par exemple, ce à quoi ressemble un objet "Client").
-   `utils.ts`: Fonctions utilitaires diverses.

### En résumé pour un non-Sveltois :

Pensez à SvelteKit comme un framework qui combine le frontend (l'interface utilisateur, dans les fichiers `.svelte`) et le backend (la logique serveur, dans les fichiers `+server.ts`) dans un seul projet. La structure des dossiers dans `src/routes/` crée automatiquement les URLs, ce qui rend l'organisation très intuitive.
