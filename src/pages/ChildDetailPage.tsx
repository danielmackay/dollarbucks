import { useParams } from 'react-router-dom'

export function ChildDetailPage() {
  const { childId } = useParams()
  return <div className="p-4">Child: {childId}</div>
}
