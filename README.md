# ⚾ MLB Fantasy

Aplicación de Fantasy MLB donde puedes predecir partidos de béisbol, competir con otros usuarios y gestionar tu propio equipo.

![MLB Fantasy](https://img.shields.io/badge/MLB-Fantasy-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

## 🌟 Características

- **Partidos MLB** - Ve y predice los resultados de los partidos de béisbol
- **Rankings** - Compite con otros usuarios por el primer lugar
- **30 Equipos MLB** - Todos los equipos de las ligas mayores con estadísticas
- **Chat Público** - Chatea en tiempo real con todos los usuarios
- **Chat Privado** - Mensajes privados entre usuarios
- **Panel de Administración** - Gestiona usuarios, partidos y supervisa la actividad
- **Detección de Trampas** - Sistema automático de detección de actividad sospechosa
- **Reportes** - Sistema de reportes de usuarios
- **Notificaciones Push** - Alertas en tiempo real
- **Sistema de Fichajes** - Cada usuario empieza con 100 millones de pesos para fichar jugadores

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

3. **Configurar base de datos**
```bash
npx prisma generate
npx prisma db push
```

4. **Iniciar servidor de chat** (en una terminal separada)
```bash
cd mini-services/chat-service
npm install
npx prisma generate
npm start
```

5. **Iniciar la aplicación** (en otra terminal)
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 📋 Uso

### Primer Usuario
- El primer usuario que se registre será automáticamente el **ADMINISTRADOR**
- El administrador puede gestionar usuarios, partidos y ver alertas de trampas

### Usuarios Normales
- Cada usuario nuevo recibe **100,000,000 de pesos** virtuales
- Pueden hacer predicciones en partidos
- Pueden chatear con otros usuarios
- Pueden reportar comportamientos sospechosos

## 🛠️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| Next.js 16 | Framework frontend/backend |
| TypeScript | Lenguaje de programación |
| Tailwind CSS | Estilos |
| shadcn/ui | Componentes UI |
| Prisma ORM | Base de datos |
| SQLite | Base de datos |
| Socket.io | Chat en tiempo real |

## 📁 Estructura del Proyecto

```
mlb-fantasy/
├── prisma/
│   └── schema.prisma      # Esquema de la base de datos
├── src/
│   ├── app/
│   │   ├── api/           # APIs del backend
│   │   ├── page.tsx       # Página principal
│   │   └── layout.tsx     # Layout de la aplicación
│   ├── components/ui/     # Componentes de interfaz
│   └── lib/               # Utilidades y configuración
├── mini-services/
│   └── chat-service/      # Servidor de chat (Socket.io)
└── package.json           # Dependencias
```

## 🔌 Puertos

- **3000**: Aplicación principal (Next.js)
- **3003**: Servidor de chat (Socket.io)

## 📝 Licencia

Este proyecto es de código abierto.

---

⭐ Si te gusta este proyecto, ¡dale una estrella!
