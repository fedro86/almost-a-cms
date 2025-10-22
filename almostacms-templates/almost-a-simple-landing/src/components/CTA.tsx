import type { CTAData } from '../types'

interface CTAProps {
  data: CTAData
}

export default function CTA({ data }: CTAProps) {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {data.headline}
        </h2>
        <p className="text-xl text-blue-100 mb-10">
          {data.subheadline}
        </p>
        <a
          href={data.buttonUrl}
          className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-semibold px-10 py-4 rounded-lg text-lg transition-colors"
        >
          {data.buttonText}
        </a>
      </div>
    </section>
  )
}
