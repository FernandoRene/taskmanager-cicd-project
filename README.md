# taskmanager-cicd-project

Sistema de gestión de tareas con pipeline CI/CD completo usando Jenkins, Docker y estrategia Blue-Green.

## 🏗️ Arquitectura

- **Backend:** Node.js + Express + Sequelize + PostgreSQL
- **Frontend:** React + Material-UI
- **CI/CD:** Jenkins + Docker + Blue-Green Deployment
- **Infraestructura:** Docker Compose + Multiple Environments

## 🌍 Ambientes

| Ambiente | Branch | URL | Puerto DB |
|----------|--------|-----|-----------|
| DEV | `develop` | http://localhost:3001 | 5432 |
| QA | `release/*` | http://localhost:3003 | 5433 |
| PROD | `main` | http://localhost:80 | 5434/5435 |

## 🚀 Pipeline CI/CD

### Flujo por Branch:
- **Feature branches:** Solo testing
- **develop:** Deploy automático a DEV
- **release/*:** Deploy automático a QA
- **main:** Deploy con aprobación manual a PROD (Blue-Green)

### Etapas del Pipeline:
1. 📥 Checkout código
2. 🎯 Determinar ambiente
3. 📦 Instalar dependencias
4. 🧪 Ejecutar tests
5. 🐳 Build imágenes Docker
6. 🚀 Deploy por ambiente
7. 🔍 Health checks

## 🔄 Blue-Green Deployment

Estrategia de deployment zero-downtime:
- **Blue Environment:** Versión actual en producción
- **Green Environment:** Nueva versión para testing
- **Switch:** Cambio instantáneo de tráfico
- **Rollback:** Vuelta inmediata si hay problemas

## 📋 Comandos

```bash
# Desarrollo local
npm install
npm start

# Docker - DEV
./scripts/deploy-dev.sh

# Docker - QA
./scripts/deploy-qa.sh [BUILD_NUMBER]

# Docker - PROD (Blue-Green)
./scripts/blue-green-deploy.sh [BUILD_NUMBER]