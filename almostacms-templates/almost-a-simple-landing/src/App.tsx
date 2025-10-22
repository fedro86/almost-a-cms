import { useData } from './hooks/useData'
import type { HeroData, FeaturesData, CTAData } from './types'
import Hero from './components/Hero'
import Features from './components/Features'
import CTA from './components/CTA'

function App() {
  const { data: hero, loading: heroLoading, error: heroError } = useData<HeroData>('hero.json')
  const { data: features, loading: featuresLoading, error: featuresError } = useData<FeaturesData>('features.json')
  const { data: cta, loading: ctaLoading, error: ctaError } = useData<CTAData>('cta.json')

  const loading = heroLoading || featuresLoading || ctaLoading
  const error = heroError || featuresError || ctaError

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {hero && <Hero data={hero} />}
      {features && <Features data={features} />}
      {cta && <CTA data={cta} />}
    </div>
  )
}

export default App
