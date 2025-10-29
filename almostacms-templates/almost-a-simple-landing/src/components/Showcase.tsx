import type { ShowcaseData } from '../types'

interface Props {
  data: ShowcaseData
}

export default function Showcase({ data }: Props) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {data.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600">
            {data.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.sites.map((site) => (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all"
            >
              {/* Screenshot */}
              <div className="aspect-video bg-gray-100 overflow-hidden">
                {site.screenshot ? (
                  <img
                    src={site.screenshot}
                    alt={`${site.name} screenshot`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                    🌐
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {site.name}
                  </h3>
                  {site.featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  by {site.creator}
                </p>
                <div className="text-xs text-gray-500">
                  Template: {site.template}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
