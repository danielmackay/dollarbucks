import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  back?: boolean
}

export function PageHeader({ title, back }: Props) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3 px-4 pt-6 pb-4 bg-brand-navy text-white">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="text-2xl min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Back"
        >
          ←
        </button>
      )}
      <h1 className="font-display text-2xl flex-1">{title}</h1>
    </header>
  )
}
