# Sistema de Gestión de Tokens - Documentación

## 📋 Resumen

Se ha implementado un sistema completo de gestión de tokens JWT que incluye:

1. ✅ **Renovación automática del accessToken cada 120 segundos**
2. ✅ **Gestión del refreshToken con duración de 7 días**
3. ✅ **Generación de nuevos tokens en cada login**
4. ✅ **Deshabilitación del refreshToken en el servidor al cerrar sesión**
5. ✅ **Manejo automático de sesiones expiradas**
6. ✅ **Validación de tokens con `/auth/profile` como endpoint validador** ⭐ NUEVO
7. ✅ **API Client con renovación automática en errores 401** ⭐ NUEVO

---

## 🔧 Componentes Implementados

### 1. **Token Manager** (`lib/auth/tokenManager.ts`)

Servicio principal que maneja toda la lógica de tokens:

#### Funciones Principales:

- **`refreshAccessToken()`**: Renueva el accessToken usando el refreshToken
  - Endpoint: `POST /auth/refresh`
  - Actualiza ambos tokens en localStorage
  - Maneja errores de tokens expirados

- **`scheduleTokenRefresh()`**: Programa la renovación automática
  - Intervalo: 120 segundos (2 minutos)
  - Incluye lógica de reintento en caso de fallo
  - Cierra sesión si falla después del reintento

- **`startTokenRefresh()`**: Inicia el sistema de renovación
  - Se llama automáticamente después del login
  - Programa la primera renovación

- **`stopTokenRefresh()`**: Detiene la renovación automática
  - Se llama al cerrar sesión
  - Limpia los timeouts activos

- **`initializeAuth()`**: Inicializa el sistema al cargar la app
  - Detecta sesiones activas
  - Inicia renovación automática si hay tokens válidos

- **`revokeRefreshToken()`**: Deshabilita el refreshToken en el servidor
  - Endpoint: `POST /auth/logout`
  - Envía el refreshToken para invalidarlo

- **`clearSession()`**: Limpia completamente la sesión
  - Detiene renovación automática
  - Elimina todos los tokens de localStorage

---

### 2. **Login Actualizado** (`pages/api/auth/login.ts`)

#### Cambios Implementados:

**En `loginUser()`:**
```typescript
// Después de guardar tokens en localStorage
startTokenRefresh(); // 🆕 Inicia renovación automática
```

**En `logoutUser()`:**
```typescript
// Envía refreshToken al servidor para deshabilitarlo
body: JSON.stringify({ refreshToken })
```

**En `clearSession()`:**
```typescript
// Detiene la renovación automática antes de limpiar
stopTokenRefresh();
```

---

### 3. **API Client** (`lib/auth/apiClient.ts`) ⭐ NUEVO

Cliente HTTP inteligente que maneja automáticamente la validación y renovación de tokens:

#### Funciones Principales:

- **`authenticatedFetch()`**: Wrapper de fetch con manejo automático de tokens
  - Agrega Authorization header automáticamente
  - Intercepta errores 401 (token expirado)
  - Renueva el token y reintenta la petición
  - Evita loops infinitos con flag `skipRetry`

- **`validateToken()`**: Valida el token actual con `/auth/profile`
  - Endpoint validador: `GET /auth/profile`
  - Si retorna 401, intenta renovar el token
  - Retorna `true` si el token es válido o se renovó exitosamente
  - Retorna `false` si el token es inválido y no se pudo renovar

- **`apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()`**: Helpers para HTTP
  - Wrappers convenientes para métodos HTTP comunes
  - Incluyen manejo automático de renovación de tokens
  - Uso simplificado sin necesidad de configurar headers

#### Flujo de Validación con `/auth/profile`:

```
Petición a endpoint protegido
    ↓
authenticatedFetch()
    ↓
Agrega Authorization header
    ↓
Hace fetch
    ↓
¿Respuesta 401?
    ↓ SÍ
validateToken() con /auth/profile
    ↓
¿Token válido?
    ↓ NO
refreshAccessToken()
    ↓
POST /auth/refresh
    ↓
Actualiza tokens
    ↓
Reintenta petición original
    ↓
Retorna respuesta exitosa
```

---

### 4. **Protected Route Component** (`components/ProtectedRoute.tsx`) ⭐ NUEVO

Componente para proteger páginas completas:

```typescript
<ProtectedRoute>
  <MiCuentaPage />
</ProtectedRoute>
```

- Valida el token antes de renderizar el contenido
- Muestra pantalla de carga durante validación
- Redirige al home si el token es inválido
- Intenta renovar automáticamente si expiró

---

### 5. **App Initialization** (`pages/_app.tsx`)

Se agregó inicialización automática del sistema:

```typescript
useEffect(() => {
  initializeAuth(); // 🆕 Verifica sesión activa al cargar
}, []);
```

---

## 🔄 Flujo de Funcionamiento

