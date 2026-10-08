import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import mark from './mark-shapes.json'

// The Mazza monogram as a beveled obsidian extrusion. Geometry comes from the vectorized
// logo (scripts/vectorize-logo.py, silhouette IoU 0.997 against the original PNG); the
// depth and bevel are a stylization, the outline is exact. Reflections come from a small
// studio scene (bone softboxes plus maroon rim panels) baked into an environment map, so
// nothing is downloaded at runtime.

const SPIN_SECONDS = 20
const MAROON = '#7A0F1F'

type MarkData = { shapes: { outer: number[][]; holes: number[][][] }[] }

function useMarkGeometry() {
  return useMemo(() => {
    const shapes = (mark as MarkData).shapes.map((s) => {
      const shape = new THREE.Shape(s.outer.map(([x, y]) => new THREE.Vector2(x, y)))
      shape.holes = s.holes.map((hole) => new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x, y))))
      return shape
    })
    const geometry = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.012,
      bevelSegments: 5,
      curveSegments: 6,
    })
    geometry.center()
    geometry.computeVertexNormals()
    return geometry
  }, [])
}

type Panel = { color: string; intensity: number; size: [number, number]; position: [number, number, number]; rotation: [number, number, number] }

const PANELS: Panel[] = [
  { color: '#F2EDE8', intensity: 2.2, size: [6, 1.2], position: [0, 3, 2], rotation: [Math.PI / 2, 0, 0] },
  { color: '#F2EDE8', intensity: 1.4, size: [0.6, 6], position: [-4, 0, 1], rotation: [0, Math.PI / 2, 0] },
  { color: MAROON, intensity: 3, size: [1, 6], position: [3.5, -0.5, -1], rotation: [0, -Math.PI / 2, 0] },
  { color: MAROON, intensity: 1.6, size: [4, 4], position: [0, 0, -4], rotation: [0, 0, 0] },
]

function StudioEnvironment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const studio = new THREE.Scene()
    for (const p of PANELS) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.color).multiplyScalar(p.intensity),
        side: THREE.DoubleSide,
      })
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(...p.size), material)
      panel.position.set(...p.position)
      panel.rotation.set(...p.rotation)
      studio.add(panel)
    }
    const target = pmrem.fromScene(studio, 0.02)
    scene.environment = target.texture
    return () => {
      scene.environment = null
      target.dispose()
      pmrem.dispose()
      studio.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          ;(o.material as THREE.Material).dispose()
        }
      })
    }
  }, [gl, scene])
  return null
}

function Mark({ pointer, still }: { pointer: RefObject<{ x: number; y: number }>; still: boolean }) {
  const geometry = useMarkGeometry()
  const tilt = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (spin.current && !still) spin.current.rotation.y += dt * ((Math.PI * 2) / SPIN_SECONDS)
    if (tilt.current && !still) {
      const p = pointer.current
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, p.y * 0.22, 3, dt)
      tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, p.x * 0.32, 3, dt)
    }
  })

  return (
    <group ref={tilt}>
      <group ref={spin} rotation-y={still ? -0.38 : 0}>
        <mesh geometry={geometry}>
          <meshPhysicalMaterial
            color="#0c0909"
            roughness={0.14}
            metalness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={0.7}
            envMapIntensity={1.35}
          />
        </mesh>
      </group>
    </group>
  )
}

export default function HeroLogo3D({ onReady }: { onReady?: () => void }) {
  const reduce = useReducedMotion() ?? false
  const wrap = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(el)
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div ref={wrap} className="logo3d">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5.2], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={reduce ? 'demand' : visible ? 'always' : 'never'}
        onCreated={() => requestAnimationFrame(() => onReady?.())}
        aria-hidden="true"
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[2, 3, 4]} intensity={0.7} />
        <pointLight position={[0, 0.2, -2]} intensity={22} distance={9} color={MAROON} />
        <pointLight position={[-3, 1, -1.2]} intensity={10} distance={9} color="#93172A" />
        <StudioEnvironment />
        <Mark pointer={pointer} still={reduce} />
      </Canvas>
    </div>
  )
}
