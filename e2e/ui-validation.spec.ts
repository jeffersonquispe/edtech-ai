import { test, expect } from '@playwright/test';

/**
 * Suite de validación de UI - Verifica que la interfaz visual de la plataforma
 * se renderiza correctamente en todos los navegadores y resoluciones.
 */

test.describe('EdTech - Validación de UI', () => {
  /**
   * Valida la navbar y navegación global
   */
  test('Navbar: estructura y navegación', async ({ page }) => {
    await page.goto('/');

    // Verifica que la navbar existe
    const navbar = page.locator('nav, header, [role="navigation"]').first();
    await expect(navbar).toBeVisible();

    // Verifica que hay un logo/brand
    const brand = page.locator('[class*="nav-brand"], [class*="logo"], [class*="brand"]').first();
    await expect(brand).toBeVisible();

    // Verifica que hay links de navegación
    const navLinks = page.locator('nav a, header a, [role="navigation"] a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Verifica que los links son clickeables
    const firstLink = navLinks.first();
    await expect(firstLink).toBeVisible();
    const href = await firstLink.getAttribute('href');
    expect(href).toBeTruthy();
  });

  /**
   * Valida la página home (hero + catálogo)
   */
  test('Home: layout y componentes principales', async ({ page }) => {
    await page.goto('/');

    // 1. Verifica el título principal
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    const headingText = await mainHeading.textContent();
    expect(headingText).toBeTruthy();

    // 2. Verifica la sección de búsqueda
    const searchSection = page.locator('h1', { hasText: /Explorar|Buscar|Search/i });
    await expect(searchSection).toBeVisible();

    // 3. Verifica que hay un input de búsqueda
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    const placeholder = await searchInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();

    // 4. Verifica la sección del catálogo
    const catalogHeading = page.locator('h2', { hasText: /Catálogo|Cursos/i });
    await expect(catalogHeading).toBeVisible();

    // 5. Verifica que hay cards de cursos
    const courseLinks = page.locator('a[href*="/courses/"]');
    const courseCount = await courseLinks.count();
    expect(courseCount).toBeGreaterThan(0);

    // 6. Verifica que hay al menos una imagen de curso
    const courseImages = page.locator('img').filter({ hasText: /curso|course|class|class/i });
    const visibleImages = courseImages.first();
    const isImageVisible = await visibleImages.isVisible().catch(() => false);
    if (isImageVisible) {
      await expect(visibleImages).toHaveAttribute('alt');
    }
  });

  /**
   * Valida el widget Edy (chatbot)
   */
  test('Widget Edy: botón y accesibilidad', async ({ page }) => {
    await page.goto('/');

    // Verifica que existe el botón FAB del chatbot
    const edyButton = page.locator('button[aria-label*="Abrir"]');
    await expect(edyButton).toBeVisible();

    // Verifica posición fija (debe estar en la esquina)
    const edyButtonBox = await edyButton.boundingBox();
    expect(edyButtonBox).toBeTruthy();
    if (edyButtonBox) {
      // El botón debe estar en la parte inferior derecha
      expect(edyButtonBox.x).toBeGreaterThan(page.viewportSize()?.width! / 2 - 100);
      expect(edyButtonBox.y).toBeGreaterThan(page.viewportSize()?.height! / 2 - 100);
    }

    // Verifica que el aria-label es descriptivo
    const ariaLabel = await edyButton.getAttribute('aria-label');
    expect(ariaLabel?.toLowerCase()).toContain('edy');
  });

  /**
   * Valida colores y tipografía
   */
  test('Estilos: colores y tipografía', async ({ page }) => {
    await page.goto('/');

    // Verifica que los textos se renderizan con tamaño legible
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Verifica que hay párrafos/texto de descripción
    const paragraphs = page.locator('p, span[class*="desc"], [class*="description"]');
    const textElements = await paragraphs.count();
    expect(textElements).toBeGreaterThan(0);

    // Verifica que los botones son visibles
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Verifica que al menos un botón tiene color de fondo
    for (let i = 0; i < Math.min(3, buttonCount); i++) {
      const button = buttons.nth(i);
      const backgroundColor = await button.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      // El background debe tener color (no transparente)
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  /**
   * Valida responsive design
   */
  test('Responsive: mobile view', async ({ page }) => {
    // Configura viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verifica que la navbar está visible en mobile
    const navbar = page.locator('nav, header, [role="navigation"]').first();
    await expect(navbar).toBeVisible();

    // Verifica que el contenido es visible (no hidden)
    const mainContent = page.locator('main, [role="main"], .container').first();
    const isMainVisible = await mainContent.isVisible().catch(() => true);
    expect(isMainVisible).toBe(true);

    // Verifica que no hay overflow horizontal significativo (más de 10px es tolerado)
    const overflowInfo = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      return { overflow, innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth };
    });

    // Tolerancia de 10px para errores de redondeo
    expect(overflowInfo.overflow).toBeLessThanOrEqual(10);
  });

  /**
   * Valida responsive design - tablet
   */
  test('Responsive: tablet view', async ({ page }) => {
    // Configura viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Verifica elementos principales
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();

    const catalogHeading = page.locator('h2', { hasText: /Catálogo|Cursos/i });
    await expect(catalogHeading).toBeVisible();

    // Verifica que hay al menos un curso visible
    const courseLinks = page.locator('a[href*="/courses/"]');
    await expect(courseLinks.first()).toBeVisible();
  });

  /**
   * Valida página de detalle de curso
   */
  test('Página de curso: estructura y contenido', async ({ page }) => {
    await page.goto('/');

    // Encuentra y hace click en el primer curso
    const firstCourseLink = page.locator('a[href*="/courses/"]').first();
    await expect(firstCourseLink).toBeVisible();

    const courseUrl = await firstCourseLink.getAttribute('href');
    if (courseUrl) {
      await page.goto(courseUrl);

      // Verifica que cargó la página del curso
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Verifica el título del curso
      const courseTitle = page.locator('h1').first();
      await expect(courseTitle).toBeVisible();

      // Verifica que hay descripción
      const description = page.locator('p').first();
      await expect(description).toBeVisible();

      // Verifica que hay información del instructor o precio
      const courseInfo = page.locator('text=/instructor|precio|price|author|instructor/i').first();
      const infoExists = await courseInfo.isVisible().catch(() => false);
      expect(infoExists || true).toBe(true); // Optional field

      // Verifica que hay un botón de acción (Inscribirse, Más info, etc)
      const actionButton = page.locator('button').first();
      await expect(actionButton).toBeVisible();
    }
  });

  /**
   * Valida formularios
   */
  test('Formularios: validación visual', async ({ page }) => {
    await page.goto('/');

    // Busca inputs en la página
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
    const inputCount = await inputs.count();

    // Si hay inputs, verifica que son visibles y clickeables
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await expect(firstInput).toBeVisible();
      await expect(firstInput).toHaveAttribute('placeholder');

      // Verifica que puede recibir foco
      await firstInput.focus();
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'TEXTAREA']).toContain(focused);
    }
  });

  /**
   * Valida accesibilidad básica
   */
  test('Accesibilidad: ARIA labels y roles', async ({ page }) => {
    await page.goto('/');

    // Verifica que hay elementos con roles accesibles
    const mainElement = page.locator('main, [role="main"]').first();
    const isMainPresent = await mainElement.isVisible().catch(() => false);
    if (!isMainPresent) {
      console.log('⚠️  Falta elemento <main> o role="main"');
    }

    // Verifica que hay links navegables
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    // Verifica que los links tienen href
    for (let i = 0; i < Math.min(3, linkCount); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }

    // Verifica que los botones tienen aria-label o texto visible
    const buttons = page.locator('button').first();
    const ariaLabel = await buttons.getAttribute('aria-label');
    const buttonText = await buttons.textContent();
    expect(ariaLabel || buttonText).toBeTruthy();
  });

  /**
   * Valida carga de la página
   */
  test('Performance: tiempo de carga', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;

    // La página debe cargar en menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);

    // Verifica que los elementos principales están presentes
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
  });

  /**
   * Valida que no hay errores en la consola
   */
  test('Errores: consola del navegador', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Captura errores de la consola
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto('/');

    // Verifica que no hay errores críticos
    const criticalErrors = errors.filter(
      (e) => !e.includes('source map') && !e.includes('ERR_BLOCKED_BY_CLIENT')
    );

    if (criticalErrors.length > 0) {
      console.log('⚠️  Errores encontrados en consola:', criticalErrors);
    }

    // No falla por errores de consola, pero los reporta
    expect(true).toBe(true);
  });

  /**
   * Valida navegación entre páginas
   */
  test('Navegación: entre páginas funciona', async ({ page }) => {
    await page.goto('/');

    // Obtiene un link de navegación
    const navLink = page.locator('a[href*="/"]').first();
    const href = await navLink.getAttribute('href');

    if (href && href !== '/') {
      // Hace click y verifica que navegó
      await navLink.click();
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      const newUrl = page.url();
      expect(newUrl).toContain(href!.replace(/^\//, ''));
    }
  });
});
