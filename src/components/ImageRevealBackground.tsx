import { useEffect, useRef } from 'react'
import { BASE_BG, REVEAL_BG } from '../lib/textures'

/**
 * 双图层光标揭示背景
 *
 * 底层常驻；揭示层由一张离屏画布生成的径向渐变做遮罩，
 * 只把光标附近的圆形区域「点亮」，露出底下的配方结构。
 *
 * 三个数值是刻意保留的：
 *  · 指针缓动 0.1
 *  · 聚光半径 clamp(160, 16vw, 420)
 *  · 渐变断点 0 / .4 / .6 / .75 / .88 / 1
 */

/** 掩膜画布缩放：这是平滑渐变，缩到 0.45 再拉伸肉眼无差，但 toDataURL 成本降约 5 倍 */
const MASK_SCALE = 0.45
const EASE_POINTER = 0.1
const EASE_PARALLAX = 0.06

export default function ImageRevealBackground() {
  const revealRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const patternRef = useRef<SVGPatternElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)

  useEffect(() => {
    const layer = revealRef.current
    const canvas = canvasRef.current
    if (!layer || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const wideMq = window.matchMedia('(min-width: 1024px)')
    const calmMq = window.matchMedia('(prefers-reduced-motion: reduce)')

    // 起点放在视口中心，首屏就能看到聚光，不必等鼠标进来
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const smooth = { x: mouse.x, y: mouse.y }
    const grid = { x: 0, y: 0 }
    let lastDrawn = { x: -1e9, y: -1e9 }
    let cell = 48
    let raf = 0
    let running = false

    const spotlightRadius = () =>
      Math.round(Math.min(420, Math.max(160, window.innerWidth * 0.16)))

    const resize = () => {
      cell = Math.round(Math.min(64, Math.max(36, window.innerWidth * 0.028)))
      canvas.width = Math.max(1, Math.round(window.innerWidth * MASK_SCALE))
      canvas.height = Math.max(1, Math.round(window.innerHeight * MASK_SCALE))
      patternRef.current?.setAttribute('width', String(cell))
      patternRef.current?.setAttribute('height', String(cell))
      pathRef.current?.setAttribute('d', `M ${cell} 0 L 0 0 0 ${cell}`)
      lastDrawn = { x: -1e9, y: -1e9 }
    }

    const drawMask = () => {
      const w = canvas.width
      const h = canvas.height
      if (w < 2 || h < 2) return

      ctx.clearRect(0, 0, w, h)
      const cx = smooth.x * MASK_SCALE
      const cy = smooth.y * MASK_SCALE
      const r = spotlightRadius() * MASK_SCALE

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.4, 'rgba(255,255,255,1)')
      g.addColorStop(0.6, 'rgba(255,255,255,0.75)')
      g.addColorStop(0.75, 'rgba(255,255,255,0.4)')
      g.addColorStop(0.88, 'rgba(255,255,255,0.12)')
      g.addColorStop(1, 'rgba(255,255,255,0)')

      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()

      const url = `url("${canvas.toDataURL()}")`
      layer.style.setProperty('mask-image', url)
      layer.style.setProperty('-webkit-mask-image', url)
      layer.style.setProperty('mask-size', '100% 100%')
      layer.style.setProperty('-webkit-mask-size', '100% 100%')
      layer.style.setProperty('mask-repeat', 'no-repeat')
      layer.style.setProperty('-webkit-mask-repeat', 'no-repeat')

      lastDrawn = { x: smooth.x, y: smooth.y }
    }

    const frame = () => {
      if (!running) return

      smooth.x += (mouse.x - smooth.x) * EASE_POINTER
      smooth.y += (mouse.y - smooth.y) * EASE_POINTER

      // 视差网格
      const nx = smooth.x / window.innerWidth - 0.5
      const ny = smooth.y / window.innerHeight - 0.5
      grid.x += (nx * 16 - grid.x) * EASE_PARALLAX
      grid.y += (ny * 16 - grid.y) * EASE_PARALLAX
      patternRef.current?.setAttribute('x', grid.x.toFixed(2))
      patternRef.current?.setAttribute('y', grid.y.toFixed(2))

      // 指针静止时不重绘：toDataURL 是这条链路里最贵的一步
      const moved =
        Math.abs(smooth.x - lastDrawn.x) > 0.15 || Math.abs(smooth.y - lastDrawn.y) > 0.15
      if (moved) drawMask()

      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || !wideMq.matches) return
      running = true
      resize()
      if (calmMq.matches) {
        smooth.x = mouse.x
        smooth.y = mouse.y
        drawMask()
        return
      }
      raf = requestAnimationFrame(frame)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onResize = () => {
      resize()
      if (running) drawMask()
    }
    const onWideChange = () => (wideMq.matches ? start() : stop())
    const onCalmChange = () => {
      stop()
      start()
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', onResize)
    wideMq.addEventListener('change', onWideChange)
    calmMq.addEventListener('change', onCalmChange)
    start()

    return () => {
      stop()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      wideMq.removeEventListener('change', onWideChange)
      calmMq.removeEventListener('change', onCalmChange)
    }
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden lg:block"
      aria-hidden="true"
    >
      {/* 1 底层 */}
      <div className="absolute inset-0" style={{ background: BASE_BG }} />

      {/* 2 揭示层 —— 遮罩由画布每帧生成 */}
      <div
        ref={revealRef}
        className="reveal-layer absolute inset-0"
        style={{ background: REVEAL_BG, willChange: 'mask-image' }}
      />

      {/* 3 视差网格 */}
      <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.1 }}>
        <defs>
          <pattern
            ref={patternRef}
            id="lumen-grid"
            width={48}
            height={48}
            patternUnits="userSpaceOnUse"
          >
            <path ref={pathRef} d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth={0.6} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lumen-grid)" />
      </svg>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
