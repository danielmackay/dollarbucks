import { Routes, Route, Navigate } from 'react-router-dom'
import { BottomNav } from './components/layout/BottomNav'
import { HomePage } from './pages/HomePage'
import { ChildDetailPage } from './pages/ChildDetailPage'
import { LedgerPage } from './pages/LedgerPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <div className="min-h-screen bg-brand-cream pb-20 max-w-lg mx-auto">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/child/:childId" element={<ChildDetailPage />} />
        <Route path="/child/:childId/ledger" element={<LedgerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
