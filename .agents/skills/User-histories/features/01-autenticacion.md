# Feature: Autenticación de Usuarios

## Historia 1 — Registro de cuenta

Como persona interesada en aprender o enseñar en la plataforma,
quiero registrarme con mi correo y contraseña,
para tener una cuenta que me permita acceder a los cursos y funcionalidades según mi rol.

### Criterios de aceptación

Escenario: Registro exitoso como estudiante
  Dado que soy un visitante sin cuenta
  Cuando completo el formulario de registro con correo y contraseña válidos
  Entonces se crea mi perfil con rol "student" automáticamente
  Y soy redirigido al dashboard

Escenario: Correo ya registrado
  Dado que intento registrarme con un correo existente
  Cuando envío el formulario
  Entonces veo un mensaje de error indicando que el correo ya está en uso
  Y no se crea una cuenta duplicada

Escenario: Datos inválidos
  Dado que ingreso una contraseña demasiado corta o un correo malformado
  Cuando intento enviar el formulario
  Entonces veo mensajes de validación específicos por campo
  Y el formulario no se envía

---

## Historia 2 — Inicio de sesión

Como usuario registrado,
quiero iniciar sesión con mi correo y contraseña,
para acceder a mi dashboard y a los cursos en los que estoy inscrito.

### Criterios de aceptación

Escenario: Login exitoso
  Dado que tengo una cuenta registrada
  Cuando ingreso mis credenciales correctas
  Entonces soy redirigido al dashboard
  Y la Navbar muestra mi estado de sesión activo

Escenario: Credenciales incorrectas
  Dado que ingreso una contraseña errónea
  Cuando intento iniciar sesión
  Entonces veo un mensaje de error de autenticación
  Y permanezco en la pantalla de login

Escenario: Cierre de sesión
  Dado que tengo una sesión activa
  Cuando hago clic en "Cerrar sesión" en la Navbar
  Entonces se destruye mi sesión
  Y soy redirigido a la página de inicio como visitante
