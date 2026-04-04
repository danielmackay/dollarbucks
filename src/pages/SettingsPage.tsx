import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { ChildList } from '../features/children/components/ChildList'
import { ChoreListForChild } from '../features/chores/components/ChoreListForChild'
import { WeeklyResetModal } from '../features/ledger/components/WeeklyResetModal'
import { Button } from '../components/ui/Button'
import { useChildrenStore } from '../features/children/store'

export function SettingsPage() {
  const children = useChildrenStore((s) => s.children)
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <main>
      <PageHeader title="Settings" />
      <div className="p-4 flex flex-col gap-6">
        <ChildList />
        {children.map((child) => (
          <ChoreListForChild key={child.id} child={child} />
        ))}

        <section>
          <h2 className="font-display text-lg text-brand-navy mb-3">Week management</h2>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setResetOpen(true)}
          >
            🔄 Reset week
          </Button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Posts allowance earnings and clears all chore completions.
          </p>
        </section>
      </div>

      <WeeklyResetModal open={resetOpen} onClose={() => setResetOpen(false)} />
    </main>
  )
}
