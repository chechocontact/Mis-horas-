# Mis Horass

App web instalable (PWA) para registrar turnos de trabajo en eventos (evento, lugar, tipo de turno, cargo, horas y auxilio de transporte) y calcular el pago.
Usa **Firebase Authentication** para las cuentas y **Cloud Firestore** para guardar los turnos. Se publica en **Netlify** desde GitHub.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa |
| `firebase-config.js` | Tus datos de conexión a Firebase (tienes que pegarlos) |
| `firestore.rules` | Reglas de seguridad: cada usuario solo ve sus turnos |
| `netlify.toml` | Configuración de publicación en Netlify |
| `manifest.webmanifest` | Nombre, ícono y colores de la app instalada |
| `sw.js` | Service worker: deja abrir la app sin señal (nunca toca los datos) |
| `*.png` | Logo e íconos de la app (todos en la raíz, sin carpetas) |

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
2. Sube **todos los archivos** de esta carpeta (no hay subcarpetas, se pueden subir uno por uno desde el celular): en el repositorio, **Add file → Upload files**, arrástralos y pulsa **Commit changes**.
   (O por terminal: `git init`, `git add .`, `git commit -m "Primera versión"`, `git remote add origin ...`, `git push -u origin main`.)

## Paso 3 · Publicar (Cloudflare Pages, recomendado)

1. Entra a https://dash.cloudflare.com (cuenta gratis) → **Workers y Pages** → **Crear** → pestaña **Pages** → **Conectar a Git** → elige GitHub y el repositorio.
2. Configuración de compilación: **Framework: Ninguno**, **Comando de compilación: vacío**, **Directorio de salida: `/`** (o déjalo vacío). Pulsa **Guardar e implementar**.
3. Te da una dirección como `https://mis-horass.pages.dev` (si se crea como Worker: `https://mis-horass.<subdominio>.workers.dev`; actívala en Domains → workers.dev). Dirección actual: `https://mis-horass.pages.dev`. Cada cambio en GitHub se publica solo (500 publicaciones gratis al mes).
4. Las cabeceras de caché van en el archivo `_headers`.
5. En Firebase → **Authentication → Configuración → Dominios autorizados**, añade tu dirección `…pages.dev`.

## Paso 3 (alternativa) · Publicar en Netlify

En el plan gratuito de Netlify cada publicación cuesta créditos: sube todos los archivos en un solo commit.

1. Entra a https://app.netlify.com → **Add new project → Import an existing project → GitHub** y elige el repositorio.
2. No hay que configurar nada: deja el comando de build vacío y el directorio de publicación en `.` (ya viene en `netlify.toml`). Pulsa **Deploy**.
3. Netlify te da una dirección como `https://mis-horas-123.netlify.app`. Puedes cambiarla en **Domain management**.
4. Cada vez que cambies un archivo en GitHub, Netlify publica la nueva versión sola.

## Paso 4 · Probar

1. Abre la dirección de Netlify, pestaña **Crear cuenta**.
2. Regístrate con tu **correo** y una **contraseña** (mínimo 6 caracteres). Te llegará un correo de confirmación (revisa también la carpeta de spam).
3. Añade un turno y recarga la página: debe seguir ahí. Entra desde otro teléfono con el mismo correo y verás los mismos turnos.
4. Si olvidas la contraseña, escribe tu correo y pulsa **¿Olvidaste tu contraseña?**: llega un enlace para crear una nueva.

## Instalar la app en el celular

- **Android (Chrome):** abre la dirección de Netlify y toca **Instalar** en el aviso de la app, o en el menú ⋮ → **Instalar app**.
- **iPhone (Safari):** toca **Compartir** → **Añadir a pantalla de inicio**.
- La app instalada abre a pantalla completa con el logo de Mis Horass. En iPhone hay que iniciar sesión una vez dentro de la app instalada.
- Cada cambio que publiques en GitHub llega solo a la app instalada la próxima vez que se abra con internet.

## Cómo se guardan los datos

