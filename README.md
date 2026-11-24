# Mis horas de eventos

App web para registrar turnos de trabajo en eventos (evento, lugar, tipo de turno, cargo, horas y auxilio de transporte) y calcular el pago.
Usa **Firebase Authentication** para las cuentas y **Cloud Firestore** para guardar los turnos. Se publica en **Netlify** desde GitHub.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa |
| `firebase-config.js` | Tus datos de conexión a Firebase (tienes que pegarlos) |
| `firestore.rules` | Reglas de seguridad: cada usuario solo ve sus turnos |
| `netlify.toml` | Configuración de publicación en Netlify |

## Paso 1 · Crear el proyecto en Firebase (gratis, sin tarjeta)

1. Entra a https://console.firebase.google.com con tu cuenta de Google y pulsa **Crear un proyecto**. Ponle un nombre (por ejemplo `mis-horas`). Google Analytics no hace falta.
2. **Authentication** → **Comenzar** → pestaña **Método de acceso** → activa **Correo electrónico/contraseña** (solo el primer interruptor) → Guardar.
3. **Firestore Database** → **Crear base de datos** → elige la ubicación (por ejemplo `southamerica-east1` o `nam5`) → **Modo de producción**.
4. En Firestore, pestaña **Reglas**: borra lo que hay, pega el contenido de `firestore.rules` y pulsa **Publicar**.
5. Ve a **Configuración del proyecto** (rueda dentada) → **Tus apps** → icono **</>** (Web) → ponle un nombre → **Registrar app**. Copia el bloque `firebaseConfig` que aparece.
6. Abre `firebase-config.js` y reemplaza los valores de ejemplo por los tuyos.
7. (Opcional) **Authentication → Plantillas → Verificación de dirección de correo electrónico**: ahí puedes cambiar el nombre del remitente, el asunto y el texto del correo de confirmación que llega al registrarse. El idioma ya va en español.

## Paso 2 · Subir a GitHub

1. Crea un repositorio nuevo en https://github.com/new (puede ser privado).
2. Sube los 5 archivos de esta carpeta: en el repositorio, **Add file → Upload files**, arrástralos y pulsa **Commit changes**.
   (O por terminal: `git init`, `git add .`, `git commit -m "Primera versión"`, `git remote add origin ...`, `git push -u origin main`.)

## Paso 3 · Publicar en Netlify

1. Entra a https://app.netlify.com → **Add new project → Import an existing project → GitHub** y elige el repositorio.
2. No hay que configurar nada: deja el comando de build vacío y el directorio de publicación en `.` (ya viene en `netlify.toml`). Pulsa **Deploy**.
3. Netlify te da una dirección como `https://mis-horas-123.netlify.app`. Puedes cambiarla en **Domain management**.
4. Cada vez que cambies un archivo en GitHub, Netlify publica la nueva versión sola.

## Paso 4 · Probar

1. Abre la dirección de Netlify, pestaña **Crear cuenta**.
2. Regístrate con tu **correo** y una **contraseña** (mínimo 6 caracteres). Te llegará un correo de confirmación (revisa también la carpeta de spam).
3. Añade un turno y recarga la página: debe seguir ahí. Entra desde otro teléfono con el mismo correo y verás los mismos turnos.
4. Si olvidas la contraseña, escribe tu correo y pulsa **¿Olvidaste tu contraseña?**: llega un enlace para crear una nueva.

## Cómo se guardan los datos

- Cada usuario tiene un documento `usuarios/{uid}` en Firestore con su lista de turnos.
- Las tarifas por cargo (Acreditador 7.500, Validador 7.500, Runner 8.500, Coordinador 10.000) y el auxilio de transporte (10.000) son fijos y están en `index.html` (`DEF_RATES` y `aux:10000`). Los usuarios no pueden cambiarlos; solo el cargo «Otro» permite escribir un valor por hora.
- Las reglas de `firestore.rules` impiden que alguien lea o modifique el documento de otra persona.
- Las cuentas son solo con correo y contraseña. Al registrarse, Firebase envía un correo de confirmación al correo indicado (el registro no se bloquea si no lo abren).
- Las contraseñas las guarda Firebase Authentication de forma segura; la app nunca las almacena.
- Los turnos también se guardan en el teléfono: si no hay señal en el evento, se sincronizan solos cuando vuelva.
- La sesión queda abierta en el dispositivo hasta pulsar **Cerrar sesión**.
- Para ver o respaldar los datos: Consola de Firebase → Firestore Database → colección `usuarios`.

## Actualizar la agenda de eventos

Los eventos de cada lugar están en `index.html`, en la lista `CAT`. Cada evento es una línea con este formato:

```js
['cp','2026-12-04','Karol G — Tropitour (día 1)'],
```

Códigos de lugar: `vc` Vive Claro Distrito Cultural · `vmh` Vive Claro Music Hall · `sb` Parque Simón Bolívar · `mp` Coliseo MedPlus · `ar` El Corazón de Bogotá Arena · `cp` Estadio El Campín.
Edita el archivo en GitHub (icono del lápiz), guarda, y Netlify publica el cambio en un minuto.

## Límites del plan gratuito

El plan Spark de Firebase no pide tarjeta y alcanza de sobra para un equipo pequeño. Si algún día se supera, Firebase deja de responder hasta el día siguiente; no cobra nada a menos que cambies al plan Blaze.
