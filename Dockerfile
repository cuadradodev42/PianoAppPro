# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias del frontend
COPY package*.json ./
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir el frontend
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Instalar dependencias del backend
COPY --from=builder /app/backend/package*.json ./backend/
RUN npm ci --prefix ./backend

# Copiar el código fuente del backend
COPY --from=builder /app/backend ./backend

# Copiar los assets del frontend
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Exponer puertos
EXPOSE 3000 3001

# Comandos para iniciar el servidor
CMD ["npm", "start"]
