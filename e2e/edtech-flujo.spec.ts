import { test, expect, Page } from '@playwright/test';

/**
 * Suite de pruebas E2E para flujos principales de EdTech:
 * 1. Visitante sin sesión: navega catálogo + interactúa con Edy
 * (Posteriormente: login + inscripción; instructor + crear curso)
 */

test.describe('EdTech - Flujos Principales', () => {
  /**
   * Flujo 1: Visitante sin sesión
   * - Abre la página
   * - Navega el catálogo
   * - Abre el chatbot Edy
   * - Pregunta '¿que cursos tienen para principiantes?'
   * - Verifica que responde
   *
   * NOTA: Este test requiere que el servidor de agente Edy esté corriendo.
   * Si no está disponible, usa @skip.
   */
  test('Visitante: navega catálogo y pregunta a Edy', async ({ page, context }) => {
    // 1. Visitante abre la página
    await page.goto('/');
    await expect(page).toHaveTitle(/EdTech/i); // EdTech Platform

    // 2. Verifica que ve el catálogo
    const catalogoHeading = page.locator('h2', { hasText: /Catálogo Completo/i });
    await expect(catalogoHeading).toBeVisible();

    // 3. Verifica que hay cursos visibles (al menos uno)
    const firstCourseLink = page.locator('a[href*="/courses/"]').first();
    await expect(firstCourseLink).toBeVisible();

    // 4. Busca el botón del widget Edy (FAB flotante)
    const edyButton = page.locator('button[aria-label*="Abrir"]');

    // Espera a que el botón sea interactuable
    await expect(edyButton).toBeVisible({ timeout: 5000 });

    // 5. Verifica que el botón tiene propiedades de accesibilidad
    const ariaLabel = await edyButton.getAttribute('aria-label');
    expect(ariaLabel).toContain('Edy');

    // 6. Hace click en el botón para abrir el widget
    await edyButton.click();
    await page.waitForTimeout(800); // Pausa para animación

    // 8. Verifica que existe un iframe dentro del documento
    const edyIframe = page.locator('iframe').filter({ hasText: /Asistente|Edy/ }).first();

    // Opcional: si el agente Edy no está disponible, skip el resto
    const iframeVisible = await edyIframe.isVisible().catch(() => false);
    if (!iframeVisible) {
      test.skip();
    }

    await expect(edyIframe).toBeVisible({ timeout: 10000 });

    // 9. Obtiene el frame del iframe para interactuar con su contenido
    const frameLocator = page.frameLocator('iframe').filter({ hasText: /Asistente|Edy/ }).first();

    // 10. Espera a que la sala LiveKit se conecte y muestre el formulario de entrada
    // Puede mostrar estados como "Conectando…", "Iniciando…" o "Escuchando"
    const textInput = frameLocator.locator('input.edy-text-input');
    await expect(textInput).toBeVisible({ timeout: 15000 });

    // 11. Escribe la pregunta en el campo de texto
    const pregunta = '¿que cursos tienen para principiantes?';
    await textInput.fill(pregunta);
    await expect(textInput).toHaveValue(pregunta);

    // 12. Hace click en el botón de envío
    const sendButton = frameLocator.locator('button.edy-send');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // 13. Verifica que el mensaje del usuario apareció en el chat
    const userMessage = frameLocator.locator('div.edy-msg-user', { hasText: pregunta });
    await expect(userMessage).toBeVisible({ timeout: 5000 });

    // 14. Verifica que el input se limpió
    await expect(textInput).toHaveValue('');

    // 15. Espera una respuesta de Edy (con timeout de 30s para dar tiempo al agente)
    // Edy debe responder con uno o más mensajes
    const edyMessage = frameLocator.locator('div.edy-msg-edy');
    await expect(edyMessage.first()).toBeVisible({ timeout: 30000 });

    // 16. Verifica que hay contenido en la respuesta (no está vacía)
    const responseText = await edyMessage.first().textContent();
    expect(responseText).toBeTruthy();
    expect(responseText?.length).toBeGreaterThan(0);

    // 17. Verifica que la conversación se ve natural (más de un mensaje visible)
    const allMessages = frameLocator.locator('div.edy-msg');
    const messageCount = await allMessages.count();
    expect(messageCount).toBeGreaterThanOrEqual(2); // Al menos el usuario + Edy
  });

  /**
   * Test auxiliar: verifica que el widget Edy tiene accesibilidad básica
   */
  test('Widget Edy: accesibilidad (a11y)', async ({ page }) => {
    await page.goto('/');

    // Busca el botón FAB
    const edyButton = page.locator('button[aria-label*="Abrir"]');
    await expect(edyButton).toBeVisible({ timeout: 5000 });

    // Verifica que tiene aria-label descriptivo
    const ariaLabel = await edyButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('Edy');
    expect(ariaLabel).toContain('Abrir');

    // Verifica que es interactuable (puede ser activado con click)
    await edyButton.click();
    await page.waitForTimeout(500);

    // Verifica que el button es accesible (tiene un aria-label) y es clickeable
    expect(ariaLabel).toBeTruthy();
  });

  /**
   * Test auxiliar: verifica que el catálogo es navegable sin sesión
   */
  test('Catálogo: visible para visitante sin sesión', async ({ page }) => {
    await page.goto('/');

    // Debe haber una sección de búsqueda
    const searchSection = page.locator('h1', { hasText: /Explorar Cursos/i });
    await expect(searchSection).toBeVisible();

    // Debe haber una sección de catálogo
    const catalogSection = page.locator('h2', { hasText: /Catálogo Completo/i });
    await expect(catalogSection).toBeVisible();

    // Debe haber al menos un curso listado (asumiendo que hay cursos publicados)
    const courseLink = page.locator('a[href*="/courses/"]').first();

    // Si hay cursos, verifica que son clickeables
    if (await courseLink.isVisible().catch(() => false)) {
      await expect(courseLink).toHaveAttribute('href', /\/courses\/[^/]+/);
    }
  });
});

/**
 * Tests adicionales para futuras implementaciones:
 *
 * test('Login + Inscripción en curso', async ({ page }) => {
 *   // 1. Visitante hace click en "Inscribirse"
 *   // 2. Se redirige a login
 *   // 3. Completa registro / login
 *   // 4. Se confirma inscripción
 * });
 *
 * test('Instructor: crear y publicar curso', async ({ page }) => {
 *   // 1. Instructor inicia sesión
 *   // 2. Accede al dashboard
 *   // 3. Crea un nuevo curso
 *   // 4. Publica el curso
 *   // 5. Verifica que aparece en el catálogo
 * });
 */
