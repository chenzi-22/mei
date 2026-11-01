/** 价格显示：整数不加小数，非整数保留两位 */
export function usd(n: number): string {
  const rounded = Math.round(n * 100) / 100
  const hasCents = !Number.isInteger(rounded)
  return (
    '$' +
    rounded.toLocaleString('en-US', {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: hasCents ? 2 : 0,
    })
  )
}
