# E2E Tests - EdTech Platform

Suite de pruebas end-to-end con Playwright para validar los flujos principales de la plataforma.

## Estructura

```
e2e/
├── global-setup.ts                          # Configuración global - autentica usuarios
├── edtech-flujo.spec.ts                     # Flujos básicos (visitante, navegación)
├── edtech-instructor-estudiante.spec.ts     # Flujos instructor → estudiante
├── ui-validation.spec.ts                    # Validación de UI
├── .auth/                                   # StorageState de autenticación (git-ignored)
│   ├── instructor.json                      # Estado autenticado del instructor
│   └── estudiante.json                      # Estado autenticado del estudiante
└── README.md
```

## Configuración

### 1. Usuarios de Prueba

**Instructor:**
- Email: `magis.ai.good@gmail.com`
- Contraseña: `123456`
- Rol: Instructor (puede crear y publicar cursos)

**Estudiante:**
- Email: `jeffersonquispep@gmail.com`
- Contraseña: `123456`
- Rol: Estudiante (puede inscribirse en cursos)

### 2. Global Setup

El archivo `global-setup.ts` se ejecuta automáticamente antes de las pruebas:
1. Autentica al usuario instructor
2. Autentica al usuario estudiante
3. Guarda el `storageState` de cada usuario en `e2e/.auth/`

Los archivos de estado se reutilizan en los tests usando:
```typescript
test.use({ storageState: 'e2e/.auth/instructor.json' });
test.use({ storageState: 'e2e/.auth/estudiante.json' });
```

## Ejecución

### Ejecutar todas las pruebas
```bash
npx playwright test
```

### Ejecutar suite específica
```bash
# Solo flujos E2E
npx playwright test e2e/edtech-flujo.spec.ts

# Solo flujos instructor-estudiante
npx playwright test e2e/edtech-instructor-estudiante.spec.ts

# Solo validación de UI
npx playwright test e2e/ui-validation.spec.ts
```

### Modo debug
```bash
npx playwright test --debug
```

### Modo headed (ver navegador)
```bash
npx playwright test --headed
```

### Ejecutar en navegador específico
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Ver reporte HTML
```bash
npx playwright show-report
```

## Flujos Implementados

### 1. Flujos Básicos (`edtech-flujo.spec.ts`)
- **Visitante**: Navega catálogo, abre chatbot Edy, hace preguntas
- **Catálogo**: Verifica visibilidad y estructura

### 2. Flujos Instructor → Estudiante (`edtech-instructor-estudiante.spec.ts`)

**Flujo 1: Instructor crea y publica curso**
1. Login como instructor
2. Accede al panel (dashboard)
3. Crea nuevo curso con:
   - Título (único por timestamp)
   - Descripción
   - Categoría
   - Precio
4. Publica el curso
5. Verifica que aparece en catálogo público

**Flujo 2: Estudiante busca e inscribe**
1. Login como estudiante
2. Busca el curso creado
3. Navega a detalles del curso
4. Se inscribe
5. Verifica que aparece en su panel de cursos inscritos

**Flujo 3: Verificación**
- Curso visible en catálogo público para visitantes

## Data-TestIds Utilizados

### Crear Curso
```typescript
data-testid="create-course-form"        // Formulario
data-testid="course-title-input"        // Input título
data-testid="course-description-input"  // Input descripción
data-testid="course-category-select"    // Select categoría
data-testid="course-price-input"        // Input precio
data-testid="create-course-button"      // Botón crear
```

### Dashboard
```typescript
data-testid="instructor-courses-list"    // Listado de cursos del instructor
data-testid="course-card-${id}"          // Card individual de curso
data-testid="publish-button-${id}"       // Botón publicar
data-testid="student-enrolled-courses"   // Listado de cursos inscritos
data-testid="enrolled-course-${id}"      // Card de curso inscrito
```

### Inscribirse
```typescript
data-testid="enroll-button"              // Botón de inscribirse
```

## Selectores Usados

### getByRole
```typescript
page.getByRole('button', { name: /crear/i })
page.getByRole('heading', { name: /panel/i })
page.getByRole('link', { name: /inscribirse/i })
```

### getByTestId
```typescript
page.getByTestId('create-course-form')
page.getByTestId('enroll-button')
```

### getByLabel
```typescript
page.getByLabel('Título')
page.getByLabel('Correo electrónico')
```

### getByPlaceholder
```typescript
page.getByPlaceholder(/buscar/i)
```

## Esperas Explícitas

Las pruebas usan esperas explícitas en lugar de sleeps:

```typescript
// Esperar a elemento visible
await expect(element).toBeVisible({ timeout: 5000 });

// Esperar a URL
await page.waitForURL(/\/dashboard/, { timeout: 10000 });

// Esperar a red
await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

// Esperar a elemento con tiempo personalizado
await page.waitForLoadState('domcontentloaded');
```

## Variables de Entorno

```bash
# URL base (por defecto http://localhost:3000)
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# Modo headed
HEADED=true

# Proyecto específico
--project=chromium
```

## Troubleshooting

### "Usuarios no autenticados"
- Verifica que los usuarios existen en Supabase
- Comprueba que las credenciales son correctas
- Ejecuta `global-setup.ts` manualmente:
  ```bash
  npx ts-node e2e/global-setup.ts
  ```

### "StorageState no encontrado"
- Verifica que `e2e/.auth/` existe
- Asegúrate de ejecutar `npx playwright test` (ejecuta global-setup automáticamente)
- Comprueba permisos de escritura en `e2e/.auth/`

### "Elemento no encontrado"
- Verifica el data-testid correcto
- Aumenta el timeout
- Usa `--debug` para inspeccionar en vivo

### "Red lenta"
- Aumenta timeouts en `waitForLoadState`
- Usa `--headed` para ver qué está ocurriendo
- Verifica que el servidor está corriendo en port 3000

## CI/CD

Para ejecutar en CI/CD:

```yaml
- name: Run E2E tests
  run: |
    npx playwright install --with-deps
    npm run test:e2e
```

## Performance

- Global setup: ~10-15 segundos (se ejecuta 1 sola vez)
- Flujos básicos: ~30 segundos (3 navegadores)
- Flujos instructor-estudiante: ~60 segundos (serial, 3 navegadores)
- Total: ~2-3 minutos (incluye UI validation)

## Próximas Mejoras

- [ ] Agregar tests de error handling (credenciales inválidas)
- [ ] Agregar tests de edge cases (títulos largos, precios altos)
- [ ] Agregar visual regression testing
- [ ] Performance testing (Lighthouse)
- [ ] Accesibilidad testing (axe-core)
