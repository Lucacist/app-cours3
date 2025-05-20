# Plateforme de Gestion de Cours

Une application web moderne permettant de gérer et d'accéder à des cours en ligne avec un système d'authentification et de gestion des droits d'accès.

## Fonctionnalités

### Pour les utilisateurs
- **Authentification sécurisée** : Connexion avec nom d'utilisateur et mot de passe
- **Accès personnalisé aux cours** : Chaque utilisateur voit uniquement les cours auxquels il a accès
- **Interface intuitive** : Navigation simple entre les différentes catégories de cours

### Pour les administrateurs
- **Gestion complète des cours** : Ajout, modification, suppression et organisation des cours
- **Gestion des utilisateurs** : Création de comptes et attribution des rôles (admin/utilisateur)
- **Gestion des droits d'accès** : Attribution des accès aux cours pour chaque utilisateur
- **Organisation par catégories** : Regroupement des cours dans des conteneurs thématiques

## Architecture technique

### Frontend
- **React 18** avec TypeScript pour une application robuste et typée
- **React Router 6** pour la navigation et les routes protégées
- **CSS personnalisé** pour une interface moderne et responsive

### Backend
- **Supabase** comme Backend-as-a-Service (BaaS)
- **PostgreSQL** pour le stockage des données
- **RPC (Remote Procedure Call)** pour les opérations d'authentification sécurisées

### Structure de la base de données
- Tables `users`, `containers`, `courses`, `user_courses` pour gérer les relations entre utilisateurs et cours

## Configuration du projet

### Prérequis
- Node.js (version 16 ou supérieure)
- Compte Supabase

### Installation

1. Clonez le dépôt
   ```bash
   git clone [URL_DU_DEPOT]
   cd app-cours3
   ```

2. Installez les dépendances
   ```bash
   npm install
   ```

3. Créez un fichier `.env` à la racine du projet avec les informations de connexion Supabase
   ```
   REACT_APP_SUPABASE_URL=votre_url_supabase
   REACT_APP_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
   ```

4. Lancez l'application en mode développement
   ```bash
   npm start
   ```

### Configuration de Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Configurez les tables suivantes :
   - `users` : pour stocker les informations des utilisateurs
   - `containers` : pour organiser les cours par catégories
   - `courses` : pour stocker les informations des cours
   - `user_courses` : pour gérer les droits d'accès aux cours
4. Créez les fonctions RPC nécessaires pour l'authentification et la gestion des utilisateurs

## Déploiement

### Déploiement sur Netlify

1. Créez un compte sur [Netlify](https://netlify.com)
2. Connectez votre dépôt GitHub
3. Configurez les variables d'environnement dans Netlify :
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
4. Configurez les redirections pour le routage côté client (fichier `_redirects` ou `netlify.toml`)
5. Déployez l'application

## Utilisation

### Connexion
- Accédez à la page de connexion `/login`
- Entrez vos identifiants (nom d'utilisateur et mot de passe)

### Navigation
- **Page d'accueil** : Affiche les cours disponibles organisés par catégories
- **Page de configuration** (admin uniquement) : Permet de gérer les cours, les utilisateurs et les droits d'accès

## Développement

### Structure du projet
```
/src
  /components     # Composants réutilisables
  /contexts       # Contextes React (AuthContext, etc.)
  /lib            # Bibliothèques et configuration (Supabase)
  /pages          # Pages principales de l'application
  /styles         # Fichiers CSS
  /types          # Types TypeScript
```

### Contribuer au projet
1. Créez une branche pour votre fonctionnalité
2. Effectuez vos modifications
3. Soumettez une pull request

## Licence

Ce projet est sous licence [MIT](LICENSE).

