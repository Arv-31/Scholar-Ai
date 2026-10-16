import { useEffect, useMemo, useRef, useState } from 'react'

// The login background: a night hill (bottom right) with a hooded archer, back-lit by the moon.
//
// What he does:
//   idle       - stars twinkle, fireflies drift, he breathes with the bow lowered. If the pointer
//                stays still for about 1.5 s he turns to aim at it.
//   tap        - he shoots a dim arrow at the tapped point; it sticks for a moment and fades.
//   hold+move  - press and hold anywhere on the sky: he draws and follows the pointer with no
//                delay at all; let go and he shoots there.
//   behind him - if the target is behind his back he turns round and shoots that way.
//   drawing    - while Supabase checks the login he draws the bow at the card. Nothing bright yet.
//   success    - ONLY after Supabase confirms the login: he reaches back, the celestial arrow
//                lights up, he shoots it into the card, a 1.5 s blast of light fills the screen,
//                then onBlastDone() lets the page open the home screen out of that light.
//   fail       - the bow lowers again.
// Taps on the form (inputs, buttons, links, the card) never shoot.
// One requestAnimationFrame loop edits SVG attributes directly, so React does not re-render
// 60 times a second.

export type ArcherPhase = 'idle' | 'drawing' | 'success' | 'fail'
export type Point = { x: number; y: number }

type Props = {
  phase: ArcherPhase
  getTarget: () => Point | null // centre of the login card
  onImpact: (point: Point) => void // celestial arrow hit the card
  onBlastDone: (point: Point) => void // the 1.5 s blast is over
}

const DEG = Math.PI / 180
const AIM_MIN = -28 * DEG // lowest he will aim
const AIM_MAX = 55 * DEG // highest he will aim
const RELAXED = -62 * DEG // bow lowered
const STILL_SECONDS = 1.5
const SLOW_SPEED = 90 // px per second; slower than this counts as "still"
const HOLD_MS = 200 // pressing longer than this = "hold and aim"
const MAX_ARROWS = 6
const BLAST_SECONDS = 1.5

// The archer's own coordinates: feet at 0,0, facing left (forward = -x), up = -y.
const FRONT_SHOULDER = { x: -7, y: -137 }
const BACK_SHOULDER = { x: 5, y: -135 }
const QUIVER_TOP = { x: 22, y: -156 }
const ARM = 23 // upper arm and forearm length
const BOW_R = 42

type Flight = {
  el: SVGGElement | null
  active: boolean
  from: Point
  to: Point
  start: number
  duration: number
  angle: number
}

