import type { CSSProperties, ReactElement } from 'react'
import type { Vessel } from '../lib/data'

/**
 * 产品图形（按器型生成，不是照片）。
 *
 * 语言沿用首屏的线框地球：细线、几何、极浅填充。
 * 加了玻璃底色和液面填充后，它在白底上读得出"是一支产品"，
 * 又不至于变成装饰性的插画。
 *
 * 关键结构：**瓶身与盖子分开渲染**。
 * 揭示时只对"盖子"这一层做遮罩，瓶身（开盖态）常驻在下面，
 * 于是拖到一半看到的是"盖子被推开一半"，而不是整只瓶子被切断——
 * 罐装那种盖子比瓶口宽的器型尤其明显。
 */

const STROKE = '#000000'
const FAINT = '#c9c9cf'
const GLASS = '#fbfbfc'
const LIQUID = '#f2f2f5'

export const VESSELS: readonly Vessel[] = ['dropper', 'ampoule', 'jar', 'tube']

/** body = 开盖态（含瓶口）；cap = 盖子本身 */
export type VesselPart = 'all' | 'body' | 'cap'

function Ticks() {
  return (
    <path
      d="M2 9V2H9 M111 2H118V9 M118 191V198H111 M9 198H2V191"
      fill="none"
      stroke={FAINT}
      strokeWidth={1}
    />
  )
}

/** 虚线液位线 */
function FillLine({ y }: { y: number }) {
  return <path d={`M36 ${y}H84`} fill="none" stroke={FAINT} strokeWidth={1} strokeDasharray="3 4" />
}

/** 瓶身标签的示意刻度 */
function Label({ y }: { y: number }) {
  return <path d={`M44 ${y}h8M44 ${y + 7}h15M44 ${y + 14}h11`} stroke={FAINT} strokeWidth={1} fill="none" />
}

type Parts = { Body: () => ReactElement; Cap: () => ReactElement }

/** 滴管精华 */
const DROPPER: Parts = {
  Body: () => {
    const body =
      'M44 64H76A12 12 0 0 1 88 76V164A12 12 0 0 1 76 176H44A12 12 0 0 1 32 164V76A12 12 0 0 1 44 64Z'
    return (
      <>
        <defs>
          <clipPath id="clip-dropper">
            <path d={body} />
          </clipPath>
        </defs>
        <path d={body} fill={GLASS} stroke={STROKE} strokeWidth={1.2} />
        <g clipPath="url(#clip-dropper)">
          <rect x="32" y="110" width="56" height="70" fill={LIQUID} />
        </g>
        <FillLine y={110} />
        <Label y={140} />
        {/* 瓶颈、瓶口、螺纹 */}
        <path d="M52 64V48M68 64V48" stroke={STROKE} strokeWidth={1.2} fill="none" />
        <ellipse cx="60" cy="48" rx="8" ry="2.6" fill={LIQUID} stroke={STROKE} strokeWidth={1.2} />
        <path d="M52 56h16" stroke={FAINT} strokeWidth={1} />
      </>
    )
  },
  Cap: () => (
    <>
      <rect x="50" y="34" width="20" height="30" rx="2" fill={GLASS} stroke={STROKE} strokeWidth={1.2} />
      <path d="M50 44h20" stroke={FAINT} strokeWidth={1} />
    </>
  ),
}

/** 安瓶：盖子＝密封头，掰断即开 */
const AMPOULE: Parts = {
  Body: () => {
    const body = 'M53 42h14v20l8 12v92c0 7-4 10-10 10H55c-6 0-10-3-10-10V74l8-12z'
    return (
      <>
        <defs>
          <clipPath id="clip-ampoule">
            <path d={body} />
          </clipPath>
        </defs>
        <path d={body} fill={GLASS} stroke={STROKE} strokeWidth={1.2} />
        <g clipPath="url(#clip-ampoule)">
          <rect x="40" y="128" width="40" height="50" fill={LIQUID} />
        </g>
        <path d="M45 80h30" stroke={FAINT} strokeWidth={1} />
        <FillLine y={128} />
        <Label y={146} />
        {/* 断口 */}
        <ellipse cx="60" cy="42" rx="7" ry="2.4" fill={LIQUID} stroke={STROKE} strokeWidth={1.2} />
        <path d="M53 39.5l2.5-2 2.5 1.6 2.5-1.6 2.5 1.6 2-1" fill="none" stroke={FAINT} strokeWidth={1} />
      </>
    )
  },
  Cap: () => (
    <>
      <path d="M53 42V30h14v12" fill={GLASS} stroke={STROKE} strokeWidth={1.2} />
      <path d="M60 30v-3" stroke={STROKE} strokeWidth={1.2} />
    </>
  ),
}

