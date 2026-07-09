# navbar-search Specification

## Purpose

Búsqueda de cursos accesible desde la Navbar en cualquier página de la plataforma, con autocompletado en tiempo real y redirección a resultados en la home.

## Requirements

### Requirement: Buscador visible en la Navbar
El sistema SHALL mostrar un campo de búsqueda de cursos en la Navbar en todas las páginas de la plataforma, excepto dentro del iframe del agente de voz (`/agente-edy`).

#### Scenario: Buscador visible en cualquier página
- **WHEN** el usuario (visitante o estudiante autenticado) navega a cualquier página de la plataforma (dashboard, detalle de curso, lección)
- **THEN** ve un campo de búsqueda o ícono de lupa en la Navbar

#### Scenario: Buscador oculto en el agente de voz
- **WHEN** el usuario está en una página bajo `/agente-edy`
- **THEN** la Navbar (y por tanto el buscador) no se renderiza

### Requirement: Búsqueda con redirección a resultados
El sistema SHALL redirigir al usuario a la página principal con el término de búsqueda aplicado cuando envía una búsqueda desde la Navbar.

#### Scenario: Envío de búsqueda con Enter o ícono
- **WHEN** el usuario escribe un término en el campo de búsqueda de la Navbar y presiona Enter o hace clic en el ícono de búsqueda
- **THEN** es redirigido a `/?q=<término>`
- **AND** la página principal muestra los cursos filtrados por ese término al cargar

#### Scenario: Búsqueda vacía no dispara acción
- **WHEN** el usuario intenta enviar la búsqueda con el campo vacío (Enter o clic en el ícono)
- **THEN** no se realiza ninguna búsqueda ni redirección

### Requirement: Autocompletado con sugerencias
El sistema SHALL mostrar un dropdown de sugerencias de cursos mientras el usuario escribe en el campo de búsqueda de la Navbar, tras al menos 2 caracteres.

#### Scenario: Sugerencias aparecen tras 2+ caracteres
- **WHEN** el usuario escribe al menos 2 caracteres en el campo de búsqueda de la Navbar
- **THEN** aparece un dropdown con hasta 5 cursos relevantes, obtenidos de `POST /api/courses/search` con `limit=5`

#### Scenario: Clic en una sugerencia navega al curso
- **WHEN** el usuario hace clic en una sugerencia del dropdown
- **THEN** es redirigido directamente a `/courses/[id]` del curso seleccionado
- **AND** el dropdown se cierra

#### Scenario: Sin coincidencias
- **WHEN** el término escrito no coincide con ningún curso publicado
- **THEN** el dropdown muestra el mensaje "No se encontraron cursos" en lugar de quedar vacío

#### Scenario: Cierre del dropdown al perder foco o presionar Escape
- **WHEN** el usuario hace clic fuera del campo de búsqueda o presiona la tecla Escape mientras el dropdown está abierto
- **THEN** el dropdown de sugerencias se cierra