export default function ArcherScene({ phase, getTarget, onImpact, onBlastDone }: Props) {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  const layout = useMemo(() => makeLayout(size.w, size.h), [size])
  const stars = useMemo(() => makeStars(size.w, size.h), [size])
  const scenery = useMemo(() => makeScenery(layout), [layout])

  const live = useRef({ phase, getTarget, onImpact, onBlastDone })
  useEffect(() => {
    live.current = { phase, getTarget, onImpact, onBlastDone }
  }, [phase, getTarget, onImpact, onBlastDone])

  const figure = useRef<SVGGElement>(null)
  const upper = useRef<SVGGElement>(null)
  const head = useRef<SVGGElement>(null)
  const cloak = useRef<SVGPathElement>(null)
  // arm parts: [bow upper arm, bow forearm, draw upper arm, draw forearm]
  const armParts = useRef<(SVGPathElement | null)[]>([])
  // joints: [bow shoulder, bow elbow, bow hand, draw shoulder, draw elbow, draw hand]
  const armJoints = useRef<(SVGCircleElement | null)[]>([])
  const bow = useRef<SVGPathElement>(null)
  const string = useRef<SVGPolylineElement>(null)
  const nocked = useRef<SVGGElement>(null)
  const glimmer = useRef<SVGCircleElement>(null)
  const celestial = useRef<SVGGElement>(null)
  const trail = useRef<SVGPolylineElement>(null)
  const blast = useRef<SVGGElement>(null)
  const blastCore = useRef<SVGCircleElement>(null)
  const blastRays = useRef<SVGGElement>(null)
  const blastRings = useRef<(SVGCircleElement | null)[]>([])
  const sparks = useRef<(SVGCircleElement | null)[]>([])
  const whiteout = useRef<SVGRectElement>(null)
  const arrowEls = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    function onResize() {
      setSize({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { s, px, py, w, h } = layout
    let facing = 1 // 1 = facing left, -1 = facing right (drawn mirrored)
    let facingTarget = 1
    const toWorld = (p: Point): Point => ({ x: px + p.x * s * facing, y: py + p.y * s })
    const toLocal = (p: Point): Point => ({
      x: (p.x - px) / (s * facingTarget),
      y: (p.y - py) / s,
    })

    const pointer = { x: 0, y: 0, known: false }
    let lastPointer = { x: 0, y: 0 }
    let still = 0
    let aimPoint: Point | null = null
    let press: { start: number } | null = null
    let angle = RELAXED
    let draw = 0
    let tap: { target: Point; start: number } | null = null
    let successStart = -1
    let impactAt = -1
    let impactPoint: Point = { x: 0, y: 0 }
    let blastDone = false
    let celestialFlight: Flight | null = null
    const trailPoints: Point[] = []
    const flights: Flight[] = Array.from({ length: MAX_ARROWS }, (_, i) => ({
      el: arrowEls.current[i],
      active: false,
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 },
      start: 0,
      duration: 0,
      angle: 0,
    }))
    const sparkDirs = sparks.current.map((_, i) => {
      const a = (i / sparks.current.length) * Math.PI * 2 + i * 0.37
      return { x: Math.cos(a), y: Math.sin(a), dist: 0.25 + ((i * 53) % 17) / 17 }
    })

    const busy = () => live.current.phase === 'drawing' || live.current.phase === 'success'
    const onForm = (e: PointerEvent) =>
      (e.target as Element | null)?.closest(
        'input, button, a, label, select, textarea, [data-no-arrows]',
      )

    function onMove(e: PointerEvent) {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.known = true
    }
    function onDown(e: PointerEvent) {
      if (reduced || e.button !== 0 || onForm(e) || busy()) return
      press = { start: performance.now() }
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.known = true
    }
    function onUp(e: PointerEvent) {
      if (!press) return
      const held = performance.now() - press.start
      const target = { x: e.clientX, y: e.clientY }
      press = null
      if (busy()) return
      if (held >= HOLD_MS) {
        // he was already following the pointer at full draw: release now
        launch(arrowTip(), target, performance.now())
        draw = 0.2
      } else {
        tap = { target, start: performance.now() }
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    function aimAt(world: Point) {
      // turn round if the target is behind his back
      facingTarget = world.x > px + 6 * s ? -1 : 1
      const t = toLocal(world)
      const sh = FRONT_SHOULDER
      return clamp(Math.atan2(sh.y - t.y, sh.x - t.x), AIM_MIN, AIM_MAX)
    }

    // where the arrow tip is right now, in screen coordinates
    function arrowTip(): Point {
      const d = dirOf(angle)
      const hand = stringHand(angle, draw)
      return toWorld({ x: hand.x + d.x * 74, y: hand.y + d.y * 74 })
    }

    function launch(from: Point, to: Point, now: number) {
      const free =
        flights.find((fl) => !fl.active) ?? flights.reduce((a, b) => (a.start < b.start ? a : b))
      const distance = Math.hypot(to.x - from.x, to.y - from.y)
      Object.assign(free, {
        active: true,
        from,
        to,
        start: now,
        duration: clamp(distance / 1600, 0.2, 0.65),
      })
    }

    let frame = 0
    let last = performance.now()
    let clock = 0
    function tick(now: number) {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      clock += dt
      const { phase: currentPhase, getTarget: target } = live.current

      // --- is the pointer still? (for the 1.5 s idle aim) ---
      if (pointer.known) {
        const speed =
          Math.hypot(pointer.x - lastPointer.x, pointer.y - lastPointer.y) / Math.max(dt, 0.001)
        lastPointer = { x: pointer.x, y: pointer.y }
        if (speed > SLOW_SPEED) still = 0
        else still += dt
        if (still >= STILL_SECONDS) aimPoint = { x: pointer.x, y: pointer.y }
      }

      const breath = reduced ? 0 : Math.sin(clock * 1.7) * 1.2
      let wantAngle = RELAXED
      let wantDraw = 0
      let instant = false
      let reach: Point | null = null // draw hand reaching behind the back
      let showNocked = false
      let showCelestial = false
      let glow = 0.35

      if (currentPhase === 'success' && successStart < 0) successStart = now
      if (currentPhase !== 'success') successStart = -1

      if (currentPhase === 'drawing' || currentPhase === 'success') {
        const card = target()
        if (card) wantAngle = aimAt(card)
        wantDraw = 1
        showNocked = true
      } else if (press && now - press.start >= HOLD_MS) {
        // hold and move: follow the pointer exactly, no easing at all
        wantAngle = aimAt(pointer)
        wantDraw = 1
        instant = true
        showNocked = true
      } else if (tap) {
        wantAngle = aimAt(tap.target)
        instant = true
        const t = (now - tap.start) / 1000
        wantDraw = t < 0.14 ? 0.9 : 0
        showNocked = t < 0.14
        if (t >= 0.14) {
          launch(arrowTip(), tap.target, now)
          tap = null
          still = 0
        }
      } else if (currentPhase === 'idle' && aimPoint && !reduced) {
        wantAngle = aimAt(aimPoint)
        wantDraw = 0.12
        showNocked = true
      } else {
        facingTarget = 1
      }

      // --- the success timeline (ms since the login was confirmed) ---
      if (successStart >= 0) {
        const t = now - successStart
        glow = 1
        showNocked = false
        const rest = restHand(angle)
        if (t < 320) {
          reach = lerpPoint(rest, QUIVER_TOP, ease(t / 320))
          wantDraw = 0
        } else if (t < 600) {
          reach = lerpPoint(QUIVER_TOP, rest, ease((t - 320) / 280))
          wantDraw = 0
          showCelestial = true
        } else if (t < 950) {
          wantDraw = 1
          showCelestial = true
        } else {
          if (!celestialFlight) {
            const card = target() ?? { x: w * 0.3, y: h * 0.5 }
            celestialFlight = {
              el: celestial.current,
              active: true,
              from: arrowTip(),
              to: card,
              start: now,
              duration: 0.36,
              angle: 0,
            }
            trailPoints.length = 0
          }
          wantDraw = 0
        }
      }

      // --- turn round smoothly, aim (instantly when following the pointer), draw ---
      facing += (facingTarget - facing) * (1 - Math.exp(-16 * dt))
      if (Math.abs(facing) < 0.04) facing = facingTarget * 0.04
      angle = instant
        ? wantAngle
        : angle + (wantAngle - angle) * (1 - Math.exp(-(currentPhase === 'drawing' ? 6 : 5) * dt))
      const drawSpeed = wantDraw > draw ? (instant ? 20 : 9) : 14
      draw += (wantDraw - draw) * (1 - Math.exp(-drawSpeed * dt))

      // --- pose, in the archer's own coordinates ---
      const d = dirOf(angle)
      const n = { x: d.y, y: -d.x }
      const shoulder = { x: FRONT_SHOULDER.x, y: FRONT_SHOULDER.y + breath }
      const backShoulder = { x: BACK_SHOULDER.x, y: BACK_SHOULDER.y + breath }
      const elbow = add(shoulder, scale(d, ARM), scale(n, -2))
      const grip = add(shoulder, scale(d, ARM * 1.95))
      const tip1 = add(grip, scale(n, BOW_R), scale(d, -BOW_R * 0.28))
      const tip2 = add(grip, scale(n, -BOW_R), scale(d, -BOW_R * 0.28))
      const mid = lerpPoint(tip1, tip2, 0.5)
      const held = add(mid, scale(d, -draw * BOW_R * 0.95))
      const hand = reach ?? held
      const backElbow = ikElbow(backShoulder, hand)

      figure.current?.setAttribute(
        'transform',
        `translate(${f(px)} ${f(py)}) scale(${f(facing * s, 3)} ${f(s, 3)})`,
      )
      upper.current?.setAttribute('transform', `translate(0 ${f(breath)})`)
      head.current?.setAttribute('transform', `rotate(${f(-(angle - RELAXED) * 14 - 6)} -1 -150)`)
      cloak.current?.setAttribute(
        'transform',
        `skewX(${f(reduced ? 0 : Math.sin(clock * 1.3) * 2.5)})`,
      )
      const parts: [Point, Point, number, number][] = [
        [shoulder, elbow, 8, 6.4],
        [elbow, grip, 6.4, 5],
        [backShoulder, backElbow, 8, 6.4],
        [backElbow, hand, 6.4, 5],
      ]
      parts.forEach(([a, b, wa, wb], i) =>
        armParts.current[i]?.setAttribute('d', limbPath(a, b, wa, wb)),
      )
      const joints: [Point, number][] = [
        [shoulder, 4.6],
        [elbow, 3.3],
        [grip, 3.6],
        [backShoulder, 4.6],
        [backElbow, 3.3],
        [hand, 3.4],
      ]
      joints.forEach(([p, r], i) => {
        const el = armJoints.current[i]
        if (!el) return
        el.setAttribute('cx', f(p.x))
        el.setAttribute('cy', f(p.y))
        el.setAttribute('r', String(r))
      })
      const r1 = add(tip1, scale(d, 6), scale(n, 3))
      const r2 = add(tip2, scale(d, 6), scale(n, -3))
      const c1 = add(lerpPoint(tip1, grip, 0.5), scale(d, 9))
      const c2 = add(lerpPoint(tip2, grip, 0.5), scale(d, 9))
      bow.current?.setAttribute(
        'd',
        `M${pt(r1)}Q${pt(add(tip1, d))} ${pt(tip1)}Q${pt(c1)} ${pt(grip)}` +
          `Q${pt(c2)} ${pt(tip2)}Q${pt(add(tip2, d))} ${pt(r2)}`,
      )
      string.current?.setAttribute('points', `${pt(tip1)} ${pt(reach ? mid : held)} ${pt(tip2)}`)
      const localDeg = (Math.atan2(d.y, d.x) * 180) / Math.PI
      if (nocked.current) {
        nocked.current.setAttribute('opacity', showNocked ? '1' : '0')
        nocked.current.setAttribute('transform', `translate(${pt(held)}) rotate(${f(localDeg)})`)
      }
      const quiverWorld = toWorld({ x: QUIVER_TOP.x, y: QUIVER_TOP.y + breath })
      glimmer.current?.setAttribute('cx', f(quiverWorld.x))
      glimmer.current?.setAttribute('cy', f(quiverWorld.y - 4 * s))
      glimmer.current?.setAttribute('opacity', String(glow))

      // --- celestial arrow: in the hand, then flying with a trail ---
      const worldDeg = (Math.atan2(d.y, d.x * facing) * 180) / Math.PI
      if (celestial.current) {
        if (celestialFlight) {
          const t = clamp((now - celestialFlight.start) / 1000 / celestialFlight.duration, 0, 1)
          const p = lerpPoint(celestialFlight.from, celestialFlight.to, t)
          const flightDeg =
            (Math.atan2(
              celestialFlight.to.y - celestialFlight.from.y,
              celestialFlight.to.x - celestialFlight.from.x,
            ) *
              180) /
            Math.PI
          celestial.current.setAttribute('transform', `translate(${pt(p)}) rotate(${f(flightDeg)})`)
          celestial.current.setAttribute('opacity', t < 1 ? '1' : '0')
          trailPoints.push(p)
          if (trailPoints.length > 16) trailPoints.shift()
          if (t >= 1 && impactAt < 0) {
            impactAt = now
            impactPoint = celestialFlight.to
            live.current.onImpact(impactPoint)
          }
        } else if (showCelestial) {
          celestial.current.setAttribute(
            'transform',
            `translate(${pt(toWorld(hand))}) rotate(${f(worldDeg)})`,
          )
          celestial.current.setAttribute('opacity', '1')
        } else {
          celestial.current.setAttribute('opacity', '0')
        }
      }
      if (trail.current) {
        trail.current.setAttribute('points', trailPoints.map(pt).join(' '))
        trail.current.setAttribute(
          'opacity',
          impactAt > 0 ? f(Math.max(0, 1 - (now - impactAt) / 250)) : '0.85',
        )
      }

      // --- the divine blast: 1.5 s of light, ending in a white flash ---
      if (impactAt > 0 && blast.current) {
        const t = clamp((now - impactAt) / 1000 / BLAST_SECONDS, 0, 1)
        const { x, y } = impactPoint
        const maxR = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))
        blast.current.setAttribute('opacity', '1')
        blastCore.current?.setAttribute('cx', f(x))
        blastCore.current?.setAttribute('cy', f(y))
        blastCore.current?.setAttribute('r', f(20 + ease(t) * maxR * 0.45))
        blastCore.current?.setAttribute('opacity', f(0.95 - t * 0.2))
        blastRays.current?.setAttribute(
          'transform',
          `translate(${f(x)} ${f(y)}) rotate(${f(t * 50)}) scale(${f(0.1 + (ease(t) * maxR) / 100, 3)})`,
        )
        blastRays.current?.setAttribute('opacity', f(Math.min(1, t * 4) * (1 - t * 0.6)))
        blastRings.current.forEach((ring, i) => {
          if (!ring) return
          const rt = clamp((t - i * 0.12) / 0.75, 0, 1)
          ring.setAttribute('cx', f(x))
          ring.setAttribute('cy', f(y))
          ring.setAttribute('r', f(ease(rt) * maxR))
          ring.setAttribute('stroke-width', f(10 * (1 - rt) + 1))
          ring.setAttribute('opacity', f(rt > 0 ? 1 - rt : 0))
        })
        sparks.current.forEach((spark, i) => {
          if (!spark) return
          const dir = sparkDirs[i]
          const out = ease(Math.min(1, t * 1.6)) * maxR * dir.dist
          spark.setAttribute('cx', f(x + dir.x * out))
          spark.setAttribute('cy', f(y + dir.y * out))
          spark.setAttribute('r', f(3.2 * (1 - t) + 0.3))
          spark.setAttribute('opacity', f(1 - t))
        })
        whiteout.current?.setAttribute('opacity', f(smoothstep(0.6, 1, t), 3))
        if (t >= 1 && !blastDone) {
          blastDone = true
          live.current.onBlastDone(impactPoint)
        }
      }

      // --- normal arrows: in flight, stuck, then fading ---
      for (const flight of flights) {
        if (!flight.el) continue
        if (!flight.active) {
          flight.el.setAttribute('opacity', '0')
          continue
        }
        const age = (now - flight.start) / 1000
        const t = clamp(age / flight.duration, 0, 1)
        const arc = Math.hypot(flight.to.x - flight.from.x, flight.to.y - flight.from.y) * 0.07
        const at = (k: number) => {
          const p = lerpPoint(flight.from, flight.to, k)
          p.y -= Math.sin(Math.PI * k) * arc
          return p
        }
        const p = at(t)
        if (t < 1) {
          const ahead = at(Math.min(1, t + 0.02))
          flight.angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI
        }
        const stuckFor = age - flight.duration
        const opacity = stuckFor < 0.9 ? 1 : Math.max(0, 1 - (stuckFor - 0.9) / 0.5)
        if (opacity <= 0) flight.active = false
        flight.el.setAttribute('transform', `translate(${pt(p)}) rotate(${f(flight.angle)})`)
        flight.el.setAttribute('opacity', f(opacity, 2))
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [layout])

  const { w, h, s } = layout

  return (
    <svg
      className="pointer-events-none fixed inset-0 h-full w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050913" />
          <stop offset="0.6" stopColor="#101933" />
          <stop offset="1" stopColor="#24305a" />
        </linearGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ea2d8" stopOpacity="0" />
          <stop offset="0.5" stopColor="#8ea2d8" stopOpacity="0.14" />
          <stop offset="1" stopColor="#8ea2d8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="mist">
          <stop offset="0" stopColor="#aab8e6" stopOpacity="0.22" />
          <stop offset="1" stopColor="#aab8e6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blast-core">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#fff4d2" stopOpacity="0.95" />
          <stop offset="0.7" stopColor="#ffd88a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="celestial-shaft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7fc8ff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="soft" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="18" />
        </filter>

        {/* The archer, in his own coordinates (feet at 0,0, facing left). Drawn twice below:
            a pale copy nudged towards the moon (rim light), then the dark figure on top. */}
        <g
          id="archer"
          ref={figure}
          fill="currentColor"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* legs and boots */}
          {LEG_SEGMENTS.map(([from, to, wa, wb], i) => (
            <path key={i} d={limbPath(from, to, wa, wb)} stroke="none" />
          ))}
          {LEG_JOINTS.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} stroke="none" />
          ))}
          <path d="M-15 -15 L-17 0 L-37 0 Q-40 -3 -35 -7 L-25 -10 Z" stroke="none" />
          <path d="M27 -15 L29 0 L10 0 Q7 -3 12 -7 L21 -10 Z" stroke="none" />
          <g ref={upper}>
            {/* cloak behind the back, moving in the wind */}
            <path
              ref={cloak}
              d="M5 -147 C20 -141 27 -112 31 -82 C34 -62 40 -50 47 -42 C37 -44 28 -50 21 -56 C16 -80 12 -112 9 -140 Z"
              stroke="none"
            />
            {/* quiver with arrows */}
            <g transform="rotate(18 16 -126)">
              <rect x="10" y="-152" width="11" height="54" rx="3" stroke="none" />
              <line x1="12.5" y1="-152" x2="11" y2="-168" strokeWidth="1.6" />
              <line x1="17" y1="-152" x2="18" y2="-166" strokeWidth="1.6" />
              <path d="M9 -168 l2 -7 l2 7 Z" strokeWidth="1" />
              <path d="M16 -166 l2 -7 l2 7 Z" strokeWidth="1" />
            </g>
            {/* torso in profile (chest forward, back behind) and hips */}
            <path
              d="M-9 -90 C-13 -104 -16 -116 -16 -128 C-16 -136 -12 -142 -6 -146 L4 -148 C12 -145 15 -136 14 -126 C13 -114 10 -102 12 -90 Z"
              stroke="none"
            />
            <ellipse cx="2" cy="-90" rx="13" ry="7" stroke="none" />
            {/* neck and hooded head */}
            <g ref={head}>
              <path d={NECK} stroke="none" />
              <ellipse cx="-3" cy="-161" rx="9" ry="11" stroke="none" />
              <path d="M-11 -163 L-14 -159 L-11 -157 Z" stroke="none" />
              <path
                d="M9 -148 C14 -160 12 -175 0 -178 C-10 -180 -16 -172 -15 -163 C-12 -168 -6 -171 0 -169 C6 -166 6 -156 9 -148 Z"
                stroke="none"
              />
            </g>
          </g>
          {/* arms (jointed, posed every frame) and the bow */}
          {[2, 3].map((i) => (
            <path key={i} ref={(el) => void (armParts.current[i] = el)} stroke="none" />
          ))}
          {[3, 4, 5].map((i) => (
            <circle key={i} ref={(el) => void (armJoints.current[i] = el)} r="0" stroke="none" />
          ))}
          <path ref={bow} fill="none" strokeWidth="3.4" />
          <polyline ref={string} fill="none" strokeWidth="0.9" />
          {[0, 1].map((i) => (
            <path key={i} ref={(el) => void (armParts.current[i] = el)} stroke="none" />
          ))}
          {[0, 1, 2].map((i) => (
            <circle key={i} ref={(el) => void (armJoints.current[i] = el)} r="0" stroke="none" />
          ))}
          <g ref={nocked} opacity="0">
            <line x1="0" y1="0" x2="64" y2="0" strokeWidth="1.8" />
            <path d="M64 -4 L74 0 L64 4 Z" strokeWidth="1" />
          </g>
        </g>
      </defs>

      <rect width={w} height={h} fill="url(#sky)" />

      {/* moon: the light behind the archer */}
      <circle
        cx={w * 0.88}
        cy={h * 0.16}
        r={Math.min(w, h) * 0.1}
        fill="#c9d4ff"
        opacity="0.18"
        filter="url(#soft)"
      />
      <circle cx={w * 0.88} cy={h * 0.16} r={Math.min(w, h) * 0.032} fill="#efeadb" />

      <g>
        {stars.map((star, i) => (
          <circle
            key={i}
            className="star"
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="#f3efe4"
            style={{
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              opacity: star.o,
            }}
          />
        ))}
      </g>
      <line
        className="shooting-star"
        x1={w * 0.18}
        y1={h * 0.1}
        x2={w * 0.18 + 90}
        y2={h * 0.1 + 30}
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* far mountains, then hills with haze between them */}
      <path d={scenery.mountains} fill="#141c36" />
      <rect y={h * 0.48} width={w} height={h * 0.25} fill="url(#haze)" />
      <path
        d={`M${w * 0.28} ${h} C${w * 0.46} ${h * 0.8} ${w * 0.6} ${h * 0.62} ${w * 0.78} ${h * 0.6} S${w * 0.95} ${h * 0.56} ${w} ${h * 0.58} L${w} ${h} Z`}
        fill="#19223f"
      />
      {scenery.village.map((light, i) => (
        <circle key={i} cx={light.x} cy={light.y} r={light.r} fill="#ffcf7a" opacity={light.o} />
      ))}
      <rect y={h * 0.6} width={w} height={h * 0.25} fill="url(#haze)" />
      <path
        d={`M${w * 0.4} ${h} C${w * 0.56} ${h * 0.84} ${w * 0.68} ${h * 0.7} ${w * 0.88} ${h * 0.68} S${w * 0.99} ${h * 0.7} ${w} ${h * 0.71} L${w} ${h} Z`}
        fill="#10172d"
      />
      <ellipse
        className="mist"
        cx={w * 0.7}
        cy={h * 0.74}
        rx={w * 0.35}
        ry={h * 0.06}
        fill="url(#mist)"
      />

      {/* front hill: gnarled tree, crest, rocks and grass */}
      <g stroke="#05070c" fill="none" strokeLinecap="round">
        {scenery.tree.map((b, i) => (
          <path key={i} d={b.d} strokeWidth={b.width} />
        ))}
      </g>
      <path d={scenery.frontHill} fill="#05070c" />
      <path d={scenery.rocks} fill="#05070c" />
      <path d={scenery.grass} fill="#05070c" />
      <ellipse
        className="mist mist-slow"
        cx={w * 0.55}
        cy={h * 0.93}
        rx={w * 0.4}
        ry={h * 0.05}
        fill="url(#mist)"
      />

      {/* rim light copy, then the archer */}
      <use href="#archer" transform="translate(1.6 -1.3)" color="#b8c6f5" opacity="0.75" />
      <use href="#archer" color="#05070c" />

      {/* fireflies */}
      {scenery.fireflies.map((fly, i) => (
        <circle
          key={i}
          className="firefly"
          cx={fly.x}
          cy={fly.y}
          r={1.6 * Math.max(s, 0.7)}
          fill="#ffe9a8"
          filter="url(#glow)"
          style={{ animationDelay: `${fly.delay}s`, animationDuration: `${fly.duration}s` }}
        />
      ))}

      {/* the celestial arrow waiting in the quiver */}
      <circle ref={glimmer} r={2.6 * s} fill="#cfeeff" opacity="0.35" filter="url(#glow)" />

      {/* normal arrows (dim) */}
      {Array.from({ length: MAX_ARROWS }, (_, i) => (
        <g
          key={i}
          ref={(el) => {
            arrowEls.current[i] = el
          }}
          opacity="0"
          stroke="#97a0b5"
          fill="#97a0b5"
        >
          <line x1={-62 * s} y1="0" x2="0" y2="0" strokeWidth={1.6 * s} />
          <path d={`M0 ${-3.5 * s} L${9 * s} 0 L0 ${3.5 * s} Z`} />
          <path
            d={`M${-62 * s} 0 l${-7 * s} ${-4 * s} M${-62 * s} 0 l${-7 * s} ${4 * s}`}
            strokeWidth={1.2 * s}
            fill="none"
          />
        </g>
      ))}

      {/* celestial arrow and its trail */}
      <polyline
        ref={trail}
        fill="none"
        stroke="#bfe6ff"
        strokeWidth={3 * s}
        strokeLinecap="round"
        filter="url(#glow)"
        opacity="0"
      />
      <g ref={celestial} opacity="0" filter="url(#glow)">
        <line
          x1="0"
          y1="0"
          x2={70 * s}
          y2="0"
          stroke="url(#celestial-shaft)"
          strokeWidth={2.6 * s}
        />
        <path d={`M${70 * s} ${-5 * s} L${84 * s} 0 L${70 * s} ${5 * s} Z`} fill="#ffffff" />
      </g>

      {/* the divine blast: core of light, turning rays, shock rings, sparks, then white */}
      <g ref={blast} opacity="0">
        <circle ref={blastCore} r="0" fill="url(#blast-core)" />
        <g ref={blastRays} fill="#fff4d2">
          {Array.from({ length: 22 }, (_, i) => (
            <polygon
              key={i}
              points="0,-1.6 100,0 0,1.6"
              transform={`rotate(${(i * 360) / 22 + (i % 3) * 4})`}
              opacity={0.5 + (i % 4) * 0.12}
            />
          ))}
        </g>
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            ref={(el) => {
              blastRings.current[i] = el
            }}
            r="0"
            fill="none"
            stroke={i === 1 ? '#bfe6ff' : '#fff1c4'}
          />
        ))}
        {Array.from({ length: 36 }, (_, i) => (
          <circle
            key={i}
            ref={(el) => {
              sparks.current[i] = el
            }}
            r="0"
            fill={i % 3 === 0 ? '#bfe6ff' : '#fff4d2'}
          />
        ))}
        <rect ref={whiteout} width={w} height={h} fill="#fff8e6" opacity="0" />
      </g>
    </svg>
  )
}

