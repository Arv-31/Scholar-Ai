import { useEffect, useMemo, useRef, useState } from 'react'

// The login background: a night hill (bottom right) with an archer drawn as a back-lit silhouette.
//
// What he does:
//   idle     - stars twinkle, he breathes, bow lowered. If the pointer stays slow or still for
//              about 1.5 s he turns and aims at it (fast shaking is ignored).
//   tap      - he shoots a dim arrow at the tapped point; it sticks for a moment and fades.
//              Taps on the form (inputs, buttons, links, the card) are ignored.
//   drawing  - while Supabase checks the login he draws the bow at the card. Nothing bright yet.
//   success  - ONLY after Supabase says the login worked: he reaches behind his back, the
//              celestial arrow lights up, he shoots it into the card and onImpact() is called.
//   fail     - the bow lowers again.
// Everything moves in one requestAnimationFrame loop that edits SVG attributes directly,
// so React does not re-render 60 times a second.

export type ArcherPhase = 'idle' | 'drawing' | 'success' | 'fail'
export type Point = { x: number; y: number }

type Props = {
  phase: ArcherPhase
  getTarget: () => Point | null // centre of the login card
  onImpact: (point: Point) => void // celestial arrow hit the card
}

const DEG = Math.PI / 180
const AIM_MIN = -25 * DEG // lowest he will aim
const AIM_MAX = 50 * DEG // highest he will aim
const RELAXED = -62 * DEG // bow lowered
const STILL_SECONDS = 1.5
const SLOW_SPEED = 90 // px per second; slower than this counts as "still"
const MAX_ARROWS = 6

// Points on the archer, in his own coordinates (feet at 0,0, facing left, y up is negative)
const SHOULDER = { x: -2, y: -132 }
const BACK_SHOULDER = { x: 6, y: -130 }
const QUIVER_TOP = { x: 25, y: -150 }

type Flight = {
  el: SVGGElement | null
  active: boolean
  from: Point
  to: Point
  start: number
  duration: number
  angle: number
}

