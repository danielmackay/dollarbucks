import { PageHeader } from '../components/ui/PageHeader'
import { ChildList } from '../features/children/components/ChildList'

export function SettingsPage() {
  return (
    <main>
      <PageHeader title="Settings" />
      <div className="p-4 flex flex-col gap-6">
        <ChildList />
      </div>
    </main>
  )
}
