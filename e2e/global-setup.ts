import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global Setup: Autentica usuarios (instructor y estudiante)
 * y guarda sus storageState para reusarlo en los tests.
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// Crear directorio de auth si no existe
const authDir = path.join(__dirname, '.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

async function authenticateUser(
  browser: any,
  email: string,
  password: string,
  storagePath: string,
  role: string
) {
  console.log(`🔐 Autenticando ${role}... (${email})`);

  const context = await browser.newContext();
  const page = await context.newPage();

  // Navega a login
  await page.goto(`${BASE_URL}/login`);

  // Llena el formulario
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);

  // Submit del formulario
  await page.getByRole('button', { name: /entrar|signin/i }).click();

  // Espera a que se redirija al home
  await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });

  // Verifica que está autenticado (navbar debe cambiar)
  await page.waitForSelector('nav', { timeout: 5000 });

  // Guarda el estado de autenticación
  await context.storageState({ path: storagePath });
  console.log(`✅ ${role} autenticado y guardado en ${storagePath}`);

  await context.close();
}

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();

  // Autenticar como Instructor
  await authenticateUser(
    browser,
    'magis.ai.good@gmail.com',
    '123456',
    path.join(authDir, 'instructor.json'),
    'Instructor'
  );

  // Autenticar como Estudiante
  await authenticateUser(
    browser,
    'jeffersonquispep@gmail.com',
    '123456',
    path.join(authDir, 'estudiante.json'),
    'Estudiante'
  );

  await browser.close();
  console.log('\n✨ Global setup completado - Ambos usuarios autenticados\n');
}

export default globalSetup;