// ---------- the archer's fixed body parts ----------
const LEG_SEGMENTS: [Point, Point, number, number][] = [
  [{ x: -3, y: -88 }, { x: -13, y: -48 }, 16, 11],
  [{ x: -13, y: -48 }, { x: -21, y: -8 }, 11, 7.5],
  [{ x: 7, y: -88 }, { x: 15, y: -47 }, 16, 11],
  [{ x: 15, y: -47 }, { x: 21, y: -8 }, 11, 7.5],
]
const LEG_JOINTS: [number, number, number][] = [
  [-3, -88, 8],
  [7, -88, 8],
  [-13, -48, 5.5],
  [15, -47, 5.5],
  [-21, -8, 3.8],
  [21, -8, 3.8],
]
const NECK = limbPath({ x: -1, y: -143 }, { x: -2, y: -152 }, 7.5, 6.5)

// ---------- layout, scenery and helpers ----------
function makeLayout(w: number, h: number) {
  const mobile = w < 768
  const s = mobile ? clamp(w / 640, 0.5, 0.72) : clamp(h / 700, 0.75, 1.3)
  return { w, h, s, mobile, px: w * (mobile ? 0.84 : 0.83), py: h * (mobile ? 0.88 : 0.74) }
}

type Layout = ReturnType<typeof makeLayout>

