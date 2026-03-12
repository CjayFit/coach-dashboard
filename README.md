# Coach Dashboard 🏋️

Application SvelteKit pour gérer et suivre la progression des clients en coaching sportif.

## 🎯 Fonctionnalités

✅ **Gestion des clients (CRUD)**
- Ajouter, modifier et supprimer des clients
- Suivi du poids, objectifs et dates

✅ **Système de score discipline**
- Calcul automatique basé sur :
  - Adhérence entraînement (≥80% = +2 pts)
  - Adhérence protéines (≥80% = +2 pts)
  - Prise de poids = +1 pt
- Badges de statut : 🟢 Excellent | 🟡 À surveiller | 🔴 À risque

✅ **Dashboard stratégique**
- KPIs globaux (total clients, statuts, moyennes)
- Filtre clients à risque
- Vue d'ensemble complète

✅ **Architecture évolutive**
- Weekly logs pour suivi détaillé
- Mise à jour automatique des métriques
- Prêt pour déploiement production

---

## 🚀 Installation rapide

### 1️⃣ Prérequis

- Node.js 18+ installé
- Un compte Supabase (gratuit)
- Un compte Vercel (gratuit)

### 2️⃣ Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd coach-dashboard

# Installer les dépendances
npm install
```

### 3️⃣ Configuration Supabase

1. **Créer un projet Supabase**
   - Aller sur [supabase.com](https://supabase.com)
   - Créer un nouveau projet
   - Noter l'URL et la clé ANON

2. **Exécuter le script SQL**
   - Dans Supabase Dashboard → SQL Editor
   - Copier-coller le contenu de `supabase-setup.sql`
   - Exécuter le script

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Éditer `.env` et remplacer :
   ```
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4️⃣ Lancer le projet

```bash
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

---

## 📁 Structure du projet

```
coach-dashboard/
├── src/
│   ├── lib/
│   │   ├── supabase.ts      # Client Supabase
│   │   ├── types.ts         # Types TypeScript
│   │   └── utils.ts         # Fonctions utilitaires (score, status)
│   ├── routes/
│   │   ├── +layout.svelte   # Layout global avec Tailwind
│   │   ├── +page.svelte     # Redirection vers /dashboard
│   │   ├── login/           # Page de connexion admin
│   │   ├── dashboard/       # Dashboard avec KPIs
│   │   └── clients/         # Gestion CRUD clients
│   └── app.css              # Styles Tailwind
├── supabase-setup.sql       # Script de création des tables
├── .env.example             # Template variables d'environnement
└── svelte.config.js         # Config avec adapter Vercel
```

---

## 🗄️ Base de données

### Table `clients`
- `id` (UUID, PK)
- `name` (text)
- `start_date` (date)
- `goal` (text)
- `start_weight` (numeric)
- `current_weight` (numeric)
- `training_adherence` (numeric 0-1)
- `protein_adherence` (numeric 0-1)
- `last_checkin` (date)

### Table `weekly_logs` (pour évolution future)
- `id` (UUID, PK)
- `client_id` (FK → clients)
- `week_number` (integer)
- `sessions_completed` (integer)
- `sessions_planned` (integer)
- `protein_respected` (boolean)
- `weight` (numeric)
- `notes` (text)

---

## 🔒 Sécurité & Authentification

### Développement
Le script SQL inclut des politiques RLS pour autoriser l'accès aux utilisateurs authentifiés.

### Pour activer l'authentification Supabase :

1. **Activer Email Auth dans Supabase**
   - Dashboard → Authentication → Providers
   - Activer "Email"

2. **Créer un utilisateur admin**
   - Authentication → Users → Add User
   - Email + mot de passe

3. **Utiliser la page /login**
   - Se connecter avec l'email/mot de passe admin
   - La session est gérée automatiquement par Supabase

### Alternative rapide (développement uniquement)
Décommenter les politiques "public" dans `supabase-setup.sql` pour désactiver l'authentification temporairement.

---

## 🌐 Déploiement sur Vercel

### Option 1 : Via l'interface Vercel

1. Push ton code sur GitHub
2. Aller sur [vercel.com](https://vercel.com)
3. Import ton repo GitHub
4. Ajouter les variables d'environnement :
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
5. Deploy !

### Option 2 : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ajouter les env variables
vercel env add PUBLIC_SUPABASE_URL
vercel env add PUBLIC_SUPABASE_ANON_KEY

# Déployer en production
vercel --prod
```

---

## 🎨 Personnalisation

### Modifier le calcul de score

Éditer `src/lib/utils.ts` :

```typescript
export function calculateScore(client: Client): number {
  let score = 0;
  // Personnaliser les critères ici
  if (client.training_adherence >= 0.8) score += 2;
  if (client.protein_adherence >= 0.8) score += 2;
  if (client.current_weight > client.start_weight) score += 1;
  return score;
}
```

### Modifier les seuils de statut

```typescript
export function getStatus(score: number): ClientStatus {
  if (score >= 4) return 'green';   // Excellent
  if (score >= 2) return 'yellow';  // À surveiller
  return 'red';                      // À risque
}
```

---

## 📈 Évolutions futures (semaines 6+)

- [ ] Graphiques de progression (Chart.js)
- [ ] Système de notifications automatiques
- [ ] Détection prédictive du décrochage
- [ ] Export des données (PDF/Excel)
- [ ] Mode multi-coach (SaaS)
- [ ] Application mobile (capacitor)

---

## 🐛 Troubleshooting

### Erreur "Could not determine executable to run"
Utiliser `npm` au lieu de `npx` pour les commandes.

### Erreur de connexion Supabase
- Vérifier que les variables d'environnement sont correctes dans `.env`
- Vérifier que les tables sont créées dans Supabase
- Vérifier que les politiques RLS sont configurées

### Erreur de build Vercel
- S'assurer que `@sveltejs/adapter-vercel` est installé
- Vérifier que `svelte.config.js` utilise l'adapter Vercel

---

## 📝 Licence

MIT - Libre d'utilisation et de modification

---

## 👤 Auteur

**CjayFit** - Coach sportif

---

## ⭐ Support

Si ce projet t'aide, n'hésite pas à mettre une étoile ⭐ !
