import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Question {
  id: string;
  question: string;
  answer: string;
}

interface FAQData {
  sectionTitle: string;
  sectionSubtitle: string;
  questions: Question[];
}

export const FAQSection: React.FC = () => {
  const [data, setData] = useState<FAQData | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/faq.json')
      .then((res) => res.json())
      .then(setData)
      .catch((error) => console.error('Failed to load FAQ:', error));
  }, []);

  if (!data) return null;

  const toggleQuestion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {data.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600">
            {data.sectionSubtitle}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {data.questions.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
              >
                <button
                  onClick={() => toggleQuestion(item.id)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-8">
                    {item.question}
                  </span>
                  <ChevronDownIcon
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            We're here to help! Join our community discussions.
          </p>
          <a
            href="https://github.com/fedro86/almost-a-cms/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Ask on GitHub Discussions
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};
