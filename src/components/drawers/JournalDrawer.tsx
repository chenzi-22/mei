import { ChevronRight } from 'lucide-react'
import { POSTS } from '../../lib/data'

/**
 * 协议 03 — 手记
 */
export default function JournalDrawer() {
  return (
    <ul className="flex flex-col">
      {POSTS.map((p, i) => (
        <li key={p.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f0f0f0' }}>
          <button
            type="button"
            className="group flex w-full items-start gap-3 py-5 text-left"
            aria-label={p.title}
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span
                  className="font-jakarta font-semibold uppercase text-gray-400"
                  style={{ fontSize: 'var(--micro)', letterSpacing: '0.18em' }}
                >
                  {p.date}
                </span>
                <span
                  className="flex-none font-jakarta uppercase text-gray-400"
                  style={{ fontSize: 'var(--micro)', letterSpacing: '0.14em' }}
                >
                  {p.read}
                </span>
              </span>

              <span
                className="mt-2 block font-orbitron font-bold uppercase text-black transition-opacity group-hover:opacity-50"
                style={{ fontSize: 'var(--body)', letterSpacing: '0.04em', lineHeight: 1.35 }}
              >
                {p.title}
              </span>
            </span>

            <ChevronRight
              strokeWidth={1.5}
              className="mt-6 flex-none text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-black"
              style={{ width: '0.95rem', height: '0.95rem' }}
            />
          </button>
        </li>
      ))}
    </ul>
  )
}