export default function ArcherScene({ phase, getTarget, onImpact }: Props) {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  const layout = useMemo(() => makeLayout(size.w, size.h), [size])
  const stars = useMemo(() => makeStars(size.w, size.h), [size])

  // live props for the animation loop
  const live = useRef({ phase, getTarget, onImpact })
  useEffect(() => {
    live.current = { phase, getTarget, onImpact }
  }, [phase, getTarget, onImpact])

  const upper = useRef<SVGGElement>(null)
  const bowArm = useRef<SVGLineElement>(null)
  const bow = useRef<SVGPathElement>(null)
  const string = useRef<SVGPolylineElement>(null)
  const drawArm = useRef<SVGPolylineElement>(null)
  const nocked = useRef<SVGGElement>(null)
  const glimmer = useRef<SVGCircleElement>(null)
  const celestial = useRef<SVGGElement>(null)
  const trail = useRef<SVGPolylineElement>(null)
  const flash = useRef<SVGCircleElement>(null)
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
    const { s } = layout
    const world = (p: Point, breath = 0): Point => ({
      x: layout.px + p.x * s,
      y: layout.py + (p.y + breath) * s,
    })

    const pointer = { x: 0, y: 0, known: false }
    let lastPointer = { x: 0, y: 0 }
    let still = 0
    let aimPoint: Point | null = null
    let angle = RELAXED
    let draw = 0
    let tap: { target: Point; start: number } | null = null
    let successStart = -1
    let impacted = false
    let flashStart = -1
    const flights: Flight[] = Array.from({ length: MAX_ARROWS }, (_, i) => ({
      el: arrowEls.current[i],
      active: false,
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 },
      start: 0,
      duration: 0,
      angle: 0,
    }))
    let celestialFlight: Flight | null = null
    const trailPoints: Point[] = []

    function onMove(e: PointerEvent) {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.known = true
    }
    function onDown(e: PointerEvent) {
      if (reduced || e.button !== 0) return
      const el = e.target as Element | null
      if (el?.closest('input, button, a, label, select, textarea, [data-no-arrows]')) return
      if (live.current.phase === 'drawing' || live.current.phase === 'success') return
      tap = { target: { x: e.clientX, y: e.clientY }, start: performance.now() }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)

    function aimAt(from: Point, to: Point) {
      return clamp(Math.atan2(from.y - to.y, from.x - to.x), AIM_MIN, AIM_MAX)
    }

    function launch(from: Point, to: Point, now: number) {
      // reuse the oldest arrow if all are in use
      const free =
        flights.find((f) => !f.active) ?? flights.reduce((a, b) => (a.start < b.start ? a : b))
      const distance = Math.hypot(to.x - from.x, to.y - from.y)
      Object.assign(free, {
        active: true,
        from,
        to,
        start: now,
        duration: clamp(distance / 1500, 0.22, 0.7),
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

      // --- is the pointer slow or still? ---
      if (pointer.known) {
        const speed =
          Math.hypot(pointer.x - lastPointer.x, pointer.y - lastPointer.y) / Math.max(dt, 0.001)
        lastPointer = { x: pointer.x, y: pointer.y }
        if (speed > SLOW_SPEED) still = 0
        else still += dt
        if (still >= STILL_SECONDS) aimPoint = { x: pointer.x, y: pointer.y }
      }

      const breath = reduced ? 0 : Math.sin(clock * 1.7) * 1.3
      const shoulder = world(SHOULDER, breath)
      const backShoulder = world(BACK_SHOULDER, breath)
      const quiverTop = world(QUIVER_TOP, breath)

      // --- where to aim and how far to draw ---
      let wantAngle = RELAXED
      let wantDraw = 0
      let hand: Point | null = null // overrides the draw hand (reaching back)
      let showNocked = false
      let showCelestial = false
      let glimmerGlow = 0.35

      if (currentPhase === 'success' && successStart < 0) successStart = now
      if (currentPhase !== 'success') {
        successStart = -1
        impacted = false
      }

      if (currentPhase === 'drawing' || currentPhase === 'success') {
        const card = target()
        if (card) wantAngle = aimAt(shoulder, card)
        wantDraw = 1
        showNocked = true
      } else if (tap) {
        wantAngle = aimAt(shoulder, tap.target)
        const t = (now - tap.start) / 1000
        wantDraw = t < 0.16 ? 0.85 : 0
        showNocked = t < 0.16
        if (t >= 0.16) {
          launch(tipOf(shoulder, angle, draw, s), tap.target, now)
          tap = null
          still = 0
        }
      } else if (currentPhase === 'idle' && aimPoint && !reduced) {
        wantAngle = aimAt(shoulder, aimPoint)
        wantDraw = 0.12
        showNocked = true
      }

      // --- the success timeline (ms since login confirmed) ---
      if (successStart >= 0) {
        const t = now - successStart
        glimmerGlow = 1
        showNocked = false // the normal arrow is put away; only the celestial one is shot
        if (t < 320) {
          // reach behind the back
          hand = lerpPoint(restHand(shoulder, angle, s), quiverTop, ease(t / 320))
          wantDraw = 0
          showNocked = false
        } else if (t < 600) {
          // bring the celestial arrow to the string
          hand = lerpPoint(quiverTop, restHand(shoulder, angle, s), ease((t - 320) / 280))
          wantDraw = 0
          showNocked = false
          showCelestial = true
        } else if (t < 950) {
          wantDraw = 1
          showNocked = false
          showCelestial = true
        } else if (!celestialFlight) {
          const card = target() ?? { x: layout.w * 0.3, y: layout.h * 0.5 }
          celestialFlight = {
            el: celestial.current,
            active: true,
            from: tipOf(shoulder, angle, draw, s),
            to: card,
            start: now,
            duration: 0.38,
            angle: 0,
          }
          trailPoints.length = 0
          wantDraw = 0
        } else {
          wantDraw = 0
        }
      }

      angle += (wantAngle - angle) * (1 - Math.exp(-(currentPhase === 'drawing' ? 6 : 4) * dt))
      draw += (wantDraw - draw) * (1 - Math.exp(-(wantDraw > draw ? 9 : 14) * dt))

      // --- pose the bow and arms ---
      const dir = { x: -Math.cos(angle), y: -Math.sin(angle) }
      const normal = { x: dir.y, y: -dir.x }
      const R = 40 * s
      const grip = { x: shoulder.x + dir.x * 46 * s, y: shoulder.y + dir.y * 46 * s }
      const tip1 = {
        x: grip.x + normal.x * R - dir.x * R * 0.35,
        y: grip.y + normal.y * R - dir.y * R * 0.35,
      }
      const tip2 = {
        x: grip.x - normal.x * R - dir.x * R * 0.35,
        y: grip.y - normal.y * R - dir.y * R * 0.35,
      }
      const mid = { x: (tip1.x + tip2.x) / 2, y: (tip1.y + tip2.y) / 2 }
      const control = { x: 2 * (grip.x + dir.x * 2) - mid.x, y: 2 * (grip.y + dir.y * 2) - mid.y }
      const stringHand = {
        x: mid.x - dir.x * draw * R * 0.95,
        y: mid.y - dir.y * draw * R * 0.95,
      }
      const drawHand = hand ?? stringHand
      const elbow = {
        x: (backShoulder.x + drawHand.x) / 2 - dir.x * 8 * s,
        y: (backShoulder.y + drawHand.y) / 2 - 12 * s,
      }

      upper.current?.setAttribute('transform', `translate(0 ${breath})`)
      setLine(bowArm.current, shoulder, grip)
      bow.current?.setAttribute(
        'd',
        `M${f(tip1.x)} ${f(tip1.y)}Q${f(control.x)} ${f(control.y)} ${f(tip2.x)} ${f(tip2.y)}`,
      )
      string.current?.setAttribute('points', pts(tip1, hand ? mid : stringHand, tip2))
      drawArm.current?.setAttribute('points', pts(backShoulder, elbow, drawHand))
      const deg = (Math.atan2(dir.y, dir.x) * 180) / Math.PI
      if (nocked.current) {
        nocked.current.setAttribute('opacity', showNocked ? '1' : '0')
        nocked.current.setAttribute(
          'transform',
          `translate(${f(stringHand.x)} ${f(stringHand.y)}) rotate(${f(deg)})`,
        )
      }
      glimmer.current?.setAttribute('opacity', String(glimmerGlow))
      glimmer.current?.setAttribute('cx', f(quiverTop.x + 2 * s))
      glimmer.current?.setAttribute('cy', f(quiverTop.y - 8 * s))

      // --- celestial arrow: on the string, then in flight with a trail ---
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
          celestial.current.setAttribute(
            'transform',
            `translate(${f(p.x)} ${f(p.y)}) rotate(${f(flightDeg)})`,
          )
          celestial.current.setAttribute('opacity', t < 1 ? '1' : '0')
          trailPoints.push(p)
          if (trailPoints.length > 14) trailPoints.shift()
          if (t >= 1 && !impacted) {
            impacted = true
            flashStart = now
            live.current.onImpact(celestialFlight.to)
          }
        } else if (showCelestial) {
          const at = hand ?? stringHand
          celestial.current.setAttribute(
            'transform',
            `translate(${f(at.x)} ${f(at.y)}) rotate(${f(deg)})`,
          )
          celestial.current.setAttribute('opacity', '1')
        } else {
          celestial.current.setAttribute('opacity', '0')
        }
      }
      if (trail.current) {
        trail.current.setAttribute(
          'points',
          trailPoints.map((p) => `${f(p.x)},${f(p.y)}`).join(' '),
        )
        trail.current.setAttribute(
          'opacity',
          impacted ? String(Math.max(0, 1 - (now - flashStart) / 300)) : '0.8',
        )
      }
      if (flash.current && flashStart > 0 && celestialFlight) {
        const t = clamp((now - flashStart) / 500, 0, 1)
        flash.current.setAttribute('cx', f(celestialFlight.to.x))
        flash.current.setAttribute('cy', f(celestialFlight.to.y))
        flash.current.setAttribute('r', f(10 + ease(t) * 160))
        flash.current.setAttribute('opacity', f(1 - t))
      }

      // --- normal arrows in flight, stuck, then fading ---
      for (const flight of flights) {
        if (!flight.el) continue
        if (!flight.active) {
          flight.el.setAttribute('opacity', '0')
          continue
        }
        const age = (now - flight.start) / 1000
        const t = clamp(age / flight.duration, 0, 1)
        const arc = Math.hypot(flight.to.x - flight.from.x, flight.to.y - flight.from.y) * 0.08
        const p = lerpPoint(flight.from, flight.to, t)
        p.y -= Math.sin(Math.PI * t) * arc
        if (t < 1) {
          const ahead = lerpPoint(flight.from, flight.to, Math.min(1, t + 0.02))
          ahead.y -= Math.sin(Math.PI * Math.min(1, t + 0.02)) * arc
          flight.angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI
        }
        const stuckFor = age - flight.duration
        const opacity = stuckFor < 0.9 ? 1 : Math.max(0, 1 - (stuckFor - 0.9) / 0.5)
        if (opacity <= 0) flight.active = false
        flight.el.setAttribute(
          'transform',
          `translate(${f(p.x)} ${f(p.y)}) rotate(${f(flight.angle)})`,
        )
        flight.el.setAttribute('opacity', f(opacity))
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [layout])

  const { w, h, s, px, py } = layout

  return (
    <svg
      className="pointer-events-none fixed inset-0 h-full w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060a16" />
          <stop offset="0.65" stopColor="#111a33" />
          <stop offset="1" stopColor="#1f2a48" />
        </linearGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ea2d8" stopOpacity="0" />
          <stop offset="0.5" stopColor="#8ea2d8" stopOpacity="0.12" />
          <stop offset="1" stopColor="#8ea2d8" stopOpacity="0" />
        </linearGradient>
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

        {/* The archer. Drawn twice below: a pale copy nudged up-right (the rim light from
            the moon), then the black silhouette on top. */}
        <g
          id="archer"
          fill="currentColor"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g transform={`translate(${px} ${py}) scale(${s})`}>
            <polyline points="4,-82 12,-42 20,0" fill="none" strokeWidth="10" />
            <polyline points="-2,-82 -14,-44 -24,0" fill="none" strokeWidth="10" />
            <line x1="-24" y1="0" x2="-34" y2="1" strokeWidth="6" />
            <line x1="20" y1="0" x2="29" y2="1" strokeWidth="6" />
            <g ref={upper}>
              <path d="M4 -142 C 28 -134 38 -100 44 -66 C 32 -74 20 -80 8 -86 Z" strokeWidth="2" />
              <g transform="rotate(22 14 -120)">
                <rect x="8" y="-150" width="11" height="54" rx="3" strokeWidth="1" />
                <line x1="11" y1="-150" x2="9" y2="-166" strokeWidth="2" />
                <line x1="16" y1="-150" x2="17" y2="-164" strokeWidth="2" />
                <path d="M7 -166 l2 -8 l2 8 Z" strokeWidth="1" />
                <path d="M15 -164 l2 -8 l2 8 Z" strokeWidth="1" />
              </g>
              <polyline points="1,-84 4,-138" fill="none" strokeWidth="20" />
              <circle cx="1" cy="-156" r="11" stroke="none" />
              <path d="M-8 -158 Q 2 -182 15 -160 Q 6 -166 -8 -158 Z" strokeWidth="2" />
            </g>
          </g>
          <line ref={bowArm} strokeWidth={7 * s} />
          <path ref={bow} fill="none" strokeWidth={3.2 * s} />
          <polyline ref={string} fill="none" strokeWidth={Math.max(0.8, 1 * s)} />
          <polyline ref={drawArm} fill="none" strokeWidth={6.5 * s} />
          <g ref={nocked} opacity="0">
            <line x1={0} y1={0} x2={64 * s} y2={0} strokeWidth={1.8 * s} />
            <path d={`M${64 * s} ${-4 * s} L${74 * s} 0 L${64 * s} ${4 * s} Z`} strokeWidth="1" />
          </g>
        </g>
      </defs>

      <rect width={w} height={h} fill="url(#sky)" />

      {/* moon and its glow, upper right: the light source behind the archer */}
      <circle
        cx={w * 0.88}
        cy={h * 0.16}
        r={Math.min(w, h) * 0.09}
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

      {/* layered hills with haze between them */}
      <path
        d={`M${w * 0.3} ${h} C${w * 0.48} ${h * 0.8} ${w * 0.62} ${h * 0.62} ${w * 0.78} ${h * 0.6} S${w * 0.95} ${h * 0.56} ${w} ${h * 0.58} L${w} ${h} Z`}
        fill="#1a2340"
      />
      <rect y={h * 0.55} width={w} height={h * 0.3} fill="url(#haze)" />
      <path
        d={`M${w * 0.42} ${h} C${w * 0.58} ${h * 0.84} ${w * 0.7} ${h * 0.7} ${w * 0.9} ${h * 0.68} S${w * 0.99} ${h * 0.7} ${w} ${h * 0.71} L${w} ${h} Z`}
        fill="#111830"
      />
      <rect y={h * 0.66} width={w} height={h * 0.24} fill="url(#haze)" />
      <path
        d={`M${w * 0.5} ${h} C${w * 0.64} ${h * 0.92} ${w * 0.74} ${py + 12} ${px} ${py} C${px + w * 0.06} ${py - 2} ${w * 0.97} ${py + 16} ${w} ${py + 30} L${w} ${h} Z`}
        fill="#05070c"
      />

      {/* rim light copy, then the silhouette */}
      <use href="#archer" transform="translate(1.6 -1.3)" color="#b8c6f5" opacity="0.7" />
      <use href="#archer" color="#05070c" />

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
          stroke="#8f98ad"
          fill="#8f98ad"
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

      {/* celestial arrow, its trail and the impact flash */}
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
      <circle ref={flash} r="0" fill="#fffaf0" opacity="0" filter="url(#soft)" />
    </svg>
  )
}

