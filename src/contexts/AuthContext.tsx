import { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type UserRole = 'admin' | 'user';

type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting to sign in with:', { username });
      // Utiliser une requête SQL directe via RPC
      const { data, error } = await supabase
        .rpc('get_user', {
          p_username: username,
          p_password: password
        });

      console.log('RPC response:', { data, error });

      if (error) {
        console.error('RPC Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error('Identifiants incorrects');
      }

      if (!data) {
        console.error('No data returned from RPC call');
        throw new Error('Identifiants incorrects');
      }

      const userData = {
        id: data.id,
        username: data.username,
        role: data.role as UserRole
      };

      console.log('Authentication successful:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
