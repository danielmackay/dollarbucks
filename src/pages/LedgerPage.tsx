import { useParams } from 'react-router-dom'

export function LedgerPage() {
  const { childId } = useParams()
  return <div className="p-4">Ledger: {childId}</div>
}
