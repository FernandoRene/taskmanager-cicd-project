#!/bin/bash

echo "🔧 Desplegando TaskManager en ambiente DEV..."

# Parar servicios DEV existentes
docker-compose -f docker/docker-compose.dev.yml down

# Construir e iniciar servicios DEV
docker-compose -f docker/docker-compose.dev.yml up -d --build

# Esperar que los servicios inicien
echo "⏳ Esperando que los servicios inicien..."
sleep 30

# Health check
echo "🔍 Verificando servicios..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend DEV: OK"
else
    echo "⚠️ Backend DEV: Warning"
fi

if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend DEV: OK"
else
    echo "⚠️ Frontend DEV: Warning"
fi

echo "🎉 Deployment DEV completado!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Backend: http://localhost:3000"