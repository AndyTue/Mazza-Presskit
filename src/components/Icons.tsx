import {
  IconArrowUpRight,
  IconBrandInstagram,
  IconBrandSoundcloud,
  IconBrandWhatsapp,
  IconBrandYoutube,
} from '@tabler/icons-react'
import type { SocialId } from '../content/site'

export const STROKE = 1.5

const brand = {
  whatsapp: IconBrandWhatsapp,
  instagram: IconBrandInstagram,
  soundcloud: IconBrandSoundcloud,
  youtube: IconBrandYoutube,
}

export function SocialIcon({ id, size = 18 }: { id: SocialId; size?: number }) {
  const Icon = brand[id]
  return <Icon size={size} stroke={STROKE} className="ico" aria-hidden="true" />
}

export function Arrow({ size = 18 }: { size?: number }) {
  return <IconArrowUpRight size={size} stroke={STROKE} className="ico ico-arrow" aria-hidden="true" />
}
