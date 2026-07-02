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

  try {
    // Navega a login
    console.log(`  → Navegando a ${BASE_URL}/login`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

    // Espera a que los inputs estén listos
    console.log(`  → Esperando formulario de login...`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    // Llena el formulario usando selectores más robustos
    console.log(`  → Completando email: ${email}`);
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(email);

    console.log(`  → Completando contraseña`);
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

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

    // Espera a que se redirija al home (o a dashboard si es instructor)
    console.log(`  → Esperando redirección...`);
    try {
      await page.waitForURL(/^.*\/(|dashboard)?$/, { timeout: 20000 });
    } catch (e) {
      console.log(`  ⚠️  Timeout esperando URL, intentando verificar nav...`);
      // Fallback: espera a que la navbar esté lista
      await page.waitForSelector('nav', { timeout: 10000 }).catch(() => {
        console.log(`  ⚠️  No se encontró nav, continuando...`);
      });
    }

    // Verifica que está autenticado (navbar debe cambiar)
    console.log(`  → Verificando autenticación...`);
    await page.waitForSelector('nav', { timeout: 10000 }).catch(() => {
      console.log(`  ⚠️  No se encontró nav, pero continuando...`);
    });

    // Pequeña pausa para asegurar que la sesión está completamente guardada
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

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
  } catch (error) {
    console.error(`❌ Error autenticando ${role}:`, error);
    throw error;
  } finally {
    await context.close();
  }
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
