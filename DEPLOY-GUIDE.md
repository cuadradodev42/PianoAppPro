# 🚀 Guía de Despliegue Gratuito - Piano Party

## 📋 Resumen

**Mejores opciones gratuitas:**
- **Frontend:** Vercel (excelente para Next.js)
- **Backend:** Railway (fácil y confiable)

## 🎯 Opción Recomendada: Vercel + Railway

### 1. Desplegar Backend en Railway

**Railway es la mejor opción gratuita para el backend:**
- ✅ 500 horas gratis/mes
- ✅ WebSocket support nativo
- ✅ Deploy automático desde Git
- ✅ Variables de entorno fáciles

**Pasos:**

1. **Ir a [Railway.app](https://railway.app)**
2. **Conectar GitHub** y autorizar
3. **New Project → Deploy from GitHub repo**
4. **Seleccionar tu repositorio**
5. **Configurar variables:**
   - `PORT`: 3001
   - `NODE_ENV`: production
6. **Configurar build:**
   - Root Directory: `backend`
   - Start Command: `npm start`
7. **Deploy** - Te dará una URL como: `https://tu-app.railway.app`

### 2. Desplegar Frontend en Vercel

**Vercel es perfecto para Next.js:**
- ✅ Totalmente gratis para proyectos personales
- ✅ Deploy automático desde Git
- ✅ CDN global
- ✅ Integración perfecta con Next.js

**Pasos:**

1. **Ir a [Vercel.com](https://vercel.com)**
2. **Conectar GitHub** y autorizar
3. **Import tu repositorio**
4. **Configurar variables de entorno:**
   - `NEXT_PUBLIC_BACKEND_URL`: https://tu-app.railway.app
5. **Deploy** - Te dará una URL como: `https://tu-app.vercel.app`

### 3. Actualizar Configuración

**En el backend (Railway), actualizar CORS:**

Edita `backend/server-prod.js` línea 9:
\`\`\`javascript
const corsOrigins = [
  "https://tu-app.vercel.app", // Tu URL de Vercel
  "http://localhost:3000",
  /\.vercel\.app$/,
]
\`\`\`

## 🔧 Alternativas Gratuitas

### Para Backend:

1. **Railway** (Recomendado)
   - ✅ 500h gratis/mes
   - ✅ WebSocket support
   - ✅ Fácil configuración

2. **Render**
   - ✅ 750h gratis/mes
   - ✅ WebSocket support
   - ❌ Puede tener latencia

3. **Heroku** (Con limitaciones)
   - ⚠️ Solo 550h gratis/mes
   - ✅ Confiable
   - ❌ Se duerme después de 30min

### Para Frontend:

1. **Vercel** (Recomendado)
   - ✅ Totalmente gratis
   - ✅ Perfecto para Next.js
   - ✅ Deploy automático

2. **Netlify**
   - ✅ Gratis decente
   - ❌ Menos optimizado para Next.js

3. **GitHub Pages**
   - ❌ No soporta Next.js SSR

## 📝 Checklist de Despliegue

### Preparación:
- [ ] Código subido a GitHub
- [ ] Variables de entorno configuradas
- [ ] CORS actualizado en el backend

### Backend (Railway):
- [ ] Proyecto creado en Railway
- [ ] Repositorio conectado
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] URL del backend copiada

### Frontend (Vercel):
- [ ] Proyecto creado en Vercel
- [ ] Repositorio conectado
- [ ] Variable NEXT_PUBLIC_BACKEND_URL configurada
- [ ] Deploy exitoso
- [ ] URL del frontend funcionando

### Testing:
- [ ] Frontend carga correctamente
- [ ] Backend responde (https://tu-backend.railway.app/health)
- [ ] WebSocket se conecta
- [ ] Crear sala funciona
- [ ] Unirse a sala funciona
- [ ] Piano funciona
- [ ] Metrónomo funciona

## 🚨 Solución de Problemas

### Error de CORS:
\`\`\`javascript
// Verificar que el backend tenga tu dominio de Vercel en corsOrigins
const corsOrigins = [
  "https://tu-app.vercel.app", // Asegúrate que coincida exactamente
  /\.vercel\.app$/,
]
\`\`\`

### WebSocket no conecta:
- ✅ Verificar que el backend esté corriendo: `/health`
- ✅ Verificar variable `NEXT_PUBLIC_BACKEND_URL`
- ✅ Verificar que sea HTTPS en producción

### Backend se duerme (Heroku):
- ⚠️ Heroku duerme apps después de 30min
- ✅ Usar Railway en su lugar
- ✅ O implementar keep-alive ping

## 💰 Costos y Límites

### Railway (Backend):
- **Gratis:** 500 horas/mes
- **Costo adicional:** $5/mes por 500h extra
- **Ideal para:** Proyectos pequeños a medianos

### Vercel (Frontend):
- **Gratis:** Ilimitado para proyectos personales
- **Límites:** 100GB bandwidth, 1000 serverless executions
- **Ideal para:** Cualquier proyecto

## 🎉 ¡Listo!

Una vez desplegado:
1. **Comparte la URL:** `https://tu-app.vercel.app`
2. **Monitorea logs** en Railway y Vercel
3. **Disfruta tu piano multijugador!** 🎹

---

**Tiempo estimado de despliegue:** 15-30 minutos  
**Costo:** $0 para uso normal  
**Escalabilidad:** Perfecto para 10-50 usuarios simultáneos  
\`\`\`

```shellscript file="deploy-setup.sh"
#!/bin/bash

echo "🚀 Preparando Piano Party para despliegue..."

# 1. Crear archivos de producción
echo "📦 Creando configuración de producción..."

# Copiar archivos para producción
cp next.config.prod.js next.config.js
cp backend/package-deploy.json backend/package.json
cp backend/server-prod.js backend/server.js

# 2. Actualizar variables de entorno
echo "🔧 Configurando variables de entorno..."
if [ ! -f ".env.production" ]; then
  cat > .env.production << EOL
# Reemplaza con tu URL de Railway
NEXT_PUBLIC_BACKEND_URL=https://tu-backend.railway.app
NODE_ENV=production
EOL
fi

# 3. Verificar dependencias
echo "✅ Verificando dependencias..."
npm list --depth=0 > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "⚠️ Instalando dependencias..."
  npm install --legacy-peer-deps
fi

# 4. Build de prueba
echo "🔨 Probando build de producción..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Error en build. Revisa los errores arriba."
  exit 1
fi

# 5. Verificar backend
echo "🔍 Verificando backend..."
cd backend
npm list --depth=0 > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "📦 Instalando dependencias del backend..."
  npm install
fi
cd ..

echo ""
echo "🎉 ¡Listo para despliegue!"
echo ""
echo "📋 Pasos siguientes:"
echo "1. Sube tu código a GitHub"
echo "2. Despliega backend en Railway:"
echo "   - Usa la carpeta 'backend' como root"
echo "   - Configura PORT=3001 y NODE_ENV=production"
echo "3. Despliega frontend en Vercel:"
echo "   - Configura NEXT_PUBLIC_BACKEND_URL con tu URL de Railway"
echo "4. Actualiza CORS en backend/server-prod.js con tu dominio de Vercel"
echo ""
echo "🔗 URLs de despliegue:"
echo "   Railway: https://railway.app"
echo "   Vercel: https://vercel.com"
