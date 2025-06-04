# =====================================================
# DOCKERFILE PARA FRONTEND - REACT
# =====================================================

# 🏗️ ETAPA 1: BUILD (Compilar React)
FROM node:18-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Crear build de producción de React
RUN npm run build

# Esto crea la carpeta "build" con archivos estáticos

# 🌐 ETAPA 2: SERVIDOR (Nginx para servir archivos)
FROM nginx:alpine

# Copiar archivos compilados desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]