# Invitación de cumpleaños de Lucía

Tarjeta virtual para compartir por WhatsApp, diseñada para celulares. Cada persona recibe una invitación personalizada y puede confirmar o declinar su asistencia. El panel de administración permite gestionar invitados, acompañantes y enlaces.

## Datos del evento

- **Fecha:** 20 de noviembre de 2026.
- **Hora:** pendiente de confirmar. La ubicación ya se recibió y se guardó en la configuración local; falta configurarla en Vercel.
- **Vestimenta:** full black, bikini obligatorio y botella en mano.
- **Confirmación:** hasta el 16 de noviembre de 2026 inclusive. El cierre está configurado provisionalmente a las 23:59:59 de Ecuador continental (05:00 UTC del día siguiente); confirmar la hora exacta.
- **Edad:** la tarjeta muestra 21; confirmar si corresponde.
- **Música:** aún no elegida ni integrada. Se han mencionado «Las Muñequitas» y «Destrabe Vol. 2».

## Estado del proyecto

- **Invitación:** tarjeta personalizada por enlace único, diseño oscuro con brillo y bolas de discoteca animadas. Los cambios visuales de Leo están incorporados.
- **Confirmaciones:** los invitados pueden confirmar o declinar y cambiar su respuesta antes del cierre. Se permite un acompañante solo cuando la administradora lo habilita. Las respuestas se guardan en Neon; el panel las actualiza al pulsar «Actualizar respuestas».
- **Panel:** inicio de sesión, lista, búsqueda, alta y edición de invitados, acompañantes y enlace de WhatsApp con mensaje preparado. Hay una cuenta administradora autorizada.
- **Lista:** se cargaron 70 invitados y seis invitaciones con acompañante permitido. Esta cifra es la carga inicial; consultar el panel para ver el estado actual.
- **Ubicación:** el panel puede generar y regenerar un código por invitado. El servidor entrega la referencia de la casa y el enlace de Maps una sola vez y guarda una huella del código. La migración ya se aplicó en producción; falta configurar la ubicación en Vercel.
- **CSV:** el panel puede descargar la lista completa con las respuestas actuales. El archivo no incluye enlaces de invitación ni códigos de ubicación. Este cambio debe desplegarse para que esté disponible en Vercel.

## Pendiente

1. Confirmar la hora de la fiesta, la edad y la hora límite exacta de confirmación.
2. Configurar `EVENT_LOCATION` y `EVENT_LOCATION_URL` en Vercel, desplegar el código actualizado y comprobar el uso único con una invitación de prueba.
3. Elegir la canción, conseguir el archivo autorizado e integrar un control de reproducción. El audio debe iniciarse tras una acción de la persona invitada, debido a las restricciones de los navegadores.
4. Desplegar y comprobar la exportación CSV. Evaluar si se necesita eliminar invitados desde el panel: actualmente se pueden agregar y editar.
5. Revisar la experiencia final en celulares y compartir los enlaces personalizados.

## Ubicación de un solo uso

La administradora genera un código para cada persona desde el panel y lo comparte por separado. La persona invitada recibe un aviso antes de mostrar la dirección; un segundo intento no revela la ubicación. Si necesita volver a verla, la administradora puede regenerar el código y el anterior queda invalidado. Si la dirección no está configurada, el código no se consume.

La vista única limita las consultas desde la invitación, aunque quien vea la dirección puede anotarla o hacer una captura. Una interrupción de conexión después de usar el código puede requerir uno nuevo.

## Desarrollo y publicación

El frontend usa Astro y TypeScript; se despliega en Vercel. La base de datos y autenticación usan Neon. La rama `desarrollo` de Neon se usa para pruebas y `main` contiene los datos de producción.

```bash
npm install
npm run dev
npm run build
```

Usar Node.js 22 para acercarse al entorno de Vercel. Las variables de entorno se documentan en `.env.example` y los pasos de publicación en `docs/despliegue-vercel.md`. Nunca subir `.env` ni la lista local de invitados al repositorio.

### Organización

- `src/pages/`: rutas de la invitación, panel y API.
- `src/components/invitation/`: tarjeta visual.
- `src/features/`: lógica de administración, confirmación y ubicación.
- `src/lib/server/`: conexión y autorización del servidor.
- `src/styles/`: estilos.
- `db/migrations/`: esquema de base de datos versionado.
- `public/`: recursos públicos cuando se incorporen.
