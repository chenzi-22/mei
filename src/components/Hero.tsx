import { ArrowUpRight } from 'lucide-react'
import { BRAND } from '../lib/data'
import { Checkerboard, Corner } from './icons'
import FeatureFrame from './FeatureFrame'

type Props = {
  onShop: () => void
}

/**
 * 首屏主视觉 —— 独占第一屏，头部用 fixed 浮在它上面。
 */
export default function Hero({ onShop }: Props) {
  const cornerSize = { width: 'var(--corner)', height: 'var(--corner)' }

  return (
    <main
      className="relative z-10 flex min-h-[100svh] flex-col justify-between gap-10 lg:flex-row lg:items-stretch"
      style={{
        paddingInline: 'var(--pad-x)',
        // 给 fixed 头部让位：头部高度 ≈ header-pt + logo + section-gap
        paddingTop: 'calc(var(--header-pt) + var(--logo) + var(--section-gap) + var(--main-py))',
        paddingBottom: 'var(--main-py)',
      }}
    >
      {/* ── 左：品牌 ── */}
      <div className="flex min-w-0 flex-col justify-center">
        <Corner pos="tl" className="text-black" style={cornerSize} />

        <h1
          className="font-orbitron font-extrabold uppercase text-black"
          style={{
            fontSize: 'var(--headline)',
            letterSpacing: '0.08em',
            lineHeight: 1.05,
            marginTop: 'var(--section-gap)',
            marginBottom: 'var(--section-gap)',
          }}
        >
          <span className="block">{BRAND.headline[0]}</span>
          <span className="block">{BRAND.headline[1]}</span>
          <span className="block whitespace-nowrap">
            {BRAND.headline[2]}
            <Checkerboard
              className="inline-block text-black"
              style={{
                width: 'var(--checker-w)',
                height: 'var(--checker-h)',
                marginLeft: '0.32em',
                verticalAlign: 'middle',
                transform: 'translateY(2px)',
              }}
            />
          </span>
        </h1>

        <Corner pos="bl" className="text-black" style={cornerSize} />

        <div style={{ marginTop: 'var(--section-gap)' }}>
          <button
            type="button"
            onClick={onShop}
            className="group inline-flex items-center rounded-md border border-gray-400 uppercase text-black transition-colors duration-200 hover:border-black hover:bg-black hover:text-white"
            style={{
              paddingInline: 'var(--btn-px)',
              paddingBlock: 'var(--btn-py)',
              fontSize: 'var(--body)',
              letterSpacing: '0.18em',
              gap: 'var(--btn-gap)',
            }}
          >
            {BRAND.cta}
            <ArrowUpRight
              strokeWidth={1.5}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              style={{ width: '0.95rem', height: '0.95rem' }}
            />
          </button>
        </div>
      </div>

      {/* ── 右：取景框 ── */}
      <div className="flex-shrink-0 self-end">
        <FeatureFrame />
      </div>

      {/* 滚动提示 */}
      <div
        className="pointer-events-none absolute inset-x-0 hidden justify-center lg:flex"
        style={{ bottom: 'calc(var(--pad-y) * 0.85)' }}
        aria-hidden="true"
      >
        <span className="flex flex-col items-center gap-2.5">
          <span
            className="font-jakarta uppercase text-gray-400"
            style={{ fontSize: 'var(--micro)', letterSpacing: '0.3em' }}
          >
            Scroll
          </span>
          <span className="anim-hint block w-px bg-black" style={{ height: '2rem' }} />
        </span>
      </div>
    </main>
  )
}
