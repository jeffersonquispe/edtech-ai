# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-validation.spec.ts >> EdTech - Validación de UI >> Navbar: estructura y navegación
- Location: e2e\ui-validation.spec.ts:12:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - link "EdTech Platform Plataforma activa" [ref=e3] [cursor=pointer]:
      - /url: /
      - generic [ref=e4]: EdTech
      - generic [ref=e5]: Platform
      - generic "Plataforma activa" [ref=e6]
    - generic [ref=e7]:
      - link "Iniciar sesión" [ref=e8] [cursor=pointer]:
        - /url: /login
      - link "Registrarse" [ref=e9] [cursor=pointer]:
        - /url: /register
  - generic [ref=e10]:
    - generic [ref=e11]:
      - heading "Explorar Cursos" [level=1] [ref=e12]
      - generic [ref=e14]:
        - generic [ref=e15]:
          - 'textbox "Buscar cursos... (ej: Python, Machine Learning, Diseño)" [ref=e16]'
          - button "Buscar" [ref=e17] [cursor=pointer]
        - paragraph [ref=e18]: 🔍 Búsqueda semántica (vectorial)
    - generic [ref=e19]:
      - heading "Catálogo Completo" [level=2] [ref=e20]
      - generic [ref=e21]:
        - banner [ref=e22]:
          - heading "Aprende sin límites." [level=1] [ref=e24]
          - paragraph [ref=e25]: Explora cursos dictados por profesionales de la industria y potencia tu carrera en tecnología, diseño y negocios.
        - generic [ref=e26]:
          - button "Todos los cursos" [ref=e27] [cursor=pointer]
          - button "Ciencia de Datos" [ref=e28] [cursor=pointer]
          - button "Diseño" [ref=e29] [cursor=pointer]
          - button "Marketing" [ref=e30] [cursor=pointer]
          - button "Negocios" [ref=e31] [cursor=pointer]
          - button "Programación" [ref=e32] [cursor=pointer]
        - generic [ref=e33]:
          - link "Machine Learning Ciencia de Datos Machine Learning IA Tradicional, Vision Computacional y NLP S/ 500" [ref=e34] [cursor=pointer]:
            - /url: /courses/d46e529e-d4cb-4a44-8ada-e90ebfd74db1
            - generic [ref=e35]:
              - img "Machine Learning" [ref=e37]
              - generic [ref=e38]: Ciencia de Datos
              - heading "Machine Learning" [level=3] [ref=e39]
              - paragraph [ref=e40]: IA Tradicional, Vision Computacional y NLP
              - generic [ref=e41]: S/ 500
          - link "Claude Code Programación Claude Code Curso de IA Agéntica S/ 100" [ref=e42] [cursor=pointer]:
            - /url: /courses/6813c543-8c06-4d8f-a951-d97946c1f073
            - generic [ref=e43]:
              - img "Claude Code" [ref=e45]
              - generic [ref=e46]: Programación
              - heading "Claude Code" [level=3] [ref=e47]
              - paragraph [ref=e48]: Curso de IA Agéntica
              - generic [ref=e49]: S/ 100
          - link "Estrategia de Marketing Digital Marketing Estrategia de Marketing Digital SEO, SEM, redes sociales y email marketing. Todo lo que necesitas para dominar el marketing online. S/ 59.99" [ref=e50] [cursor=pointer]:
            - /url: /courses/50008b64-59d5-478b-8128-cfbba46766f0
            - generic [ref=e51]:
              - img "Estrategia de Marketing Digital" [ref=e53]
              - generic [ref=e54]: Marketing
              - heading "Estrategia de Marketing Digital" [level=3] [ref=e55]
              - paragraph [ref=e56]: SEO, SEM, redes sociales y email marketing. Todo lo que necesitas para dominar el marketing online.
              - generic [ref=e57]: S/ 59.99
          - link "Branding & Identidad Visual Diseño Branding & Identidad Visual Crea una identidad visual sólida para tu marca. Logo, paleta de colores, y guidelines. S/ 54.99" [ref=e58] [cursor=pointer]:
            - /url: /courses/0d73f28a-bb94-451f-a726-7b5d94f398f7
            - generic [ref=e59]:
              - img "Branding & Identidad Visual" [ref=e61]
              - generic [ref=e62]: Diseño
              - heading "Branding & Identidad Visual" [level=3] [ref=e63]
              - paragraph [ref=e64]: Crea una identidad visual sólida para tu marca. Logo, paleta de colores, y guidelines.
              - generic [ref=e65]: S/ 54.99
          - link "Diseño UI/UX para principiantes Diseño Diseño UI/UX para principiantes Domina los principios de diseño, tipografía, color y user experience. Perfecto para diseñadores nova... S/ 39.99" [ref=e66] [cursor=pointer]:
            - /url: /courses/d70c86aa-782d-49dc-9f9b-ce467e44e12f
            - generic [ref=e67]:
              - img "Diseño UI/UX para principiantes" [ref=e69]
              - generic [ref=e70]: Diseño
              - heading "Diseño UI/UX para principiantes" [level=3] [ref=e71]
              - paragraph [ref=e72]: Domina los principios de diseño, tipografía, color y user experience. Perfecto para diseñadores nova...
              - generic [ref=e73]: S/ 39.99
          - 'link "Emprenderismo 101 Negocios Emprenderismo 101 De la idea al negocio: plan de negocio, financiamiento, y cómo escalar tu startup. S/ 44.99" [ref=e74] [cursor=pointer]':
            - /url: /courses/1c2dd6f7-ba21-445b-8b82-d452f8612c74
            - generic [ref=e75]:
              - img "Emprenderismo 101" [ref=e77]
              - generic [ref=e78]: Negocios
              - heading "Emprenderismo 101" [level=3] [ref=e79]
              - paragraph [ref=e80]: "De la idea al negocio: plan de negocio, financiamiento, y cómo escalar tu startup."
              - generic [ref=e81]: S/ 44.99
          - link "Advanced TypeScript Patterns Programación Advanced TypeScript Patterns Genéricos, decoradores, type guards y patrones avanzados. Para desarrolladores intermediate/senior. S/ 79.99" [ref=e82] [cursor=pointer]:
            - /url: /courses/bb8c3778-012b-476a-a05e-759dc01480cb
            - generic [ref=e83]:
              - img "Advanced TypeScript Patterns" [ref=e85]
              - generic [ref=e86]: Programación
              - heading "Advanced TypeScript Patterns" [level=3] [ref=e87]
              - paragraph [ref=e88]: Genéricos, decoradores, type guards y patrones avanzados. Para desarrolladores intermediate/senior.
              - generic [ref=e89]: S/ 79.99
          - link "Python para Ciencia de Datos Ciencia de Datos Python para Ciencia de Datos Aprende Python, pandas, NumPy y Matplotlib. Conviértete en un analista de datos profesional. S/ 69.99" [ref=e90] [cursor=pointer]:
            - /url: /courses/faf57d0e-8763-4684-bf20-a5ede37db9e8
            - generic [ref=e91]:
              - img "Python para Ciencia de Datos" [ref=e93]
              - generic [ref=e94]: Ciencia de Datos
              - heading "Python para Ciencia de Datos" [level=3] [ref=e95]
              - paragraph [ref=e96]: Aprende Python, pandas, NumPy y Matplotlib. Conviértete en un analista de datos profesional.
              - generic [ref=e97]: S/ 69.99
          - link "Introducción a React 19 Programación Introducción a React 19 Aprende los fundamentos de React, hooks, y cómo construir aplicaciones modernas con la última versió... S/ 49.99" [ref=e98] [cursor=pointer]:
            - /url: /courses/81ac8302-bcbd-4b88-a7b2-bc941e4c8f9d
            - generic [ref=e99]:
              - img "Introducción a React 19" [ref=e101]
              - generic [ref=e102]: Programación
              - heading "Introducción a React 19" [level=3] [ref=e103]
              - paragraph [ref=e104]: Aprende los fundamentos de React, hooks, y cómo construir aplicaciones modernas con la última versió...
              - generic [ref=e105]: S/ 49.99
          - link "Deep Learning Ciencia de Datos Deep Learning Curso sobre aprendizaje profundo descifrando la caja negra de las redes neuronales S/ 500" [ref=e106] [cursor=pointer]:
            - /url: /courses/54a5fc2d-c8af-47ee-9e99-01ce560d62d3
            - generic [ref=e107]:
              - img "Deep Learning" [ref=e109]
              - generic [ref=e110]: Ciencia de Datos
              - heading "Deep Learning" [level=3] [ref=e111]
              - paragraph [ref=e112]: Curso sobre aprendizaje profundo descifrando la caja negra de las redes neuronales
              - generic [ref=e113]: S/ 500
          - link "AI Engineer Programación AI Engineer Descubre los nuevas habilidades en el mundo de la IA aprendiendo MCP, RAGs, LLMs S/ 600" [ref=e114] [cursor=pointer]:
            - /url: /courses/eea62421-27fd-45ce-83fd-15f6cf7cd666
            - generic [ref=e115]:
              - img "AI Engineer" [ref=e117]
              - generic [ref=e118]: Programación
              - heading "AI Engineer" [level=3] [ref=e119]
              - paragraph [ref=e120]: Descubre los nuevas habilidades en el mundo de la IA aprendiendo MCP, RAGs, LLMs
              - generic [ref=e121]: S/ 600
  - button "Abrir asistente Edy" [ref=e122] [cursor=pointer]: 💬
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Suite de validación de UI - Verifica que la interfaz visual de la plataforma
  5   |  * se renderiza correctamente en todos los navegadores y resoluciones.
  6   |  */
  7   | 
  8   | test.describe('EdTech - Validación de UI', () => {
  9   |   /**
  10  |    * Valida la navbar y navegación global
  11  |    */
  12  |   test('Navbar: estructura y navegación', async ({ page }) => {
> 13  |     await page.goto('/');
      |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  14  | 
  15  |     // Verifica que la navbar existe
  16  |     const navbar = page.locator('nav, header, [role="navigation"]').first();
  17  |     await expect(navbar).toBeVisible();
  18  | 
  19  |     // Verifica que hay un logo/brand
  20  |     const brand = page.locator('[class*="nav-brand"], [class*="logo"], [class*="brand"]').first();
  21  |     await expect(brand).toBeVisible();
  22  | 
  23  |     // Verifica que hay links de navegación
  24  |     const navLinks = page.locator('nav a, header a, [role="navigation"] a');
  25  |     const linkCount = await navLinks.count();
  26  |     expect(linkCount).toBeGreaterThan(0);
  27  | 
  28  |     // Verifica que los links son clickeables
  29  |     const firstLink = navLinks.first();
  30  |     await expect(firstLink).toBeVisible();
  31  |     const href = await firstLink.getAttribute('href');
  32  |     expect(href).toBeTruthy();
  33  |   });
  34  | 
  35  |   /**
  36  |    * Valida la página home (hero + catálogo)
  37  |    */
  38  |   test('Home: layout y componentes principales', async ({ page }) => {
  39  |     await page.goto('/');
  40  | 
  41  |     // 1. Verifica el título principal
  42  |     const mainHeading = page.locator('h1').first();
  43  |     await expect(mainHeading).toBeVisible();
  44  |     const headingText = await mainHeading.textContent();
  45  |     expect(headingText).toBeTruthy();
  46  | 
  47  |     // 2. Verifica la sección de búsqueda
  48  |     const searchSection = page.locator('h1', { hasText: /Explorar|Buscar|Search/i });
  49  |     await expect(searchSection).toBeVisible();
  50  | 
  51  |     // 3. Verifica que hay un input de búsqueda
  52  |     const searchInput = page.locator('input[type="text"]').first();
  53  |     await expect(searchInput).toBeVisible();
  54  |     const placeholder = await searchInput.getAttribute('placeholder');
  55  |     expect(placeholder).toBeTruthy();
  56  | 
  57  |     // 4. Verifica la sección del catálogo
  58  |     const catalogHeading = page.locator('h2', { hasText: /Catálogo|Cursos/i });
  59  |     await expect(catalogHeading).toBeVisible();
  60  | 
  61  |     // 5. Verifica que hay cards de cursos
  62  |     const courseLinks = page.locator('a[href*="/courses/"]');
  63  |     const courseCount = await courseLinks.count();
  64  |     expect(courseCount).toBeGreaterThan(0);
  65  | 
  66  |     // 6. Verifica que hay al menos una imagen de curso
  67  |     const courseImages = page.locator('img').filter({ hasText: /curso|course|class|class/i });
  68  |     const visibleImages = courseImages.first();
  69  |     const isImageVisible = await visibleImages.isVisible().catch(() => false);
  70  |     if (isImageVisible) {
  71  |       await expect(visibleImages).toHaveAttribute('alt');
  72  |     }
  73  |   });
  74  | 
  75  |   /**
  76  |    * Valida el widget Edy (chatbot)
  77  |    */
  78  |   test('Widget Edy: botón y accesibilidad', async ({ page }) => {
  79  |     await page.goto('/');
  80  | 
  81  |     // Verifica que existe el botón FAB del chatbot
  82  |     const edyButton = page.locator('button[aria-label*="Abrir"]');
  83  |     await expect(edyButton).toBeVisible();
  84  | 
  85  |     // Verifica posición fija (debe estar en la esquina)
  86  |     const edyButtonBox = await edyButton.boundingBox();
  87  |     expect(edyButtonBox).toBeTruthy();
  88  |     if (edyButtonBox) {
  89  |       // El botón debe estar en la parte inferior derecha
  90  |       expect(edyButtonBox.x).toBeGreaterThan(page.viewportSize()?.width! / 2 - 100);
  91  |       expect(edyButtonBox.y).toBeGreaterThan(page.viewportSize()?.height! / 2 - 100);
  92  |     }
  93  | 
  94  |     // Verifica que el aria-label es descriptivo
  95  |     const ariaLabel = await edyButton.getAttribute('aria-label');
  96  |     expect(ariaLabel?.toLowerCase()).toContain('edy');
  97  |   });
  98  | 
  99  |   /**
  100 |    * Valida colores y tipografía
  101 |    */
  102 |   test('Estilos: colores y tipografía', async ({ page }) => {
  103 |     await page.goto('/');
  104 | 
  105 |     // Verifica que los textos se renderizan con tamaño legible
  106 |     const headings = page.locator('h1, h2, h3');
  107 |     const headingCount = await headings.count();
  108 |     expect(headingCount).toBeGreaterThan(0);
  109 | 
  110 |     // Verifica que hay párrafos/texto de descripción
  111 |     const paragraphs = page.locator('p, span[class*="desc"], [class*="description"]');
  112 |     const textElements = await paragraphs.count();
  113 |     expect(textElements).toBeGreaterThan(0);
```