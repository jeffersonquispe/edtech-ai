# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edtech-instructor-estudiante.spec.ts >> EdTech - Flujos Instructor → Estudiante >> Instructor: crear y publicar curso >> flujo completo: crear y publicar curso
- Location: e2e\edtech-instructor-estudiante.spec.ts:30:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/dashboard", waiting until "load"

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
    - heading "Mi panel" [level=1] [ref=e11]
    - heading "Mis cursos" [level=2] [ref=e12]
    - generic [ref=e13]:
      - generic [ref=e15]:
        - img "Machine Learning" [ref=e17]
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]:
              - link "Machine Learning" [ref=e21] [cursor=pointer]:
                - /url: /courses/d46e529e-d4cb-4a44-8ada-e90ebfd74db1
                - heading "Machine Learning" [level=3] [ref=e22]
              - text: Ciencia de Datos
            - generic [ref=e23]: published
          - paragraph [ref=e24]: IA Tradicional, Vision Computacional y NLP...
          - generic [ref=e26]: S/ 500
          - generic [ref=e28]:
            - button "Editar" [ref=e29] [cursor=pointer]
            - button "Eliminar" [ref=e30] [cursor=pointer]
      - generic [ref=e32]:
        - img "Claude Code" [ref=e34]
        - generic [ref=e35]:
          - generic [ref=e36]:
            - generic [ref=e37]:
              - link "Claude Code" [ref=e38] [cursor=pointer]:
                - /url: /courses/6813c543-8c06-4d8f-a951-d97946c1f073
                - heading "Claude Code" [level=3] [ref=e39]
              - text: Programación
            - generic [ref=e40]: published
          - paragraph [ref=e41]: Curso de IA Agéntica...
          - generic [ref=e43]: S/ 100
          - generic [ref=e45]:
            - button "Editar" [ref=e46] [cursor=pointer]
            - button "Eliminar" [ref=e47] [cursor=pointer]
      - generic [ref=e49]:
        - img "Estrategia de Marketing Digital" [ref=e51]
        - generic [ref=e52]:
          - generic [ref=e53]:
            - generic [ref=e54]:
              - link "Estrategia de Marketing Digital" [ref=e55] [cursor=pointer]:
                - /url: /courses/50008b64-59d5-478b-8128-cfbba46766f0
                - heading "Estrategia de Marketing Digital" [level=3] [ref=e56]
              - text: Marketing
            - generic [ref=e57]: published
          - paragraph [ref=e58]: SEO, SEM, redes sociales y email marketing. Todo lo que necesitas para dominar el marketing online....
          - generic [ref=e60]: S/ 59.99
          - generic [ref=e62]:
            - button "Editar" [ref=e63] [cursor=pointer]
            - button "Eliminar" [ref=e64] [cursor=pointer]
      - generic [ref=e66]:
        - img "Branding & Identidad Visual" [ref=e68]
        - generic [ref=e69]:
          - generic [ref=e70]:
            - generic [ref=e71]:
              - link "Branding & Identidad Visual" [ref=e72] [cursor=pointer]:
                - /url: /courses/0d73f28a-bb94-451f-a726-7b5d94f398f7
                - heading "Branding & Identidad Visual" [level=3] [ref=e73]
              - text: Diseño
            - generic [ref=e74]: published
          - paragraph [ref=e75]: Crea una identidad visual sólida para tu marca. Logo, paleta de colores, y guidelines....
          - generic [ref=e77]: S/ 54.99
          - generic [ref=e79]:
            - button "Editar" [ref=e80] [cursor=pointer]
            - button "Eliminar" [ref=e81] [cursor=pointer]
      - generic [ref=e83]:
        - img "Diseño UI/UX para principiantes" [ref=e85]
        - generic [ref=e86]:
          - generic [ref=e87]:
            - generic [ref=e88]:
              - link "Diseño UI/UX para principiantes" [ref=e89] [cursor=pointer]:
                - /url: /courses/d70c86aa-782d-49dc-9f9b-ce467e44e12f
                - heading "Diseño UI/UX para principiantes" [level=3] [ref=e90]
              - text: Diseño
            - generic [ref=e91]: published
          - paragraph [ref=e92]: Domina los principios de diseño, tipografía, color y user experience. Perfecto para diseñadores nova...
          - generic [ref=e94]: S/ 39.99
          - generic [ref=e96]:
            - button "Editar" [ref=e97] [cursor=pointer]
            - button "Eliminar" [ref=e98] [cursor=pointer]
      - generic [ref=e100]:
        - img "Emprenderismo 101" [ref=e102]
        - generic [ref=e103]:
          - generic [ref=e104]:
            - generic [ref=e105]:
              - link "Emprenderismo 101" [ref=e106] [cursor=pointer]:
                - /url: /courses/1c2dd6f7-ba21-445b-8b82-d452f8612c74
                - heading "Emprenderismo 101" [level=3] [ref=e107]
              - text: Negocios
            - generic [ref=e108]: published
          - paragraph [ref=e109]: "De la idea al negocio: plan de negocio, financiamiento, y cómo escalar tu startup...."
          - generic [ref=e111]: S/ 44.99
          - generic [ref=e113]:
            - button "Editar" [ref=e114] [cursor=pointer]
            - button "Eliminar" [ref=e115] [cursor=pointer]
      - generic [ref=e117]:
        - img "Advanced TypeScript Patterns" [ref=e119]
        - generic [ref=e120]:
          - generic [ref=e121]:
            - generic [ref=e122]:
              - link "Advanced TypeScript Patterns" [ref=e123] [cursor=pointer]:
                - /url: /courses/bb8c3778-012b-476a-a05e-759dc01480cb
                - heading "Advanced TypeScript Patterns" [level=3] [ref=e124]
              - text: Programación
            - generic [ref=e125]: published
          - paragraph [ref=e126]: Genéricos, decoradores, type guards y patrones avanzados. Para desarrolladores intermediate/senior....
          - generic [ref=e128]: S/ 79.99
          - generic [ref=e130]:
            - button "Editar" [ref=e131] [cursor=pointer]
            - button "Eliminar" [ref=e132] [cursor=pointer]
      - generic [ref=e134]:
        - img "Python para Ciencia de Datos" [ref=e136]
        - generic [ref=e137]:
          - generic [ref=e138]:
            - generic [ref=e139]:
              - link "Python para Ciencia de Datos" [ref=e140] [cursor=pointer]:
                - /url: /courses/faf57d0e-8763-4684-bf20-a5ede37db9e8
                - heading "Python para Ciencia de Datos" [level=3] [ref=e141]
              - text: Ciencia de Datos
            - generic [ref=e142]: published
          - paragraph [ref=e143]: Aprende Python, pandas, NumPy y Matplotlib. Conviértete en un analista de datos profesional....
          - generic [ref=e145]: S/ 69.99
          - generic [ref=e147]:
            - button "Editar" [ref=e148] [cursor=pointer]
            - button "Eliminar" [ref=e149] [cursor=pointer]
      - generic [ref=e151]:
        - img "Introducción a React 19" [ref=e153]
        - generic [ref=e154]:
          - generic [ref=e155]:
            - generic [ref=e156]:
              - link "Introducción a React 19" [ref=e157] [cursor=pointer]:
                - /url: /courses/81ac8302-bcbd-4b88-a7b2-bc941e4c8f9d
                - heading "Introducción a React 19" [level=3] [ref=e158]
              - text: Programación
            - generic [ref=e159]: published
          - paragraph [ref=e160]: Aprende los fundamentos de React, hooks, y cómo construir aplicaciones modernas con la última versió...
          - generic [ref=e162]: S/ 49.99
          - generic [ref=e164]:
            - button "Editar" [ref=e165] [cursor=pointer]
            - button "Eliminar" [ref=e166] [cursor=pointer]
      - generic [ref=e168]:
        - img "Deep Learning" [ref=e170]
        - generic [ref=e171]:
          - generic [ref=e172]:
            - generic [ref=e173]:
              - link "Deep Learning" [ref=e174] [cursor=pointer]:
                - /url: /courses/54a5fc2d-c8af-47ee-9e99-01ce560d62d3
                - heading "Deep Learning" [level=3] [ref=e175]
              - text: Ciencia de Datos
            - generic [ref=e176]: published
          - paragraph [ref=e177]: Curso sobre aprendizaje profundo descifrando la caja negra de las redes neuronales...
          - generic [ref=e179]: S/ 500
          - generic [ref=e181]:
            - button "Editar" [ref=e182] [cursor=pointer]
            - button "Eliminar" [ref=e183] [cursor=pointer]
      - generic [ref=e185]:
        - img "AI Engineer" [ref=e187]
        - generic [ref=e188]:
          - generic [ref=e189]:
            - generic [ref=e190]:
              - link "AI Engineer" [ref=e191] [cursor=pointer]:
                - /url: /courses/eea62421-27fd-45ce-83fd-15f6cf7cd666
                - heading "AI Engineer" [level=3] [ref=e192]
              - text: Programación
            - generic [ref=e193]: published
          - paragraph [ref=e194]: Descubre los nuevas habilidades en el mundo de la IA aprendiendo MCP, RAGs, LLMs...
          - generic [ref=e196]: S/ 600
          - generic [ref=e198]:
            - button "Editar" [ref=e199] [cursor=pointer]
            - button "Eliminar" [ref=e200] [cursor=pointer]
    - heading "Crear nuevo curso" [level=2] [ref=e201]
    - generic [ref=e203]:
      - generic [ref=e204]:
        - generic [ref=e205]: Título
        - textbox [ref=e206]
      - generic [ref=e207]:
        - generic [ref=e208]: Descripción
        - textbox [ref=e209]
      - generic [ref=e210]:
        - generic [ref=e211]: Categoría
        - combobox [ref=e212]:
          - option "Programación" [selected]
          - option "Diseño"
          - option "Negocios"
          - option "Marketing"
          - option "Ciencia de Datos"
      - generic [ref=e213]:
        - generic [ref=e214]: Precio (S/)
        - spinbutton [ref=e215]: "0"
      - button "Crear curso (borrador)" [ref=e216] [cursor=pointer]
  - button "Abrir asistente Edy" [ref=e217] [cursor=pointer]: 💬
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Suite E2E: Flujos Instructor → Estudiante
  5   |  *
  6   |  * Flujo 1: Instructor crea y publica un curso
  7   |  * Flujo 2: Estudiante busca, se inscribe y verifica inscripción
  8   |  *
  9   |  * Estos flujos están encadenados: el curso creado en flujo 1
  10  |  * debe ser encontrado y utilizable en flujo 2.
  11  |  */
  12  | 
  13  | // Datos del curso que crearemos
  14  | const NEW_COURSE_TITLE = `Curso Test ${Date.now()}`; // Título único por timestamp
  15  | const NEW_COURSE_DESC = 'Descripción completa del curso de prueba E2E para verificar el flujo instructor-estudiante.';
  16  | const NEW_COURSE_PRICE = '29.99';
  17  | 
  18  | test.describe.serial('EdTech - Flujos Instructor → Estudiante', () => {
  19  |   /**
  20  |    * FLUJO 1: INSTRUCTOR
  21  |    * 1. Login como instructor
  22  |    * 2. Accede al panel (dashboard)
  23  |    * 3. Crea un nuevo curso con datos específicos
  24  |    * 4. Publica el curso
  25  |    * 5. Verifica que el curso aparece en el catálogo público
  26  |    */
  27  |   test.describe('Instructor: crear y publicar curso', () => {
  28  |     test.use({ storageState: 'e2e/.auth/instructor.json' });
  29  | 
  30  |     test('flujo completo: crear y publicar curso', async ({ page }) => {
  31  |       // 1. Navega al home primero para asegurar que se cargue la sesión
  32  |       await page.goto('/');
  33  | 
  34  |       // 2. Navega al dashboard
> 35  |       await page.goto('/dashboard');
      |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  36  | 
  37  |       // Si se redirige a login, significa que la sesión no se cargó correctamente
  38  |       // Espera a que se cargue el dashboard o login
  39  |       await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  40  | 
  41  |       // Verifica que estamos en dashboard o login
  42  |       const url = page.url();
  43  |       if (url.includes('/login')) {
  44  |         // Si estamos en login, algo falló con la sesión
  45  |         throw new Error(`StorageState no se aplicó correctamente. URL: ${url}`);
  46  |       }
  47  |       await expect(page).toHaveURL(/\/dashboard/);
  48  | 
  49  |       // 2. Verifica que está en el panel del instructor
  50  |       const dashboardHeading = page.getByRole('heading', { name: /panel|mis cursos|dashboard/i }).first();
  51  |       await expect(dashboardHeading).toBeVisible();
  52  | 
  53  |       // 3. Busca el botón "Crear Curso" o "Nuevo Curso"
  54  |       const createCourseButton = page.getByRole('button', { name: /crear|nuevo|new/i }).first();
  55  |       await expect(createCourseButton).toBeVisible();
  56  | 
  57  |       // 4. Hace click para crear un nuevo curso
  58  |       await createCourseButton.click();
  59  | 
  60  |       // Espera a que se muestre el formulario
  61  |       await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  62  | 
  63  |       // 5. Llena el formulario de creación de curso usando data-testid
  64  |       // Título
  65  |       const titleInput = page.getByTestId('course-title-input');
  66  |       await expect(titleInput).toBeVisible();
  67  |       await titleInput.fill(NEW_COURSE_TITLE);
  68  | 
  69  |       // Descripción
  70  |       const descInput = page.getByTestId('course-description-input');
  71  |       await expect(descInput).toBeVisible();
  72  |       await descInput.fill(NEW_COURSE_DESC);
  73  | 
  74  |       // Categoría
  75  |       const categorySelect = page.getByTestId('course-category-select');
  76  |       await expect(categorySelect).toBeVisible();
  77  |       // Selecciona la primera categoría disponible (índice 0 es generalmente "Seleccionar")
  78  |       const options = categorySelect.locator('option');
  79  |       const optionCount = await options.count();
  80  |       if (optionCount > 1) {
  81  |         const firstCategoryValue = await options.nth(1).getAttribute('value');
  82  |         if (firstCategoryValue) {
  83  |           await categorySelect.selectOption(firstCategoryValue);
  84  |         }
  85  |       }
  86  | 
  87  |       // Precio
  88  |       const priceInput = page.getByTestId('course-price-input');
  89  |       await expect(priceInput).toBeVisible();
  90  |       await priceInput.fill(NEW_COURSE_PRICE);
  91  | 
  92  |       // 6. Verifica que el formulario está lleno
  93  |       const titleValue = await titleInput.inputValue();
  94  |       expect(titleValue).toBe(NEW_COURSE_TITLE);
  95  | 
  96  |       // 7. Busca y hace click en botón Crear usando data-testid
  97  |       const createButton = page.getByTestId('create-course-button');
  98  |       await expect(createButton).toBeVisible();
  99  | 
  100 |       console.log(`📝 Creando curso: ${NEW_COURSE_TITLE}`);
  101 |       await createButton.click();
  102 | 
  103 |       // Espera a que se guarde el curso
  104 |       console.log(`⏳ Esperando respuesta del servidor...`);
  105 |       await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
  106 |         console.log(`⚠️  Timeout en networkidle, continuando...`);
  107 |       });
  108 | 
  109 |       // Pequeña pausa para asegurar que el formulario se resetea
  110 |       await page.waitForTimeout(1000);
  111 | 
  112 |       // 8. Verifica que el curso aparece en el listado del instructor
  113 |       console.log(`🔍 Buscando curso en listado...`);
  114 |       const coursesList = page.getByTestId('instructor-courses-list');
  115 |       await expect(coursesList).toBeVisible({ timeout: 5000 });
  116 | 
  117 |       // Espera un poco más para que se renderice el nuevo curso
  118 |       await page.waitForTimeout(2000);
  119 | 
  120 |       const courseRow = page.getByText(NEW_COURSE_TITLE);
  121 |       console.log(`📋 Verificando si el curso aparece en el listado...`);
  122 |       await expect(courseRow.first()).toBeVisible({ timeout: 10000 });
  123 | 
  124 |       // 9. Busca y publica el curso (si está en draft)
  125 |       // Espera a que aparezca el botón de publicar
  126 |       // El botón de publicar debería estar visible si el curso está en draft
  127 |       // Intenta buscar un botón de publicar que esté cerca del curso
  128 |       const publishButtons = page.getByRole('button', { name: /publicar/i });
  129 |       const publishButton = publishButtons.first();
  130 | 
  131 |       if (await publishButton.isVisible().catch(() => false)) {
  132 |         await publishButton.click();
  133 |         await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  134 |       }
  135 | 
```