- Cada turno es un documento propio en Firestore: `usuarios/{uid}/turnos/{id}`. Guardar o editar un turno nunca puede borrar otro, aunque la app esté abierta en varios dispositivos a la vez.
- **Historial:** los turnos **pagados** con más de 1 mes de antigüedad pasan solos a un documento por mes (`usuarios/{uid}/archivo/AAAA-MM`). No se cargan al abrir la app: aparecen al tocar **Ver historial**, al elegir ese mes en el filtro o al buscar en el historial. Los turnos pendientes de cobro nunca se archivan.
- El paso de un turno al historial (y de vuelta, al editarlo, desmarcar el pago o eliminarlo) se hace con una transacción de Firestore: se completa todo o no cambia nada, así ningún turno se duplica ni se pierde. Cambiar un turno del historial requiere conexión.
- En `usuarios/{uid}` se guarda un resumen por mes del historial (cantidad, total y horas) para que los totales de la app sean exactos sin cargar el historial completo.
- Al abrir la app se leen solo los turnos del último mes y los pendientes de cobro, más 1 lectura del resumen. Cada mes del historial que se abre cuesta 1 lectura.
- Los dispositivos se sincronizan en vivo: lo que se añade en el celular aparece en el computador sin recargar.
- Arriba, bajo el correo, la app muestra **«Guardado en la nube ✓»** cuando el último cambio ya está en Firebase. Si dice «Sin señal…», el cambio está guardado en el teléfono y se sube solo al volver la conexión.
- Las cuentas creadas con versiones anteriores tenían todos los turnos en una sola lista (`usuarios/{uid}.records`). Al entrar, la app los copia uno por uno al nuevo formato y deja la lista original en el campo `respaldo`.
- Las tarifas por cargo (Acreditador 7.500, Validador 7.500, Runner 8.500, Coordinador 12.000) y el auxilio de transporte (10.000) son fijos y están en `index.html` (`DEF_RATES` y `aux:10000`). Los usuarios no pueden cambiarlos; solo el cargo «Otro» permite escribir un valor por hora.
- Las reglas de `firestore.rules` impiden que alguien lea o modifique los turnos o el historial de otra persona. **Si actualizas desde una versión anterior, vuelve a pegar y publicar las reglas** (Firestore → Reglas): sin ellas los turnos no se pueden guardar.
- Las cuentas son solo con correo y contraseña. Al registrarse, Firebase envía un correo de confirmación al correo indicado (el registro no se bloquea si no lo abren).
- Las contraseñas las guarda Firebase Authentication de forma segura; la app nunca las almacena.
- Los turnos también se guardan en el teléfono: si no hay señal en el evento, se sincronizan solos cuando vuelva.
- La sesión queda abierta en el dispositivo hasta pulsar **Cerrar sesión**.
- El service worker (`sw.js`) solo guarda copias de los archivos de la app para que abra sin señal. Las llamadas de inicio de sesión y de guardado van siempre directo a Firebase.
- Para ver o respaldar los datos: Consola de Firebase → Firestore Database → colección `usuarios` → cada usuario → `turnos`.

## Actualizar la agenda de eventos

Los eventos de cada lugar están en `index.html`, en la lista `CAT`. Cada evento es una línea con este formato:

```js
['cp','2026-12-04','Karol G — Tropitour (día 1)'],
```

Códigos de lugar: `vc` Vive Claro Distrito Cultural · `vmh` Vive Claro Music Hall · `sb` Parque Simón Bolívar · `mp` Coliseo MedPlus · `ar` El Corazón de Bogotá Arena · `cp` Estadio El Campín.
Edita el archivo en GitHub (icono del lápiz), guarda, y Netlify publica el cambio en un minuto.

## Límites del plan gratuito

El plan Spark de Firebase no pide tarjeta y alcanza de sobra para un equipo pequeño. Si algún día se supera, Firebase deja de responder hasta el día siguiente; no cobra nada a menos que cambies al plan Blaze.
