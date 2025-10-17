import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLandingPageData as useApi } from '../../../hooks/useLandingPageData';

interface TrustBadge {
  text: string;
  color: string;
}

interface FloatingBadge {
  emoji: string;
  label: string;
  text: string;
}

interface HeroData {
  headline: string;
  subheadline: string;
  ctaPrimary: {
    text: string;
    url: string;
    icon: string;
  };
  ctaSecondary: {
    text: string;
    url: string;
    icon: string;
  };
  heroImage: string;
  backgroundStyle: string;
  trustBadges: TrustBadge[];
  floatingBadges: {
    topRight: FloatingBadge;
    bottomLeft: FloatingBadge;
  };
}

// Common emojis for quick selection
const COMMON_EMOJIS = ['✨', '⚡', '🚀', '💎', '🎉', '🔥', '⭐', '💡', '🎯', '🌟', '💪', '🏆', '❤️', '👍', '✅', '🎨', '📱', '💻', '🌈', '🎁'];

export const LandingHeroForm: React.FC = () => {
  const { loadContent, saveContent, loading, error } = useApi();
  const [formData, setFormData] = useState<HeroData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTopEmojiPicker, setShowTopEmojiPicker] = useState(false);
  const [showBottomEmojiPicker, setShowBottomEmojiPicker] = useState(false);

  useEffect(() => {
    // Load hero data
    loadContent('hero').then((data) => {
      if (data) {
        setFormData(data as HeroData);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setSaveSuccess(false);

    const success = await saveContent('hero', formData);

    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
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
                Edit Hero Section
              </h1>
              <p className="text-gray-600">
                Main headline, subheadline, CTA buttons, and hero image
              </p>
            </div>

            {/* Top Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        </div>

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">
                ✅ Saved successfully! Changes will be live in ~30 seconds.
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
          {/* Headlines */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Main Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
                placeholder="Beautiful websites, built with GitHub"
              />
              <p className="mt-1 text-sm text-gray-500">
                The main value proposition (appears large at the top)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Subheadline
              </label>
              <textarea
                value={formData.subheadline}
                onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Create and edit your website in minutes, host it for free forever"
              />
              <p className="mt-1 text-sm text-gray-500">
                Supporting text below the headline
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Primary CTA */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Primary CTA Button
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.ctaPrimary.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    ctaPrimary: { ...formData.ctaPrimary, text: e.target.value }
                  })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                  placeholder="Create Your Website Free"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button URL
                </label>
                <input
                  type="text"
                  value={formData.ctaPrimary.url}
                  onChange={(e) => setFormData({
                    ...formData,
                    ctaPrimary: { ...formData.ctaPrimary, url: e.target.value }
                  })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                  placeholder="/create"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Secondary CTA */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Secondary CTA Button
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.ctaSecondary.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    ctaSecondary: { ...formData.ctaSecondary, text: e.target.value }
                  })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                  placeholder="See How It Works"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button URL
                </label>
                <input
                  type="text"
                  value={formData.ctaSecondary.url}
                  onChange={(e) => setFormData({
                    ...formData,
                    ctaSecondary: { ...formData.ctaSecondary, url: e.target.value }
                  })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                  placeholder="#how-it-works"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Hero Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Hero Image Path
            </label>
            <input
              type="text"
              value={formData.heroImage}
              onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
              placeholder="./assets/images/hero-screenshot.png"
            />
            <p className="mt-1 text-sm text-gray-500">
              Relative path to your hero image
            </p>
          </div>

          {/* Background Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Background Style
            </label>
            <select
              value={formData.backgroundStyle}
              onChange={(e) => setFormData({ ...formData, backgroundStyle: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
            >
              <option value="gradient">Gradient (Blue to Purple)</option>
              <option value="solid">Solid White</option>
              <option value="pattern">Pattern</option>
            </select>
          </div>

          <hr className="border-gray-200 my-8" />

          {/* Trust Badges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Trust Badges ({formData.trustBadges?.length || 0}/5)</h3>
                <p className="text-sm text-gray-600">Small badges shown below the CTA buttons</p>
              </div>
              {(formData.trustBadges?.length || 0) < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    const newBadges = [...(formData.trustBadges || []), { text: '', color: 'green' }];
                    setFormData({ ...formData, trustBadges: newBadges });
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Badge
                </button>
              )}
            </div>

            {formData.trustBadges?.map((badge, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Badge {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newBadges = formData.trustBadges.filter((_, i) => i !== index);
                      setFormData({ ...formData, trustBadges: newBadges });
                    }}
                    className="px-3 py-1 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text
                    </label>
                    <input
                      type="text"
                      value={badge.text}
                      onChange={(e) => {
                        const newBadges = [...formData.trustBadges];
                        newBadges[index] = { ...badge, text: e.target.value };
                        setFormData({ ...formData, trustBadges: newBadges });
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                      placeholder="Free forever"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <select
                      value={badge.color}
                      onChange={(e) => {
                        const newBadges = [...formData.trustBadges];
                        newBadges[index] = { ...badge, color: e.target.value };
                        setFormData({ ...formData, trustBadges: newBadges });
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                    >
                      <option value="green">Green</option>
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="red">Red</option>
                      <option value="yellow">Yellow</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {(!formData.trustBadges || formData.trustBadges.length === 0) && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm">No trust badges yet. Click "Add Badge" to create one!</p>
              </div>
            )}
          </div>

          <hr className="border-gray-200 my-8" />

          {/* Floating Badges */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Floating Badges</h3>
            <p className="text-sm text-gray-600 mb-4">Decorative badges on the hero image (toggle on/off)</p>

            {/* Top Right Badge */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Top Right Badge</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.floatingBadges?.topRight}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          floatingBadges: {
                            ...formData.floatingBadges,
                            topRight: { emoji: '✨', label: '100%', text: 'Free & Open Source' }
                          }
                        });
                      } else {
                        const { topRight, ...rest } = formData.floatingBadges;
                        setFormData({
                          ...formData,
                          floatingBadges: rest as any
                        });
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    {formData.floatingBadges?.topRight ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              {formData.floatingBadges?.topRight && (
                <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.floatingBadges?.topRight?.emoji || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        floatingBadges: {
                          ...formData.floatingBadges,
                          topRight: { ...formData.floatingBadges.topRight, emoji: e.target.value }
                        }
                      })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all text-center text-2xl"
                      placeholder="✨"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTopEmojiPicker(!showTopEmojiPicker)}
                      className="absolute right-2 top-2 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                    >
                      Pick
                    </button>
                  </div>
                  {showTopEmojiPicker && (
                    <div className="absolute z-10 mt-2 p-3 bg-white border-2 border-gray-300 rounded-lg shadow-xl grid grid-cols-5 gap-2">
                      {COMMON_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              floatingBadges: {
                                ...formData.floatingBadges,
                                topRight: { ...formData.floatingBadges.topRight, emoji }
                              }
                            });
                            setShowTopEmojiPicker(false);
                          }}
                          className="text-2xl hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label (small text)
                  </label>
                  <input
                    type="text"
                    value={formData.floatingBadges?.topRight?.label || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      floatingBadges: {
                        ...formData.floatingBadges,
                        topRight: { ...formData.floatingBadges.topRight, label: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                    placeholder="100%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Text
                  </label>
                  <input
                    type="text"
                    value={formData.floatingBadges?.topRight?.text || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      floatingBadges: {
                        ...formData.floatingBadges,
                        topRight: { ...formData.floatingBadges.topRight, text: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
                    placeholder="Free & Open Source"
                  />
                </div>
                </div>
              )}
            </div>

            {/* Bottom Left Badge */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Bottom Left Badge</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.floatingBadges?.bottomLeft}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          floatingBadges: {
                            ...formData.floatingBadges,
                            bottomLeft: { emoji: '⚡', label: 'Deploy in', text: '60 seconds' }
                          }
                        });
                      } else {
                        const { bottomLeft, ...rest } = formData.floatingBadges;
                        setFormData({
                          ...formData,
                          floatingBadges: rest as any
                        });
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    {formData.floatingBadges?.bottomLeft ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              {formData.floatingBadges?.bottomLeft && (
                <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.floatingBadges?.bottomLeft?.emoji || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        floatingBadges: {
                          ...formData.floatingBadges,
                          bottomLeft: { ...formData.floatingBadges.bottomLeft, emoji: e.target.value }
                        }
                      })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white text-center text-2xl"
                      placeholder="⚡"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBottomEmojiPicker(!showBottomEmojiPicker)}
                      className="absolute right-2 top-2 px-2 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 rounded transition-colors"
                    >
                      Pick
                    </button>
                  </div>
                  {showBottomEmojiPicker && (
                    <div className="absolute z-10 mt-2 p-3 bg-white border-2 border-gray-300 rounded-lg shadow-xl grid grid-cols-5 gap-2">
                      {COMMON_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              floatingBadges: {
                                ...formData.floatingBadges,
                                bottomLeft: { ...formData.floatingBadges.bottomLeft, emoji }
                              }
                            });
                            setShowBottomEmojiPicker(false);
                          }}
                          className="text-2xl hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label (small text)
                  </label>
                  <input
                    type="text"
                    value={formData.floatingBadges?.bottomLeft?.label || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      floatingBadges: {
                        ...formData.floatingBadges,
                        bottomLeft: { ...formData.floatingBadges.bottomLeft, label: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                    placeholder="Deploy in"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Text
                  </label>
                  <input
                    type="text"
                    value={formData.floatingBadges?.bottomLeft?.text || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      floatingBadges: {
                        ...formData.floatingBadges,
                        bottomLeft: { ...formData.floatingBadges.bottomLeft, text: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all bg-white"
                    placeholder="60 seconds"
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