function makeScenery({ w, h, s, px, py }: Layout) {
  const random = seeded(31)
  // the front hill, as two curves meeting at the archer's feet
  const seg1 = [
    { x: w * 0.5, y: h },
    { x: w * 0.64, y: h * 0.92 },
    { x: w * 0.74, y: py + 12 },
    { x: px, y: py },
  ]
  const seg2 = [
    { x: px, y: py },
    { x: px + w * 0.06, y: py - 2 },
    { x: w * 0.97, y: py + 16 },
    { x: w, y: py + 30 },
  ]
  const frontHill =
    `M${pt(seg1[0])}C${pt(seg1[1])} ${pt(seg1[2])} ${pt(seg1[3])}` +
    `C${pt(seg2[1])} ${pt(seg2[2])} ${pt(seg2[3])}L${w} ${h}Z`

  // grass blades along the crest (shorter right at his feet)
  let grass = ''
  const blades = (seg: Point[], from: number, to: number) => {
    const steps = Math.round(((to - from) * w * 0.5) / (4 * Math.max(s, 0.6)))
    for (let i = 0; i <= steps; i++) {
      const base = bezier(seg, from + ((to - from) * i) / steps)
      const nearFeet = Math.abs(base.x - px) < 40 * s ? 0.45 : 1
      const tall = (4 + random() * 10) * s * nearFeet
      const lean = (random() - 0.5) * 7 * s
      const half = (1.3 + random()) * s
      grass +=
        `M${f(base.x - half)} ${f(base.y + 2)}` +
        `Q${f(base.x + lean * 0.4)} ${f(base.y - tall * 0.6)} ${f(base.x + lean)} ${f(base.y - tall)}` +
        `Q${f(base.x + lean * 0.2)} ${f(base.y - tall * 0.4)} ${f(base.x + half)} ${f(base.y + 2)}Z`
    }
  }
  blades(seg1, 0.3, 1)
  blades(seg2, 0, 1)

  // a gnarled tree on the right slope: branches that split and get thinner
  const treeBase = bezier(seg2, 0.62)
  const tree: { d: string; width: number }[] = []
  const branch = (x: number, y: number, len: number, a: number, width: number, depth: number) => {
    const x2 = x + Math.cos(a) * len
    const y2 = y + Math.sin(a) * len
    const bend = (random() - 0.5) * len * 0.4
    tree.push({
      d: `M${f(x)} ${f(y)}Q${f((x + x2) / 2 + bend)} ${f((y + y2) / 2)} ${f(x2)} ${f(y2)}`,
      width,
    })
    if (depth === 0) return
    const parts = depth > 3 ? 2 : 2 + Math.round(random())
    for (let i = 0; i < parts; i++) {
      branch(
        x2,
        y2,
        len * (0.62 + random() * 0.18),
        a + (random() - 0.5) * 1.3,
        width * 0.66,
        depth - 1,
      )
    }
  }
  branch(treeBase.x, treeBase.y + 4, 46 * s, -Math.PI / 2 - 0.12, 7 * s, 5)

  // rocks near his feet
  const rock = (c: Point, rw: number, rh: number) =>
    `M${f(c.x - rw)} ${f(c.y + 3)}Q${f(c.x - rw * 0.9)} ${f(c.y - rh)} ${f(c.x - rw * 0.1)} ${f(c.y - rh * 1.1)}` +
    `Q${f(c.x + rw * 0.8)} ${f(c.y - rh * 0.9)} ${f(c.x + rw)} ${f(c.y + 3)}Z`
  const rocks =
    rock(bezier(seg2, 0.2), 16 * s, 10 * s) +
    rock(bezier(seg1, 0.86), 11 * s, 7 * s) +
    rock(bezier(seg2, 0.27), 7 * s, 5 * s)

  // far mountain range across the whole width
  let mountains = `M0 ${f(h * 0.66)}`
  for (let x = 0; x < w; x += w / 14) {
    mountains += `L${f(x + w / 28)} ${f(h * (0.5 + random() * 0.1))}`
    mountains += `L${f(x + w / 14)} ${f(h * (0.58 + random() * 0.05))}`
  }
  mountains += `L${w} ${h}L0 ${h}Z`

  const village = Array.from({ length: 9 }, () => ({
    x: w * (0.6 + random() * 0.35),
    y: h * (0.63 + random() * 0.05),
    r: 0.8 + random() * 1.1,
    o: 0.4 + random() * 0.5,
  }))
  const fireflies = Array.from({ length: 16 }, () => ({
    x: w * (0.45 + random() * 0.55),
    y: py - 60 * s + random() * (h - py + 40 * s),
    delay: random() * 6,
    duration: 4 + random() * 5,
  }))

  return { frontHill, grass, tree, rocks, mountains, village, fireflies }
}

