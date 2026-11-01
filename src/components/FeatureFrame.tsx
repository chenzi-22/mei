import { BRAND } from '../lib/data'
import { CornerFrame, WireframeGlobe } from './icons'

/**
 * 主视觉右下角的取景框。
 *
 * 只有四角括号，没有底色填充 —— 不是卡片，是取景框。
 * 内容只有线框地球和两句品牌主张，不放任何计算或统计。
 */
export default function FeatureFrame() {
  return (
    <div
      className="relative"
      style={{
        minWidth: 'var(--feature-min)',
        padding: 'var(--feature-pad)',
      }}
    >
      <CornerFrame />

      <WireframeGlobe
        className="text-black"
        style={{ width: 'var(--globe)', height: 'var(--globe)' }}
      />

      <p
        className="font-jakarta font-semibold uppercase text-black"
        style={{
          fontSize: 'var(--body)',
          letterSpacing: '0.18em',
          lineHeight: 1.65,
          marginTop: 'var(--section-gap)',
        }}
      >
        {BRAND.tagline[0]}
        <br />
        {BRAND.tagline[1]}
      </p>
    </div>
  )
}
