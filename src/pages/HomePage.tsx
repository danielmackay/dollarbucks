import { useChildrenStore } from '../features/children/store'
import { ChildCard } from '../features/children/components/ChildCard'
import { EmptyState } from '../features/children/components/EmptyState'

export function HomePage() {
  const children = useChildrenStore((s) => s.children)

  return (
    <main>
      <header className="bg-brand-navy px-4 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-brand-yellow text-3xl">🪙</span>
          <h1 className="font-display text-2xl text-white">Dollarbucks</h1>
        </div>
        <p className="text-brand-yellow text-sm font-ui">Earn it. Save it. Spend it.</p>
      </header>

      <div className="p-4 flex flex-col gap-3">
        {children.length === 0 ? (
          <EmptyState />
        ) : (
          children.map((child) => <ChildCard key={child.id} child={child} />)
        )}
      </div>
    </main>
  )
}