// Same stars every time (seeded random), more on bigger screens.
function makeStars(w: number, h: number) {
  const random = seeded(7)
  const count = Math.min(240, Math.round((w * h) / 7500))
  return Array.from({ length: count }, () => ({
    x: random() * w,
    y: random() * h * 0.62,
    r: 0.5 + random() * 1.2,
    o: 0.35 + random() * 0.6,
    delay: random() * 6,
    duration: 2.5 + random() * 4,
  }))
}

function seeded(start: number) {
  let seed = start
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

function bezier([a, b, c, d]: Point[], t: number): Point {
  const u = 1 - t
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  }
}

// A limb segment (thigh, forearm...) as a tapered band from joint a to joint b.
// The round joints are separate circles, so overlapping parts never cut holes in the figure.
function limbPath(a: Point, b: Point, wa: number, wb: number): string {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const nx = -(b.y - a.y) / len
  const ny = (b.x - a.x) / len
  const ra = wa / 2
  const rb = wb / 2
  return (
    `M${f(a.x + nx * ra)} ${f(a.y + ny * ra)}L${f(b.x + nx * rb)} ${f(b.y + ny * rb)}` +
    `L${f(b.x - nx * rb)} ${f(b.y - ny * rb)}L${f(a.x - nx * ra)} ${f(a.y - ny * ra)}Z`
  )
}

