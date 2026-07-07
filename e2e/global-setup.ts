import { chromium, expect, FullConfig } from '@playwright/test';
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

async function attemptLogin(
  browser: any,
  email: string,
  password: string,
  role: string
) {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navega a login
  console.log(`  → Navegando a ${BASE_URL}/login`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

  // Espera a que los inputs estén listos
  console.log(`  → Esperando formulario de login...`);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  // Espera a que React hidrate el formulario controlado; si no, fill() se pierde
  // porque el onChange aún no está conectado y el estado inicial vacío lo sobreescribe.
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

  // Llena el formulario usando selectores más robustos
  console.log(`  → Completando email: ${email}`);
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill(email);
  await expect(emailInput).toHaveValue(email);

  console.log(`  → Completando contraseña`);
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(password);
  await expect(passwordInput).toHaveValue(password);

  // Submit del formulario - busca botón por texto o rol
  console.log(`  → Enviando formulario`);
  const submitButton = page.getByRole('button', { name: /entrar|enter|login|signin/i });
  if (await submitButton.isVisible().catch(() => false)) {
    await submitButton.click();
  } else {
    // Fallback: busca por clase o texto
    const buttonByText = page.locator('button', { hasText: /Entrar|Enter|Login/ }).first();
    await buttonByText.click();
  }

  // Espera a que se redirija al home O a que aparezca un mensaje de error
  console.log(`  → Esperando redirección o mensaje de error...`);
  const outcome = await Promise.race([
    page.waitForURL(/^.*\/(|dashboard)?$/, { timeout: 20000 }).then(() => 'redirected' as const),
    page.locator('.error-msg').waitFor({ state: 'visible', timeout: 20000 }).then(() => 'error' as const),
  ]).catch(() => 'timeout' as const);

  if (outcome === 'error') {
    const errorText = await page.locator('.error-msg').textContent().catch(() => '(desconocido)');
    await context.close();
    throw new Error(`Login falló con mensaje de error: ${errorText}`);
  }

  if (outcome === 'timeout') {
    await context.close();
    throw new Error(`Login: timeout esperando redirección o error tras enviar formulario`);
  }

  // Verifica que está autenticado (navbar debe cambiar)
  console.log(`  → Verificando autenticación...`);
  await page.waitForSelector('nav', { timeout: 10000 }).catch(() => {
    console.log(`  ⚠️  No se encontró nav, pero continuando...`);
  });

  // Pequeña pausa para asegurar que la sesión está completamente guardada
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

  // Verifica explícitamente que la cookie de sesión de Supabase está presente
  const cookies = await context.cookies();
  const hasAuthCookie = cookies.some((c: any) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
  if (!hasAuthCookie) {
    await context.close();
    throw new Error('Login: no se encontró cookie de sesión de Supabase tras el login');
  }

  return { context, page };
}

async function authenticateUser(
  browser: any,
  email: string,
  password: string,
  storagePath: string,
  role: string
) {
  console.log(`🔐 Autenticando ${role}... (${email})`);

  const MAX_ATTEMPTS = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { context, page } = await attemptLogin(browser, email, password, role);

      try {
        // Guarda el estado de autenticación (cookies + localStorage)
        console.log(`  → Guardando storageState (cookies + localStorage)...`);

        // Primero guarda las cookies
        await context.storageState({ path: storagePath });

        // Luego agrega el localStorage
        const { readFileSync, writeFileSync, existsSync } = require('fs');
        const { resolve } = require('path');

        const localStorageData = await page.evaluate(() => {
          const storage: Record<string, string> = {};
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key) {
              storage[key] = window.localStorage.getItem(key) || '';
            }
          }
          return storage;
        });

        const storePath = resolve(storagePath);
        let storageStateObj: any = {};

        if (existsSync(storePath)) {
          storageStateObj = JSON.parse(readFileSync(storePath, 'utf-8'));
        }

        // Agrega localStorage
        storageStateObj.origins = [{
          origin: 'http://localhost:3000',
          localStorage: Object.entries(localStorageData).map(([name, value]) => ({
            name,
            value
          }))
        }];

        writeFileSync(storePath, JSON.stringify(storageStateObj, null, 2));

        console.log(`✅ ${role} autenticado y guardado en ${storagePath} (cookies + localStorage)`);
        return;
      } finally {
        await context.close();
      }
    } catch (error) {
      lastError = error;
      console.log(`  ⚠️  Intento ${attempt}/${MAX_ATTEMPTS} de login para ${role} falló: ${error instanceof Error ? error.message : error}`);
      if (attempt < MAX_ATTEMPTS) {
        const backoffMs = attempt * 3000;
        console.log(`  ⏳ Reintentando en ${backoffMs}ms...`);
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }
  }

  console.error(`❌ Error autenticando ${role} tras ${MAX_ATTEMPTS} intentos:`, lastError);
  throw lastError;
}

async function globalSetup(_config: FullConfig) {
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
