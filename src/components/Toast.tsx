import { Check, X } from 'lucide-react'

export type ToastState = {
  id: number
  text: string
  kind: 'ok' | 'err'
} | null

type Props = {
  toast: ToastState
  /** 抽屉打开时把提示条挪到左上，避免压住抽屉标题 */
  dodgeLeft?: boolean
}

export default function Toast({ toast, dodgeLeft = false }: Props) {
  if (!toast) return null

  const isErr = toast.kind === 'err'

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className={[
        'anim-toast-in fixed top-4 z-[60] flex max-w-[min(24rem,80vw)] items-center gap-2.5 bg-black px-4 py-3',
        dodgeLeft ? 'left-4' : 'right-4',
      ].join(' ')}
    >
      {isErr ? (
        <X
          strokeWidth={2}
          className="flex-none text-white"
          style={{ width: '0.95rem', height: '0.95rem' }}
        />
      ) : (
        <Check
          strokeWidth={2.5}
          className="flex-none text-emerald-400"
          style={{ width: '0.95rem', height: '0.95rem' }}
        />
      )}
      <span className="font-jakarta leading-snug text-white" style={{ fontSize: 'var(--body)' }}>
        {toast.text}
      </span>
    </div>
  )
}