// ---------- layout and helpers ----------
function makeLayout(w: number, h: number) {
  const mobile = w < 768
  const s = mobile ? clamp(w / 640, 0.5, 0.72) : clamp(h / 700, 0.75, 1.3)
  return { w, h, s, mobile, px: w * (mobile ? 0.84 : 0.83), py: h * (mobile ? 0.88 : 0.74) }
}

// Same stars every time (seeded random), more on bigger screens.
function makeStars(w: number, h: number) {
  let seed = 7
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const count = Math.min(220, Math.round((w * h) / 8000))
  return Array.from({ length: count }, () => ({
    x: random() * w,
    y: random() * h * 0.72,
    r: 0.5 + random() * 1.2,
    o: 0.35 + random() * 0.6,
    delay: random() * 6,
    duration: 2.5 + random() * 4,
  }))
}

function restHand(shoulder: Point, angle: number, s: number): Point {
  const dir = { x: -Math.cos(angle), y: -Math.sin(angle) }
  const grip = { x: shoulder.x + dir.x * 46 * s, y: shoulder.y + dir.y * 46 * s }
  return { x: grip.x - dir.x * 40 * s * 0.35, y: grip.y - dir.y * 40 * s * 0.35 }
}

// Where an arrow leaves the bow
function tipOf(shoulder: Point, angle: number, draw: number, s: number): Point {
  const dir = { x: -Math.cos(angle), y: -Math.sin(angle) }
  const hand = restHand(shoulder, angle, s)
  const back = draw * 40 * s * 0.95
  return { x: hand.x + dir.x * (74 * s - back), y: hand.y + dir.y * (74 * s - back) }
}

function setLine(el: SVGLineElement | null, a: Point, b: Point) {
  if (!el) return
  el.setAttribute('x1', f(a.x))
  el.setAttribute('y1', f(a.y))
  el.setAttribute('x2', f(b.x))
  el.setAttribute('y2', f(b.y))
}

function pts(...points: Point[]) {
  return points.map((p) => `${f(p.x)},${f(p.y)}`).join(' ')
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

function ease(t: number) {
  const c = clamp(t, 0, 1)
  return 1 - Math.pow(1 - c, 3)
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function f(n: number) {
  return n.toFixed(1)
}
