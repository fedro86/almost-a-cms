import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLandingPageData as useApi } from '../../../hooks/useLandingPageData';

interface FooterLink {
  text: string;
  url: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface FooterData {
  headline: string;
  subheadline: string;
  cta: {
    text: string;
    url: string;
    icon: string;
  };
  socialProof: string;
  links: {
    product: FooterLink[];
    resources: FooterLink[];
    community: FooterLink[];
  };
  social: SocialLink[];
  copyright: string;
  license: string;
  builtWith: {
    show: boolean;
    text: string;
    url: string;
  };
}

export const LandingFooterForm: React.FC = () => {
  const { loadContent, saveContent, loading, error } = useApi();
  const [formData, setFormData] = useState<FooterData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadContent('footer').then((data) => {
      if (data) {
        setFormData(data as FooterData);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setSaveSuccess(false);

    const success = await saveContent('footer', formData);

    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const updateLink = (category: 'product' | 'resources' | 'community', index: number, field: keyof FooterLink, value: string) => {
    if (!formData) return;
    const newLinks = [...formData.links[category]];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({
      ...formData,
      links: { ...formData.links, [category]: newLinks }
    });
  };

  const addLink = (category: 'product' | 'resources' | 'community') => {
    if (!formData) return;
    const newLink: FooterLink = { text: '', url: '' };
    setFormData({
      ...formData,
      links: {
        ...formData.links,
        [category]: [...formData.links[category], newLink]
      }
    });
  };

  const removeLink = (category: 'product' | 'resources' | 'community', index: number) => {
    if (!formData) return;
    const newLinks = formData.links[category].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      links: { ...formData.links, [category]: newLinks }
    });
  };

  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    if (!formData) return;
    const newSocial = [...formData.social];
    newSocial[index] = { ...newSocial[index], [field]: value };
    setFormData({ ...formData, social: newSocial });
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
            Edit Footer Section
          </h1>
          <p className="text-gray-600">
            Footer links, social, and copyright
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
          {/* CTA Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Final Call to Action</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
                placeholder="Ready to create your website?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Subheadline
              </label>
              <input
                type="text"
                value={formData.subheadline}
                onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                placeholder="Join the community building with AlmostaCMS"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.cta.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    cta: { ...formData.cta, text: e.target.value }
                  })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                  placeholder="Create Your Website Free"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Button URL
                </label>
                <input
                  type="text"
                  value={formData.cta.url}
                  onChange={(e) => setFormData({
                    ...formData,
                    cta: { ...formData.cta, url: e.target.value }
                  })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                  placeholder="/create"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Proof Text
              </label>
              <input
                type="text"
                value={formData.socialProof}
                onChange={(e) => setFormData({ ...formData, socialProof: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                placeholder="100% free & open source"
              />
            </div>
          </div>

          {/* Link Sections */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-8">
            <h2 className="text-xl font-bold text-gray-900">Footer Links</h2>

            {/* Product Links */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Links ({formData.links.product.length})
                </h3>
                <button
                  onClick={() => addLink('product')}
                  className="px-3 py-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {formData.links.product.map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={link.text}
                      onChange={(e) => updateLink('product', index, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="Features"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink('product', index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="#features"
                    />
                    <button
                      onClick={() => removeLink('product', index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Resources Links */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Resources Links ({formData.links.resources.length})
                </h3>
                <button
                  onClick={() => addLink('resources')}
                  className="px-3 py-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {formData.links.resources.map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={link.text}
                      onChange={(e) => updateLink('resources', index, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="Documentation"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink('resources', index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="/docs"
                    />
                    <button
                      onClick={() => removeLink('resources', index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Community Links */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Community Links ({formData.links.community.length})
                </h3>
                <button
                  onClick={() => addLink('community')}
                  className="px-3 py-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {formData.links.community.map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={link.text}
                      onChange={(e) => updateLink('community', index, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="Support Development"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink('community', index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="#support"
                    />
                    <button
                      onClick={() => removeLink('community', index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Social Media Links</h2>

            {formData.social.map((social, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900 capitalize">{social.platform}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <input
                      type="text"
                      value={social.platform}
                      onChange={(e) => updateSocial(index, 'platform', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="github"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={social.icon}
                      onChange={(e) => updateSocial(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="logo-github"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => updateSocial(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Bottom Bar</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Copyright Text
              </label>
              <input
                type="text"
                value={formData.copyright}
                onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                placeholder="© 2025 AlmostaCMS. Built with AlmostaCMS."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                License Text
              </label>
              <input
                type="text"
                value={formData.license}
                onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                placeholder="MIT License - Free & Open Source"
              />
            </div>

            <hr className="border-gray-200" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">"Built With" Badge</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.builtWith.show}
                    onChange={(e) => setFormData({
                      ...formData,
                      builtWith: { ...formData.builtWith, show: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    {formData.builtWith.show ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>

              {formData.builtWith.show && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={formData.builtWith.text}
                      onChange={(e) => setFormData({
                        ...formData,
                        builtWith: { ...formData.builtWith, text: e.target.value }
                      })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="Built with AlmostaCMS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge URL
                    </label>
                    <input
                      type="text"
                      value={formData.builtWith.url}
                      onChange={(e) => setFormData({
                        ...formData,
                        builtWith: { ...formData.builtWith, url: e.target.value }
                      })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="https://almostacms.com"
                    />
                  </div>
                </div>
              )}
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
