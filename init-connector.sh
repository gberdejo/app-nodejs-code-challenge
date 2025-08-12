#!/bin/bash
set -e

echo "⏳ Esperando a que Kafka Connect esté disponible..."
# Espera hasta que el puerto 8083 responda
until curl -s http://kafka-connect:8083/connectors; do
    sleep 5
done

echo "🚀 Registrando conector..."
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" \
     http://kafka-connect:8083/connectors/ \
     -d @/config/register-postgres-connector.json

echo "✅ Conector registrado"