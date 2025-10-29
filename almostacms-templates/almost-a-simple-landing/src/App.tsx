import { useData } from './hooks/useData'
import type {
  HeroData,
  FeaturesData,
  HowItWorksData,
  ShowcaseData,
  OpenSourceData,
  SupportData,
  FAQData,
  CTAData
} from './types'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Showcase from './components/Showcase'
import OpenSource from './components/OpenSource'
import Support from './components/Support'
import FAQ from './components/FAQ'
import CTA from './components/CTA'

function App() {
  const { data: hero, loading: heroLoading, error: heroError } = useData<HeroData>('hero.json')
  const { data: features, loading: featuresLoading, error: featuresError } = useData<FeaturesData>('features.json')
  const { data: howItWorks, loading: howItWorksLoading, error: howItWorksError } = useData<HowItWorksData>('howItWorks.json')
  const { data: showcase, loading: showcaseLoading, error: showcaseError } = useData<ShowcaseData>('showcase.json')
  const { data: openSource, loading: openSourceLoading, error: openSourceError } = useData<OpenSourceData>('openSource.json')
  const { data: support, loading: supportLoading, error: supportError } = useData<SupportData>('support.json')
  const { data: faq, loading: faqLoading, error: faqError } = useData<FAQData>('faq.json')
  const { data: cta, loading: ctaLoading, error: ctaError } = useData<CTAData>('cta.json')

  const loading = heroLoading || featuresLoading || howItWorksLoading || showcaseLoading ||
                  openSourceLoading || supportLoading || faqLoading || ctaLoading
  const error = heroError || featuresError || howItWorksError || showcaseError ||
                openSourceError || supportError || faqError || ctaError

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
      {howItWorks && <HowItWorks data={howItWorks} />}
      {showcase && <Showcase data={showcase} />}
      {openSource && <OpenSource data={openSource} />}
      {support && <Support data={support} />}
      {faq && <FAQ data={faq} />}
      {cta && <CTA data={cta} />}
    </div>
  )
}

export default App
