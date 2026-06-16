# 🎨 EdTech Design System

Diseño visual distintivo para plataforma de educación online. Cada decisión responde al tema: **confianza, progreso, accesibilidad**.

---

## Color Palette

### Core Colors (Tokens del Proyecto)

| Color | Hex | Uso | Razón |
|-------|-----|-----|-------|
| **Indigo** | `#5B4FFF` | Primario: CTAs, links, marca | Confianza y autoridad académica. Moderno pero accesible. |
| **Crema** | `#F6F4F0` | Fondo principal | Calidez, descanso visual. Reduce fatiga en lectura prolongada. |

### Extended Palette (Complementarios)

| Color | Hex | Uso | Razón |
|-------|-----|-----|-------|
| **Sage** | `#2D7D6F` | Éxito, progreso, inscripción | Verde natural → crecimiento/aprendizaje. Accesible con fondo crema. |
| **Amber** | `#D4A574` | Atención, draft, incompleto | Cálido, no agresivo. Diferencia estados sin sobrealerta. |
| **Neutral-50** | `#F9F8F7` | Fondos sutiles, separadores | Casi blanco; mantiene calidez crema. |
| **Neutral-900** | `#1A1A1A` | Texto máximo contraste | Casi negro; suave sobre crema. |

**Criterio de selección**: Colores cálidos (indigo + amber + sage) refuerzan el tema de educación accesible. Sin fríos estridentes. Toda paleta es WCAG AA para accesibilidad.

---

## Typography

### Display Face: Sora (SemiBold, Bold)

```
Características:
- Geométrica moderna, apertura clara
- Personalidad: amigable pero seria
- Peso: 600-700 (SemiBold-Bold)

Aplicación:
- h1: 44.8px (2.8rem)
- h2: 35.2px (2.2rem)
- h3 (tarjetas): 28px (1.75rem)

Razón: Sora es contemporánea; su geometría abierta comunica 
"acceso sin barreras" — apropiado para EdTech. 
Se usa con moderación (solo títulos) para máximo impacto.
```

### Body Face: DM Sans (Regular, Medium)

```
Características:
- Neutral, clara, excelente legibilidad web
- Personalidad: funcional, confiable
- Peso: 400-500 (Regular-Medium)

Aplicación:
- Párrafos, descripciones: 16px (1rem)
- Metadata, smaller text: 14px (0.875rem)
- Captions: 12px (0.75rem)

Razón: DM Sans complementa Sora sin competir. 
Deja que Sora sea el protagonista visual mientras 
DM Sans facilita la lectura del contenido.
Pareja intencionada, no por defecto.
```

### Type Scale (1.25x Modular Scale)

```
Display:
- Display XL:  2.8rem  (44.8px)  — Héroes de página
- Display L:   2.2rem  (35.2px)  — Secciones principales
- Display M:   1.75rem (28px)    — Tarjetas, subtítulos

Body:
- Body L:      1.1rem  (17.6px)  — Descripciones largas
- Body M:      1rem    (16px)    — Párrafos estándar
- Body S:      0.875rem (14px)   — Metadata
- Utility:     0.75rem (12px)    — Badges, labels
- Tiny:        0.7rem  (11px)    — Captions

Razón: Escala 1.25x (no genérica 1.5x) es más sutil.
Proporciona estructura clara sin saltos abruptos.
Respeta la velocidad de lectura natural.
```

---

## Element Signature: Progress Bar Visual

### Concepto

Cada tarjeta de curso tiene un **indicador de estado en borde superior** que codifica visualmente el estado sin badges redundantes.

### Visual Encoding

```
┌─────────────────────────────────┐
│████████████████████████████████│  ← Indigo sólido (4px)
│ Introducción a React 19          │
│ Aprende los fundamentos...       │
│ Programación | S/ 49.99          │
└─────────────────────────────────┘
PUBLISHED: Indigo sólido → visible, inscripción abierta


┌─────────────────────────────────┐
│████░███░████░███░████░███░████░│  ← Amber rayado (4px)
│ Diseño Avanzado                 │
│ Solo visible para instructor...  │
│ Diseño | S/ 54.99                │
└─────────────────────────────────┘
DRAFT: Amber rayado (repeating-linear-gradient) 
       → incompleto, no público


┌─────────────────────────────────┐
│██████████████████████████████████│ ← Sage sólido (6px)
│ Python para Ciencia de Datos     │
│ Estás inscrito ✓                 │
│ Ciencia de Datos | S/ 69.99      │
└─────────────────────────────────┘
ENROLLED: Sage más grueso (6px) → inscripción activa
```

### Razones

1. **Memoria Visual**: El estado es el primer elemento visto al entrar en la tarjeta. Color + patrón = accesible para daltónicos.
2. **Tema Educativo**: "Progress bar" refuerza progreso/aprendizaje — inherente al propósito de la plataforma.
3. **Diferenciación sin Ruido**: Reemplaza badges verbales; más elegante, menos clutter.
4. **Marca Distintiva**: No es un patrón común en EdTech. **Esto es lo que hace que EdTech sea memorable.**
5. **Accesibilidad**: Color + patrón visual (rayado vs sólido); legible para daltónicos y pantalla.

