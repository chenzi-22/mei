/**
 * LUMEN — 购物袋（纯函数）
 * 组件只管渲染，合并/去重/合计都在这里。
 */

import type { Product } from './data'

export type CartLine = {
  id: string
  title: string
  price: number
  qty: number
}

export function addLine(lines: CartLine[], p: Product): CartLine[] {
  const hit = lines.find((l) => l.id === p.id)
  if (hit) {
    return lines.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l))
  }
  return [...lines, { id: p.id, title: p.title, price: p.price, qty: 1 }]
}

export function removeLine(lines: CartLine[], id: string): CartLine[] {
  return lines.filter((l) => l.id !== id)
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0)
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.price * l.qty, 0)
}
