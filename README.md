# Invitación web — planificación técnica

Documento de planificación técnica. Registra los acuerdos actuales y deja señaladas las decisiones que siguen pendientes mientras se define el evento y su diseño.

## Objetivo

Crear una invitación web animada y personalizada que se pueda compartir por WhatsApp. Cada invitado abre su enlace, ve su invitación y confirma o declina su asistencia. La anfitriona administra manualmente la lista y consulta las respuestas desde una página privada. El proyecto debe funcionar con los planes gratuitos de Vercel y Supabase, sin presupuesto inicial.

## Propuesta de arquitectura

- **Frontend:** Astro con TypeScript. La página pública puede prerenderizarse y cargar interactividad solo donde hace falta, para que la invitación sea rápida incluso en móviles.
- **Interactividad:** componentes pequeños de JavaScript para animaciones, confirmación, música y estados del formulario. Elegiremos una librería de animación solo si el diseño lo necesita; primero conviene preferir CSS y Web Animations API.
- **Datos y API:** Supabase (Postgres y funciones/API) para guardar invitados y RSVP. Usar el nivel gratuito y vigilar sus límites de uso; evitar funciones o servicios de pago.
- **Administración:** ruta privada dentro del sitio, protegida con autenticación. Solo la anfitriona o personas autorizadas pueden crear, editar o eliminar invitados y consultar el listado completo.
- **Publicación:** Vercel para el sitio Astro y Supabase para la base de datos, ambos en sus planes gratuitos. Confirmar dominio: se puede comenzar con el subdominio gratuito de Vercel y conectar un dominio propio si ya se dispone de uno.

## Flujo de uso

1. La administradora inicia sesión y carga manualmente los nombres.
2. El sistema genera para cada invitado un enlace único, por ejemplo `https://dominio/invitacion/<codigo>`.
3. Desde administración se copia el enlace o se abre WhatsApp con un mensaje prellenado para compartirlo. El envío lo hace la persona desde WhatsApp; no se necesita integrar la API de WhatsApp para el caso básico.
4. El invitado abre la invitación, ve su nombre y los detalles del evento y elige **Asistiré** o **No podré asistir**. Si la administradora habilitó acompañante para esa persona, podrá indicar si llevará uno. Se permite como máximo un acompañante por invitado; queda pendiente decidir si se pide su nombre.
5. La respuesta queda guardada y la página de administración muestra el estado actualizado y si llevará acompañante, por ejemplo: “Axel confirmó asistencia + 1 acompañante”.
6. La fecha límite para confirmar es el 16 de noviembre de 2026; faltan la hora exacta y la zona horaria. Al vencer el plazo, la página informa que ya no se aceptan confirmaciones. La fecha se validará también en el servidor.
7. La ubicación se podrá revelar una sola vez mediante un código de un solo uso. El flujo exacto y cuándo se entrega el código están pendientes de definir.

## Dirección visual y contenido

- **Concepto:** fiesta full black y pool party, con detalles de neón y brillo. La paleta de acentos, tipografías y composición quedan pendientes.
- **Ambiente propuesto:** fondo oscuro, luces de neón y movimiento inspirado en reflejos de agua; cuidar la legibilidad y la experiencia móvil.
- **Mensaje esencial:** indicar claramente que llevar traje de baño es obligatorio.
- **Personalización:** saludar al invitado por el nombre registrado y mantener una sensación de invitación individual.
- **Animación y música:** introducir movimiento y luz de forma progresiva; la canción y los detalles visuales se definirán más adelante.

## Ubicación de un solo uso

La intención es que cada invitado pueda ver la ubicación una sola vez usando un código de un solo uso. Como propuesta, el servidor validará y consumirá el código mediante una operación atómica antes de devolver la ubicación, para que dos solicitudes simultáneas no puedan usarlo. La dirección no debe aparecer en el HTML inicial, recursos públicos, metadatos ni respuestas anteriores a la validación. Evitar su almacenamiento en caché y registros.

