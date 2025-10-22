import type { HeroData } from '../types'

interface HeroProps {
  data: HeroData
}

export default function Hero({ data }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          {data.headline}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
          {data.subheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={data.ctaPrimary.url}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            {data.ctaPrimary.text}
          </a>
          <a
            href={data.ctaSecondary.url}
            className="bg-white hover:bg-gray-50 text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg border-2 border-blue-600 transition-colors"
          >
            {data.ctaSecondary.text}
          </a>
        </div>
      </div>
    </section>
  )
}
