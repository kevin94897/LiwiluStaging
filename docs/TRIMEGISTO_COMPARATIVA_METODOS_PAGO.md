# Comparativa de Métodos de Pago - Trimegisto vs Otros

## 🎯 Visión General

Comparativa de los diferentes métodos de pago disponibles en Liwilu y cómo Trimegisto se diferencia.

---

## 📊 Tabla Comparativa

| Aspecto | Tarjeta (Card) | Pago Async (QR) | **Trimegisto** |
|---------|---|---|---|
| **Método** | Tarjeta de crédito/débito | QR Yape/Plin | Saldo en cuenta |
| **Requiere Auth** | ❌ No | ❌ No | ✅ Sí |
| **Crear Orden** | Inmediato | Inmediato | Después de email |
| **Pago Inmediato** | ✅ Sí | ❌ No (async) | ❌ No (email) |
| **Email Confirmación** | ❌ No | ❌ No | ✅ Sí |
| **Cuotas** | ❌ No | ❌ No | ✅ 1-3 cuotas |
| **Intereses** | ⚠️ Depende banco | ❌ No | ✅ No |
| **Tiempo Procesamiento** | Inmediato (2-3s) | 10-60 min | Email (24h) |
| **Confirmación Usuario** | Inmediata | Escanea QR | Click en email |
| **Flujo Técnico** | Crear orden → Pagar | Crear orden → Esperar | Pre-orden → Email → Crear orden |
| **Más Seguro** | ❌ Datos tarjeta | ✅ Muy | ✅ Muy |
| **UX** | ⚡️ Rápido | ⚡️ Rápido | 💤 Lento |

---

## 🔄 Flujos Comparados

### TARJETA (Card)
```
┌─────────────────┐
│ 1. CREAR ORDEN  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│ 2. SOLICITAR TOKENIZACIÓN (Culqi)│
└────────┬────────────────────────┘
         │
         ↓
┌──────────────────────┐
│ 3. Usuario ingresa   │
│    datos de tarjeta  │
└────────┬─────────────┘
         │
         ↓
┌────────────────────────────┐
│ 4. Culqi retorna token     │
│ 5. Frontend envía token    │
└────────┬───────────────────┘
         │
         ↓
┌──────────────────────┐
│ 6. PROCESAR PAGO     │
│ 7. COMPLETAR ORDEN   │
│ 8. ÉXITO INMEDIATO   │
└──────────────────────┘

Tiempo Total: 10-30 segundos
Status: ✅ Pago procesado
```

### PAGO ASINCRÓNICO (QR/Yape)
```
┌──────────────────┐
│ 1. CREAR ORDEN   │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│ 2. GENERAR QR (Culqi)    │
│ 3. Mostrar QR al usuario │
└────────┬─────────────────┘
         │
         ↓
┌───────────────────────────┐
│ 4. Usuario escanea QR     │
│ (con Yape/Plin app)       │
└────────┬──────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ 5. Esperar confirmación      │
│ (10-60 minutos)              │
│ Backend polling / webhook    │
└────────┬─────────────────────┘
         │
         ↓
┌────────────────────────────┐
│ 6. PROCESAR PAGO           │
│ 7. ACTUALIZAR ESTADO ORDEN │
│ 8. NOTIFICAR AL USUARIO    │
└────────────────────────────┘

Tiempo Total: 10 min - 1 hora
Status: ⏳ Pendiente → ✅ Confirmado
```

### TRIMEGISTO (Nuevo)
```
┌─────────────────────────────┐
│ 1. CREAR PRE-ORDEN (NO ES   │
│    ORDEN FINAL AÚN)         │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│ 2. Generar token único      │
│ 3. Enviar email con link    │
│    /confirm/{{token}}       │
└────────┬────────────────────┘
         │
         ↓ (Email delivery)
┌─────────────────────────────┐
│ 4. Usuario recibe email     │
│ 5. Hace click en link       │
│    (máx 24 horas)           │
└────────┬────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ 6. Backend valida token      │
│ 7. Descuenta saldo           │
│ 8. CREA ORDEN FINAL          │
└────────┬─────────────────────┘
         │
         ↓
┌────────────────────────────┐
│ 9. PROCESAR PAGO           │
│ 10. REDIRIGIR A ÉXITO      │
│ 11. NOTIFICAR AL USUARIO   │
└────────────────────────────┘

Tiempo Total: 5 min - 24 horas
Status: ⏳ Pendiente email → ✅ Confirmado
Pago: Automático en step 7-9
```

---

## 🎯 Cuando Usar Cada Método

### Usa TARJETA si:
- ✅ Usuario tiene tarjeta
- ✅ Quiere pagar inmediatamente
- ✅ No quiere esperar confirmación
- ✅ Dinero disponible en banco
- ✅ UX rápida es crítica

**Ejemplo**: Tienda online, compra impulsiva

### Usa PAGO ASYNC (QR) si:
- ✅ Usuario tiene app Yape/Plin
- ✅ Quiere pagar desde celular
- ✅ Dinero en billetera digital
- ✅ Puede esperar 10-60 min
- ✅ Prefiere apps de pago