/** 面霜罐 */
const JAR: Parts = {
  Body: () => (
    <>
      <rect x="33" y="88" width="54" height="72" rx="9" fill={GLASS} stroke={STROKE} strokeWidth={1.2} />
      <FillLine y={126} />
      <Label y={138} />
      {/* 罐口 + 膏体表面 */}
      <ellipse cx="60" cy="88" rx="27" ry="6" fill={LIQUID} stroke={STROKE} strokeWidth={1.2} />
      <ellipse cx="60" cy="92.5" rx="22" ry="4.2" fill="none" stroke={FAINT} strokeWidth={1} />
    </>
  ),
  Cap: () => (
    <>
      <rect x="33" y="64" width="54" height="24" rx="4" fill={GLASS} stroke={STROKE} strokeWidth={1.2} />
      <path d="M38 76h44" stroke={FAINT} strokeWidth={1} />
    </>
  ),
}

/** 防晒霜软管 */
const TUBE: Parts = {
  Body: () => {
    const body = 'M45 64h30l5 100c0 8-5 12-12 12H52c-7 0-12-4-12-12z'
    return (
      <>
        <defs>
          <clipPath id="clip-tube">
            <path d={body} />
          </clipPath>
        </defs>
        <path d={body} fill={GLASS} stroke={STROKE} strokeWidth={1.2} />
        <g clipPath="url(#clip-tube)">
          <rect x="30" y="118" width="60" height="70" fill={LIQUID} />
        </g>
        <path d="M45 64h30" stroke={STROKE} strokeWidth={1.2} />
        <FillLine y={118} />
        <Label y={142} />
        {/* 喷嘴 */}
        <path
          d="M52 66V52c0-2.2 3.6-3.4 8-3.4s8 1.2 8 3.4v14"
          fill="none"
          stroke={STROKE}
          strokeWidth={1.2}
        />
        <ellipse cx="60" cy="52" rx="4" ry="1.4" fill={LIQUID} stroke={STROKE} strokeWidth={1.2} />
      </>
    )
  },
  Cap: () => (
    <>
      <rect x="52" y="52" width="16" height="16" rx="1.5" fill={GLASS} stroke={STROKE} strokeWidth={1.2} />
      <path d="M52 60h16" stroke={FAINT} strokeWidth={1} />
    </>
  ),
}

const PARTS: Record<Vessel, Parts> = {
  dropper: DROPPER,
  ampoule: AMPOULE,
  jar: JAR,
  tube: TUBE,
}

/** 显式指定 vessel 优先；没指定就按索引回退，老调用点仍然能用 */
export function resolveVessel(kind: number, vessel?: Vessel): Vessel {
  if (vessel) return vessel
  const i = ((kind % VESSELS.length) + VESSELS.length) % VESSELS.length
  return VESSELS[i]
}

export default function ProductVessel({
  kind,
  vessel,
  part = 'all',
  className = '',
  style,
}: {
  kind: number
  vessel?: Vessel
  part?: VesselPart
  className?: string
  style?: CSSProperties
}) {
  const { Body, Cap } = PARTS[resolveVessel(kind, vessel)]

  return (
    <svg viewBox="0 0 120 200" className={className} style={style} role="presentation" aria-hidden="true">
      {part !== 'cap' && <Ticks />}
      {part !== 'cap' && <Body />}
      {part !== 'body' && <Cap />}
    </svg>
  )
}
