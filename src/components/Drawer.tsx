import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { BRAND } from '../lib/data'

type Props = {
  open: boolean
  index: string
  title: string
  subtitle: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** true 时不渲染默认品牌页脚（购物袋自己有结算条） */
  footerless?: boolean
}

/**
 * 右侧抽屉。
 * 常挂在 DOM 上，用 translate 做进出场，这样关闭动画才顺。
 */
export default function Drawer({
  open,
  index,
  title,
  subtitle,
  onClose,
  children,
  footer,
  footerless = false,
}: Props) {
  return (
    <>
      {/* 背景遮罩 */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* 面板 */}
      <aside
        className="fixed right-0 top-0 z-40 flex h-full flex-col border-l border-gray-200 bg-white transition-transform duration-300"
        style={{
          width: 'min(var(--drawer-max), 92vw)',
          maxWidth: 'min(var(--drawer-max), 92vw)',
          padding: 'var(--drawer-pad)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        }}
        aria-hidden={!open}
        aria-label={title}
      >
        {/* 头部 */}
        <div className="flex flex-none items-start justify-between gap-4">
          <div className="min-w-0">
            <div
              className="font-jakarta font-medium uppercase text-gray-400"
              style={{ fontSize: 'var(--micro)', letterSpacing: '0.22em' }}
            >
              Protocol {index}
            </div>
            <h2
              className="font-orbitron font-bold uppercase leading-tight text-black"
              style={{ fontSize: 'var(--logo)', letterSpacing: '0.06em', marginTop: '0.35rem' }}
            >
              {title}
            </h2>
            <div
              className="font-jakarta uppercase text-gray-500"
              style={{ fontSize: 'var(--micro)', letterSpacing: '0.16em', marginTop: '0.3rem' }}
            >
              {subtitle}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-1 flex-none text-black transition-opacity hover:opacity-50"
            aria-label="Close panel"
          >
            <X strokeWidth={1.5} style={{ width: 'var(--icon)', height: 'var(--icon)' }} />
          </button>
        </div>

        {/* 内容 */}
        <div className="thin-scroll mt-6 min-h-0 flex-1 overflow-y-auto">{children}</div>

        {/* 底部 */}
        <div className="flex-none pt-4">
          {footerless ? null : (
            footer ?? (
              <div
                className="text-center font-jakarta uppercase text-gray-400"
                style={{ fontSize: 'var(--micro)', letterSpacing: '0.16em' }}
              >
                {BRAND.footer}
              </div>
            )
          )}
        </div>
      </aside>
    </>
  )
}
