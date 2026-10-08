# Mazza · Presskit web

Landing de una sola página para Mazza (DJ y productor, Tizimín, Yucatán).
Vite + React + TypeScript + Tailwind 4, Motion para la animación, Lenis para el scroll suave
y Three.js (React Three Fiber) para el logo 3D del hero.

## Requisitos

- Node 20 o superior
- Python 3 con Pillow y OpenCV, solo si vas a regenerar imágenes o el contorno del logo
  (`pip install pillow opencv-python`)

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo en http://localhost:5173
npm run build        # build de producción en dist/ (descarga feeds, compila y prerenderiza)
npm run preview      # sirve dist/ en http://localhost:4173
npm run feeds        # actualiza los tracks de SoundCloud y los videos de YouTube
npm run assets       # regenera fotos WebP, flyers, favicon y og.jpg desde ../images
```

`npm run build` ejecuta `npm run feeds` antes de compilar. Si SoundCloud o YouTube no responden,
se conserva la última copia en `src/content/generated/`, así que el build nunca falla por eso.

## Dónde se edita el contenido

Todo el texto y los datos viven en `src/content/`. No hace falta tocar componentes.

| Archivo | Qué contiene |
| --- | --- |
| `site.ts` | Nombre, ciudad, año, menú y redes (WhatsApp, Instagram, SoundCloud, YouTube) |
| `bio.ts` | Biografía (marcada como borrador), cifras +6 años y +200 shows, foto |
| `services.ts` | Los cuatro servicios y sus fotos |
| `music.ts` | Títulos y etiquetas que se muestran para cada track de SoundCloud, y tracks ocultos |
| `hidden.ts` | Textos de la serie Hidden y el video destacado de YouTube |
| `events.ts` | Flyers del carrusel de eventos pasados |
| `gallery.ts` | Fotos de la galería y su orden por columnas |

### Agregar un flyer de evento

1. Guarda la imagen en `../images/` como `flyerNN.jpeg`, con el siguiente número libre
   (por ejemplo `flyer18.jpeg`). Puede tener cualquier proporción.
2. Ejecuta `npm run assets`. El flyer se coloca completo en una tarjeta 4:5, sin recortar el texto,
   y se genera `public/images/events/flyer-18-1080.webp` y `-540.webp`.
3. Agrega una entrada en `src/content/events.ts` con `image: 'flyer-18'`, nombre, fecha y lugar.
   Si el flyer no muestra el año o el lugar, deja el campo vacío y no se muestra.

### Agregar fotos o videos a la galería

Guarda las fotos como `../images/fotoNN.jpeg` y los videos como `../images/videoNN.mp4`, agrega el
nombre a `PHOTOS` en `scripts/prepare-assets.py` si es una foto, ejecuta `npm run assets` y añade
la entrada en `src/content/gallery.ts`. Los videos se reproducen en silencio cuando están en
pantalla y con sonido y controles al abrirlos.

### Cambiar o agregar fotos del DJ

Reemplaza los archivos en `../images/` (mismos nombres) y ejecuta `npm run assets`.
Cada foto se exporta en 480, 720 y 960 px de ancho. Las fotos se muestran en blanco y negro
y recuperan el color al pasar el cursor.

## Placeholders pendientes

- Dominio: `VITE_SITE_URL` en `.env` vale `https://mazza.example`. Cámbialo por el dominio real
  antes del build final, porque se usa en la URL canónica y en la imagen para redes (og.jpg).
- Biografía y textos de servicios: son borradores (`draft: true` en `bio.ts`).

## Cómo funciona por dentro

- **Prerender estático.** `npm run build` genera el HTML completo de la página
  (`src/entry-server.tsx` y `scripts/prerender.mjs`). El contenido se lee sin JavaScript y el CSS
  va incrustado. La app de React arranca justo después del primer pintado y se hidrata por partes.
- **Logo 3D.** El contorno se vectorizó desde `images/Logo.png` (`scripts/vectorize-logo.py`,
  coincidencia de silueta IoU 0.997) y se extruye en Three.js. Se carga con la primera
  interacción (o a los 10 s); mientras tanto se ve el logo plano. En equipos sin WebGL, en modo
  ahorro de datos o con poca memoria se queda el logo plano.
- **SoundCloud.** Los tracks salen del feed RSS público del perfil. El reproductor oficial solo
  se carga cuando alguien da Play.
- **YouTube.** Los videos salen del feed RSS del canal @HIDDEN_121. Se muestra la miniatura y el
  reproductor (`youtube-nocookie.com`) solo se carga al hacer clic. Los videos incrustados no
  funcionan en `127.0.0.1`: usa `localhost` o el dominio real.
- **Movimiento reducido.** Con `prefers-reduced-motion` se desactivan el scroll suave, las capas
  que se escalan, los parallax y las animaciones del hero.

## Pruebas

Con `npm run dev` o `npm run preview` corriendo:

```bash
node scripts/smoke.mjs http://localhost:4173/                # interacciones clave (11 pruebas)
node scripts/screenshots.mjs http://localhost:4173/ screens  # capturas 1440 y 390 por sección
```

Ambos usan Playwright con el Chrome instalado en el equipo.

## Publicar

Es un sitio estático: sube la carpeta `dist/`.

- **Vercel:** importa el repositorio con *Root directory* `web`. Build `npm run build`,
  output `dist`. `vercel.json` ya define la caché.
- **Netlify o Cloudflare Pages:** base `web`, build `npm run build`, publish `dist`.
  `public/_headers` ya define la caché.

Después de conectar el dominio, actualiza `VITE_SITE_URL` y vuelve a publicar.