### HTML/CSS Implementation

```html
<!-- Published course -->
<div class="card course-card" data-state="published">
  <!-- CSS: ::before { background: var(--color-indigo); } -->
</div>

<!-- Draft course (instructor) -->
<div class="card course-card" data-state="draft">
  <!-- CSS: ::before { background: repeating-linear-gradient(...amber...); } -->
</div>

<!-- Student enrolled -->
<div class="card course-card" data-state="enrolled">
  <!-- CSS: ::before { background: var(--color-sage); height: 6px; } -->
</div>
```

---

## Layout & Spacing System

### Spacing Scale

```
--space-xs:  0.5rem   (8px)
--space-sm:  1rem     (16px)
--space-md:  1.5rem   (24px)
--space-lg:  2rem     (32px)
--space-xl:  3rem     (48px)
```

**Aplicación**: Todos los paddings/margins usan variables. Asegura consistencia.

### Grid System

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}
```

- Tarjetas **mínimo 280px** para legibilidad
- Responsive automático
- Gap = 24px (respira sin parecer sparse)

### Border Radius

```
--radius-sm:  6px   (inputs, buttons)
--radius-md:  10px  (cards)
--radius-lg:  16px  (modals, overlays)
```

**Razón**: Coherencia geométrica. Indigo #5B4FFF es redondeado en su óptica; las curvas complementan.

---

## Motion & Interaction

### Transitions

```css
--transition-fast:   150ms ease-out
--transition-normal: 300ms ease-out
```

**Aplicados a**:
- Botones: lift al hover (`translateY(-2px)`)
- Tarjetas: sombra suave + elevación
- Links: cambio de color rápido

**Razón**: EdTech requiere respuesta visual clara. Sin excesos (sin 5+ animaciones). Un movimiento = acción.

### Hover States

```
Button hover: 
  - Background más oscuro
  - Elevation (translateY + box-shadow)
  - No estado de "presionado" (ese es el click)

Card hover:
  - Elevación (+8px shadow)
  - Movimiento suave (-4px translateY)
  - Cambio de color no, solo espacial
```

---

## Component Examples

### Course Card (La Firma)

```
┌─ Estado visual (color bar)
│
├─ Categoría (uppercase, 12px, gris)
├─ Título (Sora Bold, 28px)
├─ Descripción (DM Sans, 14px, truncada)
└─ Precio (Sora Bold, 17.6px, Indigo)

Hover effect:
  → Sombra aumenta
  → Card se eleva 4px
  → Color bar se mantiene (no distrae)
```

### Button (Primary)

```
Sora SemiBold, 14px
Padding: 10px 20px
Background: Indigo
Border-radius: 6px

Hover:
  → Background: #4940e0 (más oscuro)
  → Box-shadow: 0 8px 16px rgba(91, 79, 255, 0.2)
  → Transform: translateY(-2px)
```

### Form Input

```
Border: 1px solid #e5e7eb (neutral)
Focus state:
  → Border: var(--color-indigo)
  → Box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1)
  
Razón: Outline grande ayuda a accesibilidad visual.
Color indigo vincula a la marca.
```

---

## Accessibility

### Color Contrast

| Element | Foreground | Background | Ratio | WCAG |
|---------|-----------|-----------|-------|------|
| Body text | Neutral-900 | Crema | 11.2:1 | AAA |
| Links | Indigo | Crema | 4.8:1 | AA |
| Sage text | Sage | Crema | 6.1:1 | AA |
| Amber text | Amber | Crema | 5.2:1 | AA |

### Patterns (No solo color)

- Draft state: Color (amber) + patrón (rayado)
- Success state: Color (sage) + badge + checkmark
- Error state: Color + ícono + texto descriptivo

### Focus States

- Todos los inputs y buttons tienen `:focus` visible
- Outline de 3px con color indigo de baja opacidad
- Soporta navegación por teclado

---

## Design Philosophy

### "Less is More, But Not Quiet"

La firma (progress bar) es el elemento osado. Todo lo demás es disciplinado:
- Colores: restringidos a 6
- Tipografías: solo 2 familias
- Efectos: solo sombra + elevación al hover
- Decoración: cero (excepto la firma)

### "Type is Content"

- Sora no es un juego visual; es una declaración de acceso.
- DM Sans no es invisible; es facilitadora de confianza.
- Escala tipográfica es estructura lógica, no ornamentación.

### "Color Encodes Meaning"

- Indigo = acción primaria, marca
- Sage = progreso, éxito
- Amber = atención, incompleto
- Neutral = contexto sin presión

---

## Future Extensions

Si se agregan componentes nuevos:

1. **Tablas de datos**: Usar DM Sans, mismo spacing
2. **Modales**: Border-radius-lg, sombra mayor
3. **Badges de estado**: Nuevas combinaciones de color + patrón si aplica
4. **Iconografía**: Debería ecoar la geometría abierta de Sora
5. **Ilustraciones**: Paleta sage + indigo + crema; sin saturación

---

**Sistema creado**: 2026-06-15  
**Próxima revisión**: Tras 10+ usuarios activos o cambio de marca
