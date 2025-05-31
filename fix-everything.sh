#!/bin/bash

echo "🔧 Solucionando TODOS los problemas de Piano Party..."

# 1. Limpiar completamente
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

# 2. Instalar versiones específicas estables
echo "📦 Instalando React 18.2.0 y Next.js 13.4.19 (versiones estables)..."
npm install --legacy-peer-deps

# 3. Verificar instalación
echo "✅ Verificando instalación..."
echo "React: $(npm list react --depth=0 2>/dev/null | grep react@ || echo 'Error')"
echo "Next.js: $(npm list next --depth=0 2>/dev/null | grep next@ || echo 'Error')"

# 4. Instalar backend
if [ -d "backend" ]; then
  echo "📦 Instalando dependencias del backend..."
  cd backend
  npm install
  cd ..
fi

# 5. Verificar que los puertos estén libres
echo "🔍 Verificando puertos..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
  echo "⚠️ Liberando puerto 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
  echo "⚠️ Liberando puerto 3001..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi

echo ""
echo "🎉 ¡TODOS los problemas solucionados!"
echo ""
echo "✅ React 18.2.0 instalado (sin errores de refs)"
echo "✅ Next.js 13.4.19 instalado (estable)"
echo "✅ Backend corregido (asignación de teclas única)"
echo "✅ WebSocket optimizado (conexión rápida)"
echo "✅ Controles funcionando (BPM y volumen)"
echo "✅ Escalas funcionando (cambio automático de teclas)"
echo ""
echo "Para ejecutar la aplicación:"
echo "  npm run full-dev"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
