# ⚾ MLB Fantasy - Estilo "Mister"

Aplicación de Fantasy MLB completa inspirada en la app "Mister". Crea tu equipo, ficha jugadores, configura tu lineup semanal y compite por la gloria.

![MLB Fantasy](https://img.shields.io/badge/MLB-Fantasy-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## 🌟 Características

### Sistema de Juego
- **Mercado de Jugadores** - Compra y vende jugadores de los 30 equipos MLB
- **Lineup Semanal** - Configura tu alineación titular (9 jugadores como en MLB real)
- **Sistema de Puntos** - Puntos personalizados por acción (HR, RBI, Wins, Saves, etc.)
- **Clasificación de Liga** - Compite por el primer lugar en la tabla de posiciones
- **100 Millones de Pesos** - Cada usuario empieza con presupuesto para fichar

### Panel de Administración
- **Control del Mercado** - Abre y cierra el mercado de fichajes
- **Configuración de Liga** - Ajusta presupuestos, límites de plantilla y reglas de puntos
- **Verificación de Pagos** - Valida los pagos de Transfermóvil manualmente
- **Expulsión Automática** - Usuarios sin pago son expulsados automáticamente

### Sistema de Pagos
- **Transfermóvil** - Pago mensual de 500 pesos
- **Verificación Manual** - El admin verifica cada pago
- **Control de Acceso** - Solo usuarios pagados pueden jugar

### Autenticación
- **Google OAuth** - Los usuarios entran con su cuenta de Google
- **Admin Único** - Solo un administrador (configurado por email)
- **Modo Desarrollo** - Login con email para pruebas

## 🚀 Instalación

### Requisitos
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
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=tu-clave-secreta-aqui
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
ADMIN_EMAIL=admin@mlbfantasy.com
```

4. **Configurar base de datos**
```bash
npx prisma generate
npx prisma db push
```

5. **Iniciar servidor de chat** (en una terminal separada)
```bash
cd mini-services/chat-service
npm install
npx prisma generate
npm start
```

6. **Iniciar la aplicación**
```bash
npm run dev
```

7. **Abrir en el navegador**
```
http://localhost:3000
```

## 📋 Uso

### Administrador
- El primer usuario con el email configurado en `ADMIN_EMAIL` se convierte en admin
- El admin puede:
  - Abrir/cerrar el mercado de fichajes
  - Configurar reglas de la liga
  - Verificar pagos de usuarios
  - Expulsar usuarios sin pago

### Usuarios
- Se autentican con Google
- Pagan mensualidad via Transfermóvil (500 pesos)
- Fichan jugadores del mercado
- Configuran su lineup semanal
- Compen en la clasificación

## 📊 Sistema de Puntos

| Acción | Puntos |
|--------|--------|
| Hit | 1 |
| Home Run | 4 |
| RBI | 1 |
| Base Robada | 2 |
| Victoria (Pitcher) | 5 |
| Save | 3 |
| Strikeout | 1 |

## 🔧 Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Añade las URLs autorizadas:
   - `http://localhost:3000/api/auth/callback/google`
6. Copia Client ID y Client Secret a tu `.env`

## 📁 Estructura del Proyecto

```
mlb-fantasy/
├── prisma/
│   └── schema.prisma      # Esquema de base de datos
├── src/
│   ├── app/
│   │   ├── api/           # APIs del backend
│   │   │   ├── admin/     # Rutas de administración
│   │   │   ├── auth/      # NextAuth
│   │   │   ├── league/    # Liga y clasificación
│   │   │   ├── lineup/    # Lineup semanal
│   │   │   ├── market/    # Mercado de jugadores
│   │   │   └── payments/  # Sistema de pagos
│   │   ├── page.tsx       # Página principal
│   │   └── layout.tsx     # Layout
│   ├── components/ui/     # Componentes shadcn/ui
│   └── lib/               # Utilidades
├── mini-services/
│   └── chat-service/      # Servidor de chat Socket.io
└── db/                    # Base de datos SQLite
```

## 🔌 Puertos

- **3000**: Aplicación principal
- **3003**: Servidor de chat

## 🛠️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| Next.js 16 | Framework |
| TypeScript | Lenguaje |
| Tailwind CSS | Estilos |
| shadcn/ui | Componentes |
| Prisma | ORM |
| SQLite | Base de datos |
| NextAuth.js | Autenticación |
| Socket.io | Chat en tiempo real |

## 💳 Sistema de Pagos Transfermóvil

1. El usuario realiza la transferencia de 500 pesos
2. En la app, registra el pago con:
   - Número de referencia
   - Número de teléfono
3. El administrador verifica el pago
4. El usuario puede seguir jugando

Los usuarios que no paguen son **expulsados automáticamente** y pierden su equipo y dinero.

---

⭐ Si te gusta este proyecto, ¡dale una estrella!
