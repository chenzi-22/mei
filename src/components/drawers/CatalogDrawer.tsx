import { Plus } from 'lucide-react'
import { ORIGINS, PRODUCTS } from '../../lib/data'
import type { Product } from '../../lib/data'
import { usd } from '../../lib/format'

/** 拖拽商品时携带的自定义类型（避免和文件拖拽混淆） */
export const DRAG_MIME = 'application/x-lumen-product'

type Props = {
  onAdd: (p: Product) => void
}

/**
 * 面板 01 — 目录
 *
 * 每条是一个可拖拽的商品：拖住它丢到页面任意位置即可加入购物袋，
 * 也可以直接点 ADD。
 */
export default function CatalogDrawer({ onAdd }: Props) {
  return (
    <>
      <p
        className="mb-1 font-jakarta uppercase text-gray-400"
        style={{ fontSize: 'var(--micro)', letterSpacing: '0.16em' }}
      >
        Drag any item to the page to add
      </p>

      <ul className="flex flex-col">
        {PRODUCTS.map((p, i) => {
          const origin = ORIGINS.find((o) => o.id === p.originId)
          return (
            <li
              key={p.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_MIME, p.id)
                e.dataTransfer.effectAllowed = 'copy'
              }}
              className="py-5"
              style={{
                borderTop: i === 0 ? 'none' : '1px solid #f0f0f0',
                cursor: 'grab',
              }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className="font-jakarta uppercase text-gray-400"
                  style={{ fontSize: 'var(--micro)', letterSpacing: '0.18em' }}
                >
                  {p.tag}
                </span>
                <span
                  className="tnum flex-none font-jakarta font-semibold text-black"
                  style={{ fontSize: 'var(--body)' }}
                >
                  {usd(p.price)}
                </span>
              </div>

              <h3
                className="mt-1.5 font-jakarta font-semibold uppercase text-black"
                style={{ fontSize: 'var(--body)', letterSpacing: '0.06em', lineHeight: 1.35 }}
              >
                {p.title}
              </h3>

              <p
                className="mt-1 font-jakarta text-gray-500"
                style={{ fontSize: 'var(--micro)', lineHeight: 1.6 }}
              >
                {p.inc.join(' · ')}
              </p>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span
                  className="font-jakarta uppercase text-gray-400"
                  style={{ fontSize: 'var(--micro)', letterSpacing: '0.14em' }}
                >
                  {origin ? `${origin.code} · ${origin.city}` : ''} — {p.climate}
                </span>

                <button
                  type="button"
                  onClick={() => onAdd(p)}
                  className="inline-flex flex-none items-center gap-1 border border-gray-400 px-2.5 py-1 font-jakarta font-semibold uppercase text-black transition-colors hover:border-black hover:bg-black hover:text-white"
                  style={{ fontSize: 'var(--micro)', letterSpacing: '0.16em' }}
                  aria-label={`Add ${p.title} to bag`}
                >
                  <Plus strokeWidth={2.4} style={{ width: '0.7rem', height: '0.7rem' }} />
                  Add
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
