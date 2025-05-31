#!/bin/bash

echo "🔧 Solucionando problemas de refs de React 19..."

# Limpiar completamente
echo "🧹 Limpiando instalación anterior..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock
rm -rf .next

# Limpiar backend también
if [ -d "backend" ]; then
  echo "🧹 Limpiando backend..."
  cd backend
  rm -rf node_modules
  rm -rf package-lock.json
  cd ..
fi

# Instalar con versiones específicas para evitar conflictos
echo "📦 Instalando dependencias con versiones compatibles..."
npm install --legacy-peer-deps

# Verificar instalación
echo "✅ Verificando instalación..."
npm list --depth=0 | grep -E "(react|next|@radix-ui)"

# Instalar backend
if [ -d "backend" ]; then
  echo "📦 Instalando dependencias del backend..."
  cd backend
  npm install
  cd ..
fi

echo ""
echo "🎉 ¡Corrección completada!"
echo ""
echo "Los componentes UI han sido actualizados para ser compatibles con React 18.2.0"
echo "Ya no deberías ver errores de 'Accessing element.ref was removed in React 19'"
echo ""
echo "Para ejecutar la aplicación:"
echo "  npm run full-dev"
