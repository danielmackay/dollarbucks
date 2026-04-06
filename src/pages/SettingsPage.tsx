import { useState } from 'react'
import { ArrowsClockwise, GearSix, Users, Star, Warning } from '@phosphor-icons/react'
import { ChildList } from '../features/children/components/ChildList'
import { ChoreListForChild } from '../features/chores/components/ChoreListForChild'
import { WeeklyResetModal } from '../features/ledger/components/WeeklyResetModal'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useChildrenStore } from '../features/children/store'
import { useChoresStore } from '../features/chores/store'
import { useLedgerStore } from '../features/ledger/store'

export function SettingsPage() {
  const children = useChildrenStore((s) => s.children)
  const [resetOpen, setResetOpen] = useState(false)
  const [nukeOpen, setNukeOpen] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  function handleNuke() {
    useChildrenStore.getState().clearAll()
    useChoresStore.getState().clearAll()
    useLedgerStore.getState().clearAll()
    setNukeOpen(false)
  }

  return (
    <main>
      {/* ── Header ── */}
      <header className="bg-brand-navy px-5 pt-12 pb-10 rounded-b-[2.5rem] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-10 bg-white" />
        <div className="absolute -right-4 top-12 w-24 h-24 rounded-full opacity-5 bg-white" />

        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
              Manage
            </p>
            <h1
              className="font-display font-black text-white leading-none"
              style={{ fontSize: 'clamp(2rem, 8vw, 2.75rem)' }}
            >
              Settings
            </h1>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 mb-1">
            <GearSix size={32} weight="fill" className="text-white" />
          </div>
        </div>
      </header>

      <div className="px-4 mt-5 flex flex-col gap-6 pb-10">

        {/* ── Children section ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
              <Users size={15} weight="bold" className="text-brand-blue" />
            </div>
            <h2 className="font-display text-base font-extrabold text-brand-navy">Children</h2>
          </div>
          <ChildList />
        </section>

        {/* ── Chores per child ── */}
        {children.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0">
                <Star size={15} weight="bold" className="text-brand-orange" />
              </div>
              <h2 className="font-display text-base font-extrabold text-brand-navy">Chores</h2>
            </div>
            <div className="flex flex-col gap-5">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Child colour accent bar */}
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: child.avatarColour }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                        style={{ backgroundColor: child.avatarColour }}
                      >
                        {child.name[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-brand-navy">{child.name}'s chores</span>
                    </div>
                    <ChoreListForChild child={child} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Week management ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-brand-green/10 flex items-center justify-center shrink-0">
              <ArrowsClockwise size={15} weight="bold" className="text-brand-green" />
            </div>
            <h2 className="font-display text-base font-extrabold text-brand-navy">Week management</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Posts each child's allowance earnings based on chores completed, then clears all completions for the new week.
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setResetOpen(true)}
            >
              <ArrowsClockwise size={16} weight="bold" />
              Reset week
            </Button>
          </div>
        </section>

        {/* ── Danger zone ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <Warning size={15} weight="bold" className="text-red-500" />
            </div>
            <h2 className="font-display text-base font-extrabold text-red-500">Danger zone</h2>
          </div>

          <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
            <p className="text-sm text-red-700/80 mb-4 leading-relaxed">
              Permanently deletes all children, chores, and transaction history. This cannot be undone.
            </p>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setNukeOpen(true)}
            >
              <Warning size={16} weight="bold" />
              Reset all data.
            </Button>
          </div>
        </section>

        {/* ── Version footer ── */}
        <div
          className="text-xs text-gray-400 text-center cursor-pointer select-none pt-2"
          onClick={() => setShowDebug((v) => !v)}
        >
          <span>v{__APP_VERSION__}</span>
          {showDebug && (
            <div className="mt-2 space-y-0.5 font-mono">
              <div>Hash: {__GIT_COMMIT_SHORT__}</div>
              <div className="break-all">Commit: {__GIT_COMMIT_FULL__}</div>
              <div>Built: {new Date(__BUILD_DATE__).toLocaleString()}</div>
              <div>Env: {import.meta.env.MODE}</div>
            </div>
          )}
        </div>

      </div>

      <WeeklyResetModal open={resetOpen} onClose={() => setResetOpen(false)} />

      <Modal open={nukeOpen} onClose={() => setNukeOpen(false)} title="Reset all data?">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 bg-red-50 rounded-xl p-3">
            <Warning size={20} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">
              This will permanently delete <strong>all children, chores, and every transaction</strong> in the ledger. There is no way to recover this data.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setNukeOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleNuke} className="flex-1">
              Delete everything
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
