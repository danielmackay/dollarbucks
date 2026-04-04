import { NavLink } from 'react-router-dom'
import { House, GearSix } from '@phosphor-icons/react'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur-sm border-t border-gray-100">
      <div className="flex">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 pt-3 pb-4 transition-colors ${
              isActive ? 'text-brand-blue' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`relative transition-transform ${isActive ? 'scale-110' : ''}`}>
                <House
                  size={24}
                  weight={isActive ? 'fill' : 'regular'}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-blue" />
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-brand-blue' : 'text-gray-400'}`}>
                Home
              </span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 pt-3 pb-4 transition-colors ${
              isActive ? 'text-brand-blue' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`relative transition-transform ${isActive ? 'scale-110' : ''}`}>
                <GearSix
                  size={24}
                  weight={isActive ? 'fill' : 'regular'}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-blue" />
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-brand-blue' : 'text-gray-400'}`}>
                Settings
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