La página deberá avisar antes de revelar la ubicación que solo podrá consultarse una vez. Si se interrumpe la conexión después de consumir el código, podría no mostrarse; conviene permitir que la administradora genere otro tras verificar la solicitud. Falta decidir cómo se entrega el código, si el acceso requiere confirmar asistencia y cómo se recupera el acceso.

Esta medida limita las consultas, pero no impide que quien vea la dirección la anote, haga una captura o la comparta. Un enlace de invitación o código compartido también podría ser usado por otra persona antes que el destinatario.

## Datos iniciales

Modelo orientativo; se ajustará al formato real de invitados y a las reglas del evento.

### `guests` (invitados/invitaciones)

- `id`: identificador interno.
- `display_name`: nombre que se muestra en la invitación.
- `invite_code`: código aleatorio, único y no secuencial para el enlace.
- `status`: `pending`, `attending` o `declined`.
- `party_size_allowed`: máximo de asistentes para esa invitación: 1 por defecto o 2 si la administradora habilita un acompañante.
- `party_size_confirmed`: cantidad confirmada: 1 o 2 cuando asiste; sin asistentes cuando declina. El servidor debe validar que no exceda el límite asignado.
- `rsvp_deadline`: fecha y hora límite para responder.
- `created_at`, `updated_at`.
- El código de ubicación y su estado de uso se modelarán aparte de la invitación; su generación y recuperación están pendientes de definir.

### `rsvps` (opcional si se necesita historial)

- `id`, `guest_id`, `answer`, `party_size`, `note`, `submitted_at`.

Para una primera versión sencilla, el estado y la respuesta más reciente pueden vivir directamente en `guests`. Mantener una tabla de respuestas aparte sirve si se quiere guardar cambios e historial.

## Acceso y privacidad

- El enlace contiene un código aleatorio difícil de adivinar; no exponer IDs consecutivos ni permitir recorrer la lista de nombres.
- El enlace identifica la invitación, pero no se debe tratar como una contraseña de administración. La ruta pública solo puede leer los datos mínimos para esa invitación y registrar su respuesta.
- La administración requiere inicio de sesión. Aplicar políticas de acceso en la base de datos (RLS) y validar también en el servidor/API; no confiar en ocultar botones en el navegador.
- No incluir datos de invitados en archivos públicos, código cliente, metadatos ni logs innecesarios.
- Definir cómo invalidar o regenerar un enlace si se comparte por error.

## Música y experiencia en móviles

Los navegadores actuales suelen bloquear el audio con reproducción automática antes de que la persona interactúe con la página. Por eso no se puede garantizar que la música suene apenas se abre el enlace. La experiencia propuesta es mostrar un botón claro, por ejemplo **“Abrir invitación”** o un control de música, y comenzar el audio después de ese toque. Incluir controles visibles para pausar/reanudar, respetar el modo silencio y no reproducir sonido inesperado.

Optimizar las animaciones para móviles, ofrecer una alternativa para `prefers-reduced-motion`, cargar imágenes y audio de forma eficiente y comprobar que la información importante siga visible si los medios tardan o fallan.

## Páginas y funciones previstas

- **Invitación pública:** contenido personalizado por código, detalles del evento, animación, música opcional y formulario RSVP.
- **Administración:** acceso autenticado, listado con búsqueda/filtros por estado, alta/edición/baja de invitados, opción individual para permitir un acompañante y resumen de confirmaciones con acompañantes.
- **Compartir:** copiar enlace y generar enlace `wa.me` con texto prellenado. El envío lo realiza la anfitriona desde WhatsApp.
- **Exportación:** incluir descarga CSV como respaldo o para la lista final. La carga de nombres será manual; no se necesita importar CSV.

## Fases sugeridas

