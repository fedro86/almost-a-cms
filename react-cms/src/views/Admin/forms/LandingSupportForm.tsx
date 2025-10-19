import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLandingPageData as useApi } from '../../../hooks/useLandingPageData';
import { EmojiInput } from '../../../components/EmojiPicker';

interface DonationOption {
  id?: string;
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
  showSection?: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  donations: {
    title: string;
    subtitle: string;
    showSection?: boolean;
    options: DonationOption[];
    monthlySupport: MonthlySupport;
  };
  featureFunding: {
    title: string;
    subtitle: string;
    showSection?: boolean;
    platformUrl: string;
    topFeatures: Feature[];
    viewAllUrl: string;
  };
  transparency: {
    text: string;
    url: string;
    showSection?: boolean;
  };
}

export const LandingSupportForm: React.FC = () => {
  const { loadContent, saveContent, loading, error } = useApi();
  const [formData, setFormData] = useState<SupportData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirmDonation, setShowDeleteConfirmDonation] = useState<number | null>(null);
  const [showDeleteConfirmFeature, setShowDeleteConfirmFeature] = useState<number | null>(null);

  useEffect(() => {
    loadContent('support').then((data) => {
      if (data) {
        // Ensure all show toggles default to true
        setFormData({
          ...data,
          showSection: data.showSection !== undefined ? data.showSection : true,
          showTitle: data.showTitle !== undefined ? data.showTitle : true,
          showSubtitle: data.showSubtitle !== undefined ? data.showSubtitle : true,
          donations: {
            ...data.donations,
            showSection: data.donations?.showSection !== undefined ? data.donations.showSection : true,
          },
          featureFunding: {
            ...data.featureFunding,
            showSection: data.featureFunding?.showSection !== undefined ? data.featureFunding.showSection : true,
          },
          transparency: {
            ...data.transparency,
            showSection: data.transparency?.showSection !== undefined ? data.transparency.showSection : true,
          }
        } as SupportData);
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

  const addDonationOption = () => {
    if (!formData) return;
    const newOption: DonationOption = {
      id: `donation-${Date.now()}`,
      emoji: '☕',
      text: 'New Donation',
      amount: 5,
      url: '',
    };
    setFormData({
      ...formData,
      donations: {
        ...formData.donations,
        options: [...formData.donations.options, newOption]
      }
    });
  };

  const removeDonationOption = (index: number) => {
    if (!formData) return;
    const newOptions = formData.donations.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      donations: { ...formData.donations, options: newOptions }
    });
    setShowDeleteConfirmDonation(null);
  };

  const moveDonationOption = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    const newOptions = [...formData.donations.options];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOptions.length) return;

    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
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
      title: 'New Feature',
      description: 'Describe this feature...',
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
    setShowDeleteConfirmFeature(null);
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    const newFeatures = [...formData.featureFunding.topFeatures];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newFeatures.length) return;

    [newFeatures[index], newFeatures[targetIndex]] = [newFeatures[targetIndex], newFeatures[index]];
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit Support Section
              </h1>
              <p className="text-gray-600">
                Donations and feature funding
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Section Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Show Section</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.showSection ?? true}
                    onChange={(e) => setFormData({ ...formData, showSection: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-green-600 peer-focus:ring-2 peer-focus:ring-green-200 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-md"></div>
                </div>
              </label>
            </div>
          </div>
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

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Section Title
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">Show Title</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.showTitle ?? true}
                      onChange={(e) => setFormData({ ...formData, showTitle: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-200 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>
              <input
                type="text"
                value={formData.sectionTitle}
                onChange={(e) => setFormData({ ...formData, sectionTitle: e.target.value })}
                disabled={!(formData.showTitle ?? true)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Support AlmostaCMS"
              />
            </div>

            {/* Subtitle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Section Subtitle
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">Show Subtitle</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.showSubtitle ?? true}
                      onChange={(e) => setFormData({ ...formData, showSubtitle: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-200 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>
              <textarea
                value={formData.sectionSubtitle}
                onChange={(e) => setFormData({ ...formData, sectionSubtitle: e.target.value })}
                disabled={!(formData.showSubtitle ?? true)}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Help us build the features you want"
              />
            </div>
          </div>

          {/* Donations Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">One-Time Donations</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600">Show Section</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.donations.showSection ?? true}
                    onChange={(e) => setFormData({
                      ...formData,
                      donations: { ...formData.donations, showSection: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-200 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

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

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Donation Options ({formData.donations.options.length} {formData.donations.options.length === 1 ? 'item' : 'items'})
              </h3>
              <button
                type="button"
                onClick={addDonationOption}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Option
              </button>
            </div>

            {formData.donations.options.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 text-lg">No donation options yet</p>
                <p className="text-gray-500 text-sm mt-2">Click "Add Option" to create your first donation tier</p>
              </div>
            ) : (
              formData.donations.options.map((option, index) => (
                <div key={option.id || index} className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 space-y-4">
                  {/* Option Header with Controls */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-pink-600 text-white rounded-lg flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <h4 className="font-semibold text-gray-900">Option {index + 1}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveDonationOption(index, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => moveDonationOption(index, 'down')}
                        disabled={index === formData.donations.options.length - 1}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Delete */}
                      {showDeleteConfirmDonation === index ? (
                        <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                          <span className="text-sm text-red-800 font-medium">Delete?</span>
                          <button
                            type="button"
                            onClick={() => removeDonationOption(index)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition-all"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirmDonation(null)}
                            className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs rounded font-medium transition-all"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmDonation(index)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete option"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <EmojiInput
                        value={option.emoji}
                        onChange={(emoji) => updateDonationOption(index, 'emoji', emoji)}
                        label="Emoji"
                        placeholder="☕"
                        buttonColor="pink"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text
                      </label>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateDonationOption(index, 'text', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                        placeholder="Buy Me a Coffee"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        value={option.amount}
                        onChange={(e) => updateDonationOption(index, 'amount', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <input
                      type="text"
                      value={option.url}
                      onChange={(e) => updateDonationOption(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="https://ko-fi.com/almostacms"
                    />
                  </div>
                </div>
              ))
            )}

            <hr className="border-gray-200" />

            <h3 className="text-lg font-semibold text-gray-900">Monthly Support</h3>

            <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <EmojiInput
                    value={formData.donations.monthlySupport.emoji}
                    onChange={(emoji) => setFormData({
                      ...formData,
                      donations: {
                        ...formData.donations,
                        monthlySupport: { ...formData.donations.monthlySupport, emoji }
                      }
                    })}
                    label="Emoji"
                    placeholder="❤️"
                    buttonColor="red"
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Feature Funding</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600">Show Section</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.featureFunding.showSection ?? true}
                    onChange={(e) => setFormData({
                      ...formData,
                      featureFunding: { ...formData.featureFunding, showSection: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-200 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

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
                Top Features ({formData.featureFunding.topFeatures.length} {formData.featureFunding.topFeatures.length === 1 ? 'item' : 'items'})
              </h3>
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Feature
              </button>
            </div>

            {formData.featureFunding.topFeatures.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-gray-600 text-lg">No features yet</p>
                <p className="text-gray-500 text-sm mt-2">Click "Add Feature" to create your first fundable feature</p>
              </div>
            ) : (
              formData.featureFunding.topFeatures.map((feature, index) => (
                <div key={feature.id} className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 space-y-4">
                  {/* Feature Header with Controls */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <h4 className="font-semibold text-gray-900">
                        {feature.title || `Feature ${index + 1}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveFeature(index, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => moveFeature(index, 'down')}
                        disabled={index === formData.featureFunding.topFeatures.length - 1}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Delete */}
                      {showDeleteConfirmFeature === index ? (
                        <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                          <span className="text-sm text-red-800 font-medium">Delete?</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition-all"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirmFeature(null)}
                            className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs rounded font-medium transition-all"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmFeature(index)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete feature"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
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

                {/* Progress Bar */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-indigo-600">
                      ${feature.fundedAmount} / ${feature.goalAmount}
                    </span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {feature.goalAmount > 0 ? Math.round((feature.fundedAmount / feature.goalAmount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${feature.goalAmount > 0 ? Math.min((feature.fundedAmount / feature.goalAmount) * 100, 100) : 0}%`
                      }}
                    ></div>
                  </div>
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
              ))
            )}
          </div>

          {/* Transparency */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Transparency</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600">Show Section</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.transparency.showSection ?? true}
                    onChange={(e) => setFormData({
                      ...formData,
                      transparency: { ...formData.transparency, showSection: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-200 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

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
