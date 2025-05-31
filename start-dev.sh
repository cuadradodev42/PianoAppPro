#!/bin/bash

echo "🚀 Iniciando Piano Party en modo desarrollo..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install --legacy-peer-deps
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend && npm install && cd ..
fi

# Verificar que el puerto 3000 esté libre
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Puerto 3000 está en uso. Liberando..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Verificar que el puerto 3001 esté libre
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Puerto 3001 está en uso. Liberando..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi

echo "🎹 Iniciando frontend y backend..."
npm run full-dev
