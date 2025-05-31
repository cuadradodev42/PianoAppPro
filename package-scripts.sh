#!/bin/bash

# Script para manejar diferentes escenarios de instalación

case "$1" in
  "clean")
    echo "🧹 Limpiando proyecto..."
    rm -rf node_modules package-lock.json .next
    if [ -d "backend" ]; then
      cd backend && rm -rf node_modules package-lock.json && cd ..
    fi
    echo "✅ Limpieza completada"
    ;;
  
  "install-legacy")
    echo "📦 Instalando con --legacy-peer-deps..."
    npm install --legacy-peer-deps
    ;;
    
  "install-force")
    echo "📦 Instalando con --force..."
    npm install --force
    ;;
    
  "full-install")
    echo "🚀 Instalación completa..."
    ./package-scripts.sh clean
    ./package-scripts.sh install-legacy
    if [ -d "backend" ]; then
      cd backend && npm install && cd ..
    fi
    echo "✅ Instalación completa terminada"
    ;;
    
  *)
    echo "Uso: $0 {clean|install-legacy|install-force|full-install}"
    echo ""
    echo "Comandos disponibles:"
    echo "  clean          - Limpiar archivos temporales"
    echo "  install-legacy - Instalar con --legacy-peer-deps"
    echo "  install-force  - Instalar con --force"
    echo "  full-install   - Instalación completa (recomendado)"
    ;;
esac
