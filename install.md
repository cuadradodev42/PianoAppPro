# 🚀 Guía de Instalación - Piano Party

## Requisitos Previos

- **Node.js 18+** (Recomendado: 18.17.0 o superior)
- **npm 8+** (Incluido con Node.js)
- **Git** (Para clonar el repositorio)

## Instalación Paso a Paso

### 1. Descargar el Proyecto

\`\`\`bash
# Opción A: Clonar desde Git
git clone <tu-repositorio>
cd piano-multiplayer

# Opción B: Descargar ZIP
# Extrae el archivo ZIP y navega a la carpeta
cd piano-multiplayer
\`\`\`

### 2. Limpiar Instalación Anterior (si existe)

\`\`\`bash
# Limpiar archivos temporales
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock

# Limpiar backend
cd backend
rm -rf node_modules
rm -rf package-lock.json
cd ..
\`\`\`

### 3. Instalar Dependencias

\`\`\`bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
\`\`\`

### 4. Configurar Variables de Entorno

\`\`\`bash
# El archivo .env.local ya está incluido con la configuración básica
# Si necesitas modificarlo:
cp .env.local .env.local.backup
\`\`\`

### 5. Verificar Instalación

\`\`\`bash
# Verificar que las dependencias se instalaron correctamente
npm list --depth=0

# Verificar backend
cd backend
npm list --depth=0
cd ..
\`\`\`

### 6. Ejecutar la Aplicación

\`\`\`bash
# Opción A: Ejecutar todo junto (Recomendado)
npm run full-dev

# Opción B: Ejecutar por separado
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
\`\`\`

### 7. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## Solución de Problemas

### Error: "Cannot find module"
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Error: "Port already in use"
\`\`\`bash
# Cambiar puerto en package.json o matar proceso
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
\`\`\`

### Error de compilación CSS
\`\`\`bash
rm -rf .next
npm run dev
\`\`\`

## Scripts Disponibles

- `npm run dev` - Ejecutar solo frontend
- `npm run build` - Compilar para producción
- `npm run start` - Ejecutar versión de producción
- `npm run backend` - Ejecutar solo backend
- `npm run full-dev` - Ejecutar frontend y backend
- `npm run clean` - Limpiar archivos temporales
- `npm run fresh-install` - Instalación limpia completa

## Estructura de Archivos

\`\`\`
piano-multiplayer/
├── app/                    # Aplicación Next.js
├── components/             # Componentes React
├── hooks/                  # Hooks personalizados
├── lib/                    # Utilidades
├── backend/                # Servidor Node.js
├── package.json            # Dependencias frontend
├── next.config.js          # Configuración Next.js
├── tailwind.config.js      # Configuración Tailwind
└── README.md               # Documentación
\`\`\`

¡Listo! Tu aplicación Piano Party debería estar funcionando correctamente.
