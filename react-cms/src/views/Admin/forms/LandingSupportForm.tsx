import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLandingPageData as useApi } from '../../../hooks/useLandingPageData';

interface DonationOption {
  id: string;
  emoji: string;
  text: string;
  amount: number;
  url: string;
}

interface MonthlySupport {
  emoji: string;
  text: string;
  amount: number;
  url: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  fundedAmount: number;
  goalAmount: number;
  contributors: number;
  status: string;
  priority: string;
  url: string;
}

interface SupportData {
  sectionTitle: string;
  sectionSubtitle: string;
  donations: {
    title: string;
    subtitle: string;
    options: DonationOption[];
    monthlySupport: MonthlySupport;
  };
  featureFunding: {
    title: string;
    subtitle: string;
    platformUrl: string;
    topFeatures: Feature[];
    viewAllUrl: string;
  };
  transparency: {
    text: string;
    url: string;
  };
}

export const LandingSupportForm: React.FC = () => {
  const { loadContent, saveContent, loading, error } = useApi();
  const [formData, setFormData] = useState<SupportData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadContent('support').then((data) => {
      if (data) {
        setFormData(data as SupportData);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setSaveSuccess(false);

    const success = await saveContent('support', formData);

    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const updateDonationOption = (index: number, field: keyof DonationOption, value: string | number) => {
    if (!formData) return;
    const newOptions = [...formData.donations.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({
      ...formData,
      donations: { ...formData.donations, options: newOptions }
    });
  };

  const updateFeature = (index: number, field: keyof Feature, value: string | number) => {
    if (!formData) return;
    const newFeatures = [...formData.featureFunding.topFeatures];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({
      ...formData,
      featureFunding: { ...formData.featureFunding, topFeatures: newFeatures }
    });
  };

  const addFeature = () => {
    if (!formData) return;
    const newFeature: Feature = {
      id: `feature-${Date.now()}`,
      title: '',
      description: '',
      fundedAmount: 0,
      goalAmount: 500,
      contributors: 0,
      status: 'proposed',
      priority: 'medium',
      url: '',
    };
    setFormData({
      ...formData,
      featureFunding: {
        ...formData.featureFunding,
        topFeatures: [...formData.featureFunding.topFeatures, newFeature]
      }
    });
  };

  const removeFeature = (index: number) => {
    if (!formData) return;
    const newFeatures = formData.featureFunding.topFeatures.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      featureFunding: { ...formData.featureFunding, topFeatures: newFeatures }
    });
  };

  if (loading || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/landing-page"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sections
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Support Section
          </h1>
          <p className="text-gray-600">
            Donations and feature funding
          </p>
        </div>

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">
                Saved successfully! Changes will be live in ~30 seconds.
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-8">
          {/* Section Header */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Section Header</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={formData.sectionTitle}
                onChange={(e) => setFormData({ ...formData, sectionTitle: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
                placeholder="Support AlmostaCMS"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Section Subtitle
              </label>
              <textarea
                value={formData.sectionSubtitle}
                onChange={(e) => setFormData({ ...formData, sectionSubtitle: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Help us build the features you want"
              />
            </div>
          </div>

          {/* Donations Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">One-Time Donations</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Donations Title
              </label>
              <input
                type="text"
                value={formData.donations.title}
                onChange={(e) => setFormData({
                  ...formData,
                  donations: { ...formData.donations, title: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                placeholder="One-Time Support"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Donations Subtitle
              </label>
              <input
                type="text"
                value={formData.donations.subtitle}
                onChange={(e) => setFormData({
                  ...formData,
                  donations: { ...formData.donations, subtitle: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                placeholder="Buy me a coffee to keep the project going"
              />
            </div>

            <hr className="border-gray-200" />

            <h3 className="text-lg font-semibold text-gray-900">Donation Options (3)</h3>

            {formData.donations.options.map((option, index) => (
              <div key={option.id} className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border-2 border-pink-200 space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={option.emoji}
                      onChange={(e) => updateDonationOption(index, 'emoji', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white text-center text-2xl"
                      placeholder="☕"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text
                    </label>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateDonationOption(index, 'text', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                      placeholder="Buy Me a Coffee"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      value={option.amount}
                      onChange={(e) => updateDonationOption(index, 'amount', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                      placeholder="5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={option.url}
                    onChange={(e) => updateDonationOption(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white font-mono text-sm"
                    placeholder="https://ko-fi.com/almostacms"
                  />
                </div>
              </div>
            ))}

            <hr className="border-gray-200" />

            <h3 className="text-lg font-semibold text-gray-900">Monthly Support</h3>

            <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border-2 border-red-200 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.donations.monthlySupport.emoji}
                    onChange={(e) => setFormData({
                      ...formData,
                      donations: {
                        ...formData.donations,
                        monthlySupport: { ...formData.donations.monthlySupport, emoji: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white text-center text-2xl"
                    placeholder="❤️"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text
                  </label>
                  <input
                    type="text"
                    value={formData.donations.monthlySupport.text}
                    onChange={(e) => setFormData({
                      ...formData,
                      donations: {
                        ...formData.donations,
                        monthlySupport: { ...formData.donations.monthlySupport, text: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                    placeholder="Sponsor Monthly"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={formData.donations.monthlySupport.amount}
                    onChange={(e) => setFormData({
                      ...formData,
                      donations: {
                        ...formData.donations,
                        monthlySupport: { ...formData.donations.monthlySupport, amount: parseInt(e.target.value) || 0 }
                      }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                    placeholder="5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  value={formData.donations.monthlySupport.url}
                  onChange={(e) => setFormData({
                    ...formData,
                    donations: {
                      ...formData.donations,
                      monthlySupport: { ...formData.donations.monthlySupport, url: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white font-mono text-sm"
                  placeholder="https://github.com/sponsors/almostacms"
                />
              </div>
            </div>
          </div>

          {/* Feature Funding Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Feature Funding</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Feature Funding Title
              </label>
              <input
                type="text"
                value={formData.featureFunding.title}
                onChange={(e) => setFormData({
                  ...formData,
                  featureFunding: { ...formData.featureFunding, title: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                placeholder="Fund Features You Want"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Feature Funding Subtitle
              </label>
              <input
                type="text"
                value={formData.featureFunding.subtitle}
                onChange={(e) => setFormData({
                  ...formData,
                  featureFunding: { ...formData.featureFunding, subtitle: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                placeholder="Vote with your wallet - features get built when funded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform URL
                </label>
                <input
                  type="text"
                  value={formData.featureFunding.platformUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    featureFunding: { ...formData.featureFunding, platformUrl: e.target.value }
                  })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                  placeholder="https://polar.sh/almostacms"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View All URL
                </label>
                <input
                  type="text"
                  value={formData.featureFunding.viewAllUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    featureFunding: { ...formData.featureFunding, viewAllUrl: e.target.value }
                  })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                  placeholder="https://github.com/username/repo/issues"
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Features ({formData.featureFunding.topFeatures.length})
              </h3>
              <button
                onClick={addFeature}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Feature
              </button>
            </div>

            {formData.featureFunding.topFeatures.map((feature, index) => (
              <div key={feature.id} className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    {feature.title || `Feature ${index + 1}`}
                  </h4>
                  <button
                    onClick={() => removeFeature(index)}
                    className="px-3 py-1 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                    placeholder="Custom Domain Wizard"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                    placeholder="Step-by-step guide to connect your own domain"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funded ($)
                    </label>
                    <input
                      type="number"
                      value={feature.fundedAmount}
                      onChange={(e) => updateFeature(index, 'fundedAmount', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal ($)
                    </label>
                    <input
                      type="number"
                      value={feature.goalAmount}
                      onChange={(e) => updateFeature(index, 'goalAmount', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contributors
                    </label>
                    <input
                      type="number"
                      value={feature.contributors}
                      onChange={(e) => updateFeature(index, 'contributors', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={feature.status}
                      onChange={(e) => updateFeature(index, 'status', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="proposed">Proposed</option>
                      <option value="funding">Funding</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={feature.priority}
                      onChange={(e) => updateFeature(index, 'priority', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <input
                      type="text"
                      value={feature.url}
                      onChange={(e) => updateFeature(index, 'url', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white font-mono text-xs"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transparency */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Transparency</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Transparency Text
              </label>
              <textarea
                value={formData.transparency.text}
                onChange={(e) => setFormData({
                  ...formData,
                  transparency: { ...formData.transparency, text: e.target.value }
                })}
                rows={2}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                placeholder="All funds go directly to development. Track spending on Open Collective."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Transparency URL
              </label>
              <input
                type="text"
                value={formData.transparency.url}
                onChange={(e) => setFormData({
                  ...formData,
                  transparency: { ...formData.transparency, url: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                placeholder="https://opencollective.com/almostacms"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            to="/admin/landing-page"
            className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold transition-all"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Preview Link */}
        <div className="mt-4 text-center">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Preview changes on live site
          </a>
        </div>
      </div>
    </div>
  );
};
