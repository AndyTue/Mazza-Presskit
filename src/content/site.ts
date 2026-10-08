// Global site data: name, navigation and social links.
// Edit here; components read from this file.

export const site = {
  name: 'Mazza',
  role: 'DJ & productor',
  location: 'Tizimín, Yucatán',
  year: 2026,
}

export type NavItem = { id: string; label: string }

export const nav: NavItem[] = [
  { id: 'biografia', label: 'Biografía' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'musica', label: 'Música' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'galeria', label: 'Galería' },
  { id: 'contacto', label: 'Contacto' },
]

export type SocialId = 'whatsapp' | 'instagram' | 'soundcloud' | 'youtube'

export type Social = { id: SocialId; label: string; handle: string; href: string }

const whatsappMessage = 'Hola Mazza, quiero consultar disponibilidad para un evento.'

export const socials: Social[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    handle: '+52 986 153 4485',
    href: `https://wa.me/529861534485?text=${encodeURIComponent(whatsappMessage)}`,
  },
  { id: 'instagram', label: 'Instagram', handle: '@mazzaa.dj', href: 'https://www.instagram.com/mazzaa.dj/' },
  {
    id: 'soundcloud',
    label: 'SoundCloud',
    handle: '/edgar-pat-249072497',
    href: 'https://soundcloud.com/edgar-pat-249072497',
  },
  { id: 'youtube', label: 'YouTube', handle: '@HIDDEN_121', href: 'https://www.youtube.com/@HIDDEN_121' },
]

// Photos live in public/images as <name>-480.webp and <name>-960.webp.
export const photo = (name: string) => ({
  src: `/images/dj/${name}-960.webp`,
  srcSet: `/images/dj/${name}-480.webp 480w, /images/dj/${name}-720.webp 720w, /images/dj/${name}-960.webp 960w`,
})
