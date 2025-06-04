# =====================================================
# DOCKERFILE PARA BACKEND - TASKMANAGER
# =====================================================

# 1. 🧱 IMAGEN BASE - Como elegir el sistema operativo
FROM node:18-alpine

# ¿Por qué node:18-alpine?
# - node:18 = Viene con Node.js versión 18 preinstalado
# - alpine = Versión super ligera de Linux (5MB vs 100MB+)

# 2. 📁 DIRECTORIO DE TRABAJO - Donde vivirá tu app
WORKDIR /usr/src/app

# Es como hacer: cd /usr/src/app

# 3. 📋 COPIAR ARCHIVOS DE DEPENDENCIAS PRIMERO
# ¿Por qué primero? Para aprovechar el cache de Docker
COPY package*.json ./

# Esto copia:
# - package.json
# - package-lock.json (si existe)

# 4. 📦 INSTALAR DEPENDENCIAS
RUN npm ci --only=production

# npm ci vs npm install:
# - npm ci = Más rápido, para producción
# - --only=production = No instala devDependencies

# 5. 📁 COPIAR TODO EL CÓDIGO FUENTE
COPY . .

# El punto "." significa "todo en esta carpeta"

# 6. 👤 CREAR USUARIO NO-ROOT (Seguridad)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# ¿Por qué? Por seguridad, no ejecutar como root

# 7. 🌐 EXPONER PUERTO
EXPOSE 3000

# No abre el puerto, solo lo "documenta"

# 8. ⚡ COMANDO DE INICIO
CMD ["npm", "start"]

# Es como ejecutar: npm start