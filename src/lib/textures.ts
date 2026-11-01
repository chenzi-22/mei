/**
 * LUMEN — 程序化纹理
 *
 * 两个背景图层都不依赖任何外部图片，全部用内联 SVG 生成。
 * 想换成品牌大片：把 BASE_BG / REVEAL_BG 换成 `url('/your-1.jpg') center/cover no-repeat`
 * 即可，其余遮罩逻辑完全不用动。
 */

function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** 点阵 —— 分子节点 */
export function dotTexture(color: string, opacity: number, tile = 26, r = 0.85): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}">` +
    `<circle cx="${tile / 2}" cy="${tile / 2}" r="${r}" fill="${color}" fill-opacity="${opacity}"/>` +
    `</svg>`
  return svgUrl(svg)
}

/** 细网格 */
export function gridTexture(color: string, opacity: number, tile = 130, w = 0.6): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}">` +
    `<path d="M0 0H${tile}M0 0V${tile}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${w}"/>` +
    `</svg>`
  return svgUrl(svg)
}

/** 六边形轮廓 —— 分子骨架 */
export function hexTexture(color: string, opacity: number, size = 240, w = 0.7): string {
  const c = size / 2
  const R = c - 6
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6
    return `${(c + R * Math.cos(a)).toFixed(1)},${(c + R * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<polygon points="${pts}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${w}"/>` +
    `</svg>`
  return svgUrl(svg)
}

/** 底层：纯白 + 极淡点阵（常驻可见） */
export const BASE_BG = [
  `${dotTexture('#64748b', 0.1)} 0 0 / 26px 26px repeat`,
  '#ffffff',
].join(', ')

/** 揭示层：白底 + 分子骨架 + 网格 + 更深的点阵（只在光标聚光内显现） */
export const REVEAL_BG = [
  `${hexTexture('#0f172a', 0.14, 240)} 0 0 / 240px 240px repeat`,
  `${gridTexture('#0f172a', 0.09, 130)} 0 0 / 130px 130px repeat`,
  `${dotTexture('#0f172a', 0.42)} 0 0 / 26px 26px repeat`,
  '#ffffff',
].join(', ')
