# Mon Application React avec Supabase

Une application React moderne utilisant Supabase comme backend, styled avec Chakra UI.

## Configuration

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Copiez les informations de connexion (URL et clé anonyme)
4. Créez un fichier `.env` à la racine du projet avec :
   ```
   REACT_APP_SUPABASE_URL=votre_url_supabase
   REACT_APP_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
   ```

## Installation

```bash
npm install
npm start
```

## Déploiement sur Netlify

1. Créez un compte sur [Netlify](https://netlify.com)
2. Connectez votre dépôt GitHub
3. Configurez les variables d'environnement dans Netlify :
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_ANON_KEY
4. Déployez !

## Technologies utilisées

- React avec TypeScript
- Supabase (Backend as a Service)
- Chakra UI (Interface utilisateur)
- React Router (Navigation)
