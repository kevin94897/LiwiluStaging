// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, getCurrentUser, isAuthenticated as checkAuth } from '@/lib/auth/authUtils';
import { logoutUser } from '@/pages/api/auth/login';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Cargar usuario desde localStorage al montar el componente
  useEffect(() => {
    const loadUser = () => {
      try {
        const authenticated = checkAuth();
        const currentUser = getCurrentUser();

        setIsAuthenticated(authenticated);
        setUser(currentUser);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }

      // Rehidratar desde API si:
      // 1. Tenemos token pero no hay usuario en localStorage
      // 2. El usuario existe pero faltan campos críticos (documentNumber, phone)
      const token = localStorage.getItem('accessToken');
      const localUser = localStorage.getItem('user');
      const currentUser = getCurrentUser();

      if (token) {
        const isIncomplete = !localUser || localUser === 'undefined' || (
          currentUser && (!currentUser.documentNumber || !currentUser.phone)
        );

        if (isIncomplete) {

          import('@/lib/auth/apiClient').then(({ fetchUserProfile }) => {
            fetchUserProfile().then((apiUser) => {
              if (apiUser) {
                // saveSession ya normaliza el usuario, así que lo leemos de nuevo
                const { getCurrentUser } = require('@/lib/auth/authUtils');
                setUser(getCurrentUser());
              }
            });
          });
        }
      }
    };

    loadUser();

    // ✅ Escuchar cambios en el localStorage (útil para tabs múltiples)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout
  };
}