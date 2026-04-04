import { useState } from 'react'
import { CalendarBlank, ArrowCounterClockwise, X } from '@phosphor-icons/react'
import { getToday, setDevDateOverride, formatLocalDate } from '../features/chores/dateHelpers'
import { useAppStore, getMondayOfThisWeek } from '../features/app/store'

export default function DevDatePicker() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getToday)
  const realToday = formatLocalDate(new Date())
  const isOverridden = selectedDate !== realToday

  const applyDate = (date: string) => {
    const isReal = date === realToday
    setDevDateOverride(isReal ? null : date)
    useAppStore.getState().setCurrentDate(date)
    useAppStore.getState().setWeekStartDate(getMondayOfThisWeek())
  }

  const handleDateChange = (value: string) => {
    setSelectedDate(value)
    applyDate(value)
  }

  const handleReset = () => {
    setSelectedDate(realToday)
    applyDate(realToday)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-3 z-50 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg transition-colors ${
          isOverridden
            ? 'bg-amber-500 text-white'
            : 'bg-gray-700 text-gray-200'
        }`}
      >
        <CalendarBlank size={14} weight="bold" />
        {isOverridden ? selectedDate : 'DEV'}
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 right-3 z-50 rounded-xl bg-gray-800 p-3 shadow-xl text-white min-w-[220px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
          Time Travel
        </span>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          <X size={14} weight="bold" />
        </button>
      </div>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => handleDateChange(e.target.value)}
        className="w-full rounded-lg border border-gray-600 bg-gray-700 px-2.5 py-1.5 text-sm text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
      />

      {isOverridden && (
        <button
          onClick={handleReset}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-700 px-2.5 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
        >
          <ArrowCounterClockwise size={12} weight="bold" />
          Back to today ({realToday})
        </button>
      )}
    </div>
  )
}