**Ejemplo**: Usuario en transporte público pagando por QR

### Usa TRIMEGISTO si:
- ✅ Usuario tiene saldo disponible **← DIFERENCIAL**
- ✅ Quiere pagar en cuotas
- ✅ No quiere usar tarjeta/billetera
- ✅ Puede esperar confirmación por email
- ✅ Quiere beneficios de crédito

**Ejemplo**: Compra mayor, quiere dividir en cuotas

---

## 💡 El **"Por Qué"** de Trimegisto

### Para Liwilu (Empresa)
```
BENEFICIOS:
✅ Pago garantizado (pre-autorizado)
✅ Una persona usa su saldo = fidelización
✅ Analytics sobre comportamiento
✅ Reduce cart abandonment (cuotas más baratas)
✅ Control de crédito interno

RIESGO:
⚠️ Usuario no confirma email → Expira → Reintentar checkout
⚠️ Saldo insuficiente al confirmar → Validar nuevamente
```

### Para Usuario
```
BENEFICIOS:
✅ No necesita tarjeta
✅ No necesita billetera digital
✅ Cuotas sin intereses
✅ Control total (puede no confirmar)
✅ Seguro (token único, expiración)

FRICCIÓN:
⚠️ Requiere email y uno más step
⚠️ Requiere saldo disponible
⚠️ Si no confirma → debe reintentar
⚠️ Token válido solo 24 horas
```

---

## 📊 Matriz de Estado de Pago

```
TARJETA
├─ PENDIENTE → COMPLETADA (inmediato)
├─ PENDIENTE → CANCELADA (rechaza banco)
└─ PENDIENTE → ERROR (datos inválidos)

ASYNC (QR)
├─ PENDIENTE → EN_TRANSITO (10-60 min)
├─ EN_TRANSITO → COMPLETADA (usuario escanea)
├─ EN_TRANSITO → EXPIRADA (6 horas sin escanear)
└─ EN_TRANSITO → CANCELADA (usuario cancela QR)

TRIMEGISTO
├─ PENDIENTE_CONFIRMACION → CONFIRMADA (click email)
├─ CONFIRMADA → COMPLETADA (pago automático)
├─ PENDIENTE_CONFIRMACION → EXPIRADA (24h sin click)
└─ PENDIENTE_CONFIRMACION → CANCELADA (usuario cancela)
```

---

## ⏱️ Timeline Comparativo

```
TARJETA
T=0s    Usuario en checkout
T=5s    Ingresa datos tarjeta
T=15s   Validando con banco
T=30s   ✅ ORDEN COMPLETADA
────────────────────────────
Total: ~30 segundos

ASYNC (QR)
T=0s    Usuario en checkout
T=5s    Muestra QR
T=20s   Usuario escanea
T=25s   Esperando confirmación Yape
T=1800s Usuario confirma en app
T=1805s ✅ ORDEN COMPLETADA
────────────────────────────
Total: 5 minutos a 1 hora

TRIMEGISTO
T=0s    Usuario en checkout
T=5s    Click: Confirmar Compra
T=10s   Email enviado ← DIFERENCIA
T=600s  Usuario recibe email
T=3600s Usuario hace click
T=3610s Backend procesa pago
T=3615s ✅ ORDEN COMPLETADA
────────────────────────────
Total: 10 minutos a 24 horas
```

---

## 🔐 Seguridad Comparada

| Aspecto | Tarjeta | Async | Trimegisto |
|---------|---------|-------|-----------|
| **Datos sensibles** | Se envían a Culqi | No | No |
| **Token único** | Sí (JWT) | Sí | Sí |
| **Email confirm** | No | No | Sí ← |
| **One-time use** | Depende | Depende | Sí ← |
| **Expiración** | 3DS (15 min) | Custom | 24 horas |
| **Rate limit** | Backend | Backend | Backend |
| **Validación user** | Email + 3DS | QR App | Email click ← |
| **Reversible** | Sí (chargeback) | No | No ← |

---

## 💰 Ejemplo Numérico

### Usuario quiere comprar: S/. 120

#### OPCIÓN 1: TARJETA
```
Subtotal:      S/. 100
Envío:         S/. 20
Interés:       S/. 0 (o variable)
────────────────────────
Total:         S/. 120
Cuotas:        1 sola (sin dividir)
Tiempo:        30 segundos ⚡
Status:        ✅ Pago inmediato
```

#### OPCIÓN 2: ASYNC (QR)
```
Subtotal:      S/. 100
Envío:         S/. 20
Comisión:      S/. 0
────────────────────────
Total:         S/. 120
Cuotas:        1 sola (sin dividir)
Tiempo:        10-60 minutos ⏳
Status:        ✅ Después de escanear QR
```

