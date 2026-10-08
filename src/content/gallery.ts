// Gallery items. `column` places each item in one of three staggered columns, `ratio` is the
// crop shown in the grid and `full` is the original proportion used in the lightbox.
// Videos live in public/video (from MazzaPresskit/images/videoNN.mp4 via `npm run assets`).

type Base = { name: string; alt: string; ratio: string; full: string; column: 1 | 2 | 3 }
export type GalleryPhoto = Base & { kind: 'photo' }
export type GalleryVideo = Base & { kind: 'video'; src: string; poster: string }
export type GalleryItem = GalleryPhoto | GalleryVideo

const photo = (name: string, alt: string, ratio: string, column: 1 | 2 | 3, full = '3/4'): GalleryPhoto => ({
  kind: 'photo',
  name,
  alt,
  ratio,
  full,
  column,
})

const video = (name: string, alt: string, ratio: string, column: 1 | 2 | 3, full: string): GalleryVideo => ({
  kind: 'video',
  name,
  alt,
  ratio,
  full,
  column,
  src: `/video/${name}.mp4`,
  poster: `/video/${name}-poster.webp`,
})

export const gallery: GalleryItem[] = [
  photo('hero', 'Mazza con audífonos en la consola, con láseres de fondo', '4/5', 1),
  photo('foto-4', 'Cabina de club con el nombre MAZZA en la pantalla LED', '4/5', 3),
  photo('foto-7', 'Mazza con lentes oscuros y playera blanca', '3/4', 1, '1684/2528'),
  video('video-01', 'Video de un set de Mazza bajo luces de neón', '9/16', 2, '576/1024'),
  photo('foto-6', 'Mazza y otro DJ mezclando al aire libre al atardecer', '3/4', 3, '9/16'),
  photo('foto-3', 'Mazza de perfil mezclando bajo luces rosas', '3/4', 1),
  photo('foto-2', 'Mazza de espaldas frente a la consola durante un set nocturno', '1/1', 2),
  photo('foto-8', 'Mazza en una consola iluminada con luces de colores', '3/5', 3, '589/1280'),
  photo('foto-9', 'Mazza de espaldas en cabina frente a una pista llena', '4/3', 1, '4/3'),
  photo('foto-10', 'Mazza en la playa junto a su equipo de sonido', '4/5', 2, '829/989'),
  photo('foto-1', 'Mazza concentrado en la mezcla, con audífonos', '3/4', 3),
]
