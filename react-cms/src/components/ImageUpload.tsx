import React, { useRef, useState, useEffect } from 'react';
import { PhotoIcon, FolderIcon } from '@heroicons/react/24/outline';
import GitHubApiService from '../services/github-api';
import { useRepo } from '../hooks/useRepo';

interface RepoImage {
  name: string;
  path: string;
  url: string;
}

interface ImageUploadProps {
  value: string;
  onChange: (path: string) => void;
  label?: string;
  placeholder?: string;
  showPreview?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Image',
  placeholder = './assets/images/image.png',
  showPreview = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showImageBrowser, setShowImageBrowser] = useState(false);
  const [availableImages, setAvailableImages] = useState<RepoImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const { activeRepo } = useRepo();

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
    onChange(displayPath);
    setImagePreviewUrl(null); // Clear data URL preview to use GitHub URL
    setShowImageBrowser(false);
  };

  // Handle image upload
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

        // Store the data URL
        onChange(result);
        setImagePreviewUrl(result);

        alert(
          `✅ Image uploaded successfully!\n\n` +
          `The image has been loaded. Click "Save Changes" to save it.`
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
    if (!value) return null;

    // If we have a preview URL from upload, use it
    if (imagePreviewUrl) return imagePreviewUrl;

    // If it's already a data URL, use it
    if (value.startsWith('data:')) return value;

    // If it's a full URL, use it
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    // If it's a relative path and we have an active repo, construct GitHub raw URL
    if (value.startsWith('./')) {
      if (!activeRepo) {
        console.log('Cannot construct image URL: No active repository');
        return null;
      }
      const cleanPath = value.replace('./', '');
      const url = `https://raw.githubusercontent.com/${activeRepo.owner}/${activeRepo.name}/main/${cleanPath}`;
      return url;
    }

    // If it starts with assets/, construct GitHub raw URL
    if (value.startsWith('assets/')) {
      if (!activeRepo) {
        console.log('Cannot construct image URL: No active repository');
        return null;
      }
      const url = `https://raw.githubusercontent.com/${activeRepo.owner}/${activeRepo.name}/main/${value}`;
      return url;
    }

    return value;
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Image Preview */}
      {showPreview && (
        <div className="mb-4 rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-50">
          {getImagePreviewUrl() ? (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100">
              <img
                src={getImagePreviewUrl()!}
                alt="Preview"
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
      )}

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
      <input
        type="text"
        value={value || 'No image selected'}
        readOnly
        disabled
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono text-sm cursor-not-allowed"
        placeholder={placeholder}
      />
      <p className="mt-1 text-xs text-gray-500">
        Use "Upload Image" or "Browse Images" to change the image
      </p>

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
  );
};
