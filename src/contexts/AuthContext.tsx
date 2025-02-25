import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, withRetry } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AdminConfig {
  admin_email: string;
  is_active: boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        checkAdminStatus(session.user.email);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        checkAdminStatus(session.user.email);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (email: string) => {
    setIsAdmin(false); // Establecer como false por defecto
    
    if (!email) return;

    try {
      const { data, error } = await withRetry<{
        data: AdminConfig | null;
        error: any;
      }>(() =>
        supabase
          .from('admin_config')
          .select('admin_email, is_active')
          .eq('admin_email', email.toLowerCase())
          .eq('is_active', true)
          .single()
      );

      if (error || !data) {
        console.error('Error o no datos al verificar estado de admin:', error);
        setIsAdmin(false);
        return;
      }

      // Solo establecer como admin si el email coincide exactamente
      setIsAdmin(data.admin_email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.error('Error verificando estado de admin:', error);
      setIsAdmin(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}