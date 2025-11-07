import { PropsWithChildren, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

type OverlayProps = PropsWithChildren<{
  open: boolean
  onClose?: () => void
  backdropClassName?: string
  contentClassName?: string
  closeOnEsc?: boolean
  closeOnBackdrop?: boolean
  preventScroll?: boolean
  closeOnBlur?: boolean
}>

export function Overlay({
  open,
  onClose,
  children,
  backdropClassName,
  contentClassName,
  closeOnEsc = true,
  closeOnBackdrop = true,
  preventScroll = true,
  closeOnBlur = true
}: OverlayProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !preventScroll) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open, preventScroll])

  useEffect(() => {
    if (!open || !closeOnEsc) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, closeOnEsc, onClose])

  useEffect(() => {
    if (!open || !closeOnBlur) return
    const handler = (e: FocusEvent) => {
      const el = contentRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) onClose?.()
    }
    document.addEventListener('focusin', handler)
    return () => document.removeEventListener('focusin', handler)
  }, [open, closeOnBlur, onClose])

  useEffect(() => {
    if (!open) return
    const el = contentRef.current
    if (!el) return
    const id = requestAnimationFrame(() => el.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null

  const handleBackdrop = () => {
    if (closeOnBackdrop) onClose?.()
  }

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
    const portalTarget =
    document.getElementById('portal-root') ??
    document.getElementById('root') ??
    document.body;   

  return createPortal(
    <div
      onClick={handleBackdrop}
      className={clsx(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
        'flex items-center justify-center p-4',
        backdropClassName
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={contentRef}
        onClick={stop}
        className={clsx('w-full max-w-2xl outline-none', contentClassName)}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    portalTarget
  )
}
