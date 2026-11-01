import { useRef, useState } from 'react'
import ProductVessel from './ProductVessel'
import type { Vessel } from '../lib/data'

/**
 * 产品「渐变开盖」展示。
 *
 * 和首屏人物素颜→全妆用的是同一套做法：两层同构的图形叠在一起，
 * 上层用 linear-gradient 遮罩切开，鼠标左右划动就切换开合程度。
 *
 * 区别在于拆了层：下层是**开盖态瓶身**（常驻），上层只有**盖子**。
 * 所以拖到一半看到的是"盖子被推开一半"，罐装那种盖子比罐口宽的器型
 * 也不会剩下一条小残片；同时盖子会随开度抬起、微旋，更像真在开盖。
 *
 * 触屏没有 hover，pointermove 只在手指按下时触发，自然退化成拖动。
 * 键盘聚焦后可用 ←/→ 调开合程度。
 */

/** 过渡带半宽（相对宽度）：比人物窄，但太窄会让盖子像被"切断" */
const FEATHER = 0.09
/** 初始开度：留一道缝，让人知道能划开 */
const START = 0.12

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export default function ProductReveal({
  kind,
  vessel,
  maxWidth = 'clamp(8.5rem, 15vw, 14rem)',
}: {
  kind: number
  vessel?: Vessel
  maxWidth?: string
}) {
  const [open, setOpen] = useState(START)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const update = (clientX: number) => {
    const el = boxRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width === 0) return
    setOpen(clamp01((clientX - r.left) / r.width))
  }

  const a = clamp01(open - FEATHER) * 100
  const b = clamp01(open + FEATHER) * 100
  // 透明区＝已开盖：开度越大，从左侧被"擦掉"的盖子越多
  const mask = `linear-gradient(90deg, transparent 0%, transparent ${a.toFixed(2)}%, #000 ${b.toFixed(2)}%, #000 100%)`

  return (
    <div
      ref={boxRef}
      className="relative touch-pan-y select-none"
      style={{ width: '100%', maxWidth, cursor: 'ew-resize' }}
      onPointerMove={(e) => update(e.clientX)}
      onPointerDown={(e) => update(e.clientX)}
    >
      {/* 下层：开盖态瓶身，常驻 */}
      <ProductVessel kind={kind} vessel={vessel} part="body" className="block h-auto w-full" />

      {/* 上层：只有盖子，被渐变遮罩切开；随开度抬起 + 微旋 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
      >
        <div
          style={{
            transform: `translate3d(${(-open * 9).toFixed(2)}px, ${(-open * 16).toFixed(2)}px, 0) rotate(${(-open * 7).toFixed(2)}deg)`,
            transformOrigin: '50% 26%',
            transition: 'transform 90ms linear',
          }}
        >
          <ProductVessel kind={kind} vessel={vessel} part="cap" className="block h-auto w-full" />
        </div>
      </div>

      {/* 键盘可达：只有 Tab 聚焦时才显形 */}
      <button
        type="button"
        role="slider"
        aria-label="Open the package"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(open * 100)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            setOpen((v) => clamp01(v - 0.05))
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            setOpen((v) => clamp01(v + 0.05))
          }
        }}
        className="absolute inset-0 cursor-ew-resize border-0 bg-transparent p-0 opacity-0 outline-none focus-visible:opacity-100"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)' }}
      />
    </div>
  )
}
