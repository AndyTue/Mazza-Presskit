import { useEffect, useState } from 'react'

// False during prerendering and the hydration pass, true right after. Used for parts that
// depend on the viewport (carousel geometry, portals) so server and client markup match.
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
