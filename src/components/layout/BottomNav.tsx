import { NavLink } from 'react-router-dom'

export function BottomNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center text-xs gap-1 py-2 px-4 ${
      isActive ? 'text-brand-blue font-semibold' : 'text-gray-400'
    }`

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around max-w-lg mx-auto">
      <NavLink to="/" end className={linkClass}>
        <span className="text-2xl">🏠</span>
        <span>Home</span>
      </NavLink>
      <NavLink to="/settings" className={linkClass}>
        <span className="text-2xl">⚙️</span>
        <span>Settings</span>
      </NavLink>
    </nav>
  )
}
