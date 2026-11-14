import { useEffect, useRef } from 'react'
import { drawPlanet } from '../utils/planetRenderer'

/** Small self-contained rotating planet canvas (used on sector cards). */
export default function PlanetGlobe({ type = 'moon', size = 200, speed = 0.25, dust = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const swirls = Array.from({ length: 5 }, (_, i) => ({ angle: (i / 5) * Math.PI * 2, r: 0.52 + i * 0.04, speed: 0.4 + i * 0.12 }))
    let raf = 0
    let t = 0
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      ctx.clearRect(0, 0, size, size)
      const c = size / 2
      drawPlanet(ctx, { x: c, y: c, r: size * 0.38, rotation: t * speed, type })
      if (dust) {
        ctx.lineCap = 'round'
        swirls.forEach((s) => {
          const a = s.angle + t * s.speed
          ctx.strokeStyle = 'rgba(255,190,140,0.35)'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.ellipse(c, c, size * s.r * 0.85, size * s.r * 0.28, -0.3, a, a + 0.9)
          ctx.stroke()
        })
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [type, size, speed, dust])

  return <canvas ref={ref} style={{ width: size, height: size }} aria-hidden="true" />
}
