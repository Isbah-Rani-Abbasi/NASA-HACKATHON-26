import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import SpaceBackdrop from './components/SpaceBackdrop'
import TopBar from './components/TopBar'
import missions from './data/missions.json'
import CockpitPage from './pages/CockpitPage'
import LandingPage from './pages/LandingPage'
import MissionBriefingPage from './pages/MissionBriefingPage'
import OutpostPage from './pages/OutpostPage'
import SectorsPage from './pages/SectorsPage'
import { unlockAudio } from './utils/soundEffects'

function backdropFor(pathname) {
  if (pathname.startsWith('/sectors')) return 'sectors'
  if (pathname.startsWith('/moon')) return 'moon'
  if (pathname.startsWith('/mars')) return 'mars'
  if (pathname.startsWith('/cockpit')) return 'deep'
  if (pathname.startsWith('/outpost')) {
    const id = pathname.split('/')[2]
    return missions[id]?.sector === 'mars' ? 'mars' : 'moon'
  }
  return 'landing'
}

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="relative min-h-full">
      <SpaceBackdrop variant={backdropFor(pathname)} />
      <TopBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sectors" element={<SectorsPage />} />
        <Route path="/moon" element={<MissionBriefingPage sector="moon" />} />
        <Route path="/mars" element={<MissionBriefingPage sector="mars" />} />
        <Route path="/cockpit/:missionId" element={<CockpitPage />} />
        <Route path="/outpost/:missionId" element={<OutpostPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
