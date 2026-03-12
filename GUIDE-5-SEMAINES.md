# 📅 Guide de développement - 5 semaines

Ce guide suit le plan de développement original sur 5 semaines (3h/semaine).

---

## ✅ SEMAINE 1 — Configuration & Supabase (3h) - COMPLÉTÉ

### Ce qui a été fait :

- [x] Installation du client Supabase (`@supabase/supabase-js`)
- [x] Création du fichier `src/lib/supabase.ts` pour la connexion
- [x] Définition des types TypeScript dans `src/lib/types.ts`
- [x] Script SQL `supabase-setup.sql` pour créer les tables :
  - Table `clients` avec toutes les colonnes requises
  - Table `weekly_logs` pour évolution future
  - Index et politiques RLS
  - Trigger automatique pour mise à jour des métriques
- [x] Configuration des variables d'environnement

### 🎯 Prochaine étape pour toi :

1. Créer un compte Supabase sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans SQL Editor et exécuter `supabase-setup.sql`
4. Copier ton URL et ANON_KEY dans `.env`

---

## ✅ SEMAINE 2 — CRUD Clients (3h) - COMPLÉTÉ

### Ce qui a été fait :

- [x] Route `/clients` créée
- [x] Affichage liste clients avec cards stylées
- [x] Formulaire ajout client (modal)
- [x] Bouton modifier avec pré-remplissage du formulaire
- [x] Bouton supprimer avec confirmation
- [x] Fonction `calculateScore()` dans `src/lib/utils.ts`
- [x] Badges statut basés sur le score :
  - 🟢 Score ≥ 4 : Excellent
  - 🟡 Score ≥ 2 : À surveiller
  - 🔴 Score < 2 : À risque

### 💡 Logique du score :
```typescript
- Training adherence ≥ 80% → +2 points
- Protein adherence ≥ 80% → +2 points
- Prise de poids (current > start) → +1 point
Maximum = 5 points
```

---

## ✅ SEMAINE 3 — Dashboard stratégique (3h) - COMPLÉTÉ

### Ce qui a été fait :

- [x] Route `/dashboard` créée
- [x] Affichage des KPIs :
  - Nombre total de clients
  - Nombre de clients 🟢 (excellents)
  - Nombre de clients 🟡 (à surveiller)
  - Nombre de clients 🔴 (à risque)
  - Moyenne prise de poids
  - Moyenne discipline score
- [x] Filtre "Afficher uniquement 🔴" pour isoler les clients à risque
- [x] Tableau récapitulatif avec toutes les métriques
- [x] Navigation entre Dashboard et Clients

---

## ✅ SEMAINE 4 — Weekly Logs (3h) - STRUCTURE PRÊTE

### Ce qui est prêt :

- [x] Table `weekly_logs` créée dans le script SQL
- [x] Types TypeScript définis
- [x] Fonction trigger automatique pour mise à jour :
  - `current_weight` mis à jour depuis le dernier log
  - `training_adherence` calculé automatiquement (moyenne des semaines)
  - `protein_adherence` calculé automatiquement (moyenne des semaines)
  - `last_checkin` mis à jour

### 🚀 Pour implémenter (quand tu es prêt) :

1. **Créer route `/clients/[id]/logs`**
   - Afficher l'historique des weekly logs d'un client
   - Graphique de progression du poids

2. **Ajouter bouton "Logs" sur chaque carte client**
   - Lien vers la page des logs

3. **Formulaire ajout weekly log**
   ```typescript
   - Numéro de semaine
   - Sessions complétées / planifiées
   - Protéines respectées (oui/non)
   - Poids de la semaine
   - Notes (optionnel)
   ```

4. **Le trigger SQL fera le reste automatiquement !**

---

## ✅ SEMAINE 5 — Production Ready (3h) - COMPLÉTÉ

### Ce qui a été fait :

- [x] Route `/login` avec authentification Supabase
- [x] UI professionnelle avec Tailwind CSS :
  - Cards élégantes
  - Couleurs de statut
  - Responsive design
  - Animations et transitions
- [x] Configuration Vercel adapter
- [x] Documentation complète (README.md)
- [x] Script SQL avec données de test
- [x] Variables d'environnement (.env.example)

### 🌐 Pour déployer :

1. **Setup GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Coach Dashboard"
   git branch -M main
   git remote add origin <ton-repo-github>
   git push -u origin main
   ```

2. **Déployer sur Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - "Import Project" → choisir ton repo GitHub
   - Ajouter les variables d'environnement :
     - `PUBLIC_SUPABASE_URL`
     - `PUBLIC_SUPABASE_ANON_KEY`
   - Deploy !

3. **Configurer l'authentification**
   - Supabase Dashboard → Authentication → Providers
   - Activer "Email"
   - Créer un utilisateur admin
   - Se connecter via `/login`

---

## 🎉 Félicitations !

Tu as maintenant un **Coach Dashboard complet et fonctionnel** :

✅ Simple
✅ Stable
✅ Stratégiquement utile
✅ Déployable en production
✅ Évolutif vers SaaS

---

## 📈 Évolutions suggérées (après les 5 semaines)

### Semaine 6 — Weekly Logs Interface
- Page détaillée par client
- Formulaire ajout logs
- Graphique progression poids

### Semaine 7 — Détection automatique décrochage
- Analyser les tendances
- Alertes automatiques
- Suggestions d'actions

### Semaine 8 — Graphiques avancés
- Chart.js ou Recharts
- Courbes de progression
- Comparaisons entre clients

### Semaine 9 — Notifications
- Email notifications (Supabase Edge Functions)
- Rappels check-in
- Félicitations automatiques

### Semaine 10 — SaaS MVP
- Multi-coach
- Abonnements (Stripe)
- Tableau de bord coach
- Portail client

---

## 💡 Conseils

### ⚠️ NE PAS coder trop

Le piège : vouloir une "app parfaite" dès le départ.

**La règle d'or :**
1. Utilise ce qui existe
2. Valide avec de vrais clients
3. Améliore selon les retours
4. Itère progressivement

### 🎯 Focus stratégique

Concentre-toi sur ce qui apporte de la VALEUR :
- Gain de temps dans ton suivi
- Visibilité sur les clients à risque
- Prise de décision basée sur les données

Le code parfait viendra plus tard. L'important est que ça marche et que ça t'aide.

---

## 📞 Support

Des questions ? Besoin d'aide ?

1. Consulte le [README.md](README.md)
2. Vérifie la section Troubleshooting
3. Teste avec les données de démonstration

**Bon courage pour la suite ! 🚀**