### **Flujo de Login:**

1. Usuario ingresa credenciales
2. Se envía `POST /auth/login`
3. Backend devuelve `accessToken` y `refreshToken`
4. Se guardan en localStorage
5. **Se inicia renovación automática** ✨
6. Usuario es redirigido

### **Flujo de Renovación Automática:**

```
Login exitoso
    ↓
startTokenRefresh()
    ↓
scheduleTokenRefresh()
    ↓
[Espera 120 segundos]
    ↓
refreshAccessToken()
    ↓
POST /auth/refresh
    ↓
Actualiza tokens
    ↓
scheduleTokenRefresh() (ciclo continuo)
```

### **Flujo de Logout:**

1. Usuario hace clic en "Cerrar sesión"
2. Se llama `logoutUser()`
3. **Se envía refreshToken al servidor para deshabilitarlo** ✨
4. `POST /auth/logout` con refreshToken en body
5. Se detiene renovación automática
6. Se limpia localStorage
7. Usuario es redirigido al home

### **Flujo de Carga de Aplicación:**

1. App se carga (`_app.tsx`)
2. `useEffect` ejecuta `initializeAuth()`
3. Verifica si hay tokens en localStorage
4. Si existen, **inicia renovación automática** ✨
5. Si no existen, no hace nada

---

## 🕐 Tiempos Configurados

| Token | Duración | Renovación |
|-------|----------|------------|
| **accessToken** | ~2 minutos | Cada 120 segundos |
| **refreshToken** | 7 días | En cada renovación de accessToken |

---

## 🛡️ Manejo de Errores

### **Token Expirado:**
- Si el refreshToken expira (401/403), se cierra sesión automáticamente
- Usuario es redirigido al home

### **Error de Red:**
- Se reintenta una vez después de 5 segundos
- Si falla el reintento, se cierra sesión

### **Sesión Inválida:**
- Si no hay refreshToken, no se intenta renovar
- Si la estructura es inválida, se limpia la sesión

---

## 📡 Endpoints Utilizados

### **1. POST `/auth/refresh`**
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "nuevo_access_token",
    "refreshToken": "nuevo_refresh_token"
  }
}
```

### **2. POST `/auth/logout`**
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

### **3. GET `/auth/profile`** ⭐ ENDPOINT VALIDADOR

Este endpoint se usa como **validador principal** para verificar si el accessToken es válido.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**Uso:**
- Se llama automáticamente en `validateToken()`
- Si retorna 401, se activa `refreshAccessToken()`
- Usado por `ProtectedRoute` para validar acceso a páginas
- Interceptado automáticamente por `authenticatedFetch()`

---

## 🔍 Logs del Sistema

El sistema incluye logs detallados para debugging:

- `🚀 Iniciando sistema de renovación automática de tokens`
- `⏰ Próxima renovación de token programada en 120 segundos`
- `🔄 Renovando accessToken...`
- `✅ AccessToken renovado exitosamente`
- `🔒 Deshabilitando refreshToken en el servidor...`
- `⏹️ Renovación automática de tokens detenida`
- `🧹 Sesión limpiada completamente`
- `🔐 Sesión activa detectada, iniciando renovación automática`

---

## ✅ Validación Completa

### **Requisitos Cumplidos:**

1. ✅ **AccessToken renovado cada 120 segundos**
   - Implementado con `scheduleTokenRefresh()`
   - Intervalo configurable

2. ✅ **RefreshToken válido por 7 días**
   - Manejado por el backend
   - Frontend renueva ambos tokens en cada refresh

3. ✅ **Login genera nuevos tokens**
   - `loginUser()` guarda nuevos tokens
   - Inicia renovación automática

4. ✅ **Logout deshabilita refreshToken**
   - `logoutUser()` envía refreshToken al servidor
   - Backend lo invalida en la base de datos

5. ✅ **Sesión se mantiene activa**
   - Renovación automática continua
   - Manejo de errores con reintento

---

## 🚀 Uso en Otros Componentes

Para hacer peticiones autenticadas, simplemente usa el accessToken:

```typescript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch(`${API_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

El sistema se encarga automáticamente de mantener el token actualizado.

---

## 🔐 Seguridad

- Los tokens se almacenan en localStorage (considera httpOnly cookies para mayor seguridad en producción)
- El refreshToken se envía al servidor para invalidación en logout
- Manejo automático de tokens expirados
- Limpieza completa de sesión en caso de error

---

## 📝 Notas Importantes

1. El sistema se inicializa automáticamente al cargar la aplicación
2. No requiere intervención manual del desarrollador
3. Los logs ayudan a debuggear problemas de autenticación
4. El intervalo de renovación es configurable en `tokenManager.ts`
5. El sistema es resiliente a errores de red con lógica de reintento

---

**Fecha de Implementación:** 2025-12-10
**Versión:** 1.0.0
