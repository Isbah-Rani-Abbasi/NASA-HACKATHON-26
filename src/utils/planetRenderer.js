/**
 * Lightweight 2.5D planet renderer for HTML5 canvas.
 * Surface features live on a sphere (longitude/latitude) and are projected
 * each frame so planets appear to rotate, then a lighting gradient adds depth.
 */

const PALETTES = {
  earth: {
    base: ['#2f7fe0', '#174a9c'],
    features: [
      { color: '#3fa34d', count: 14, size: [0.18, 0.38] },
      { color: '#c2a165', count: 6, size: [0.1, 0.2] },
      { color: 'rgba(255,255,255,0.75)', count: 16, size: [0.08, 0.22], stretch: 2.6 },
    ],
    atmosphere: 'rgba(90,180,255,0.55)',
  },
  moon: {
    base: ['#c9ccd4', '#8b8f9a'],
    features: [
      { color: 'rgba(90,95,108,0.55)', count: 9, size: [0.16, 0.34] },
      { color: 'rgba(70,74,86,0.7)', count: 26, size: [0.04, 0.1], crater: true },
      { color: 'rgba(235,238,245,0.5)', count: 10, size: [0.02, 0.05] },
    ],
    atmosphere: null,
  },
  mars: {
    base: ['#d9622b', '#8f2f0f'],
    features: [
      { color: 'rgba(110,38,12,0.65)', count: 12, size: [0.14, 0.32] },
      { color: 'rgba(240,160,100,0.45)', count: 10, size: [0.1, 0.24], stretch: 2.2 },
      { color: 'rgba(80,25,10,0.6)', count: 14, size: [0.03, 0.08], crater: true },
    ],
    caps: 'rgba(255,245,240,0.9)',
    atmosphere: 'rgba(255,150,100,0.35)',
  },
  phobos: {
    base: ['#9c8a7c', '#4f443c'],
    features: [{ color: 'rgba(50,40,35,0.6)', count: 8, size: [0.1, 0.25], crater: true }],
    atmosphere: null,
  },
}

// Deterministic pseudo-random so planets look the same every visit.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const featureCache = new Map()

function getFeatures(type) {
  if (featureCache.has(type)) return featureCache.get(type)
  const palette = PALETTES[type] || PALETTES.moon
  const rand = seeded(type.length * 7919 + type.charCodeAt(0) * 31)
  const list = []
  palette.features.forEach((group) => {
    for (let i = 0; i < group.count; i++) {
      list.push({
        lon: rand() * Math.PI * 2,
        lat: (rand() - 0.5) * 2.4,
        size: group.size[0] + rand() * (group.size[1] - group.size[0]),
        stretch: group.stretch || 1,
        color: group.color,
        crater: group.crater,
      })
    }
  })
  featureCache.set(type, list)
  return list
}

/**
 * Draws a rotating, shaded planet.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number,y:number,r:number,rotation:number,type:'earth'|'moon'|'mars'|'phobos',light?:{x:number,y:number}}} opts
 */
export function drawPlanet(ctx, { x, y, r, rotation = 0, type = 'moon', light = { x: -0.45, y: -0.35 } }) {
  const palette = PALETTES[type] || PALETTES.moon
  ctx.save()

  if (palette.atmosphere) {
    const glow = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.35)
    glow.addColorStop(0, palette.atmosphere)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, r * 1.35, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.closePath()
  const base = ctx.createLinearGradient(x - r, y - r, x + r, y + r)
  base.addColorStop(0, palette.base[0])
  base.addColorStop(1, palette.base[1])
  ctx.fillStyle = base
  ctx.fill()
  ctx.clip()

  for (const f of getFeatures(type)) {
    const lon = f.lon + rotation
    const depth = Math.cos(lon) * Math.cos(f.lat)
    if (depth <= -0.05) continue
    const px = x + r * Math.sin(lon) * Math.cos(f.lat)
    const py = y - r * Math.sin(f.lat) * 0.92
    const fore = Math.max(0.12, Math.cos(lon))
    const rx = f.size * r * fore * f.stretch
    const ry = f.size * r * Math.max(0.3, Math.cos(f.lat))
    ctx.globalAlpha = Math.min(1, depth * 3 + 0.2)
    ctx.fillStyle = f.color
    ctx.beginPath()
    ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    if (f.crater) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = Math.max(0.5, r * 0.012)
      ctx.beginPath()
      ctx.ellipse(px + rx * 0.12, py + ry * 0.12, rx, ry, 0, Math.PI * 0.1, Math.PI * 0.9)
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1

  if (palette.caps) {
    ctx.fillStyle = palette.caps
    ctx.beginPath()
    ctx.ellipse(x, y - r * 0.93, r * 0.42, r * 0.14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x, y + r * 0.95, r * 0.3, r * 0.09, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const lx = x + light.x * r
  const ly = y + light.y * r
  const shade = ctx.createRadialGradient(lx, ly, r * 0.05, lx, ly, r * 2.1)
  shade.addColorStop(0, 'rgba(255,255,255,0.22)')
  shade.addColorStop(0.35, 'rgba(0,0,0,0)')
  shade.addColorStop(0.7, 'rgba(0,0,0,0.55)')
  shade.addColorStop(1, 'rgba(0,0,0,0.92)')
  ctx.fillStyle = shade
  ctx.fillRect(x - r, y - r, r * 2, r * 2)

  ctx.restore()
}

/** Draws a glowing star sun with corona. */
export function drawSun(ctx, { x, y, r, time = 0 }) {
  ctx.save()
  const pulse = 1 + Math.sin(time * 2) * 0.04
  const corona = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.2 * pulse)
  corona.addColorStop(0, 'rgba(255,220,120,0.9)')
  corona.addColorStop(0.35, 'rgba(255,184,0,0.35)')
  corona.addColorStop(1, 'rgba(255,120,0,0)')
  ctx.fillStyle = corona
  ctx.beginPath()
  ctx.arc(x, y, r * 3.2 * pulse, 0, Math.PI * 2)
  ctx.fill()
  const core = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
  core.addColorStop(0, '#fff7d1')
  core.addColorStop(0.6, '#ffc93c')
  core.addColorStop(1, '#ff8a00')
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
