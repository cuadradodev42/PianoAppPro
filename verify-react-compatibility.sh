#!/bin/bash

echo "🔍 Verificando compatibilidad con React..."

# Verificar versiones instaladas
echo "📦 Versiones instaladas:"
echo "React: $(npm list react --depth=0 2>/dev/null | grep react@ || echo 'No instalado')"
echo "React DOM: $(npm list react-dom --depth=0 2>/dev/null | grep react-dom@ || echo 'No instalado')"
echo "Next.js: $(npm list next --depth=0 2>/dev/null | grep next@ || echo 'No instalado')"

# Verificar que no hay conflictos
echo ""
echo "🔍 Verificando conflictos de dependencias..."
npm ls --depth=0 2>&1 | grep -E "(WARN|ERR)" || echo "✅ No hay conflictos detectados"

# Verificar archivos de componentes UI
echo ""
echo "🔍 Verificando componentes UI..."
components=(
  "components/ui/button.tsx"
  "components/ui/card.tsx"
  "components/ui/input.tsx"
  "components/ui/slider.tsx"
  "components/ui/select.tsx"
  "components/ui/checkbox.tsx"
  "components/ui/badge.tsx"
)

for component in "${components[@]}"; do
  if [ -f "$component" ]; then
    echo "✅ $component existe"
  else
    echo "❌ $component NO EXISTE"
  fi
done

echo ""
echo "🔍 Verificación completada"
echo ""
echo "Si todo está ✅, ejecuta: npm run dev"
echo "Si hay problemas ❌, ejecuta: ./fix-react-refs.sh"
