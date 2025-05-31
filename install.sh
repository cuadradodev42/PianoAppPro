#!/bin/bash

echo "🧹 Limpiando archivos temporales..."
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock

echo "📦 Instalando dependencias..."
npm install

echo "🔧 Verificando instalación..."
npm list --depth=0

echo "✅ Instalación completada. Ejecuta 'npm run dev' para iniciar el servidor."
