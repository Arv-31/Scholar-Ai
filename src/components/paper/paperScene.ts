// The 3D paper behind <PaperProgress />. Plain three.js, loaded only when a unit page opens.
//
// How it works (in plain words):
// 1. One flat sheet is cut into a fine grid of points (vertices).
// 2. At 0% the sheet is spread over a whole ball and creased by fold planes cutting through it,
//    so it is a closed, crushed paper ball that looks real from every side (it slowly turns).
// 3. As progress grows the ball is pressed into a thick crumpled pad (still closed on every
//    side), then its corners fold out until, at 100%, it is one flat sheet.
// 4. Straight, narrow fold lines give sharp creases; they fade away as the paper flattens.
// Drag rotates it in place (like a globe). It never moves, pans or zooms.
import * as THREE from 'three'

export type PaperHandle = {
  setProgress: (value: number) => void // 0..1
  dispose: () => void
}

type Options = { progress: number; reducedMotion: boolean }

const SHEET_H = 2
const SHEET_W = SHEET_H * 1.4
const SEG_X = 250 // fine enough for crisp fold lines (each crease is only a few points wide)
const SEG_Y = 178
const CRUSHED_RADIUS = 0.6 // size of the fully crushed ball at 0%

export function createPaperScene(container: HTMLElement, options: Options): PaperHandle {
  const reduced = options.reducedMotion

  // ---------- renderer, camera, lights ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping // softer, film-like highlights
  renderer.toneMappingExposure = 1.4
  const canvas = renderer.domElement
  canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:grab;touch-action:pan-y'
  canvas.setAttribute('aria-hidden', 'true')
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 0, 5.4)

  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x8a8172, 1.7))
  const key = new THREE.DirectionalLight(0xffe6c8, 2.4) // warm key light
  key.position.set(4.5, 2.5, 3) // low, from the side, so every fold casts light and shade
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xc9d6ff, 0.5) // weaker cool fill
  fill.position.set(-4, -1.5, 2)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0xfff2dd, 0.9) // faint backlight that outlines the edges
  rim.position.set(-1, 2.5, -4)
  scene.add(rim)

  // soft shadow on the card behind the paper (it does not turn with the paper)
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture(),
    transparent: true,
    depthWrite: false,
    toneMapped: false, // keep the shadow as dark as we set it
  })
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMaterial)
  shadow.position.set(0.3, -0.34, -1.4) // further back, so it is drawn larger (see scale below)
  scene.add(shadow)

  // ---------- the sheet ----------
  const geometry = new THREE.PlaneGeometry(SHEET_W, SHEET_H, SEG_X, SEG_Y)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const count = position.count
  const baseX = new Float32Array(count)
  const baseY = new Float32Array(count)
  const crease = new Float32Array(count) // -0.5..0.5, sharp ridges
  const wrinkle = new Float32Array(count) // faint wrinkle that stays at 100%

  // Straight fold lines across the sheet, each one a sharp V-shaped crease (like real crumpled paper)
  const folds = makeFolds(40)
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
    crease[i] = v + (ridged(x * 2.6 + 5, y * 2.6 + 9, 2.5) - 0.5) * 0.55
    sum += crease[i]
    wrinkle[i] = (valueNoise(x * 9, y * 9, 1.3) - 0.5) * 0.01
  }
  // centre the crease heights around 0 and scale them to about -0.5..0.5
  const mean = sum / count
  let peak = 0
  for (let i = 0; i < count; i++) peak = Math.max(peak, Math.abs(crease[i] - mean))
  for (let i = 0; i < count; i++) crease[i] = ((crease[i] - mean) / peak) * 0.5

  // The fully crushed ball (0%), worked out once. The sheet is spread evenly over a whole ball
  // ("octahedral" mapping: no poles, no gap), so it looks closed from every side. It is then
  // pushed in and out by straight fold planes cutting through it in 3D: sharp creases all round.
  const ball = new Float32Array(count * 3)
  const ballCrease = new Float32Array(count)
  const planes = makeFoldPlanes(90, 23, [0.2, 0.55]) // wide bands: the flat facets
  const creases = makeFoldPlanes(60, 41, [0.025, 0.06]) // narrow V folds: the crisp crease lines
  let ballSum = 0
  for (let i = 0; i < count; i++) {
    const [dx, dy, dz] = octahedralToSphere(baseX[i] / (SHEET_W / 2), baseY[i] / (SHEET_H / 2))
    let v = 0
    // each plane folds a band of the surface into a straight ridge or valley with flat sides;
    // many overlapping bands make flat facets meeting at sharp edges, like real crushed paper
    for (const plane of planes) {
      const d = Math.abs(dx * plane.nx + dy * plane.ny + dz * plane.nz - plane.c)
      if (d < plane.w) v += plane.a * (1 - d / plane.w)
    }
    for (const line of creases) {
      const d = Math.abs(dx * line.nx + dy * line.ny + dz * line.nz - line.c)
      if (d < line.w) v += line.a * 0.55 * (1 - d / line.w)
    }
    v += (ridged(dx * 5 + 3, dy * 5 + 7, dz * 5 + 1) - 0.5) * 0.12 // fine crinkle
    ballCrease[i] = v
    ballSum += v
    ball[i * 3] = dx
    ball[i * 3 + 1] = dy
    ball[i * 3 + 2] = dz
  }
  const ballMean = ballSum / count
  let ballPeak = 0
  for (let i = 0; i < count; i++) ballPeak = Math.max(ballPeak, Math.abs(ballCrease[i] - ballMean))
  for (let i = 0; i < count; i++) {
    ballCrease[i] = ((ballCrease[i] - ballMean) / ballPeak) * 0.5
    const r = CRUSHED_RADIUS * (1 + 0.36 * ballCrease[i])
    ball[i * 3] *= r
    ball[i * 3 + 1] *= r
    ball[i * 3 + 2] *= r
  }

  // per-point colour: valleys of the creases are a little darker (like real shadowed folds)
  const colors = new Float32Array(count * 3)
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const tone = new Float32Array(count) // tiny random tone change per area of the sheet
  for (let i = 0; i < count; i++)
    tone[i] = (valueNoise(baseX[i] * 3, baseY[i] * 3, 4.2) - 0.5) * 0.06

  const material = new THREE.MeshStandardMaterial({
    color: 0xfbf9f3,
    vertexColors: true,
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
    flatShading: false, // smooth light across each facet; the folds themselves stay sharp
    bumpMap: fibreTexture(),
    bumpScale: 0.35,
  })
  const mesh = new THREE.Mesh(geometry, material)
  const holder = new THREE.Group() // drag rotates this group
  holder.add(mesh)
  scene.add(holder)

  function applyProgress(p: number) {
    const array = position.array as Float32Array
    // 1) 0-45%: the closed ball is pressed flatter and wider into a thick crumpled pad.
    //    Squashing a closed shape keeps it closed, so no side ever shows an opening.
    const press = smoothstep(0, 0.45, p)
    const widen = 1 + 0.35 * press
    const thin = 1 - 0.8 * press
    // 2) 35-100%: the pad's corners fold out until it is one flat sheet.
    const open = smoothstep(0.35, 1, p)
    const depth = 0.5 * Math.pow(1 - p, 1.2) // crease strength on the opening sheet
    for (let i = 0; i < count; i++) {
      const padX = ball[i * 3] * widen
      const padY = ball[i * 3 + 1] * widen
      const padZ = ball[i * 3 + 2] * thin
      const flatZ = crease[i] * depth + wrinkle[i]
      array[i * 3] = padX + (baseX[i] - padX) * open
      array[i * 3 + 1] = padY + (baseY[i] - padY) * open
      array[i * 3 + 2] = padZ + (flatZ - padZ) * open
    }
    // darken the folds while crushed; the shading fades as the sheet flattens
    const colorArray = geometry.attributes.color.array as Float32Array
    const shade = Math.pow(1 - p, 0.8)
    for (let i = 0; i < count; i++) {
      const fold = ballCrease[i] + (crease[i] - ballCrease[i]) * open
      const valley = Math.max(0, -fold) * 2 // 0 on ridges, up to 1 deep in a fold
      const c = 1 - shade * (valley * 0.32 + 0.04) + tone[i] * shade
      colorArray[i * 3] = c
      colorArray[i * 3 + 1] = c * 0.995
      colorArray[i * 3 + 2] = c * 0.98
    }
    geometry.attributes.color.needsUpdate = true

    const scale = 1.5 - 0.5 * smoothstep(0, 0.65, p) // the crushed ball shows bigger
    mesh.scale.setScalar(scale)
    // the shadow grows from a round blob (ball) to the sheet's shape (flat)
    const flat = smoothstep(0.3, 1, p)
    const grow = 2.3 * scale // makes up for the shadow sitting further from the camera
    shadow.scale.set(
      (0.95 + (SHEET_W - 0.95) * flat) * grow * 0.75,
      (0.9 + (SHEET_H - 0.9) * flat) * grow * 0.75,
      1,
    )
    shadowMaterial.opacity = 0.22 - 0.06 * flat
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
  const spin = new THREE.Quaternion()
  const upAxis = new THREE.Vector3(0, 1, 0)
  let spinAngle = 0 // slow turn while crushed, so every side of the ball shows

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
    sway.setFromEuler(
      new THREE.Euler(
        Math.sin(clock * 0.5) * swayAmount,
        Math.sin(clock * 0.37) * swayAmount * 1.4,
        0,
      ),
    )
    const tilt = dragging || reduced ? 0 : 0.14
    hover.setFromEuler(new THREE.Euler(hoverY * tilt, hoverX * tilt, 0))
    // slow spin while crushed; as the paper opens it eases back to face you
    const spinAmount = reduced ? 0 : 1 - smoothstep(0.25, 0.6, shown)
    if (!dragging) spinAngle += dt * 0.35 * spinAmount
    const facing = Math.round(spinAngle / (Math.PI * 2)) * Math.PI * 2
    spinAngle += (facing - spinAngle) * (1 - spinAmount) * (1 - Math.exp(-3 * dt))
    spin.setFromAxisAngle(upAxis, spinAngle)
    holder.quaternion.copy(dragTurn).multiply(hover).multiply(rest).multiply(spin).multiply(sway)

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
      shadow.geometry.dispose()
      shadowMaterial.map?.dispose()
      shadowMaterial.dispose()
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

// Square sheet coordinates (-1..1, -1..1) to a point on a ball, spread evenly with no poles.
// The edges of the square fold onto each other at the back, so the ball is fully closed.
function octahedralToSphere(u: number, v: number): [number, number, number] {
  let x = u
  let y = v
  const z = 1 - Math.abs(u) - Math.abs(v)
  if (z < 0) {
    x = (1 - Math.abs(v)) * (u >= 0 ? 1 : -1)
    y = (1 - Math.abs(u)) * (v >= 0 ? 1 : -1)
  }
  const length = Math.hypot(x, y, z) || 1
  return [x / length, y / length, z / length]
}

// Random flat planes through the ball: each one makes a sharp crease where it cuts the surface
function makeFoldPlanes(n: number, seedValue: number, width: [number, number]) {
  let seed = seedValue
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  return Array.from({ length: n }, () => {
    const z = random() * 2 - 1
    const angle = random() * Math.PI * 2
    const r = Math.sqrt(1 - z * z)
    return {
      nx: r * Math.cos(angle),
      ny: r * Math.sin(angle),
      nz: z,
      c: (random() - 0.5) * 1.6,
      a: (random() < 0.5 ? -1 : 1) * (0.5 + random() * 0.5),
      w: width[0] + random() * (width[1] - width[0]), // half-width of the folded band
    }
  })
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
      w: 0.05 + random() * 0.12, // half-width of the ridge: narrow = crisp fold
    }
  })
}

// Paper surface for the bump map: fine grain plus short random fibres
function fibreTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(size, size)
  for (let i = 0; i < size * size; i++) {
    const g = 128 + (Math.random() - 0.5) * 40
    image.data[i * 4] = image.data[i * 4 + 1] = image.data[i * 4 + 2] = g
    image.data[i * 4 + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  ctx.lineCap = 'round'
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const angle = Math.random() * Math.PI
    const length = 4 + Math.random() * 14
    ctx.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.22)'
    ctx.lineWidth = 0.6 + Math.random() * 0.8
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

// Soft dark blob used as the shadow behind the paper
function shadowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(20,22,26,1)')
  gradient.addColorStop(0.55, 'rgba(20,22,26,0.55)')
  gradient.addColorStop(1, 'rgba(20,22,26,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}
