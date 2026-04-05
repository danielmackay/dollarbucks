import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)

  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      setNeedRefresh(true)
    },
  })

  return (
    <Modal open={needRefresh} onClose={() => {}} title="Update Available">
      <p className="text-brand-navy/70 mb-6">
        A new version of Dollarbucks is ready. Tap below to update.
      </p>
      <Button className="w-full" onClick={() => updateServiceWorker(true)}>
        Update Now
      </Button>
    </Modal>
  )
}
