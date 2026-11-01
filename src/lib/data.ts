/**
 * LUMEN — brand data
 *
 * 所有可变的业务数据集中在这一点，组件只消费、不硬编码。
 * 新增产品 / 产地 / 手记只需在这里加一条。
 */

/** 容器器型：产品图按这个字段生成，不再靠数组下标猜 */
export type Vessel = 'dropper' | 'ampoule' | 'jar' | 'tube'

export type Product = {
  id: string
  title: string
  price: number
  tag: string
  /** 容器器型 —— 决定产品图的形状与开盖方式 */
  vessel: Vessel
  /** INCI 成分表 —— 拖拽解析时会拿它做匹配 */
  inc: string[]
  /** 指向 Origin.id */
  originId: string
  climate: string
}

export type Origin = {
  id: string
  city: string
  country: string
  code: string
  spec: string
  certs: string[]
}

export type Post = {
  id: string
  date: string
  title: string
  read: string
}

export const BRAND = {
  name: 'LUMEN',
  degree: '˚',
  headline: ['SKIN', 'BEYOND', 'BORDERS'] as const,
  cta: 'SHOP THE PROTOCOL',
  tagline: ['FORMULATED FOR EVERY CLIMATE.', 'SHIPPED ACROSS EVERY BORDER.'] as const,
  footer: 'LUMEN © 2026 — SKIN BEYOND BORDERS',
} as const

export const PRODUCTS: Product[] = [
  {
    id: 'h2o-lattice',
    title: 'H2O LATTICE SERUM',
    price: 68,
    vessel: 'dropper',
    tag: 'LIMITED EDITION',
    inc: [
      'Aqua',
      'Sodium Hyaluronate',
      'Niacinamide',
      'Panthenol',
      'Glycerin',
      'Allantoin',
    ],
    originId: 'seoul',
    climate: 'HUMID / TEMPERATE',
  },
  {
    id: 'geo-peptide',
    title: 'GEO-PEPTIDE AMPOULE',
    price: 54,
    vessel: 'ampoule',
    tag: 'NEW DROP',
    inc: [
      'Aqua',
      'Copper Tripeptide-1',
      'Acetyl Hexapeptide-8',
      'Niacinamide',
      'Panthenol',
      'Glycerin',
    ],
    originId: 'zurich',
    climate: 'DRY / COLD',
  },
  {
    id: 'orbital-barrier',
    title: 'ORBITAL BARRIER CREAM',
    price: 46,
    vessel: 'jar',
    tag: 'IN STOCK',
    inc: [
      'Aqua',
      'Ceramide NP',
      'Squalane',
      'Cholesterol',
      'Centella Asiatica Extract',
      'Glycerin',
    ],
    originId: 'kyoto',
    climate: 'ARID / INDOOR',
  },
  {
    id: 'modular-uv',
    title: 'MODULAR UV VEIL SPF50+',
    price: 39,
    vessel: 'tube',
    tag: 'PRE-ORDER',
    inc: [
      'Aqua',
      'Zinc Oxide',
      'Titanium Dioxide',
      'Niacinamide',
      'Tocopherol',
      'Glycerin',
    ],
    originId: 'lyon',
    climate: 'HIGH UV / TROPICAL',
  },
]

export const ORIGINS: Origin[] = [
  {
    id: 'seoul',
    city: 'SEOUL',
    country: 'KOREA',
    code: 'KR',
    spec: 'Fermentation and peptide lab · cold enzymolysis preserves the active conformation',
    certs: ['ISO 22716', 'COSMOS'],
  },
  {
    id: 'kyoto',
    city: 'KYOTO',
    country: 'JAPAN',
    code: 'JP',
    spec: 'Ceramide line · lamellar lipids built to match the skin barrier',
    certs: ['GMP', 'JCID'],
  },
  {
    id: 'lyon',
    city: 'LYON',
    country: 'FRANCE',
    code: 'FR',
    spec: 'Botanical extraction · supercritical CO₂, zero solvent residue',
    certs: ['ECOCERT', 'ISO 16128'],
  },
  {
    id: 'zurich',
    city: 'ZÜRICH',
    country: 'SWITZERLAND',
    code: 'CH',
    spec: 'Clinical validation · 3D epidermal models, filed batch by batch',
    certs: ['GMP', 'ISO 22716'],
  },
]

export const POSTS: Post[] = [
  {
    id: 'p1',
    date: 'AUG 2026',
    title: 'THE ARCHITECTURE OF A BARRIER',
    read: '4 MIN READ',
  },
  {
    id: 'p2',
    date: 'JUL 2026',
    title: 'CIRCULAR FORMULATION IN HIGH-END SKINCARE',
    read: '6 MIN READ',
  },
  {
    id: 'p3',
    date: 'JUN 2026',
    title: 'MINIMALISM AS A FUNCTIONAL STATEMENT',
    read: '3 MIN READ',
  },
]
