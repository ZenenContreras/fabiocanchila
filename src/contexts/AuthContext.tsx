import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  created_at: string;
  last_sign_in_at?: string;
  is_active: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AdminConfig {
  admin_email: string;
  is_active: boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showNotification } = useNotification();
  
  // Usar refs para controlar el estado de verificación y evitar bucles
  const adminCheckRef = useRef<{[email: string]: boolean}>({});
  const previousUserRef = useRef<User | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error al obtener perfil de usuario:', error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      return null;
    }
  }, []);

  const checkAdminStatus = useCallback(async (email: string) => {
    // Si ya verificamos este email, no volver a verificar
    if (adminCheckRef.current[email] !== undefined) {
      return;
    }
    
    // Marcar como verificado para evitar múltiples llamadas
    adminCheckRef.current[email] = false;
    setIsAdmin(false);
    
    if (!email) return;
    
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('admin_email, is_active')
        .eq('admin_email', email)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error al verificar estado de admin:', error);
        return;
      }

      // Solo establecer como admin si hay datos y el email coincide exactamente
      const isUserAdmin = !!data && data.admin_email.toLowerCase() === email.toLowerCase();
      setIsAdmin(isUserAdmin);
      adminCheckRef.current[email] = isUserAdmin;
    } catch (error) {
      console.error('Error verificando estado de admin:', error);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Mostrar notificación si el usuario acaba de iniciar sesión
      if (!previousUserRef.current && currentUser) {
        showNotification('success', 'Ha iniciado sesión correctamente');
      }
      
      previousUserRef.current = currentUser;
      
      if (session?.user) {
        // Obtener perfil de usuario
        fetchUserProfile(session.user.id).then(profile => {
          setUserProfile(profile);
        });
        
        // Verificar si es admin
        checkAdminStatus(session.user.email);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Mostrar notificación según el evento
        if (event === 'SIGNED_IN' && !previousUserRef.current) {
          showNotification('success', 'Ha iniciado sesión correctamente');
        } else if (event === 'SIGNED_OUT') {
          showNotification('info', 'Ha cerrado sesión correctamente');
          setUserProfile(null);
        }

        previousUserRef.current = currentUser;

        if (session?.user) {
          // Obtener perfil de usuario
          fetchUserProfile(session.user.id).then(profile => {
            setUserProfile(profile);
          });
          
          // Verificar si es admin
          checkAdminStatus(session.user.email);
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAdminStatus, fetchUserProfile, showNotification]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // La notificación se maneja en el onAuthStateChange
  };

  return (
    <AuthContext.Provider value={{ session, user, userProfile, isAdmin, signOut }}>
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