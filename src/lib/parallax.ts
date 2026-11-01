/**
 * LUMEN — 视差滚动
 *
 * 全站只挂一个 scroll 监听、一个 rAF 循环，所有元素共享。
 * 位移按「元素中心相对视口中心的距离」计算，所以任何位置都能用。
 */

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

type Entry = {
  el: HTMLElement
  /** 正数 = 比滚动更快（向上漂），负数 = 反向（向下漂） */
  speed: number
  /** 每像素位移叠加多少度旋转，0 表示不转 */
  rotate: number
  /** 元素中心在文档中的 y（未变换时测得） */
  center: number
  last: number
}

const entries = new Set<Entry>()
let raf = 0
let listening = false

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function measure(e: Entry) {
  const prev = e.el.style.transform
  e.el.style.transform = 'none'
  const r = e.el.getBoundingClientRect()
  e.center = r.top + window.scrollY + r.height / 2
  e.el.style.transform = prev
  e.last = Number.NaN
}

function apply() {
  raf = 0
  const viewCenter = window.scrollY + window.innerHeight / 2
  for (const e of entries) {
    const y = (viewCenter - e.center) * e.speed
    if (Math.abs(y - e.last) < 0.1) continue
    e.last = y
    const rot = e.rotate ? ` rotate(${(y * e.rotate).toFixed(3)}deg)` : ''
    e.el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)${rot}`
  }
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(apply)
}

function remeasureAll() {
  for (const e of entries) measure(e)
  schedule()
}

function ensureListening() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', remeasureAll)
  window.addEventListener('load', remeasureAll)
  // 字体加载完成后行高会变，中心点要重测
  if (document.fonts?.ready) void document.fonts.ready.then(remeasureAll)
}

/**
 * 给元素挂视差。
 * @param speed 位移系数（0.1 = 轻微，0.3 = 明显）
 * @param rotate 每像素旋转系数（0 表示不旋转）
 */
export function useParallax<T extends HTMLElement>(
  speed: number,
  rotate = 0,
): RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return

    const entry: Entry = { el, speed, rotate, center: 0, last: Number.NaN }
    entries.add(entry)
    ensureListening()
    measure(entry)
    schedule()

    // 元素自身尺寸变化（文字换行、字体替换）时重测中心
    const ro = new ResizeObserver(() => {
      measure(entry)
      schedule()
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      entries.delete(entry)
      el.style.transform = ''
    }
  }, [speed, rotate])

  return ref
}
