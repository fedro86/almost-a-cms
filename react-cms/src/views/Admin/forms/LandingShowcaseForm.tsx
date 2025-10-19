import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLandingPageData as useApi } from '../../../hooks/useLandingPageData';
import { ImageUpload } from '../../../components/ImageUpload';

interface ShowcaseSite {
  id: string;
  name: string;
  creator: string;
  url: string;
  screenshot: string;
  template: string;
  featured: boolean;
}

interface ShowcaseData {
  showSection?: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  sites: ShowcaseSite[];
}

export const LandingShowcaseForm: React.FC = () => {
  const { loadContent, saveContent, loading, error } = useApi();
  const [formData, setFormData] = useState<ShowcaseData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadContent('showcase').then((data) => {
      if (data) {
        // Ensure showSection, showTitle and showSubtitle default to true
        setFormData({
          ...data,
          showSection: data.showSection !== undefined ? data.showSection : true,
          showTitle: data.showTitle !== undefined ? data.showTitle : true,
          showSubtitle: data.showSubtitle !== undefined ? data.showSubtitle : true,
        } as ShowcaseData);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setSaveSuccess(false);

    const success = await saveContent('showcase', formData);

    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const updateSite = (index: number, field: keyof ShowcaseSite, value: string | boolean) => {
    if (!formData) return;
    const newSites = [...formData.sites];
    newSites[index] = { ...newSites[index], [field]: value };
    setFormData({ ...formData, sites: newSites });
  };

  const addSite = () => {
    if (!formData) return;
    const newSite: ShowcaseSite = {
      id: `site-${Date.now()}`,
      name: '',
      creator: '',
      url: '',
      screenshot: '',
      template: 'personal-website',
      featured: false,
    };
    setFormData({ ...formData, sites: [...formData.sites, newSite] });
  };

  const removeSite = (index: number) => {
    if (!formData) return;
    const newSites = formData.sites.filter((_, i) => i !== index);
    setFormData({ ...formData, sites: newSites });
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
                Edit Showcase Section
              </h1>
              <p className="text-gray-600">
                Sites built with AlmostaCMS
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
                placeholder="Built with AlmostaCMS"
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
                placeholder="Real websites created by our users"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Sites */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Showcase Sites ({formData.sites.length} items)
              </h3>
              <button
                onClick={addSite}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Site
              </button>
            </div>

            {formData.sites.map((site, index) => (
              <div key={site.id} className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900">
                      {site.name || `Site ${index + 1}`}
                    </h4>
                    {site.featured && (
                      <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeSite(index)}
                    className="px-3 py-1 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={site.name}
                      onChange={(e) => updateSite(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="My Portfolio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creator Name
                    </label>
                    <input
                      type="text"
                      value={site.creator}
                      onChange={(e) => updateSite(index, 'creator', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site URL
                  </label>
                  <input
                    type="text"
                    value={site.url}
                    onChange={(e) => updateSite(index, 'url', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <ImageUpload
                    value={site.screenshot}
                    onChange={(path) => updateSite(index, 'screenshot', path)}
                    label="Screenshot"
                    placeholder="./assets/images/showcase/site.png"
                    showPreview={true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Type
                    </label>
                    <select
                      value={site.template}
                      onChange={(e) => updateSite(index, 'template', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                    >
                      <option value="personal-website">Personal Website</option>
                      <option value="landing-page">Landing Page</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="blog">Blog</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featured
                    </label>
                    <div className="flex items-center h-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={site.featured}
                          onChange={(e) => updateSite(index, 'featured', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-700">
                          {site.featured ? 'Yes' : 'No'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {formData.sites.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">No showcase sites yet</p>
                <p className="text-sm mt-1">Click "Add Site" to add your first showcase item</p>
              </div>
            )}
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
