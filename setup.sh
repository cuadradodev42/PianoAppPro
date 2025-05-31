#!/bin/bash

echo "🚀 Configurando Piano Party - Aplicación Multijugador"
echo ""

# Limpiar archivos anteriores
echo "🧹 Limpiando archivos temporales..."
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
npm install

# Configurar backend
echo "🔧 Configurando backend..."
cd backend
rm -rf node_modules
rm -rf package-lock.json
npm install
cd ..

# Verificar instalación
echo "✅ Verificando instalación..."
npm list --depth=0

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "Para iniciar el proyecto:"
echo "  npm run full-dev    # Inicia frontend y backend"
echo "  npm run dev         # Solo frontend"
echo "  cd backend && npm run dev  # Solo backend"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
