// Past events carousel, data transcribed from each flyer (only what the flyer shows:
// a missing year or place stays empty and is simply not displayed).
// To add a flyer: save it as MazzaPresskit/images/flyerNN.jpeg, run `npm run assets`
// (it is fitted to 4:5 without cropping) and add an entry here with image 'flyer-NN'.

export type EventItem = { image: string; name: string; date: string; place: string; alt: string }

export const events: EventItem[] = [
  { image: 'flyer-01', name: 'Perreo Pa-Trio', date: '15 de septiembre', place: '', alt: 'Flyer de Perreo Pa-Trio' },
  { image: 'flyer-02', name: 'Amor y Caos', date: 'Sábado 14 de febrero', place: '', alt: 'Flyer de Amor y Caos' },
  { image: 'flyer-03', name: 'Back to School', date: 'Sábado 2 de mayo', place: 'Local social Aura Patricia', alt: 'Flyer de Back to School' },
  { image: 'flyer-04', name: 'Novatec Halloween', date: 'Viernes 2 de octubre', place: 'Dakiti, Tizimín', alt: 'Flyer de Novatec Halloween' },
  { image: 'flyer-05', name: 'Sunset Party', date: '4 de abril', place: 'Frozetti, El Cuyo, Yucatán', alt: 'Flyer de Sunset Party' },
  { image: 'flyer-06', name: 'Stand Medina’s', date: '10 de enero', place: 'Los Tablados', alt: 'Flyer de Stand Medina’s' },
  { image: 'flyer-07', name: 'La Misma del Rancho', date: 'Viernes 20 de marzo', place: '', alt: 'Flyer de La Misma del Rancho' },
  { image: 'flyer-08', name: 'Santos y Pecadores', date: 'Sábado 28', place: 'Perla Negra Restaurant & Bar', alt: 'Flyer de Santos y Pecadores' },
  { image: 'flyer-09', name: 'Live Beats', date: '5 de diciembre', place: 'Cuerno de Fuego, Cielo Cenizo Rooftop', alt: 'Flyer de Live Beats' },
  { image: 'flyer-10', name: 'Guerra de Bandas', date: 'Sábado 6 de junio', place: 'Local Monarcas, Tizimín', alt: 'Flyer de Guerra de Bandas' },
  { image: 'flyer-11', name: 'Hanal Pixan', date: '1 de noviembre de 2025', place: 'Jaguar Negro, Tizimín', alt: 'Flyer de Hanal Pixan' },
  { image: 'flyer-12', name: 'Eden Sunset', date: '1 de agosto de 2025', place: 'El Cuyo Beach Festival', alt: 'Flyer de Eden Sunset' },
  { image: 'flyer-13', name: 'Eden Cuyo 2025', date: '19 de abril de 2025', place: 'Dársena, El Cuyo', alt: 'Flyer de Eden Cuyo 2025' },
  { image: 'flyer-14', name: 'After Cuyo Beach 2025', date: '1 de agosto', place: 'Main Stage del Cuyo', alt: 'Flyer de After Cuyo Beach 2025' },
  { image: 'flyer-15', name: 'Eden', date: '8 de marzo de 2025', place: 'Tizimín, Yucatán', alt: 'Flyer de Eden' },
  { image: 'flyer-16', name: 'Dark Carnival, Halloween Part 2', date: 'Sábado 31 de octubre', place: '', alt: 'Flyer de Dark Carnival, Halloween Part 2' },
  { image: 'flyer-17', name: 'Trakas HDSPTM, banda en vivo', date: '2 de enero de 2025', place: 'Expo Feria Tizimín', alt: 'Flyer de Trakas HDSPTM, banda en vivo' },
]

export const flyer = (name: string) => ({
  src: `/images/events/${name}-1080.webp`,
  srcSet: `/images/events/${name}-540.webp 540w, /images/events/${name}-1080.webp 1080w`,
})
