import { PageHeader } from '../components/ui/PageHeader'
import { ChildList } from '../features/children/components/ChildList'
import { ChoreListForChild } from '../features/chores/components/ChoreListForChild'
import { useChildrenStore } from '../features/children/store'

export function SettingsPage() {
  const children = useChildrenStore((s) => s.children)

  return (
    <main>
      <PageHeader title="Settings" />
      <div className="p-4 flex flex-col gap-6">
        <ChildList />
        {children.map((child) => (
          <ChoreListForChild key={child.id} child={child} />
        ))}
      </div>
    </main>
  )
}
