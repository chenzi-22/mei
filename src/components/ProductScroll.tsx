import { ArrowUpRight, Plus } from 'lucide-react'
import { ORIGINS, PRODUCTS } from '../lib/data'
import type { Product } from '../lib/data'
import { usd } from '../lib/format'
import { useParallax } from '../lib/parallax'
import ProductReveal from './ProductReveal'

type Props = {
  onAdd: (p: Product) => void
  onOpenCatalog: () => void
}

const micro = { fontSize: 'var(--micro)', letterSpacing: '0.18em' } as const

function Item({
  p,
  i,
  onAdd,
}: {
  p: Product
  i: number
  onAdd: (p: Product) => void
}) {
  // 三层不同速度：巨型编号最慢、容器反向漂、文案几乎跟随滚动
  const ghostRef = useParallax<HTMLSpanElement>(0.16)
  const vesselRef = useParallax<HTMLDivElement>(-0.1, 0.012)
  const copyRef = useParallax<HTMLDivElement>(0.06)

  const flipped = i % 2 === 1
  const origin = ORIGINS.find((o) => o.id === p.originId)
  const index = String(i + 1).padStart(2, '0')

  return (
    <article
      className={[
        'relative flex min-h-[78vh] flex-col items-center justify-center gap-10 lg:min-h-[88vh] lg:flex-row lg:gap-16',
        flipped ? 'lg:flex-row-reverse' : '',
      ].join(' ')}
    >
      {/* 巨型编号（视差最慢） */}
      <span
        ref={ghostRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 select-none font-orbitron font-black leading-none text-black"
        style={{
          fontSize: 'clamp(4.5rem, 11vw, 9rem)',
          color: '#ededf0',
          marginTop: '-0.55em',
          zIndex: 0,
          ...(flipped ? { right: 0 } : { left: 0 }),
        }}
      >
        {index}
      </span>

      {/* 容器（反向视差 + 微旋转）+ 划动开盖 */}
      <div ref={vesselRef} className="relative z-10 flex flex-1 items-center justify-center">
        <ProductReveal kind={i} vessel={p.vessel} />
      </div>

      {/* 文案 */}
      <div ref={copyRef} className="relative z-10 w-full flex-1">
        <div className="flex items-baseline gap-4 border-t border-gray-200 pt-4">
          <span
            className="font-orbitron font-bold leading-none"
            style={{ fontSize: 'var(--body)', letterSpacing: '0.1em' }}
          >
            {index}
          </span>
          <span className="font-jakarta uppercase text-gray-400" style={micro}>
            {p.tag}
          </span>
        </div>

        <h3
          className="mt-5 font-orbitron font-extrabold uppercase text-black"
          style={{
            fontSize: 'clamp(1.4rem, 2.6vw, 2.4rem)',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
          }}
        >
          {p.title}
        </h3>

        <p
          className="mt-4 font-jakarta text-gray-500"
          style={{ fontSize: 'var(--body)', lineHeight: 1.8 }}
        >
          {p.inc.join(' · ')}
        </p>

        <div
          className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-jakarta uppercase text-gray-400"
          style={{ ...micro, letterSpacing: '0.14em' }}
        >
          {origin && (
            <span>
              {origin.code} · {origin.city}
            </span>
          )}
          <span>{p.climate}</span>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-5">
          <span
            className="tnum font-jakarta font-semibold text-black"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.3rem)' }}
          >
            {usd(p.price)}
          </span>

          <button
            type="button"
            onClick={() => onAdd(p)}
            className="group inline-flex items-center gap-2 border border-gray-400 px-4 py-2 font-jakarta font-semibold uppercase text-black transition-colors hover:border-black hover:bg-black hover:text-white"
            style={{ ...micro, letterSpacing: '0.16em' }}
          >
            <Plus strokeWidth={2.4} style={{ width: '0.75rem', height: '0.75rem' }} />
            Add to bag
          </button>
        </div>
      </div>
    </article>
  )
}

/**
 * 产品视差滚动区。
 * 四支配方各占一屏，编号 / 容器 / 文案三层不同速度。
 */
export default function ProductScroll({ onAdd, onOpenCatalog }: Props) {
  return (
    <section
      id="products"
      className="relative z-10"
      style={{ paddingInline: 'var(--pad-x)', scrollMarginTop: '6rem' }}
    >
      {/* 区块头 */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 border-t border-gray-300 pt-6">
        <h2
          className="font-orbitron font-extrabold uppercase text-black"
          style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.6rem)', letterSpacing: '0.06em' }}
        >
          The Protocol
        </h2>
        <span className="font-jakarta uppercase text-gray-400" style={micro}>
          04 Formulas
        </span>
      </div>

      <div className="mx-auto max-w-6xl">
        {PRODUCTS.map((p, i) => (
          <Item key={p.id} p={p} i={i} onAdd={onAdd} />
        ))}
      </div>

      {/* 收尾 */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-gray-300 py-10">
        <p
          className="font-jakarta uppercase text-gray-500"
          style={{ fontSize: 'var(--body)', letterSpacing: '0.14em' }}
        >
          Full index in the catalog
        </p>

        <button
          type="button"
          onClick={onOpenCatalog}
          className="group inline-flex items-center gap-2.5 border border-gray-400 px-5 py-2.5 font-jakarta font-semibold uppercase text-black transition-colors hover:border-black hover:bg-black hover:text-white"
          style={{ fontSize: 'var(--body)', letterSpacing: '0.16em' }}
        >
          View all
          <ArrowUpRight
            strokeWidth={1.5}
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            style={{ width: '0.95rem', height: '0.95rem' }}
          />
        </button>
      </div>
    </section>
  )
}
