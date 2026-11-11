# Configuración de Vercel y Neon

El proyecto Neon es `amigaleo-invitacion`; para producción se utiliza la rama `main`. El dominio `https://invitacionfiestalucia.vercel.app` ya fue autorizado en Neon Auth para esa rama.

En la configuración del proyecto de Vercel, agregar estas variables para el entorno **Production**:

- `DATABASE_URL`: cadena de conexión **pooled** de la base `neondb`, rama `main`, copiada desde Neon Console. Es una credencial privada: introducirla directamente en Vercel, sin publicarla ni enviarla por chat.
- `NEON_AUTH_BASE_URL`: URL base de Neon Auth de la rama `main`, disponible en Neon Console → Auth → Configuration.
- `ADMIN_USER_ID`: identificador exacto de la cuenta administradora en la rama `main`. El panel rechaza todas las cuentas si está vacío.
- `EVENT_LOCATION`: referencia textual de la ubicación, incluida la casa; se entrega solo después de validar el código de un solo uso.
- `EVENT_LOCATION_URL`: enlace HTTPS de Google Maps de la ubicación, entregado junto con la referencia después de validar el código.

Después de configurar las variables, desplegar la versión actual del código y comprobar acceso autenticado, rechazo sin sesión, gestión de invitados y enlaces. No introducir invitados reales ni compartir enlaces hasta completar las pruebas. La página local de creación de acceso responde 404 fuera del servidor de desarrollo; las cuentas creadas en `desarrollo` y `main` son independientes.

La ruta personalizada permite confirmar asistencia y consultar la ubicación con código de un solo uso. La lista inicial se cargó en la rama `main`; el archivo local `data/private/` permanece excluido de Git. La migración de ubicación ya se aplicó en producción. Los últimos cambios requieren un nuevo despliegue.