1. **Definición:** confirmar datos del evento, si se pide el nombre del acompañante, hora y zona horaria del cierre, acceso administrativo y si habrá dominio propio.
2. **Base funcional:** iniciar Astro, preparar base de datos, autenticación, invitaciones por código y confirmación persistente.
3. **Administración y compartir:** lista, estados, carga de invitados y enlaces para WhatsApp.
4. **Diseño y movimiento:** aplicar dirección visual, animaciones, contenido y música.
5. **Revisión y publicación:** verificar experiencia móvil, permisos, enlaces, accesibilidad básica y desplegar.

## Decisiones pendientes

- **Resuelto:** cada invitación corresponde a una persona.
- **Acompañantes:** la administradora decide por invitado si permite uno; máximo un acompañante adicional. El invitado debe indicar si lo llevará y el panel debe reflejarlo. Pendiente decidir si se registra su nombre.
- **Fecha límite:** 16 de noviembre de 2026. Pendientes la hora exacta y la zona horaria; esta fecha sustituye la regla provisional de una semana.
- **Pendiente:** si habrá una sola cuenta administradora o varias.
- **Ubicación:** definir cuándo y cómo se entrega el código de un solo uso, si exige confirmar asistencia y cómo se recupera el acceso.
- **Diseño:** definir colores de neón, referencias visuales, textos y datos del evento.
- **Resuelto:** alta manual de invitados; no se necesita importar la lista. Se agregará exportación CSV opcional para respaldo.
- **Resuelto:** desplegar en Vercel y usar Supabase en planes gratuitos; presupuesto inicial cero. Dominio propio pendiente.
- **Pendiente:** seleccionar la música. Se cuenta con permiso para publicarla. La reproducción requerirá una acción de la persona invitada por las restricciones del navegador.
- **Resuelto:** conservar los datos después del evento por si acaso; acordar más adelante quién tendrá acceso y por cuánto tiempo.

## Criterios para considerar lista la primera versión

- La administradora puede gestionar invitados sin exponer la lista públicamente.
- Cada enlace muestra la invitación correcta y no permite acceder a invitaciones ajenas cambiando un ID simple.
- RSVP se guarda de forma persistente y el panel refleja la respuesta.
- El enlace se puede compartir por WhatsApp y funciona en un navegador móvil.
- La música se inicia tras una acción explícita y tiene controles.
- La invitación sigue siendo utilizable con movimiento reducido, audio apagado o conexión lenta.

## Desarrollo local

Requisitos: Node.js compatible con Astro y npm. Instalar las dependencias con `npm install` y ejecutar `npm run dev`. Para generar la versión de producción, usar `npm run build`. El adaptador de Vercel está configurado para permitir rutas dinámicas.

La página principal y las rutas `/admin` y `/invitacion/<codigo>` son puntos de partida. La invitación devuelve temporalmente el estado 503; todavía no hay conexión a Supabase, inicio de sesión, gestión de invitados ni RSVP. No ingresar datos reales hasta implementar la protección y persistencia.

## Organización del proyecto

Las rutas de `src/pages` reciben las solicitudes y componen las páginas. Mantenerlas pequeñas facilitará cambiar el diseño o la lógica de cada función por separado.

```text
src/
  pages/                 Rutas públicas, invitación y administración
  layouts/               Estructura HTML compartida
  components/
    shared/              Componentes visuales reutilizables
    invitation/          Componentes propios de la invitación
    admin/               Componentes propios del panel
  config/                Contenido y configuración compartida del sitio
  features/
    invitations/         Gestión y consulta de invitaciones
    rsvp/                Reglas y operaciones de confirmación
    admin/               Funciones de administración
  lib/server/            Integraciones y utilidades exclusivas del servidor
  styles/                Estilos globales y variables visuales
  types/                 Tipos compartidos
public/
  images/                Imágenes públicas
  audio/                 Música pública cuando esté definida
```

Las carpetas reservadas están vacías hasta que se necesiten. Los detalles de conexión y las claves privadas irán en variables de entorno del servidor, nunca en `public/` ni en componentes enviados al navegador. La autenticación, las reglas de acceso y el almacenamiento se implementarán al configurar Supabase; la página actual de administración es solo un marcador sin datos.
