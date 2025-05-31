#!/bin/bash

echo "🔍 Verificando archivos del proyecto..."

# Verificar archivos principales
files=(
  "package.json"
  "next.config.js"
  "tailwind.config.js"
  "postcss.config.js"
  "tsconfig.json"
  "app/layout.tsx"
  "app/globals.css"
  ".env.local"
  ".gitignore"
  "README.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file existe"
  else
    echo "❌ $file NO EXISTE"
  fi
done

echo ""
echo "📦 Verificando dependencias en package.json..."
if grep -q "next.*13.4.19" package.json; then
  echo "✅ Next.js versión correcta"
else
  echo "❌ Next.js versión incorrecta"
fi

if grep -q "react.*18.2.0" package.json; then
  echo "✅ React versión correcta"
else
  echo "❌ React versión incorrecta"
fi

echo ""
echo "🎯 Verificación completada"
