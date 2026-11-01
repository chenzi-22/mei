import { ORIGINS } from '../../lib/data'

/**
 * 协议 02 — 产地
 * 跨境美妆的真实差异不在包装，而在实验室与备案地。
 */
export default function OriginsDrawer() {
  return (
    <ul className="flex flex-col">
      {ORIGINS.map((o, i) => (
        <li
          key={o.id}
          className="py-5"
          style={{ borderTop: i === 0 ? 'none' : '1px solid #f0f0f0' }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex items-baseline gap-2">
              <span
                className="font-orbitron font-bold uppercase text-black"
                style={{ fontSize: 'var(--body)', letterSpacing: '0.1em' }}
              >
                {o.city}
              </span>
              <span
                className="font-jakarta uppercase text-gray-400"
                style={{ fontSize: 'var(--micro)', letterSpacing: '0.18em' }}
              >
                {o.country}
              </span>
            </span>
            <span
              className="flex-none border border-gray-300 px-1.5 py-0.5 font-jakarta font-semibold uppercase text-gray-500"
              style={{ fontSize: 'var(--micro)', letterSpacing: '0.14em' }}
            >
              {o.code}
            </span>
          </div>

          <p
            className="mt-2 font-jakarta text-gray-600"
            style={{ fontSize: 'var(--micro)', lineHeight: 1.7 }}
          >
            {o.spec}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {o.certs.map((c) => (
              <span
                key={c}
                className="font-jakarta uppercase text-gray-400"
                style={{
                  fontSize: 'var(--micro)',
                  letterSpacing: '0.14em',
                  border: '1px solid #e5e5e5',
                  padding: '0.1rem 0.4rem',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  )
}
