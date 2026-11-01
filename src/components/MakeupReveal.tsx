import { useRef, useState } from 'react'

/**
 * 素颜 → 全妆 的渐变揭示
 *
 * 交互：鼠标在图上左右划动就跟着变，不需要按住。
 * 触屏没有 hover，于是 pointermove 只在手指按下时触发，自然退化成拖动。
 *
 * 画面上没有任何线条或文字：分割线只在键盘聚焦时显形，
 * 图片不带外框，也没有角标和提示。
 *
 * 两张素材是同一人物、同一姿势、同一布光的两代图，
 * 相位相关测得 dx=0 dy=0 scale=1.0（MAD 3.9/255），可以逐像素对齐叠加。
 *
 * 素材是带 alpha 的抠图（见 blend.py）：背景为真透明，
 * 所以人物直接落在页面自己的白底 / 点阵纹理上，没有照片方框，也没有接缝。
 */

/** 素材路径跟着构建 base 走：GitHub Pages 的子目录部署也能取到 */
const BASE = import.meta.env.BASE_URL
const BARE_PHOTO = `${BASE}portrait-bare.webp`
const STYLED_PHOTO = `${BASE}portrait-styled.webp`

/** 过渡带半宽（相对宽度）：越大越柔 */
const FEATHER = 0.13
/** 起始位置：几乎全素颜 */
const START = 0.12

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export default function MakeupReveal() {
  const [pos, setPos] = useState(START)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const update = (clientX: number) => {
    const el = boxRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width === 0) return
    setPos(clamp01((clientX - r.left) / r.width))
  }

  const a = clamp01(pos - FEATHER) * 100
  const b = clamp01(pos + FEATHER) * 100
  const mask = `linear-gradient(90deg, #000 0%, #000 ${a.toFixed(2)}%, transparent ${b.toFixed(2)}%, transparent 100%)`

  return (
    <div
      ref={boxRef}
      onPointerMove={(e) => update(e.clientX)}
      className="touch-pan-y relative w-full cursor-ew-resize select-none overflow-hidden"
    >
      {/* 素颜（底层，常驻） */}
      <img
        src={BARE_PHOTO}
        alt="Bare face"
        draggable={false}
        className="block h-auto w-full"
      />

      {/* 全妆（上层，被渐变遮罩切开） */}
      <img
        src={STYLED_PHOTO}
        alt="Full makeup"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
      />

      {/* 分割线：默认完全不可见，只有键盘 Tab 聚焦时才显形 */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 opacity-0 transition-opacity duration-150 focus-within:opacity-100"
        style={{
          left: `${pos * 100}%`,
          width: '1px',
          transform: 'translateX(-0.5px)',
          background: 'rgba(0,0,0,0.55)',
        }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Makeup reveal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos * 100)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              setPos((p) => clamp01(p - 0.04))
            } else if (e.key === 'ArrowRight') {
              e.preventDefault()
              setPos((p) => clamp01(p + 0.04))
            }
          }}
          className="pointer-events-auto absolute top-1/2 left-0 flex items-center justify-center rounded-full border border-black bg-white"
          style={{
            width: '2.1rem',
            height: '2.1rem',
            cursor: 'ew-resize',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  )
}
