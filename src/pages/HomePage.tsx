import { Coins } from '@phosphor-icons/react'
import { useChildrenStore } from '../features/children/store'
import { ChildCard } from '../features/children/components/ChildCard'
import { EmptyState } from '../features/children/components/EmptyState'

export function HomePage() {
  const children = useChildrenStore((s) => s.children)

  return (
    <main>
      {/* ── Header ── */}
      <header className="bg-brand-navy px-5 pt-12 pb-10 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3">
          {/* Coin lockup */}
          <div className="bg-brand-yellow rounded-2xl p-2.5 shrink-0 shadow-lg shadow-brand-yellow/30">
            <Coins size={28} weight="fill" className="text-brand-navy" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-black text-white tracking-tight leading-none">
              Dollarbucks
            </h1>
            <p className="text-brand-yellow/80 text-[11px] font-bold tracking-widest uppercase mt-0.5">
              Earn it. Save it. Spend it.
            </p>
          </div>
        </div>

        {/* Summary strip when children exist */}
        {children.length > 0 && (
          <p className="mt-5 text-white/50 text-sm font-semibold">
            {children.length} {children.length === 1 ? 'kid' : 'kids'} tracked this week
          </p>
        )}
      </header>

      {/* ── Child list ── */}
      <div className="p-4 flex flex-col gap-3 pt-5">
        {children.length === 0 ? (
          <EmptyState />
        ) : (
          children.map((child, i) => (
            <div
              key={child.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ChildCard child={child} />
            </div>
          ))
        )}
      </div>
    </main>
  )
}
