// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, getCurrentUser, isAuthenticated as checkAuth } from '@/lib/auth/authUtils';
import { logoutUser } from '@/lib/auth/services/authService';
import { fetchUserProfile } from '@/lib/auth/apiClient';

/**
 * Legacy useAuth hook - maintained for backward compatibility
 * Note: Now uses cookies instead of localStorage
 * Consider migrating to the new AuthContext from @/context/AuthContext
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load user from cookies on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const authenticated = checkAuth();
        const currentUser = getCurrentUser();

        setIsAuthenticated(authenticated);
        setUser(currentUser);

        // Rehidrate from API if user data is incomplete
        if (authenticated && currentUser) {
          const isIncomplete = !currentUser.documentNumber || !currentUser.phone;

          if (isIncomplete) {
            console.log('🔄 Rehidratando perfil por datos incompletos...');
            try {
              const apiUser = await fetchUserProfile();
              if (apiUser) {
                // Reload user from cookie after API update
                const updatedUser = getCurrentUser();
                setUser(updatedUser);
              }
            } catch (error) {
              console.error('Error rehidratando perfil:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // ✅ Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        const authenticated = checkAuth();
        const currentUser = getCurrentUser();
        setIsAuthenticated(authenticated);
        setUser(currentUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
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