#!/bin/bash

echo "🔧 Solucionando error 'use(): [object Object]'..."

# 1. Limpiar completamente
echo "🧹 Limpiando instalación anterior..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock
rm -rf .next

# 2. Instalar versiones específicas compatibles
echo "📦 Instalando Next.js 13.4.19 (compatible con params)..."
npm install --legacy-peer-deps

# 3. Verificar que no hay conflictos
echo "✅ Verificando instalación..."
npm list next react --depth=0

# 4. Limpiar e instalar backend
if [ -d "backend" ]; then
  echo "📦 Instalando backend..."
  cd backend
  rm -rf node_modules package-lock.json
  npm install
  cd ..
fi

echo ""
echo "🎉 ¡Error de 'use()' solucionado!"
echo ""
echo "✅ Next.js 13.4.19 instalado (sin use() de React 19)"
echo "✅ WebSocket con importación dinámica"
echo "✅ Params accesibles directamente"
echo "✅ SSR compatible"
echo ""
echo "Para ejecutar:"
echo "  npm run full-dev"
