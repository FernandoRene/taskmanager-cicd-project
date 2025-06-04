#!/bin/bash

BUILD_NUMBER=${1:-latest}
export BUILD_NUMBER

echo "🧪 Desplegando TaskManager en ambiente QA..."
echo "📦 Build Number: $BUILD_NUMBER"

# Parar servicios QA existentes
docker-compose -f docker/docker-compose.qa.yml down

# Iniciar servicios QA con imágenes específicas
docker-compose -f docker/docker-compose.qa.yml up -d

# Esperar que los servicios inicien
echo "⏳ Esperando que los servicios inicien..."
sleep 45

# Health check
echo "🔍 Verificando servicios QA..."
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Backend QA: OK"
else
    echo "⚠️ Backend QA: Warning"
fi

if curl -f http://localhost:3003 > /dev/null 2>&1; then
    echo "✅ Frontend QA: OK"
else
    echo "⚠️ Frontend QA: Warning"
fi

echo "🎉 Deployment QA completado!"
echo "🌐 Frontend: http://localhost:3003"
echo "🔧 Backend: http://localhost:3002"