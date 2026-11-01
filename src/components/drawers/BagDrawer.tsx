import { ChevronRight, ShoppingBag } from 'lucide-react'
import type { CartLine } from '../../lib/cart'
import { cartTotal } from '../../lib/cart'
import { usd } from '../../lib/format'

type Props = {
  lines: CartLine[]
  onRemove: (id: string) => void
  onCheckout: () => void
}

/**
 * 协议 04 — 购物袋
 */
export default function BagDrawer({ lines, onRemove, onCheckout }: Props) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <ShoppingBag
          strokeWidth={1.2}
          className="text-gray-300"
          style={{ width: '2rem', height: '2rem' }}
        />
        <p
          className="font-jakarta text-gray-500"
          style={{ fontSize: 'var(--body)' }}
        >
          Your shopping bag is empty.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <ul className="flex flex-col">
        {lines.map((l, i) => (
          <li
            key={l.id}
            className="flex items-start justify-between gap-3 py-4"
            style={{ borderTop: i === 0 ? 'none' : '1px solid #f0f0f0' }}
          >
            <div className="min-w-0">
              <div
                className="font-jakarta font-semibold uppercase text-black"
                style={{ fontSize: 'var(--micro)', letterSpacing: '0.08em', lineHeight: 1.45 }}
              >
                {l.title}
              </div>
              <div
                className="tnum mt-1 font-jakarta text-gray-500"
                style={{ fontSize: 'var(--micro)' }}
              >
                {usd(l.price)} × {l.qty}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRemove(l.id)}
              className="flex-none font-jakarta uppercase text-gray-400 underline-offset-4 transition-colors hover:text-black hover:underline"
              style={{ fontSize: 'var(--micro)', letterSpacing: '0.14em' }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div
        className="mt-4 flex items-baseline justify-between border-t border-gray-200 pt-4"
        style={{ marginTop: 'auto' }}
      >
        <span
          className="font-jakarta uppercase text-gray-400"
          style={{ fontSize: 'var(--micro)', letterSpacing: '0.18em' }}
        >
          Subtotal
        </span>
        <span
          className="tnum font-jakarta font-semibold text-black"
          style={{ fontSize: 'var(--body)' }}
        >
          {usd(cartTotal(lines))}
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="mt-3 flex w-full items-center justify-center gap-2 bg-black font-jakarta font-semibold uppercase text-white transition-opacity hover:opacity-80"
        style={{
          paddingBlock: 'var(--btn-py)',
          paddingInline: 'var(--btn-px)',
          fontSize: 'var(--body)',
          letterSpacing: '0.18em',
        }}
      >
        Checkout Now
        <ChevronRight strokeWidth={1.8} style={{ width: '0.95rem', height: '0.95rem' }} />
      </button>
    </div>
  )
}
