import { useState } from 'react'
import type { FAQData } from '../types'

interface Props {
  data: FAQData
}

export default function FAQ({ data }: Props) {
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null)

  const toggleQuestion = (questionId: string) => {
    setOpenQuestionId(openQuestionId === questionId ? null : questionId)
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {data.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600">
            {data.sectionSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          {data.questions.map((item) => (
            <div
              key={item.id}
              className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
            >
              <button
                onClick={() => toggleQuestion(item.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-8">
                  {item.question}
                </span>
                <span className="text-2xl text-blue-600 flex-shrink-0">
                  {openQuestionId === item.id ? '−' : '+'}
                </span>
              </button>

              {openQuestionId === item.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
