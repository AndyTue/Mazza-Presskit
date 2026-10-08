import { Layers, type LayerDef } from './components/Layers'
import { NavBar } from './components/NavBar'
import { Hero } from './hero/Hero'
import { ScrollProvider } from './lib/scroll'
import { Bio } from './sections/Bio'
import { Contact } from './sections/Contact'
import { Events } from './sections/Events'
import { Gallery } from './sections/Gallery'
import { Hidden } from './sections/Hidden'
import { Music } from './sections/Music'
import { Services } from './sections/Services'

const layers: LayerDef[] = [
  { id: 'top', node: <Hero /> },
  { id: 'biografia', node: <Bio /> },
  { id: 'servicios', node: <Services /> },
  { id: 'musica', node: <Music /> },
  { id: 'hidden', node: <Hidden /> },
  { id: 'eventos', node: <Events /> },
  { id: 'galeria', node: <Gallery /> },
  { id: 'contacto', node: <Contact /> },
]

export default function App() {
  return (
    <ScrollProvider>
      <a className="skip mono" href="#biografia">
        Saltar al contenido
      </a>
      <NavBar />
      <main>
        <Layers layers={layers} />
      </main>
    </ScrollProvider>
  )
}
