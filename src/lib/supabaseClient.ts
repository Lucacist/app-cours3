import { createClient } from '@supabase/supabase-js'

// Valeurs par défaut pour le développement local
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://votre-projet.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'clé-publique-par-défaut'

// Vérification que l'URL est valide avant de créer le client
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error('URL Supabase invalide:', url);
    return false;
  }
};

// Création du client seulement si l'URL est valide
export const supabase = isValidUrl(supabaseUrl) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://votre-projet.supabase.co', 'clé-publique-par-défaut')
