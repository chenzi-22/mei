import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { BRAND } from '../lib/data'
import { PROTOCOLS } from '../lib/protocols'
import type { ProtocolId } from '../lib/protocols'

type Props = {
  cartCount: number
  active: ProtocolId | null
  onOpen: (id: ProtocolId) => void
  onLogo: () => void
}

export default function Header({ cartCount, active, onOpen, onLogo }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const nav = PROTOCOLS.filter((p) => p.inNav)

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex items-start justify-between transition-colors duration-200"
      style={{
        paddingInline: 'var(--pad-x)',
        paddingTop: 'var(--header-pt)',
        paddingBottom: 'var(--section-gap)',
        background: scrolled ? 'rgba(255, 255, 255, 0.86)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: `1px solid ${scrolled ? '#e5e5e5' : 'transparent'}`,
      }}
    >
      {/* Logo */}
      <button
        type="button"
        onClick={() => {
          onLogo()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        className="flex items-start transition-opacity hover:opacity-80"
        aria-label={`${BRAND.name} home`}
      >
        <span
          className="font-orbitron font-black uppercase leading-none text-black"
          style={{ fontSize: 'var(--logo)', letterSpacing: '0.15em' }}
        >
          {BRAND.name}
        </span>
        <span
          className="font-orbitron font-black leading-none text-black"
          style={{
            fontSize: 'var(--logo-deg)',
            marginTop: '-0.16rem',
            marginLeft: '0.14rem',
          }}
        >
          {BRAND.degree}
        </span>
      </button>

      {/* Nav */}
      <nav className="flex items-center" style={{ gap: 'var(--gap-nav)' }}>
        {nav.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen(p.id)}
            className="font-jakarta font-medium uppercase transition-opacity hover:opacity-50"
            style={{
              fontSize: 'var(--nav)',
              letterSpacing: '0.2em',
              color: active === p.id ? '#000000' : '#737373',
            }}
          >
            {p.label}
          </button>
        ))}

        <span
          aria-hidden="true"
          className="select-none text-gray-300"
          style={{ fontSize: 'var(--nav)' }}
        >
          |
        </span>

        <button
          type="button"
          onClick={() => onOpen('bag')}
          className="relative text-black transition-opacity hover:opacity-50"
          aria-label={`Shopping bag, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
        >
          <ShoppingBag
            strokeWidth={1.5}
            style={{ width: 'var(--icon)', height: 'var(--icon)' }}
          />
          {cartCount > 0 && (
            <span
              className="absolute flex items-center justify-center rounded-full bg-black font-jakarta font-semibold leading-none text-white"
              style={{
                right: '-0.45rem',
                top: '-0.45rem',
                width: '1.05rem',
                height: '1.05rem',
                fontSize: '0.58rem',
              }}
            >
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  )
}
