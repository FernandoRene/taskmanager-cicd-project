#!/bin/bash

NEW_VERSION=${1:-latest}
CURRENT_ENV=$(cat .current-env 2>/dev/null || echo "blue")
TARGET_ENV=$([ "$CURRENT_ENV" = "blue" ] && echo "green" || echo "blue")

export PROD_DB_PASSWORD="super_secure_prod_password_2025"
export PROD_SECRET_KEY="super_secure_prod_jwt_key_2025"

if [ "$TARGET_ENV" = "green" ]; then
    export GREEN_VERSION=$NEW_VERSION
    export BLUE_VERSION=$(cat .blue-version 2>/dev/null || echo "latest")
else
    export BLUE_VERSION=$NEW_VERSION
    export GREEN_VERSION=$(cat .green-version 2>/dev/null || echo "latest")
fi

echo "🚀 Iniciando Blue-Green Deployment"
echo "📍 Ambiente actual: $CURRENT_ENV"
echo "🎯 Ambiente destino: $TARGET_ENV"
echo "🏷️  Nueva versión: $NEW_VERSION"

# Desplegar en ambiente destino
echo "🔧 Desplegando en ambiente $TARGET_ENV..."
docker-compose -f docker/docker-compose.prod.yml up -d

# Esperar que los servicios estén listos
echo "⏳ Esperando que los servicios estén listos..."
sleep 60

# Health check del ambiente destino
TARGET_PORT=$([ "$TARGET_ENV" = "green" ] && echo "3007" || echo "3005")
if curl -f http://localhost:$TARGET_PORT > /dev/null 2>&1; then
    echo "✅ Ambiente $TARGET_ENV está funcionando"
else
    echo "❌ Ambiente $TARGET_ENV falló - Abortando deployment"
    exit 1
fi

# Simular switch de tráfico (en un entorno real, actualizaría nginx)
echo "🔀 Simulando switch de tráfico a $TARGET_ENV..."
echo $TARGET_ENV > .current-env
echo $NEW_VERSION > .$TARGET_ENV-version

echo "🎉 Blue-Green deployment completado exitosamente!"
echo "🌍 Aplicación disponible en:"
echo "   - Blue:  http://localhost:3005"
echo "   - Green: http://localhost:3007"
echo "📊 Ambiente activo: $TARGET_ENV"
echo "📈 Versión activa: $NEW_VERSION"