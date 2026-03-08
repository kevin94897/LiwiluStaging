// Ejemplo de uso del sistema de validación de tokens

## 1. Proteger una página completa

```tsx
// pages/mi-cuenta/index.tsx
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

export default function MiCuenta() {
  return (
    <ProtectedRoute>
      <Layout>
        <h1>Mi Cuenta</h1>
        {/* Contenido protegido */}
      </Layout>
    </ProtectedRoute>
  );
}
```

## 2. Usar el API Client en lugar de fetch directo

### Antes (sin validación automática):
```tsx
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

### Después (con validación automática):
```tsx
import { apiGet } from '@/lib/auth/apiClient';

const response = await apiGet('/users/profile');
// Si el token expiró, se renueva automáticamente y reintenta
```

## 3. Ejemplos de uso del API Client

### GET Request:
```tsx
import { apiGet } from '@/lib/auth/apiClient';

const fetchUserData = async () => {
  try {
    const response = await apiGet('/users/profile');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### POST Request:
```tsx
import { apiPost } from '@/lib/auth/apiClient';

const createAddress = async (addressData) => {
  try {
    const response = await apiPost('/users/addresses', addressData);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### PUT Request:
```tsx
import { apiPut } from '@/lib/auth/apiClient';

const updateAddress = async (id, addressData) => {
  try {
    const response = await apiPut(`/users/addresses/${id}`, addressData);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### DELETE Request:
```tsx
import { apiDelete } from '@/lib/auth/apiClient';

const deleteAddress = async (id) => {
  try {
    const response = await apiDelete(`/users/addresses/${id}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 4. Validar token manualmente

```tsx
import { validateToken } from '@/lib/auth/apiClient';

const checkAuth = async () => {
  const isValid = await validateToken();
  
  if (isValid) {
    console.log('Usuario autenticado');
  } else {
    console.log('Token inválido o expirado');
  }
};
```

## 5. Usar en useEffect para proteger componentes

```tsx
import { useEffect, useState } from 'react';
import { validateToken } from '@/lib/auth/apiClient';

export default function MyComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      setIsAuthenticated(isValid);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <div>No autorizado</div>;
  }

  return <div>Contenido protegido</div>;
}
```

## 6. Flujo completo de validación

```
Usuario hace una petición
    ↓
apiGet/apiPost/apiPut/apiDelete
    ↓
Agrega Authorization header
    ↓
Hace fetch al endpoint
    ↓
¿Respuesta 401?
    ↓ Sí
refreshAccessToken()
    ↓
POST /auth/refresh
    ↓
Actualiza tokens
    ↓
Reintenta petición original
    ↓
Retorna respuesta
```

## 7. Endpoints que usan validación automática

- ✅ `/users/profile` - Validador principal
- ✅ `/users/addresses` - GET, POST, PUT, DELETE
- ✅ Cualquier endpoint que use `apiGet`, `apiPost`, `apiPut`, `apiDelete`

## 8. Ventajas del sistema

1. **Automático**: No necesitas manejar renovación de tokens manualmente
2. **Transparente**: El usuario no nota cuando se renueva el token
3. **Resiliente**: Reintenta automáticamente después de renovar
4. **Seguro**: Cierra sesión si el refresh token también expiró
5. **Simple**: Un solo import y listo

## 9. Migración de código existente

### Buscar y reemplazar:

```tsx
// Buscar:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

// Reemplazar con:
import { apiGet } from '@/lib/auth/apiClient';
const response = await apiGet('/endpoint');
```

## 10. Configuración de endpoints públicos

Si necesitas hacer una petición sin autenticación:

```tsx
import { authenticatedFetch } from '@/lib/auth/apiClient';

const response = await authenticatedFetch(url, {
  skipAuth: true, // No agrega Authorization header
});
```
