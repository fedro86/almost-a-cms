import type { OpenSourceData } from '../types'

interface Props {
  data: OpenSourceData
}

export default function OpenSource({ data }: Props) {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            {data.sectionTitle}
          </h2>
          <p className="text-xl text-gray-300">
            {data.sectionSubtitle}
          </p>
        </div>

        {/* GitHub Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              ⭐ {data.stats.stars.toLocaleString()}
            </div>
            <div className="text-gray-400">Stars</div>
          </div>
          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              🔱 {data.stats.forks.toLocaleString()}
            </div>
            <div className="text-gray-400">Forks</div>
          </div>
          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <div className="text-4xl font-bold text-green-400 mb-2">
              👥 {data.stats.contributors.toLocaleString()}
            </div>
            <div className="text-gray-400">Contributors</div>
          </div>
          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              📅
            </div>
            <div className="text-gray-400">Active</div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.callsToAction.map((cta) => (
            <a
              key={cta.text}
              href={cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center"
            >
              <span className="text-xl">{cta.icon}</span>
              <span className="font-medium">{cta.text}</span>
            </a>
          ))}
        </div>

        {/* GitHub Link */}
        <div className="text-center mt-12">
          <a
            href={data.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lg text-gray-300 hover:text-white transition-colors"
          >
            <span>View on GitHub</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
