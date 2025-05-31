#!/bin/bash

echo "🔧 Solucionando conflictos de dependencias..."

# Limpiar completamente
echo "🧹 Limpiando archivos anteriores..."
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

# Instalar con legacy peer deps para evitar conflictos
echo "📦 Instalando dependencias con --legacy-peer-deps..."
npm install --legacy-peer-deps

# Verificar instalación
echo "✅ Verificando instalación..."
npm list --depth=0

# Instalar backend
if [ -d "backend" ]; then
  echo "📦 Instalando dependencias del backend..."
  cd backend
  npm install
  cd ..
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "Para ejecutar la aplicación:"
echo "  npm run full-dev    # Frontend + Backend"
echo "  npm run dev         # Solo Frontend"
echo ""
echo "Si sigues teniendo problemas, ejecuta:"
echo "  npm install --force"
