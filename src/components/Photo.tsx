import { photo } from '../content/site'

type PhotoProps = {
  name: string
  alt: string
  sizes: string
  position?: string
  eager?: boolean
}

// DJ photo from public/images/dj with responsive sources (480w / 720w / 960w).
export function Photo({ name, alt, sizes, position, eager = false }: PhotoProps) {
  const { src, srcSet } = photo(name)
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={960}
      height={1280}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      style={position ? { objectPosition: position } : undefined}
    />
  )
}
