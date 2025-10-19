import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PhotoIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useLandingPageData as useApi } from '../../../hooks/useLandingPageData';
import GitHubApiService from '../../../services/github-api';
import { useRepo } from '../../../hooks/useRepo';
import { EmojiInput } from '../../../components/EmojiPicker';

interface TrustBadge {
  text: string;
  color: string;
}

interface FloatingBadge {
  emoji: string;
  label: string;
  text: string;
}

interface RepoImage {
  name: string;
  path: string;
  url: string;
}

interface HeroData {
  showSection?: boolean;
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

export const LandingHeroForm: React.FC = () => {
  const { loadContent, saveContent, loading, error } = useApi();
  const [formData, setFormData] = useState<HeroData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image browser state
  const [showImageBrowser, setShowImageBrowser] = useState(false);
  const [availableImages, setAvailableImages] = useState<RepoImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const { activeRepo } = useRepo();

  // Gradient colors state
  const [gradientFrom, setGradientFrom] = useState('#3b82f6'); // blue-500
  const [gradientTo, setGradientTo] = useState('#a855f7'); // purple-500
  const [gradientDirection, setGradientDirection] = useState('to-br');

  useEffect(() => {
    // Load hero data
    loadContent('hero').then((data) => {
      if (data) {
        setFormData({
          ...data,
          showSection: data.showSection !== undefined ? data.showSection : true,
        } as HeroData);
      }
    });
  }, []);

  // Load available images from repository
  useEffect(() => {
    loadAvailableImages();
  }, [activeRepo]);

  const loadAvailableImages = async () => {
    if (!activeRepo) return;

    setLoadingImages(true);
    try {
      const result = await GitHubApiService.listDirectoryContents(
        activeRepo.owner,
        activeRepo.name,
        'assets/images'
      );

      if (result.success && result.data) {
        // Filter to only image files
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const images = result.data
          .filter((item: any) => {
            const ext = item.name.split('.').pop()?.toLowerCase();
            return item.type === 'file' && ext && imageExtensions.includes(ext);
          })
          .map((item: any) => ({
            name: item.name,
            path: item.path,
            url: `https://raw.githubusercontent.com/${activeRepo.owner}/${activeRepo.name}/main/${item.path}`
          }));

        setAvailableImages(images);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Select an existing image from the repository
  const selectExistingImage = (imagePath: string) => {
    const displayPath = `./${imagePath}`;
    if (formData) {
      setFormData({ ...formData, heroImage: displayPath });
      setImagePreviewUrl(null); // Clear data URL preview to use GitHub URL
      setShowImageBrowser(false);
    }
  };

  // Validate and fix image path on component mount
  useEffect(() => {
    if (!formData || !activeRepo) return;

    const validateImagePath = async () => {
      const currentPath = formData.heroImage;

      // Skip if it's a data URL
      if (currentPath.startsWith('data:')) return;

      // Skip if it's empty
      if (!currentPath) return;

      // Skip if it's an external URL
      if (currentPath.startsWith('http://') || currentPath.startsWith('https://')) return;

      // Extract the path without leading ./
      const cleanPath = currentPath.replace(/^\.\//, '');

      // Check if the file exists in the repository
      try {
        const result = await GitHubApiService.getFileContent(
          activeRepo.owner,
          activeRepo.name,
          cleanPath
        );

        // If file doesn't exist, try to find the first available image or clear it
        if (!result.success) {
          console.log(`Image ${cleanPath} not found in repository`);

          // Try to load available images and use the first one, or clear the path
          const imagesResult = await GitHubApiService.listDirectoryContents(
            activeRepo.owner,
            activeRepo.name,
            'assets/images'
          );

          if (imagesResult.success && imagesResult.data && imagesResult.data.length > 0) {
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
            const firstImage = imagesResult.data.find((item: any) => {
              const ext = item.name.split('.').pop()?.toLowerCase();
              return item.type === 'file' && ext && imageExtensions.includes(ext);
            });

            if (firstImage) {
              console.log(`Using first available image: ${firstImage.path}`);
              setFormData({ ...formData, heroImage: `./${firstImage.path}` });
            } else {
              console.log('No images found, clearing path');
              setFormData({ ...formData, heroImage: '' });
            }
          } else {
            console.log('No images directory found, clearing path');
            setFormData({ ...formData, heroImage: '' });
          }
        }
      } catch (error) {
        console.error('Error validating image path:', error);
      }
    };

    validateImagePath();
  }, [formData?.heroImage, activeRepo]); // Only run when heroImage or activeRepo changes

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

  // Handle hero image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Read file as base64
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Failed to read file');
        }

        // Store the data URL in the heroImage field
        if (formData) {
          setFormData({ ...formData, heroImage: result });
          setImagePreviewUrl(result);
        }

        alert(
          `✅ Image uploaded successfully!\n\n` +
          `The image has been loaded. Click "Save Changes" to save it to your landing page.`
        );

        setUploadingImage(false);
      };

      reader.onerror = () => {
        alert('Failed to read image file. Please try again.');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      alert(`❌ Failed to upload image\n\nError: ${error.message}`);
      setUploadingImage(false);
    }
  };

  // Get image preview URL
  const getImagePreviewUrl = (): string | null => {
    if (!formData?.heroImage) return null;

    // If we have a preview URL from upload, use it
    if (imagePreviewUrl) return imagePreviewUrl;

    // If it's already a data URL, use it
    if (formData.heroImage.startsWith('data:')) return formData.heroImage;

    // If it's a full URL, use it
    if (formData.heroImage.startsWith('http://') || formData.heroImage.startsWith('https://')) {
      return formData.heroImage;
    }

    // If it's a relative path and we have an active repo, construct GitHub raw URL
    if (formData.heroImage.startsWith('./')) {
      if (!activeRepo) {
        console.log('Cannot construct image URL: No active repository');
        return null;
      }
      const cleanPath = formData.heroImage.replace('./', '');
      const url = `https://raw.githubusercontent.com/${activeRepo.owner}/${activeRepo.name}/main/${cleanPath}`;
      console.log('Constructed image URL:', url);
      return url;
    }

    // If it starts with assets/, construct GitHub raw URL
    if (formData.heroImage.startsWith('assets/')) {
      if (!activeRepo) {
        console.log('Cannot construct image URL: No active repository');
        return null;
      }
      const url = `https://raw.githubusercontent.com/${activeRepo.owner}/${activeRepo.name}/main/${formData.heroImage}`;
      console.log('Constructed image URL:', url);
      return url;
    }

    return formData.heroImage;
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
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Image</h3>

            {/* Image Preview */}
            <div className="mb-4 rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-50">
              {getImagePreviewUrl() ? (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                  <img
                    src={getImagePreviewUrl()!}
                    alt="Hero preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      console.error('Image preview failed to load:', getImagePreviewUrl());
                      e.currentTarget.onerror = null; // Prevent infinite loop
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="192"%3E%3Crect fill="%23f3f4f6" width="400" height="192"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <PhotoIcon className="mx-auto h-12 w-12 mb-2" />
                    <p className="text-sm">No image selected</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload and Browse Buttons */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PhotoIcon className="h-5 w-5" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowImageBrowser(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
              >
                <FolderIcon className="h-5 w-5" />
                <span>Browse Images</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Upload from your computer or browse existing images from assets/images
            </p>

            {/* Image Path Display (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Image Path
              </label>
              <input
                type="text"
                value={formData.heroImage || 'No image selected'}
                readOnly
                disabled
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono text-sm cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use "Upload Image" or "Browse Images" to change the hero image
              </p>
            </div>
          </div>

          {/* Background Style */}
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Background Style</h3>

            {/* Style Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const gradient = `bg-gradient-${gradientDirection} from-[${gradientFrom}] to-[${gradientTo}]`;
                    setFormData({ ...formData, backgroundStyle: gradient });
                  }}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    formData.backgroundStyle.startsWith('bg-gradient')
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Gradient
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, backgroundStyle: 'bg-white' })}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    formData.backgroundStyle === 'bg-white'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Solid
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, backgroundStyle: 'bg-gray-50' })}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    !formData.backgroundStyle.startsWith('bg-gradient') && formData.backgroundStyle !== 'bg-white'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Gradient Color Pickers */}
            {formData.backgroundStyle.startsWith('bg-gradient') && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={gradientFrom}
                        onChange={(e) => {
                          setGradientFrom(e.target.value);
                          const gradient = `bg-gradient-${gradientDirection} from-[${e.target.value}] to-[${gradientTo}]`;
                          setFormData({ ...formData, backgroundStyle: gradient });
                        }}
                        className="h-10 w-20 rounded border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={gradientFrom}
                        onChange={(e) => {
                          setGradientFrom(e.target.value);
                          const gradient = `bg-gradient-${gradientDirection} from-[${e.target.value}] to-[${gradientTo}]`;
                          setFormData({ ...formData, backgroundStyle: gradient });
                        }}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 font-mono text-sm"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={gradientTo}
                        onChange={(e) => {
                          setGradientTo(e.target.value);
                          const gradient = `bg-gradient-${gradientDirection} from-[${gradientFrom}] to-[${e.target.value}]`;
                          setFormData({ ...formData, backgroundStyle: gradient });
                        }}
                        className="h-10 w-20 rounded border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={gradientTo}
                        onChange={(e) => {
                          setGradientTo(e.target.value);
                          const gradient = `bg-gradient-${gradientDirection} from-[${gradientFrom}] to-[${e.target.value}]`;
                          setFormData({ ...formData, backgroundStyle: gradient });
                        }}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 font-mono text-sm"
                        placeholder="#a855f7"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gradient Direction
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['to-r', 'to-br', 'to-b', 'to-bl'].map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => {
                          setGradientDirection(dir);
                          const gradient = `bg-gradient-${dir} from-[${gradientFrom}] to-[${gradientTo}]`;
                          setFormData({ ...formData, backgroundStyle: gradient });
                        }}
                        className={`px-3 py-2 rounded border-2 font-medium text-sm transition-all ${
                          gradientDirection === dir
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {dir === 'to-r' ? '→' : dir === 'to-br' ? '↘' : dir === 'to-b' ? '↓' : '↙'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom CSS Input */}
            {!formData.backgroundStyle.startsWith('bg-gradient') && formData.backgroundStyle !== 'bg-white' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom CSS (Tailwind classes)
                </label>
                <textarea
                  value={formData.backgroundStyle}
                  onChange={(e) => setFormData({ ...formData, backgroundStyle: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all font-mono text-sm"
                  placeholder="bg-gradient-to-r from-blue-500 to-purple-600"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter Tailwind CSS classes (e.g., "bg-gradient-to-br from-blue-50 via-white to-purple-50")
                </p>
              </div>
            )}

            {/* Preview */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div
                className={`h-24 rounded-lg border-2 border-gray-300 ${formData.backgroundStyle}`}
                style={
                  formData.backgroundStyle.includes('from-[') && formData.backgroundStyle.includes('to-[')
                    ? {
                        background: `linear-gradient(${
                          gradientDirection === 'to-r' ? 'to right' :
                          gradientDirection === 'to-br' ? 'to bottom right' :
                          gradientDirection === 'to-b' ? 'to bottom' :
                          'to bottom left'
                        }, ${gradientFrom}, ${gradientTo})`
                      }
                    : undefined
                }
              />
            </div>
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
                  <EmojiInput
                    value={formData.floatingBadges?.topRight?.emoji || ''}
                    onChange={(emoji) => setFormData({
                      ...formData,
                      floatingBadges: {
                        ...formData.floatingBadges,
                        topRight: { ...formData.floatingBadges.topRight, emoji }
                      }
                    })}
                    label="Emoji"
                    placeholder="✨"
                    buttonColor="blue"
                  />
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
                  <EmojiInput
                    value={formData.floatingBadges?.bottomLeft?.emoji || ''}
                    onChange={(emoji) => setFormData({
                      ...formData,
                      floatingBadges: {
                        ...formData.floatingBadges,
                        bottomLeft: { ...formData.floatingBadges.bottomLeft, emoji }
                      }
                    })}
                    label="Emoji"
                    placeholder="⚡"
                    buttonColor="purple"
                  />
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

        {/* Image Browser Modal */}
        {showImageBrowser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Browse Repository Images</h3>
                <button
                  onClick={() => setShowImageBrowser(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingImages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : availableImages.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">No images found in assets/images</p>
                    <p className="mt-2 text-sm text-gray-500">Upload an image first to see it here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {availableImages.map((image) => (
                      <button
                        key={image.path}
                        onClick={() => selectExistingImage(image.path)}
                        className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EError%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-end">
                          <div className="w-full p-2 bg-black bg-opacity-75 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.name}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowImageBrowser(false)}
                  className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