// Where the elbow goes so a two-part arm reaches the hand (the elbow bends upwards).
function ikElbow(shoulder: Point, hand: Point): Point {
  const dx = hand.x - shoulder.x
  const dy = hand.y - shoulder.y
  const dist = Math.min(Math.hypot(dx, dy), ARM * 1.98) || 1
  const base = Math.atan2(dy, dx)
  const bend = Math.acos(clamp(dist / (2 * ARM), -1, 1))
  const e1 = add(shoulder, { x: Math.cos(base - bend) * ARM, y: Math.sin(base - bend) * ARM })
  const e2 = add(shoulder, { x: Math.cos(base + bend) * ARM, y: Math.sin(base + bend) * ARM })
  return e1.y < e2.y ? e1 : e2
}

function dirOf(a: number): Point {
  return { x: -Math.cos(a), y: -Math.sin(a) }
}

function restHand(angle: number): Point {
  const d = dirOf(angle)
  const grip = add(FRONT_SHOULDER, scale(d, ARM * 1.95))
  return add(grip, scale(d, -BOW_R * 0.28))
}

function stringHand(angle: number, draw: number): Point {
  return add(restHand(angle), scale(dirOf(angle), -draw * BOW_R * 0.95))
}

function add(...points: Point[]): Point {
  return points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
}

function scale(p: Point, k: number): Point {
  return { x: p.x * k, y: p.y * k }
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

function ease(t: number) {
  const c = clamp(t, 0, 1)
  return 1 - Math.pow(1 - c, 3)
}

function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function f(n: number, digits = 1) {
  return n.toFixed(digits)
}

function pt(p: Point) {
  return `${f(p.x)} ${f(p.y)}`
}
