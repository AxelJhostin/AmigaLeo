# Configuración de Vercel y Neon

El proyecto Neon es `amigaleo-invitacion`; para producción se utiliza la rama `main`. El dominio `https://invitacionfiestalucia.vercel.app` ya fue autorizado en Neon Auth para esa rama.

En la configuración del proyecto de Vercel, agregar estas variables para el entorno **Production**:

- `DATABASE_URL`: cadena de conexión **pooled** de la base `neondb`, rama `main`, copiada desde Neon Console. Es una credencial privada: introducirla directamente en Vercel, sin publicarla ni enviarla por chat.
- `NEON_AUTH_BASE_URL`: URL base de Neon Auth de la rama `main`, disponible en Neon Console → Auth → Configuration.
- `ADMIN_USER_ID`: identificador exacto de la cuenta administradora en la rama `main`. El panel rechaza todas las cuentas si está vacío.

Después de configurar las tres variables, desplegar la versión actual del código y comprobar acceso autenticado, rechazo sin sesión, gestión de invitados y enlaces. No introducir invitados reales ni compartir enlaces hasta completar las pruebas. La página local de creación de acceso responde 404 fuera del servidor de desarrollo; las cuentas creadas en `desarrollo` y `main` son independientes.

La ruta de invitación muestra el nombre, pero RSVP y ubicación de un solo uso aún no están implementados. La lista de invitados permanece en `data/private/` local, excluida de Git, y todavía no se ha importado.
