// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, getCurrentUser, logoutUser, isAuthenticated as checkAuth } from '../pages/api/auth/logout';

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
      // La función logoutUser ya recarga la página y redirige
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