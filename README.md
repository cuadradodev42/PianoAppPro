# 🎹 Piano Party - Aplicación Multijugador

Una aplicación de piano colaborativo en tiempo real donde múltiples usuarios pueden tocar juntos desde diferentes dispositivos.

## ✨ Características

### 🎵 **Funcionalidades Musicales**
- **Piano de 12 teclas** (1 octava completa)
- **Samples reales de piano** con calidad de estudio
- **Control de volumen** y BPM compartido
- **Asignación automática** de teclas por jugador

### 👥 **Multijugador**
- **Hasta 12 jugadores** simultáneos por sala
- **Salas con códigos únicos** de 6 dígitos
- **Sincronización en tiempo real** con Socket.IO
- **Modo espectador** para usuarios que solo quieren escuchar
- **Lista de participantes** actualizada en vivo

### 🎬 **Sistema de Grabación**
- **Grabar sesiones** musicales completas
- **Reproducir grabaciones** con sincronización perfecta
- **Almacenamiento** de múltiples grabaciones por sala
- **Metadatos** de duración, fecha y número de jugadores

### 📱 **Diseño Responsive**
- **Optimizado para móviles** y tablets
- **Touch events** para dispositivos táctiles
- **Interfaz moderna** con Tailwind CSS
- **Componentes accesibles** con shadcn/ui

## 🚀 Instalación y Uso

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn

### **1. Clonar e Instalar**
\`\`\`bash
git clone <tu-repositorio>
cd piano-multiplayer

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
\`\`\`

### **2. Desarrollo Local**

**Opción A: Ejecutar todo con un comando**
\`\`\`bash
npm run full-dev
\`\`\`

**Opción B: Ejecutar por separado**
\`\`\`bash
# Terminal 1 - Backend (puerto 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (puerto 3000)
npm run dev
\`\`\`

### **3. Acceder a la Aplicación**
- Frontend: \`http://localhost:3000\`
- Backend: \`http://localhost:3001\`

### **4. Producción**
\`\`\`bash
# Frontend
npm run build
npm start

# Backend
cd backend
npm start
\`\`\`

## 🎮 Cómo Jugar

### **Crear una Sala**
1. Ingresa tu nombre
2. Haz clic en "Crear Sala"
3. Comparte el código de 6 dígitos con amigos

### **Unirse a una Sala**
1. Ingresa tu nombre
2. Introduce el código de sala
3. Elige si quieres ser jugador o espectador
4. ¡Comienza a tocar!

### **Controles**
- **Jugadores**: Pueden tocar su tecla asignada y controlar BPM/volumen
- **Espectadores**: Solo pueden escuchar, no tocar ni cambiar configuraciones
- **Grabación**: Cualquier jugador puede iniciar/detener grabaciones

## 🏗️ Arquitectura Técnica

### **Frontend (Puerto 3000)**
- **Next.js 13.4.19** con App Router
- **React 18** con hooks personalizados
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Componentes personalizados** para UI

### **Backend (Puerto 3001)**
- **Node.js** con servidor HTTP
- **Socket.IO** para comunicación en tiempo real
- **Gestión de salas** en memoria
- **Sistema de eventos** para sincronización

### **Audio**
- **Samples reales de piano** de alta calidad
- **Web Audio API** para reproducción
- **Fallback a síntesis** si los samples fallan
- **Control de volumen** dinámico

## 📁 Estructura del Proyecto

\`\`\`
piano-multiplayer/
├── app/                         # Frontend Next.js
│   ├── page.tsx                 # Página principal
│   └── room/[id]/page.tsx       # Página de sala
├── components/                  # Componentes React
│   ├── piano.tsx                # Componente del piano
│   ├── player-list.tsx          # Lista de jugadores
│   └── ui/                      # Componentes base
├── hooks/                       # Hooks personalizados
│   ├── use-websocket.ts         # Hook de WebSocket
│   └── use-piano-sound.ts       # Hook de audio con samples
├── backend/                     # Servidor backend
│   ├── server.js                # Servidor Socket.IO
│   ├── constants.js             # Constantes compartidas
│   └── package.json             # Dependencias del backend
└── package.json                 # Dependencias del frontend
\`\`\`

## 🔧 Configuración

### **Variables de Entorno**

**Frontend (.env.local)**
\`\`\`bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001  # URL del backend en desarrollo
\`\`\`

**Backend (.env)**
\`\`\`bash
PORT=3001                        # Puerto del servidor backend
NODE_ENV=development             # Entorno de desarrollo
\`\`\`

### **Configuración de Socket.IO**
- **Frontend**: Se conecta al backend en puerto 3001
- **Backend**: Acepta conexiones desde localhost:3000
- **CORS**: Configurado para desarrollo y producción
- **Transports**: WebSocket y polling

## 🚀 Despliegue

### **Vercel (Recomendado)**

**Frontend:**
1. Conecta tu repositorio a Vercel
2. Configura la variable \`NEXT_PUBLIC_BACKEND_URL\`
3. Despliega automáticamente

**Backend:**
1. Crea un proyecto separado en Vercel para el backend
2. Configura el directorio raíz como \`backend/\`
3. Configura las variables de entorno necesarias

### **Otros Proveedores**
- **Railway**: Soporte nativo para Socket.IO
- **Render**: Configuración simple para ambos servicios
- **Heroku**: Con buildpack de Node.js

## 🐛 Solución de Problemas

### **Audio no funciona**
- Verifica que los samples se estén cargando (revisa la consola)
- Interactúa con la página antes de tocar
- Revisa el volumen del sistema y del navegador

### **Conexión perdida**
- Verifica que el backend esté ejecutándose en puerto 3001
- Revisa la configuración de CORS
- La aplicación se reconecta automáticamente

### **Samples no cargan**
- Verifica la conexión a internet
- El sistema usa fallback a síntesis automáticamente
- Revisa la consola para errores específicos

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles

## 🎵 ¡Disfruta tocando música con tus amigos!

--

**Desarrollado con ❤️ para la comunidad musical**
\`\`\`

Ahora vamos a crear un script de verificación para asegurar que todos los archivos están sincronizados:
