// The 3D paper behind <PaperProgress />. Plain three.js, loaded only when a unit page opens.
//
// How it works (in plain words):
// 1. One flat sheet is cut into a grid of points (vertices).
// 2. The sheet is curled around a small invisible ball: at 0% the ball is tiny, so the sheet
//    wraps all the way round it (a crushed ball). As progress grows the ball gets bigger and
//    bigger, so the sheet uncurls, until at 100% it is flat.
// 3. On top of that, every point is pushed in or out by "ridged" noise: sharp, uneven creases.
//    The creases are strong at 0% and fade away as the paper flattens.
// Drag rotates it in place (like a globe). It never moves, pans or zooms.
import * as THREE from 'three'

export type PaperHandle = {
  setProgress: (value: number) => void // 0..1
  dispose: () => void
}

type Options = { progress: number; reducedMotion: boolean }

const SHEET_H = 2
const SHEET_W = SHEET_H * 1.4
const SEG_X = 96 // fewer, bigger facets read as paper rather than rock
const SEG_Y = 68
const BALL_RADIUS = 0.46 // size of the ball the sheet wraps around at 0%

export function createPaperScene(container: HTMLElement, options: Options): PaperHandle {
  const reduced = options.reducedMotion

  // ---------- renderer, camera, lights ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const canvas = renderer.domElement
  canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:grab;touch-action:pan-y'
  canvas.setAttribute('aria-hidden', 'true')
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 0, 5.4)

  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x8a8172, 1.7))
  const key = new THREE.DirectionalLight(0xffe6c8, 2.4) // warm key light
  key.position.set(3, 4, 5)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xc9d6ff, 0.5) // weaker cool fill
  fill.position.set(-4, -1.5, 2)
  scene.add(fill)

  // ---------- the sheet ----------
  const geometry = new THREE.PlaneGeometry(SHEET_W, SHEET_H, SEG_X, SEG_Y)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const count = position.count
  const baseX = new Float32Array(count)
  const baseY = new Float32Array(count)
  const crease = new Float32Array(count) // -0.5..0.5, sharp ridges
  const wrinkle = new Float32Array(count) // faint wrinkle that stays at 100%

  // Straight fold lines across the sheet, each one a sharp V-shaped crease (like real crumpled paper)
  const folds = makeFolds(26)
  let sum = 0
  for (let i = 0; i < count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    baseX[i] = x
    baseY[i] = y
    let v = 0
    for (const fold of folds) {
      // a narrow, sharp ridge (or valley) along the fold line, flat paper elsewhere
      const d = Math.abs(x * fold.nx + y * fold.ny - fold.c)
      if (d < fold.w) v += fold.a * (1 - d / fold.w)
    }
    crease[i] = v + (ridged(x * 2.4 + 5, y * 2.4 + 9, 2.5) - 0.5) * 0.9
    sum += crease[i]
    wrinkle[i] = (valueNoise(x * 9, y * 9, 1.3) - 0.5) * 0.01
  }
  // centre the crease heights around 0 and scale them to about -0.5..0.5
  const mean = sum / count
  let peak = 0
  for (let i = 0; i < count; i++) peak = Math.max(peak, Math.abs(crease[i] - mean))
  for (let i = 0; i < count; i++) crease[i] = ((crease[i] - mean) / peak) * 0.5

  const material = new THREE.MeshStandardMaterial({
    color: 0xfbf9f3,
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
    flatShading: true, // keeps every crease facet visible
    bumpMap: grainTexture(),
    bumpScale: 0.25,
  })
  const mesh = new THREE.Mesh(geometry, material)
  const holder = new THREE.Group() // drag rotates this group
  holder.add(mesh)
  scene.add(holder)

  function applyProgress(p: number) {
    const array = position.array as Float32Array
    // radius of the ball the sheet curls around: small at 0%, huge (= flat) at 100%
    const wrap = BALL_RADIUS / Math.pow(1 - 0.999 * p, 1.6)
    const depth = 0.5 * Math.pow(1 - p, 1.2) // crease strength
    // keep the ball centred (so it spins in place); slide back to z = 0 as it flattens
    const centre = wrap * smoothstep(0, 0.7, p)
    for (let i = 0; i < count; i++) {
      const theta = baseX[i] / wrap
      const phi = baseY[i] / wrap
      // point on the ball, and the direction pointing out of it
      const nx = Math.sin(theta) * Math.cos(phi)
      const ny = Math.sin(phi)
      const nz = Math.cos(theta) * Math.cos(phi)
      const push = crease[i] * depth + wrinkle[i]
      array[i * 3] = nx * (wrap + push)
      array[i * 3 + 1] = ny * (wrap + push)
      array[i * 3 + 2] = nz * (wrap + push) - centre
    }
    mesh.scale.setScalar(1.5 - 0.5 * smoothstep(0, 0.65, p)) // the crushed ball shows bigger
    position.needsUpdate = true
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
  }

  // ---------- size ----------
  function resize() {
    const { clientWidth: w, clientHeight: h } = container
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // keep the flat sheet fully in view on narrow screens
    const fitWidth = (SHEET_W * 1.08) / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect)
    camera.position.z = Math.max(5.4, fitWidth)
    camera.updateProjectionMatrix()
  }
  const sizeObserver = new ResizeObserver(resize)
  sizeObserver.observe(container)
  resize()

  // ---------- drag to rotate (in place only), hover tilt ----------
  let dragging = false
  let lastX = 0
  let lastY = 0
  let spinX = 0 // angular speed while dragging / coasting
  let spinY = 0
  let hoverX = 0 // -1..1 pointer position over the canvas
  let hoverY = 0
  let idleTime = 0 // seconds since the last drag
  const dragTurn = new THREE.Quaternion() // the student's own rotation, eases back to zero

  function onDown(e: PointerEvent) {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    spinX = spinY = 0
    canvas.setPointerCapture(e.pointerId)
    canvas.style.cursor = 'grabbing'
  }
  function onMove(e: PointerEvent) {
    const box = canvas.getBoundingClientRect()
    hoverX = ((e.clientX - box.left) / box.width) * 2 - 1
    hoverY = ((e.clientY - box.top) / box.height) * 2 - 1
    if (!dragging) return
    spinY = (e.clientX - lastX) * 0.012
    spinX = (e.clientY - lastY) * 0.012
    lastX = e.clientX
    lastY = e.clientY
    turn(spinX, spinY)
    idleTime = 0
  }
  function onUp(e: PointerEvent) {
    dragging = false
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    canvas.style.cursor = 'grab'
  }
  function onLeave() {
    if (!dragging) hoverX = hoverY = 0
  }
  const axisX = new THREE.Vector3(1, 0, 0)
  const axisY = new THREE.Vector3(0, 1, 0)
  const step = new THREE.Quaternion()
  function turn(ax: number, ay: number) {
    step.setFromAxisAngle(axisY, ay)
    dragTurn.premultiply(step)
    step.setFromAxisAngle(axisX, ax)
    dragTurn.premultiply(step)
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('pointerleave', onLeave)

  // ---------- animation loop ----------
  let target = clamp01(options.progress)
  let shown = reduced ? target : 0 // springs up from crumpled on first show
  let speed = 0
  applyProgress(shown)

  const restCrumpled = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.35, 0.6, 0.15))
  const restFlat = new THREE.Quaternion() // flat sheet faces the camera
  const rest = new THREE.Quaternion()
  const sway = new THREE.Quaternion()
  const hover = new THREE.Quaternion()
  const identity = new THREE.Quaternion()

  let visible = true
  const viewObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
  })
  viewObserver.observe(container)

  let frame = 0
  let last = performance.now()
  let clock = 0
  function tick(now: number) {
    frame = requestAnimationFrame(tick)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!visible || document.hidden) return
    clock += dt

    // progress spring (no overshoot past 0..1)
    if (Math.abs(target - shown) > 0.0005 || Math.abs(speed) > 0.0005) {
      speed += (target - shown) * 60 * dt
      speed *= Math.exp(-11 * dt)
      shown = clamp01(shown + speed * dt)
      applyProgress(shown)
    }

    // coasting after release, then ease the student's turn back to zero
    if (!dragging) {
      idleTime += dt
      if (Math.abs(spinX) + Math.abs(spinY) > 0.0004) {
        turn(spinX, spinY)
        spinX *= Math.exp(-4 * dt)
        spinY *= Math.exp(-4 * dt)
      } else if (idleTime > 1.2) {
        dragTurn.slerp(identity, 1 - Math.exp(-1.5 * dt))
      }
    }

    // resting pose: crumpled ball sits at an angle, the flat sheet faces you
    rest.slerpQuaternions(restCrumpled, restFlat, smoothstep(0.55, 1, shown))
    const swayAmount = reduced ? 0 : 0.06 * (1 - shown * 0.7)
    sway.setFromEuler(new THREE.Euler(Math.sin(clock * 0.5) * swayAmount, Math.sin(clock * 0.37) * swayAmount * 1.4, 0))
    const tilt = dragging || reduced ? 0 : 0.14
    hover.setFromEuler(new THREE.Euler(hoverY * tilt, hoverX * tilt, 0))
    holder.quaternion.copy(dragTurn).multiply(hover).multiply(rest).multiply(sway)

    renderer.render(scene, camera)
  }
  frame = requestAnimationFrame(tick)

  return {
    setProgress(value) {
      target = clamp01(value)
      if (reduced) {
        shown = target
        applyProgress(shown)
      }
    },
    dispose() {
      cancelAnimationFrame(frame)
      sizeObserver.disconnect()
      viewObserver.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
      geometry.dispose()
      material.bumpMap?.dispose()
      material.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}

// ---------- small maths helpers ----------
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

function hash(x: number, y: number, z: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return n - Math.floor(n)
}

// Smooth random value at any 3D point (0..1)
function valueNoise(x: number, y: number, z: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = x - xi
  const yf = y - yi
  const zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const w = zf * zf * (3 - 2 * zf)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz)
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  )
}

// Ridged noise, 4 layers: sharp, uneven ridges like paper creases (0..1)
function ridged(x: number, y: number, z: number) {
  let sum = 0
  let amp = 0.5
  let freq = 1
  for (let octave = 0; octave < 4; octave++) {
    const n = 1 - Math.abs(valueNoise(x * freq, y * freq, z * freq) * 2 - 1)
    sum += n * n * amp
    freq *= 2.1
    amp *= 0.5
  }
  return sum / 0.9375
}

// Random straight fold lines (seeded, so every student sees the same paper)
function makeFolds(n: number) {
  let seed = 11
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  return Array.from({ length: n }, () => {
    const angle = random() * Math.PI
    return {
      nx: Math.cos(angle),
      ny: Math.sin(angle),
      c: (random() - 0.5) * 2.4,
      a: (random() < 0.5 ? -1 : 1) * (0.5 + random() * 0.5),
      w: 0.12 + random() * 0.22, // half-width of the ridge
    }
  })
}

// Fine paper grain for the bump map
function grainTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(size, size)
  for (let i = 0; i < size * size; i++) {
    const g = 110 + Math.random() * 60
    image.data[i * 4] = image.data[i * 4 + 1] = image.data[i * 4 + 2] = g
    image.data[i * 4 + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  return texture
}