#### OPCIÓN 3: TRIMEGISTO
```
Subtotal:      S/. 100
Envío:         S/. 20
Cuota 1:       S/. 40 × 3 cuotas
────────────────────────
Total:         S/. 120
Cuotas:        3 de S/. 40 ← DIFERENCIA
Tiempo:        Email + click (5min-24h) 💤
Status:        ✅ Después de confirmar email
```

---

## 🎨 UI/UX Comparada

### Página de Checkout

```
┌──────────────────────────────────────────┐
│ MÉTODOS DE PAGO                          │
├──────────────────────────────────────────┤
│ ○ Tarjeta de Crédito/Débito              │
│   └─ Ingresa datos: #XXXX XXXX XXXX XXXX │
│   └─ 3D Secure si es necesario           │
│   └─ ⚡ Pago inmediato                   │
│                                          │
│ ○ Pago Digital (QR Yape/Plin)            │
│   └─ Muestra QR dinámico                 │
│   └─ Instrucciones de escaneo            │
│   └─ ⏳ Espera escaneo (timeout 6h)      │
│                                          │
│ ◉ Pagar con Saldo Trimegisto             │
│   └─ Saldo disponible: S/. 150           │
│   └─ Monto a usar: S/. 120               │
│   └─ Cuotas: [1] [2] [3]                 │
│   └─ Monto/cuota: S/. 40                 │
│   └─ 📧 Confirmación por email           │
│                                          │
│ [CONFIRMAR COMPRA]                       │
└──────────────────────────────────────────┘
```

---

## ❌ Por Qué NO usar Trimegisto en Ciertos Casos

```
❌ Se rechaza si:
   • Usuario no está autenticado
   • Saldo < total a pagar
   • Email inválido
   • Usuario no confirma en 24h
   • Token expirado

❌ No es apropiado para:
   • Compras urgentes (necesita email)
   • Cliente sin saldo (requiere saldo disponible)
   • Usuario que no revisa email
   • Transacciones grandes sin confirmación
```

---

## 📈 Comparativa de Conversión

```
MÉTODOS (estimado):
├─ Tarjeta:      85% conversión (más popular pero datos sensibles)
├─ Async QR:     60% conversión (requiere escanear)
└─ Trimegisto:   70% conversión (email confirm, saldo controlado)

FRICCIÓN:
├─ Tarjeta:      ⚡ Muy baja
├─ Async QR:     🟡 Media (espera escaneo)
└─ Trimegisto:   🟡 Media (espera email + click)
```

---

## 🎯 Resumen Ejecutivo

### Tarjeta
- **Cuando**: Ahora mismo, tengo tarjeta
- **Velocidad**: ⚡⚡⚡ Inmediato
- **Complejidad**: 🟡 Media (datos sensibles)

### Async QR
- **Cuando**: Tengo app Yape/Plin, puedo esperar
- **Velocidad**: 🟡 10-60 min
- **Complejidad**: 🟢 Baja (solo QR scan)

### Trimegisto
- **Cuando**: Tengo saldo, quiero cuotas, puedo esperar email ← DIFERENCIAL
- **Velocidad**: 💤 5min - 24h
- **Complejidad**: 🟠 Alta (pre-orden → email → confirm)

---

## 🔗 Relación entre Métodos

```
TODAS las compras
    │
    ├─ ¿Usuario autenticado? 
    │  ├─ ✅ Sí
    │  │  ├─ ¿Tiene saldo Trimegisto?
    │  │  │  ├─ ✅ Sí → Opción TRIMEGISTO ← NUEVA
    │  │  │  └─ ❌ No → Sigue a métodos otros
    │  │  │
    │  │  ├─ ¿Tiene tarjeta?
    │  │  │  ├─ ✅ Sí → Opción TARJETA
    │  │  │  └─ ❌ No → Sigue a siguiente
    │  │  │
    │  │  └─ ¿Tiene billetera digital?
    │  │     ├─ ✅ Sí → Opción ASYNC QR
    │  │     └─ ❌ No → Ofrece otros métodos
    │  │
    │  └─ ❌ No (Guest)
    │     └─ Solo: TARJETA, ASYNC QR
    │        (No puede usar TRIMEGISTO)
    │
    └─ Usuario elige y paga ✓
```

---

## 📝 Notas Finales

### Trimegisto es ESPECIAL porque:
1. ✅ Es interno (usa saldo propio)
2. ✅ No requiere terceros (Culqi, Yape, etc)
3. ✅ Dividible en cuotas (1-3)
4. ✅ Sin intereses
5. ✅ Requiere confirmación obligatoria
6. ✅ Pre-orden temporal (24h expiry)

### Vs otros métodos:
- Tarjeta vs Trimegisto: Tarjeta es más rápido, Trimegisto es más barato (en cuotas)
- Async QR vs Trimegisto: QR es más rápido (si tienes app), Trimegisto más flexible
- Todos funcionan independientemente en el checkout

---

**Conclusión**: Trimegisto complementa, no reemplaza otros métodos. Es perfecto para usuarios que:
- tienen saldo pero no quieren pagarlo todo
- buscan cuotas sin intereses
- confían en el método de email para confirmar

