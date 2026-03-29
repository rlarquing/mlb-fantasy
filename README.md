# ⚾ MLB Fantasy Cuba - Estilo "Mister"

Aplicación completa de Fantasy Baseball estilo "Mister" con todas las funcionalidades para gestionar tu propia liga de béisbol MLB.

![MLB Fantasy](https://img.shields.io/badge/MLB-Fantasy_Cuba-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

## 🌟 Características Principales

### Sistema de Autenticación
- **Solo el administrador** puede entrar con email/password (`admin@mlbfantasy.com`)
- **Todos los demás usuarios** DEBEN autenticarse con Google OAuth
- Primer usuario que se registra NO es admin (solo el email específico)

### Sistema de Pagos con Transfermóvil
- **500 pesos mensuales** por usuario
- El usuario ingresa el número de referencia de Transfermóvil
- El admin verifica/rechaza pagos manualmente
- **Expulsión automática** a los 30 días sin pago

### Mercado de Jugadores
- Compra jugadores con tu presupuesto inicial (100 millones)
- Vende jugadores al mercado
- Precios basados en rendimiento real
- Admin puede abrir/cerrar el mercado

### Sistema de Lineup (Once Ideal)
- Forma tu lineup semanal: **1 P, 1 C, 1B, 2B, 3B, SS, 3 OF, DH**
- Designa un **capitán** que duplica puntos
- Cambia tu lineup cada semana

### Sistema de Puntos

**Bateadores:**
| Acción | Puntos |
|--------|--------|
| Hit (sencillo) | +1 |
| Doble | +2 |
| Triple | +3 |
| Home Run | +4 |
| RBI | +1 |
| Run | +1 |
| Base robada | +2 |
| Base por bolas | +1 |
| Ponche | -1 |

**Pitchers:**
| Acción | Puntos |
|--------|--------|
| Victoria | +5 |
| Salvamento | +5 |
| Entrada lanzada | +1 |
| Ponche | +1 |
| Carrera limpia | -2 |
| Derrota | -3 |

### Panel de Administración
- Configurar reglas de la liga
- Abrir/cerrar mercado
- Verificar pagos pendientes
- Expulsar usuarios sin pago
- Ver clasificación y estadísticas

## 📊 Datos Incluidos

- **30 equipos MLB** completos
- **63+ jugadores reales** con estadísticas
- Precios basados en rendimiento real ($500K - $30M)
- Estadísticas: HR, RBI, AVG, ERA, W, SV, etc.

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+
- npm o bun

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/rlarquing/mlb-fantasy.git
cd mlb-fantasy
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crea un archivo `.env` con:
```
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="tu-clave-secreta"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@mlbfantasy.com"
GOOGLE_CLIENT_ID="tu-client-id-de-google"
GOOGLE_CLIENT_SECRET="tu-client-secret-de-google"
```

4. **Configurar base de datos**
```bash
npx prisma generate
npx prisma db push
```

5. **Cargar datos iniciales**
```bash
node scripts/seed.js
```

6. **Iniciar la aplicación**
```bash
npm run dev
```

7. **Abrir en el navegador**
```
http://localhost:3000
```

## 👤 Credenciales

### Administrador
- **Email:** admin@mlbfantasy.com
- **Acceso:** Directo (sin Google)

### Usuarios Normales
- **Acceso:** Solo con Google OAuth
- **Presupuesto inicial:** 100,000,000 pesos
- **Mensualidad:** 500 pesos

## 🔧 Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Ve a "APIs & Services" > "Credentials"
4. Crea "OAuth 2.0 Client IDs"
5. Añade `http://localhost:3000` como origen autorizado
6. Añade `http://localhost:3000/api/auth/callback/google` como URI de redirección
7. Copia el Client ID y Client Secret a tu `.env`

## 📁 Estructura del Proyecto

```
mlb-fantasy/
├── prisma/
│   └── schema.prisma      # Esquema de la base de datos
├── scripts/
│   └── seed.js            # Script de datos iniciales
├── src/
│   ├── app/
│   │   ├── api/           # APIs del backend
│   │   │   ├── admin/     # Rutas de administración
│   │   │   ├── auth/      # Autenticación
│   │   │   ├── market/    # Mercado de jugadores
│   │   │   ├── lineup/    # Gestión de lineup
│   │   │   ├── payments/  # Sistema de pagos
│   │   │   └── league/    # Clasificación
│   │   ├── page.tsx       # Página principal
│   │   └── layout.tsx     # Layout de la aplicación
│   ├── components/ui/     # Componentes de interfaz
│   └── lib/               # Utilidades y configuración
├── db/
│   └── custom.db          # Base de datos SQLite
└── package.json
```

## 🔌 Puertos

- **3000**: Aplicación principal (Next.js)

## 📱 Funcionalidades por Rol

### Administrador
- ✅ Entrar con email/password
- ✅ Configurar reglas de la liga
- ✅ Abrir/cerrar mercado
- ✅ Verificar pagos
- ✅ Expulsar usuarios morosos
- ✅ Ver estadísticas globales

### Usuario Normal
- ✅ Entrar con Google
- ✅ Comprar/vender jugadores
- ✅ Configurar lineup semanal
- ✅ Ver clasificación
- ✅ Pagar mensualidad
- ✅ Recibir notificaciones

## 💳 Sistema de Pagos

1. El usuario va a la pestaña "Pagos"
2. Ingresa:
   - Número de teléfono
   - Número de referencia de Transfermóvil
3. El admin verifica el pago
4. Si no paga en 30 días → expulsado automáticamente

## ⚠️ Importante

- El primer usuario NO es admin automáticamente
- Solo el email `admin@mlbfantasy.com` tiene acceso de administrador
- Los usuarios expulsados pierden todo su equipo y dinero
- Los pagos deben ser verificados manualmente por el admin

## 📝 Licencia

Este proyecto es privado para uso del propietario.

---

⭐ ¡Disfruta tu liga de Fantasy MLB Cuba! ⚾
