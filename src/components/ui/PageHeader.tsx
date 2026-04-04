import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'

interface Props {
  title: string
  back?: boolean
}

export function PageHeader({ title, back }: Props) {
  const navigate = useNavigate()
  return (
    <header className="bg-brand-navy px-4 pt-12 pb-8 rounded-b-[2rem] flex items-center gap-3">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 active:bg-white/20 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} weight="bold" className="text-white" />
        </button>
      )}
      <h1 className="font-display text-2xl font-extrabold text-white flex-1 leading-tight">{title}</h1>
    </header>
  )
}
