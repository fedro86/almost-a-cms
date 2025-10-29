import type { HowItWorksData } from '../types'

interface Props {
  data: HowItWorksData
}

export default function HowItWorks({ data }: Props) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {data.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600">
            {data.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {data.steps.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Step number badge */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-6">
                {step.number}
              </div>

              {/* Connector line (hidden on last step) */}
              {step.number < data.steps.length && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-blue-200" style={{ transform: 'translateX(50%)' }} />
              )}

              <div className="relative z-10 bg-white p-6 rounded-lg shadow-sm">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
