# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edtech-flujo.spec.ts >> EdTech - Flujos Principales >> Visitante: navega catálogo y pregunta a Edy
- Location: e2e\edtech-flujo.spec.ts:21:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('h2').filter({ hasText: /Catálogo Completo/i })
Expected: visible
Received: undefined

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h2').filter({ hasText: /Catálogo Completo/i })

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
          - 'textbox "Buscar cursos... (ej: Python, Machine Learning, Diseño)" [active] [ref=e16]'
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
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Suite de pruebas E2E para flujos principales de EdTech:
  5   |  * 1. Visitante sin sesión: navega catálogo + interactúa con Edy
  6   |  * (Posteriormente: login + inscripción; instructor + crear curso)
  7   |  */
  8   | 
  9   | test.describe('EdTech - Flujos Principales', () => {
  10  |   /**
  11  |    * Flujo 1: Visitante sin sesión
  12  |    * - Abre la página
  13  |    * - Navega el catálogo
  14  |    * - Abre el chatbot Edy
  15  |    * - Pregunta '¿que cursos tienen para principiantes?'
  16  |    * - Verifica que responde
  17  |    *
  18  |    * NOTA: Este test requiere que el servidor de agente Edy esté corriendo.
  19  |    * Si no está disponible, usa @skip.
  20  |    */
  21  |   test('Visitante: navega catálogo y pregunta a Edy', async ({ page, context }) => {
  22  |     // 1. Visitante abre la página
  23  |     await page.goto('/');
  24  |     await expect(page).toHaveTitle(/EdTech/i); // EdTech Platform
  25  | 
  26  |     // 2. Verifica que ve el catálogo
  27  |     const catalogoHeading = page.locator('h2', { hasText: /Catálogo Completo/i });
> 28  |     await expect(catalogoHeading).toBeVisible();
      |                                   ^ Error: expect(locator).toBeVisible() failed
  29  | 
  30  |     // 3. Verifica que hay cursos visibles (al menos uno)
  31  |     const firstCourseLink = page.locator('a[href*="/courses/"]').first();
  32  |     await expect(firstCourseLink).toBeVisible();
  33  | 
  34  |     // 4. Busca el botón del widget Edy (FAB flotante)
  35  |     const edyButton = page.locator('button[aria-label*="Abrir"]');
  36  | 
  37  |     // Espera a que el botón sea interactuable
  38  |     await expect(edyButton).toBeVisible({ timeout: 5000 });
  39  | 
  40  |     // 5. Verifica que el botón tiene propiedades de accesibilidad
  41  |     const ariaLabel = await edyButton.getAttribute('aria-label');
  42  |     expect(ariaLabel).toContain('Edy');
  43  | 
  44  |     // 6. Hace click en el botón para abrir el widget
  45  |     await edyButton.click();
  46  |     await page.waitForTimeout(800); // Pausa para animación
  47  | 
  48  |     // 8. Verifica que existe un iframe dentro del documento
  49  |     const edyIframe = page.locator('iframe').filter({ hasText: /Asistente|Edy/ }).first();
  50  | 
  51  |     // Opcional: si el agente Edy no está disponible, skip el resto
  52  |     const iframeVisible = await edyIframe.isVisible().catch(() => false);
  53  |     if (!iframeVisible) {
  54  |       test.skip();
  55  |     }
  56  | 
  57  |     await expect(edyIframe).toBeVisible({ timeout: 10000 });
  58  | 
  59  |     // 9. Obtiene el frame del iframe para interactuar con su contenido
  60  |     const frameLocator = page.frameLocator('iframe').filter({ hasText: /Asistente|Edy/ }).first();
  61  | 
  62  |     // 10. Espera a que la sala LiveKit se conecte y muestre el formulario de entrada
  63  |     // Puede mostrar estados como "Conectando…", "Iniciando…" o "Escuchando"
  64  |     const textInput = frameLocator.locator('input.edy-text-input');
  65  |     await expect(textInput).toBeVisible({ timeout: 15000 });
  66  | 
  67  |     // 11. Escribe la pregunta en el campo de texto
  68  |     const pregunta = '¿que cursos tienen para principiantes?';
  69  |     await textInput.fill(pregunta);
  70  |     await expect(textInput).toHaveValue(pregunta);
  71  | 
  72  |     // 12. Hace click en el botón de envío
  73  |     const sendButton = frameLocator.locator('button.edy-send');
  74  |     await expect(sendButton).toBeEnabled();
  75  |     await sendButton.click();
  76  | 
  77  |     // 13. Verifica que el mensaje del usuario apareció en el chat
  78  |     const userMessage = frameLocator.locator('div.edy-msg-user', { hasText: pregunta });
  79  |     await expect(userMessage).toBeVisible({ timeout: 5000 });
  80  | 
  81  |     // 14. Verifica que el input se limpió
  82  |     await expect(textInput).toHaveValue('');
  83  | 
  84  |     // 15. Espera una respuesta de Edy (con timeout de 30s para dar tiempo al agente)
  85  |     // Edy debe responder con uno o más mensajes
  86  |     const edyMessage = frameLocator.locator('div.edy-msg-edy');
  87  |     await expect(edyMessage.first()).toBeVisible({ timeout: 30000 });
  88  | 
  89  |     // 16. Verifica que hay contenido en la respuesta (no está vacía)
  90  |     const responseText = await edyMessage.first().textContent();
  91  |     expect(responseText).toBeTruthy();
  92  |     expect(responseText?.length).toBeGreaterThan(0);
  93  | 
  94  |     // 17. Verifica que la conversación se ve natural (más de un mensaje visible)
  95  |     const allMessages = frameLocator.locator('div.edy-msg');
  96  |     const messageCount = await allMessages.count();
  97  |     expect(messageCount).toBeGreaterThanOrEqual(2); // Al menos el usuario + Edy
  98  |   });
  99  | 
  100 |   /**
  101 |    * Test auxiliar: verifica que el widget Edy tiene accesibilidad básica
  102 |    */
  103 |   test('Widget Edy: accesibilidad (a11y)', async ({ page }) => {
  104 |     await page.goto('/');
  105 | 
  106 |     // Busca el botón FAB
  107 |     const edyButton = page.locator('button[aria-label*="Abrir"]');
  108 |     await expect(edyButton).toBeVisible({ timeout: 5000 });
  109 | 
  110 |     // Verifica que tiene aria-label descriptivo
  111 |     const ariaLabel = await edyButton.getAttribute('aria-label');
  112 |     expect(ariaLabel).toBeTruthy();
  113 |     expect(ariaLabel).toContain('Edy');
  114 |     expect(ariaLabel).toContain('Abrir');
  115 | 
  116 |     // Verifica que es interactuable (puede ser activado con click)
  117 |     await edyButton.click();
  118 |     await page.waitForTimeout(500);
  119 | 
  120 |     // Verifica que el button es accesible (tiene un aria-label) y es clickeable
  121 |     expect(ariaLabel).toBeTruthy();
  122 |   });
  123 | 
  124 |   /**
  125 |    * Test auxiliar: verifica que el catálogo es navegable sin sesión
  126 |    */
  127 |   test('Catálogo: visible para visitante sin sesión', async ({ page }) => {
  128 |     await page.goto('/');
```