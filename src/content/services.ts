// Services shown as an asymmetric grid. `layout` decides the cell; `accent` paints the card maroon.

export type Service = {
  title: string
  body: string
  tags: string[]
  layout: 'feature' | 'side' | 'wide'
  accent?: boolean
  image?: { name: string; alt: string; position?: string }
}

export const services: Service[] = [
  {
    title: 'Clubs y festivales',
    body: 'Sets que van del reggaetón más bailable al house y el indie dance, con edits y mashups propios. La experiencia de sus residencias le permite leer la pista y llevar la energía de la noche, ya sea en el warm-up, el set principal o el cierre.',
    tags: ['[Reggaetón]', '[House]', '[Indie dance]'],
    layout: 'feature',
    image: { name: 'foto-9', alt: 'Mazza de espaldas en cabina frente a una pista llena', position: '50% 62%' },
  },
  {
    title: 'Eventos privados',
    body: 'La misma versatilidad de cabina, adaptada a tu fiesta: una selección pensada para tus invitados que se ajusta al momento y mantiene la pista llena de principio a fin.',
    tags: ['[A la medida]', '[Lectura de pista]'],
    layout: 'side',
  },
  {
    title: 'Bodas y corporativos',
    body: 'Ambiente cuidado para la cena y la recepción, y una pista que crece con la noche. Música para bodas, lanzamientos y eventos de empresa con el nivel de un club.',
    tags: ['[Cena]', '[Recepción]', '[Pista]'],
    layout: 'side',
    accent: true,
  },
  {
    title: 'Producción y mezcla',
    body: 'Edits y mashups con el sello que define sus sets, listos para sonar en club. Producción y mezcla para artistas y marcas que buscan un sonido fresco, dinámico y hecho para la pista.',
    tags: ['[Edits]', '[Mashups]', '[Producción]'],
    layout: 'wide',
    image: { name: 'foto-2', alt: 'Mazza de espaldas frente a la consola durante un set nocturno', position: '50% 58%' },
  },
]
