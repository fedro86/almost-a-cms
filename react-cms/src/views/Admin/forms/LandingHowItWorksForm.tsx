import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLandingPageData as useApi } from '../../../hooks/useLandingPageData';
import { IconBrowser } from '../../../components/IconBrowser';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface HowItWorksData {
  showSection?: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  steps: Step[];
  ctaText: string;
  ctaUrl: string;
}

export const LandingHowItWorksForm: React.FC = () => {
  const { loadContent, saveContent, loading, error } = useApi();
  const [formData, setFormData] = useState<HowItWorksData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showIconBrowser, setShowIconBrowser] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadContent('howItWorks').then((data) => {
      if (data) {
        // Ensure showSection, showTitle and showSubtitle default to true
        setFormData({
          ...data,
          showSection: data.showSection !== undefined ? data.showSection : true,
          showTitle: data.showTitle !== undefined ? data.showTitle : true,
          showSubtitle: data.showSubtitle !== undefined ? data.showSubtitle : true,
        } as HowItWorksData);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setSaveSuccess(false);

    const success = await saveContent('howItWorks', formData);

    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const updateStep = (index: number, field: keyof Step, value: string | number) => {
    if (!formData) return;
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const handleOpenIconBrowser = (index: number) => {
    setSelectedStepIndex(index);
    setShowIconBrowser(true);
  };

  const handleSelectIcon = (iconName: string) => {
    if (selectedStepIndex !== null) {
      updateStep(selectedStepIndex, 'icon', iconName);
    }
  };

  const addStep = () => {
    if (!formData) return;
    const newStep: Step = {
      number: formData.steps.length + 1,
      icon: 'star',
      title: 'New Step',
      description: 'Describe this step...',
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep],
    });
  };

  const deleteStep = (index: number) => {
    if (!formData) return;
    const newSteps = formData.steps.filter((_, i) => i !== index);
    // Renumber the steps
    const renumberedSteps = newSteps.map((step, i) => ({ ...step, number: i + 1 }));
    setFormData({ ...formData, steps: renumberedSteps });
    setShowDeleteConfirm(null);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    // Renumber the steps after swapping
    const renumberedSteps = newSteps.map((step, i) => ({ ...step, number: i + 1 }));
    setFormData({ ...formData, steps: renumberedSteps });
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
                Edit How It Works Section
              </h1>
              <p className="text-gray-600">
                Manage your step-by-step process with icons and descriptions
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
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-8">
          {/* Section Header with Visibility Toggles */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Section Header</h3>
            </div>

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
                placeholder="How It Works"
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
                placeholder="Get your website online in 3 simple steps"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Steps */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Process Steps ({formData.steps.length} {formData.steps.length === 1 ? 'item' : 'items'})
              </h3>
              <button
                type="button"
                onClick={addStep}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Step
              </button>
            </div>

            {formData.steps.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 text-lg">No steps yet</p>
                <p className="text-gray-500 text-sm mt-2">Click "Add Step" to create your first step</p>
              </div>
            ) : (
              formData.steps.map((step, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 space-y-4 relative">
                  {/* Step Header with Controls */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                        {step.number}
                      </span>
                      <h4 className="font-semibold text-gray-900">Step {step.number}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveStep(index, 'up')}
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
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === formData.steps.length - 1}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Delete */}
                      {showDeleteConfirm === index ? (
                        <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                          <span className="text-sm text-red-800 font-medium">Delete?</span>
                          <button
                            type="button"
                            onClick={() => deleteStep(index)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition-all"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs rounded font-medium transition-all"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(index)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete step"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Icon Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={step.icon}
                        onChange={(e) => updateStep(index, 'icon', e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                        placeholder="rocket-launch"
                      />
                      <button
                        type="button"
                        onClick={() => handleOpenIconBrowser(index)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Browse Icons
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enter icon name or click "Browse Icons" to see all available Heroicons
                    </p>
                  </div>

                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="Connect with GitHub"
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="Sign in with your GitHub account. No registration forms, no passwords to remember."
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <hr className="border-gray-200" />

          {/* CTA */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Call to Action
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                  placeholder="Get Started Free"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Button URL
                </label>
                <input
                  type="text"
                  value={formData.ctaUrl}
                  onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                  placeholder="/create"
                />
              </div>
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

        {/* Icon Browser Modal */}
        <IconBrowser
          isOpen={showIconBrowser}
          onClose={() => setShowIconBrowser(false)}
          onSelectIcon={handleSelectIcon}
          currentIcon={selectedStepIndex !== null ? formData.steps[selectedStepIndex]?.icon : ''}
        />
      </div>
    </div>
  );
};
