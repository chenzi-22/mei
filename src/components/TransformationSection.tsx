import { ArrowUpRight } from 'lucide-react'
import { PRODUCTS } from '../lib/data'
import { usd } from '../lib/format'
import MakeupReveal from './MakeupReveal'

type Props = {
  onOpenCatalog: () => void
}

/**
 * 主视觉之后的产品介绍区。
 * 左边是真人半身像（鼠标左右划动即可在素颜与全妆之间过渡），
 * 右边介绍撑起这套妆底的四个配方。
 */
export default function TransformationSection({ onOpenCatalog }: Props) {
  return (
    <section
      id="transformation"
      className="relative z-10"
      style={{ paddingInline: 'var(--pad-x)', scrollMarginTop: '6rem' }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 border-t border-gray-300 pt-6">
        <h2
          className="font-orbitron font-extrabold uppercase text-black"
          style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.6rem)', letterSpacing: '0.06em' }}
        >
          The Transformation
        </h2>
        <span
          className="font-jakarta uppercase text-gray-400"
          style={{ fontSize: 'var(--micro)', letterSpacing: '0.18em' }}
        >
          Shop the look
        </span>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl items-center gap-10 py-6 lg:grid-cols-[0.92fr_1fr] lg:gap-16">
        <MakeupReveal />

        <div>
          <p
            className="font-jakarta uppercase text-gray-400"
            style={{ fontSize: 'var(--micro)', letterSpacing: '0.2em' }}
          >
            The protocol
          </p>

          <h3
            className="mt-3 font-orbitron font-extrabold uppercase text-black"
            style={{
              fontSize: 'clamp(1.35rem, 2.3vw, 2.1rem)',
              lineHeight: 1.12,
              letterSpacing: '0.02em',
            }}
          >
            One face.
            <br />
            Two finishes.
          </h3>

          <p
            className="mt-4 font-jakarta text-gray-500"
            style={{ fontSize: 'var(--body)', lineHeight: 1.8 }}
          >
            The finish is only the surface. Four formulas hold it up:
            a water-binding base, a lipid layer that seals it in, and a UV film on top.
          </p>

          <ol className="mt-7">
            {PRODUCTS.map((p, i) => (
              <li
                key={p.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-gray-200 py-3"
              >
                <span
                  className="font-orbitron font-bold text-black"
                  style={{ fontSize: 'var(--micro)', letterSpacing: '0.1em' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className="min-w-0">
                  <span
                    className="block font-jakarta font-semibold uppercase text-black"
                    style={{ fontSize: 'var(--micro)', letterSpacing: '0.1em', lineHeight: 1.5 }}
                  >
                    {p.title}
                  </span>
                  <span
                    className="mt-0.5 block font-jakarta text-gray-400"
                    style={{ fontSize: 'var(--micro)', letterSpacing: '0.1em' }}
                  >
                    {p.tag}
                  </span>
                </span>

                <span
                  className="tnum ml-auto font-jakarta font-semibold text-black"
                  style={{ fontSize: 'var(--micro)' }}
                >
                  {usd(p.price)}
                </span>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={onOpenCatalog}
            className="group mt-7 inline-flex items-center gap-2.5 border border-gray-400 px-5 py-2.5 font-jakarta font-semibold uppercase text-black transition-colors hover:border-black hover:bg-black hover:text-white"
            style={{ fontSize: 'var(--body)', letterSpacing: '0.16em' }}
          >
            Shop all four
            <ArrowUpRight
              strokeWidth={1.5}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              style={{ width: '0.95rem', height: '0.95rem' }}
            />
          </button>
        </div>
      </div>
    </section>
  )
}
