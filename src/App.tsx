import { useCallback, useEffect, useRef, useState } from 'react'
import { ShoppingBag } from 'lucide-react'

import Header from './components/Header'
import Hero from './components/Hero'
import TransformationSection from './components/TransformationSection'
import ProductScroll from './components/ProductScroll'
import Drawer from './components/Drawer'
import Toast from './components/Toast'
import type { ToastState } from './components/Toast'
import ImageRevealBackground from './components/ImageRevealBackground'
import CatalogDrawer, { DRAG_MIME } from './components/drawers/CatalogDrawer'
import OriginsDrawer from './components/drawers/OriginsDrawer'
import JournalDrawer from './components/drawers/JournalDrawer'
import BagDrawer from './components/drawers/BagDrawer'

import { BRAND, PRODUCTS } from './lib/data'
import type { Product } from './lib/data'
import type { ProtocolId } from './lib/protocols'
import { protocolOf } from './lib/protocols'
import { addLine, cartCount, removeLine } from './lib/cart'
import type { CartLine } from './lib/cart'

export default function App() {
  const [drawer, setDrawer] = useState<ProtocolId | null>(null)
  const [cart, setCart] = useState<CartLine[]>([])
  const [toast, setToast] = useState<ToastState>(null)
  const [dragging, setDragging] = useState(false)

  const dragDepth = useRef(0)
  const toastTimer = useRef<number | undefined>(undefined)

  /* ── 提示 ── */
  const notify = useCallback((text: string, kind: 'ok' | 'err' = 'ok') => {
    setToast({ id: Date.now(), text, kind })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  /* ── 购物袋 ── */
  const onAdd = useCallback(
    (p: Product) => {
      setCart((c) => addLine(c, p))
      notify(`Added "${p.title}" to your shopping bag.`)
    },
    [notify],
  )

  const onRemove = useCallback((id: string) => setCart((c) => removeLine(c, id)), [])

  const onCheckout = useCallback(() => {
    setCart([])
    setDrawer(null)
    notify('Order submitted successfully!')
  }, [notify])

  /* ── 滚到产品区 ── */
  const scrollToProducts = useCallback(() => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  /* ── 拖商品进购物袋 ── */
  useEffect(() => {
    const isProductDrag = (e: DragEvent) =>
      !!e.dataTransfer && Array.from(e.dataTransfer.types).includes(DRAG_MIME)

    const onEnter = (e: DragEvent) => {
      if (!isProductDrag(e)) return
      e.preventDefault()
      dragDepth.current += 1
      setDragging(true)
    }

    const onOver = (e: DragEvent) => {
      // 不 preventDefault 的话浏览器会拒绝 drop，文件还会被导航打开
      e.preventDefault()
      if (isProductDrag(e) && e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    }

    const onLeave = () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setDragging(false)
    }

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      dragDepth.current = 0
      setDragging(false)

      const id = e.dataTransfer?.getData(DRAG_MIME)
      if (id) {
        const p = PRODUCTS.find((x) => x.id === id)
        if (p) onAdd(p)
        return
      }
      if (e.dataTransfer?.files?.length) {
        notify('Only products can be dropped here — not files.', 'err')
      }
    }

    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragover', onOver)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [onAdd, notify])

  /* ── Esc 关闭面板 ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawer(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const proto = protocolOf(drawer)

  return (
    <div className="relative min-h-screen bg-white font-jakarta text-black antialiased">
      <ImageRevealBackground />

      <Header
        cartCount={cartCount(cart)}
        active={drawer}
        onOpen={setDrawer}
        onLogo={() => setDrawer(null)}
      />

      <Hero onShop={scrollToProducts} />

      <TransformationSection onOpenCatalog={() => setDrawer('catalog')} />

      <ProductScroll onAdd={onAdd} onOpenCatalog={() => setDrawer('catalog')} />

      {/* 页脚 */}
      <footer
        className="relative z-10 mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200"
        style={{ paddingInline: 'var(--pad-x)', paddingBlock: 'var(--pad-y)' }}
      >
        <span
          className="font-orbitron font-black uppercase leading-none text-black"
          style={{ fontSize: 'var(--body)', letterSpacing: '0.15em' }}
        >
          {BRAND.name}
          {BRAND.degree}
        </span>
        <span
          className="font-jakarta uppercase text-gray-400"
          style={{ fontSize: 'var(--micro)', letterSpacing: '0.16em' }}
        >
          {BRAND.footer}
        </span>
      </footer>

      <Drawer
        open={!!drawer}
        index={proto?.index ?? ''}
        title={proto?.title ?? ''}
        subtitle={proto?.subtitle ?? ''}
        onClose={() => setDrawer(null)}
        footerless={drawer === 'bag'}
      >
        {drawer === 'catalog' && <CatalogDrawer onAdd={onAdd} />}
        {drawer === 'origins' && <OriginsDrawer />}
        {drawer === 'journal' && <JournalDrawer />}
        {drawer === 'bag' && (
          <BagDrawer lines={cart} onRemove={onRemove} onCheckout={onCheckout} />
        )}
      </Drawer>

      {/* 拖拽落区 */}
      <div
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-150"
        style={{ opacity: dragging ? 1 : 0 }}
        aria-hidden={!dragging}
      >
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
        <div className="anim-drop-in relative mx-6 flex max-w-lg flex-col items-center gap-3 border-2 border-dashed border-black bg-white px-10 py-12 text-center">
          <ShoppingBag
            strokeWidth={1.2}
            className="text-black"
            style={{ width: '1.8rem', height: '1.8rem' }}
          />
          <div
            className="font-orbitron font-bold uppercase text-black"
            style={{ fontSize: 'var(--logo)', letterSpacing: '0.1em' }}
          >
            Drop to bag
          </div>
          <p
            className="font-jakarta uppercase text-gray-500"
            style={{ fontSize: 'var(--micro)', letterSpacing: '0.18em' }}
          >
            Release anywhere on the page
          </p>
        </div>
      </div>

      <Toast toast={toast} dodgeLeft={!!drawer} />
    </div>
  )
}
