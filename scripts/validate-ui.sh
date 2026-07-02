#!/bin/bash

# Script para validar la UI de la plataforma

echo "🚀 Iniciando servidor de desarrollo..."
npm run dev > /tmp/dev-server.log 2>&1 &
DEV_PID=$!
sleep 8

echo "✅ Servidor iniciado (PID: $DEV_PID)"
echo ""
echo "🧪 Ejecutando pruebas de validación de UI..."
echo ""

npx playwright test e2e/ui-validation.spec.ts --reporter=html --reporter=list

TEST_EXIT=$?

echo ""
echo "🛑 Deteniendo servidor..."
kill $DEV_PID 2>/dev/null || true

if [ $TEST_EXIT -eq 0 ]; then
  echo "✅ Todas las pruebas de UI pasaron!"
  echo "📊 Reporte HTML: test-results/index.html"
else
  echo "❌ Algunas pruebas fallaron. Ver detalles arriba."
fi

exit $TEST_EXIT
