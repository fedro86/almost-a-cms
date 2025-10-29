import type { SupportData } from '../types'

interface Props {
  data: SupportData
}

export default function Support({ data }: Props) {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {data.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600">
            {data.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donations Column */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {data.donations.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {data.donations.subtitle}
            </p>

            {/* One-time donations */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {data.donations.options.map((option) => (
                <a
                  key={option.id}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all text-center"
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {option.text}
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    ${option.amount}
                  </div>
                </a>
              ))}
            </div>

            {/* Monthly support */}
            <a
              href={data.donations.monthlySupport.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-center"
            >
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                <span className="text-2xl">{data.donations.monthlySupport.emoji}</span>
                <span>{data.donations.monthlySupport.text}</span>
                <span className="text-purple-200">
                  ${data.donations.monthlySupport.amount}/month
                </span>
              </div>
            </a>
          </div>

          {/* Feature Funding Column */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {data.featureFunding.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {data.featureFunding.subtitle}
            </p>

            {/* Top funded features */}
            <div className="space-y-4 mb-6">
              {data.featureFunding.topFeatures.map((feature) => {
                const percentFunded = (feature.fundedAmount / feature.goalAmount) * 100
                return (
                  <a
                    key={feature.id}
                    href={feature.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {feature.title}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        feature.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {feature.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {feature.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(percentFunded, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Funding stats */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        ${feature.fundedAmount.toLocaleString()} / ${feature.goalAmount.toLocaleString()}
                      </span>
                      <span className="text-gray-500">
                        {feature.contributors} contributors
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* View all link */}
            <a
              href={data.featureFunding.viewAllUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center font-semibold"
            >
              View All Feature Requests →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
