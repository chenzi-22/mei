import type { CSSProperties } from 'react'

/**
 * 自制 SVG 图形：四角括号 / 棋盘格 / 线框地球。
 * 不引任何图标库（lucide 只负责功能图标）。
 */

/* ══════════════════ 四角括号 ══════════════════ */

export type CornerPos = 'tl' | 'tr' | 'bl' | 'br'

const CORNER_PATH: Record<CornerPos, string> = {
  tl: 'M0 11.5V0.5H11.5',
  tr: 'M0.5 0.5H11.5V11.5',
  bl: 'M0 0.5V11.5H11.5',
  br: 'M0.5 11.5H11.5V0.5',
}

export function Corner({
  pos,
  className = '',
  style,
  strokeWidth = 1.5,
}: {
  pos: CornerPos
  className?: string
  style?: CSSProperties
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={CORNER_PATH[pos]} />
    </svg>
  )
}

const POS_CLASS: Record<CornerPos, string> = {
  tl: 'left-0 top-0',
  tr: 'right-0 top-0',
  bl: 'left-0 bottom-0',
  br: 'right-0 bottom-0',
}

/** 四个角在父容器四角（父容器需 relative） */
export function CornerFrame() {
  const size: CSSProperties = { width: 'var(--corner)', height: 'var(--corner)' }
  return (
    <>
      {(Object.keys(POS_CLASS) as CornerPos[]).map((pos) => (
        <Corner
          key={pos}
          pos={pos}
          className={`pointer-events-none absolute text-black ${POS_CLASS[pos]}`}
          style={size}
        />
      ))}
    </>
  )
}

/* ══════════════════ 棋盘格 ══════════════════ */

const CHECK_ROWS = 4
const CHECK_COLS = 7
const CHECK_SIZE = 3.8
const CHECK_PITCH = 4.5
const CHECK_SHIFT = 2.25

export function Checkerboard({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  const cells: string[] = []
  for (let r = 0; r < CHECK_ROWS; r++) {
    const offset = r % 2 === 0 ? CHECK_SHIFT : 0
    for (let c = 0; c < CHECK_COLS; c++) {
      const x = (c * CHECK_PITCH + offset).toFixed(2)
      const y = (r * CHECK_PITCH).toFixed(2)
      cells.push(`M${x} ${y}h${CHECK_SIZE}v${CHECK_SIZE}h-${CHECK_SIZE}z`)
    }
  }

  return (
    <svg
      viewBox="0 0 36 18"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={cells.join('')} />
    </svg>
  )
}

/* ══════════════════ 线框地球 ══════════════════ */

export function WireframeGlobe({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      aria-hidden="true"
      className={className}
      style={style}
    >
      <circle cx="32" cy="32" r="28" />
      {/* 赤道 */}
      <line x1="4" y1="32" x2="60" y2="32" />
      {/* 纬线 */}
      <ellipse cx="32" cy="32" rx="28" ry="10" />
      <ellipse cx="32" cy="32" rx="28" ry="19" />
      {/* 本初子午线 */}
      <line x1="32" y1="4" x2="32" y2="60" />
      {/* 经线 */}
      <ellipse cx="32" cy="32" rx="10" ry="28" />
      <ellipse cx="32" cy="32" rx="19" ry="28" />
    </svg>
  )
}
