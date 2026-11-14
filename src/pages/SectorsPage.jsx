import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PlanetGlobe from '../components/PlanetGlobe'
import { sfx } from '../utils/soundEffects'

const SECTORS = [
  {
    id: 'moon',
    title: 'MISSION ON MOON',
    planet: 'moon',
    stats: ['16.6% Gravity', 'No Atmosphere'],
    blurb: 'Rescue Apollo 13 from a meteoroid storm and run an emergency lunar base.',
    cta: 'ENTER LUNAR SECTOR',
    accent: '#00F0FF',
    glow: 'rgba(0,240,255,0.55)',
    dust: false,
  },
  {
    id: 'mars',
    title: 'MISSION ON MARS',
    planet: 'mars',
    stats: ['38% Gravity', 'Thin CO2 Air', 'Comms Delay'],
    blurb: 'Save the Mars Polar Lander from solar flares and build a red-planet outpost.',
    cta: 'ENTER MARTIAN SECTOR',
    accent: '#FFB800',
    glow: 'rgba(255,120,60,0.6)',
    dust: true,
  },
]

export default function SectorsPage() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 pt-24 pb-12">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <p className="font-display text-xs font-bold tracking-[0.35em] text-solar">SECTOR SELECTION HUB</p>
        <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-5xl">
          Choose Your <span className="glow-text text-cyan-glow">Sector</span>
        </h1>
        <p className="mt-3 text-slate-300">The Sun radar is tracking storms across the Solar System. Where will you fly, Commander?</p>
      </motion.header>

      <div className="grid w-full gap-8 md:grid-cols-2">
        {SECTORS.map((s, i) => (
          <motion.article
            key={s.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.15, type: 'spring', stiffness: 90 }}
            whileHover={{ scale: 1.035, boxShadow: `0 0 50px ${s.glow}` }}
            onMouseEnter={() => sfx.hover()}
            className="glass-panel group relative flex min-h-[30rem] flex-col lg:aspect-square items-center justify-between overflow-hidden rounded-3xl p-6 sm:p-8"
            style={{ borderColor: `${s.accent}55` }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40 transition group-hover:opacity-70"
              style={{ background: `radial-gradient(circle at 50% 40%, ${s.glow}, transparent 60%)` }}
            />
            <h2 className="relative font-display text-2xl font-black tracking-widest sm:text-3xl" style={{ color: s.accent }}>
              {s.title}
            </h2>
            <div className="relative transition-transform duration-500 group-hover:scale-110">
              <PlanetGlobe type={s.planet} size={190} speed={0.35} dust={s.dust} />
            </div>
            <div className="relative w-full text-center">
              <div className="mb-2 flex flex-wrap justify-center gap-2">
                {s.stats.map((stat) => (
                  <span key={stat} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 font-display text-[11px] font-bold tracking-wider text-white">
                    {stat}
                  </span>
                ))}
              </div>
              <p className="mb-4 text-sm text-slate-300">{s.blurb}</p>
              <button
                type="button"
                onClick={() => {
                  sfx.powerUp()
                  navigate(`/${s.id}`)
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-black tracking-widest text-cosmic transition hover:brightness-110 sm:text-base"
                style={{ background: s.accent, boxShadow: `0 0 24px ${s.glow}` }}
              >
                {s.cta} <ArrowRight size={18} />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </main>
  )
}
