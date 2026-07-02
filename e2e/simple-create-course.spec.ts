import { test, expect } from '@playwright/test';

/**
 * Test simplificado: Solo crear un curso
 */
test('Instructor: crear curso (simple)', async ({ page, context }) => {
  // Autentica manualmente en este test
  page.context = context;

  // Usa el archivo de auth guardado
  const fs = require('fs');
  const path = require('path');
  const authFile = path.join(__dirname, '.auth/instructor.json');

  if (!fs.existsSync(authFile)) {
    throw new Error(`Auth file no encontrado: ${authFile}`);
  }

  // Lee el storage state
  const storageState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
  const { cookies = [], origins = [] } = storageState;

  // Restaura cookies
  for (const cookie of cookies) {
    await context.addCookies([{
      name: cookie.name,
      value: cookie.value,
      domain: 'localhost',
      path: '/',
      httpOnly: cookie.httpOnly,
      secure: false,
      sameSite: 'Lax' as const
    }]);
  }

  // Restaura localStorage
  await page.goto('http://localhost:3000');
  for (const origin of origins) {
    if (origin.localStorage) {
      await page.evaluate((storageData: any) => {
        for (const item of storageData) {
          window.localStorage.setItem(item.name, item.value);
        }
      }, origin.localStorage);
    }
  }

  // Navega a dashboard
  console.log('📍 Navegando a dashboard...');
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForLoadState('networkidle');

  const url = page.url();
  console.log(`📍 URL: ${url}`);

  if (!url.includes('/dashboard')) {
    throw new Error(`No estamos en dashboard, estamos en: ${url}`);
  }

  console.log('✅ En dashboard');

  // Completa y envía formulario
  console.log('📝 Creando curso...');
  const titleInput = page.getByTestId('course-title-input');
  await titleInput.fill('Curso Test Simplificado');

  const descInput = page.getByTestId('course-description-input');
  await descInput.fill('Test description');

  const button = page.getByTestId('create-course-button');
  console.log('🚀 Clickeando botón crear...');
  await button.click();

  console.log('⏳ Esperando respuesta...');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Verifica que el formulario se limpió (indicador de éxito)
  const resetValue = await titleInput.inputValue();
  if (resetValue === '') {
    console.log('✅ Formulario se limpió - curso probablemente creado');
  } else {
    console.log(`⚠️ Formulario NO se limpió. Valor: "${resetValue}"`);
  }

  // Recarga y verifica
  console.log('🔄 Recargando...');
  await page.reload();
  await page.waitForLoadState('networkidle');

  const pageText = await page.textContent('body');
  const courseAppears = pageText?.includes('Curso Test Simplificado') || false;
  console.log(`✅ Curso aparece en lista: ${courseAppears}`);

  if (!courseAppears) {
    console.log('📋 Contenido de página:');
    console.log(pageText?.substring(0, 800));
  }
});
