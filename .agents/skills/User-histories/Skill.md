---
name: user-stories
description: Redacta historias de usuario y criterios de aceptación claros, verificables y bien dimensionados, listos para refinamiento y desarrollo. Úsala siempre que el usuario diga "escribí una historia de usuario", "armá los criterios de aceptación", "necesito user stories para esta feature", "convertí este requerimiento en historias", "dividí este épico", "Given/When/Then para...", o describa una funcionalidad por construir y quiera expresarla como trabajo accionable para el equipo — aunque no diga "historia de usuario". Produce historias centradas en el valor para el usuario y criterios de aceptación que definen sin ambigüedad cuándo la historia está terminada.
---

# Historias de Usuario y Criterios de Aceptación

Una historia de usuario captura *qué* necesita un usuario y *por qué*, dejando el *cómo* para el equipo. No es una especificación: es una promesa de conversación. Su valor está en mantener el foco en el valor entregado a una persona real, no en tareas técnicas sueltas. Los criterios de aceptación son el contrato que dice, sin ambigüedad, cuándo esa historia está terminada y funcionando.

## La historia

Usá el formato de rol-objetivo-beneficio, porque obliga a nombrar a quién sirve el cambio y para qué:

```
Como [rol o tipo de usuario],
quiero [acción u objetivo],
para [beneficio o valor].
```

El "para" es la parte que más se omite y la más importante: si no podés articular el beneficio, quizás la historia no valga la pena, o estás describiendo una tarea técnica disfrazada. El rol debe ser una persona concreta ("comprador recurrente", "administrador de cuenta"), no "el usuario" genérico ni "el sistema".

**Ejemplo:**
Input: "Hay que agregar filtros a la búsqueda de productos."
Output:
> Como comprador que navega un catálogo grande,
> quiero filtrar los productos por categoría y rango de precio,
> para encontrar lo que busco sin revisar páginas de resultados irrelevantes.

## Qué hace buena a una historia: INVEST

Evaluá cada historia contra estos seis criterios:

- **Independiente** — Se puede desarrollar y entregar sin depender del orden de otras historias.
- **Negociable** — Describe la necesidad, no impone una solución cerrada. Deja espacio a la conversación.
- **Valiosa** — Entrega valor observable a un usuario o al negocio. Si nadie nota el cambio, revisá la historia.
- **Estimable** — El equipo entiende lo suficiente como para dimensionarla. Si no es estimable, falta refinamiento o hay que dividirla.
- **Small (pequeña)** — Cabe cómodamente en un sprint; idealmente unos pocos días. Las historias grandes se dividen.
- **Testeable** — Existen criterios de aceptación verificables. Si no podés escribir cómo probarla, no está lista.

## Criterios de aceptación

Definen las condiciones que deben cumplirse para considerar la historia completa. Buenos criterios son específicos, verificables y escritos desde la perspectiva del comportamiento observable — no de la implementación. Elegí el estilo según la historia:

### Estilo Gherkin (Given/When/Then)

Ideal para flujos con comportamiento condicional. Cada escenario es un caso concreto y probable de convertirse en un test:

```
Escenario: [nombre del caso]
  Dado [contexto/estado inicial]
  Cuando [acción del usuario o evento]
  Entonces [resultado esperado observable]
```

Escribí un escenario por camino relevante: el camino feliz, los casos borde y los de error. No te quedes solo con el happy path — ahí es donde un buen Tech Lead agrega valor.

**Ejemplo (para la historia de filtros de arriba):**
```
Escenario: Filtrar por categoría y precio
  Dado que estoy en la página de resultados de búsqueda
  Cuando selecciono la categoría "Calzado" y el rango de $50 a $100
  Entonces veo solo productos de calzado con precio entre $50 y $100
  Y el contador de resultados refleja la cantidad filtrada

Escenario: Filtro sin resultados
  Dado que apliqué un conjunto de filtros
  Cuando ninguna combinación de productos los cumple
  Entonces veo un mensaje de "sin resultados" y una opción para limpiar filtros
```

### Estilo lista de verificación

Ideal para reglas o requisitos discretos que no encajan en un flujo:

```
La historia está completa cuando:
- [ ] [condición verificable 1]
- [ ] [condición verificable 2]
- [ ] [condición de validación / error]
- [ ] [condición no funcional relevante: accesibilidad, rendimiento, etc.]
```

## Reglas para criterios que sirven

- **Verificables, no aspiracionales.** "La página carga rápido" no sirve; "la página responde en menos de 1s con 1000 productos" sí.
- **Comportamiento, no implementación.** Describí qué ve o logra el usuario, no qué tabla o servicio se toca.
- **Cubrí los caminos no felices.** Errores, validaciones, estados vacíos, permisos. Suelen ser la mitad del trabajo real.
- **Incluí lo no funcional cuando importa.** Accesibilidad, rendimiento, seguridad, compatibilidad — si es parte de "terminado", va como criterio.

## Criterios de aceptación vs Definition of Done

No los confundas. Los **criterios de aceptación** son específicos de *esta* historia (qué tiene que hacer). La **Definition of Done** es un estándar transversal que aplica a *todas* las historias (tests escritos, code review aprobado, documentación actualizada, desplegado a staging). No repitas la DoD en cada historia; mantenela aparte.

## Cómo dividir historias grandes (épicos)

Si una historia no cumple "Small" o "Testeable", dividila. Patrones útiles, en orden de preferencia: por pasos del flujo de trabajo, por reglas de negocio o variaciones, por tipo de dato o interfaz, por camino feliz primero y casos borde después, o por operaciones CRUD. Cada porción resultante debe seguir entregando valor por sí sola — nunca dividas en "capa de frontend" y "capa de backend", porque ninguna de las dos entrega valor sola.

## Antes de cerrar

Verificá: ¿la historia nombra un rol concreto y un beneficio real (el "para")?, ¿cumple INVEST, sobre todo "pequeña" y "testeable"?, ¿los criterios son verificables y describen comportamiento observable?, ¿cubriste errores y casos borde, no solo el camino feliz?, ¿separaste lo específico de la historia de la Definition of Done? Si no podés escribir un criterio de aceptación testeable, la historia todavía no está lista para desarrollo: falta refinarla o dividirla.