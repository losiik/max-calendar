import { Overlay } from '@/shared/ui/Overlay'
import { useModalStore } from '../modal/store'

export function ModalHost() {
  const { stack, close } = useModalStore()
  return (
    <>
      {stack.map(m => {
        const C = m.content
        return (
          <Overlay key={m.id} open onClose={() => close()}>
            <C />
          </Overlay>
        )
      })}
    </>
  )
}
