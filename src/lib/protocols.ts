/**
 * LUMEN — 面板注册表
 *
 * 导航项、抽屉编号、标题、副标题全部由这一份数据驱动。
 * 加一个新面板 = 在数组里加一条，而不是到处改 JSX。
 *
 * 只有电商业务：浏览商品、看产地、看手记、加购结算。
 */

export type ProtocolId = 'catalog' | 'origins' | 'journal' | 'bag'

export type Protocol = {
  id: ProtocolId
  /** 抽屉左上角的编号 */
  index: string
  /** 顶栏导航文案 */
  label: string
  /** 抽屉标题（Orbitron） */
  title: string
  /** 抽屉副标题 */
  subtitle: string
  /** 是否出现在顶栏导航 */
  inNav: boolean
}

export const PROTOCOLS: Protocol[] = [
  {
    id: 'catalog',
    index: '01',
    label: 'CATALOG',
    title: 'Catalog',
    subtitle: 'Featured Formulas',
    inNav: true,
  },
  {
    id: 'origins',
    index: '02',
    label: 'ORIGINS',
    title: 'Origins',
    subtitle: 'Laboratory Network',
    inNav: true,
  },
  {
    id: 'journal',
    index: '03',
    label: 'JOURNAL',
    title: 'Editorial',
    subtitle: 'Latest Dispatches',
    inNav: true,
  },
  {
    id: 'bag',
    index: '04',
    label: 'BAG',
    title: 'Shopping Bag',
    subtitle: 'Your Selection',
    inNav: false,
  },
]

export function protocolOf(id: ProtocolId | null): Protocol | null {
  if (!id) return null
  return PROTOCOLS.find((p) => p.id === id) ?? null
}
