import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon, UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, CalendarIcon, ShareIcon, PhotoIcon, FolderIcon } from '@heroicons/react/24/outline';
import GitHubApiService from '../../services/github-api';
import { useRepo } from '../../hooks/useRepo';

interface Avatar {
  src: string;
  alt: string;
  width: string;
}

interface PersonalInfo {
  avatar: Avatar;
  name: string;
  title: string;
}

interface Contact {
  icon: string;
  title: string;
  value: string;
  href?: string;
  datetime?: string;
}

interface SocialLink {
  platform: string;
  icon: string;
  url: string;
}

interface SidebarData {
  personalInfo: PersonalInfo;
  contacts: {
    email?: Contact;
    phone?: Contact;
    birthday?: Contact;
    location?: Contact;
  };
  socialLinks: SocialLink[];
}

interface SidebarFormProps {
  data: SidebarData;
  onChange: (data: SidebarData) => void;
}

interface RepoImage {
  name: string;
  path: string;
  url: string;
}

export const SidebarForm: React.FC<SidebarFormProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<SidebarData>(data);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showImageBrowser, setShowImageBrowser] = useState(false);
  const [availableImages, setAvailableImages] = useState<RepoImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeRepo } = useRepo();

  const updateFormData = (updates: Partial<SidebarData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  const updatePersonalInfo = (updates: Partial<PersonalInfo>) => {
    updateFormData({
      personalInfo: { ...formData.personalInfo, ...updates }
    });
  };

  const updateAvatar = (updates: Partial<Avatar>) => {
    updatePersonalInfo({
      avatar: { ...formData.personalInfo.avatar, ...updates }
    });
  };

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
    updateAvatar({ src: displayPath });
    setImagePreviewUrl(null); // Clear data URL preview to use GitHub URL
    setShowImageBrowser(false);
  };

  // Handle image upload to GitHub
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (!file.size || file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    if (!activeRepo) {
      alert('No active repository. Please create a portfolio first.');
      return;
    }

    setUploadingImage(true);

    try {
      // Read file as base64
      const reader = new FileReader();

      reader.onload = async (e) => {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Failed to read file');
        }

        // Extract base64 data (remove data:image/...;base64, prefix)
        const base64Data = result.split(',')[1];

        // Generate filename from original file
        const extension = file.name.split('.').pop() || 'png';
        const filename = `my-avatar.${extension}`;
        const githubPath = `assets/images/${filename}`;
        const displayPath = `./${githubPath}`;

        console.log(`Uploading avatar to ${githubPath}...`);

        // Check if file exists to get SHA
        const existingFile = await GitHubApiService.getFileContent(
          activeRepo.owner,
          activeRepo.name,
          githubPath
        );

        // Upload to GitHub using binary file method (no double encoding)
        const uploadResult = await GitHubApiService.uploadBinaryFile(
          activeRepo.owner,
          activeRepo.name,
          githubPath,
          base64Data, // Already base64-encoded (without data:... prefix)
          existingFile.success ? existingFile.data?.sha : undefined,
          `Upload avatar image via AlmostaCMS`
        );

        if (!uploadResult.success) {
          console.error('GitHub upload failed:', uploadResult.error);
          throw new Error(uploadResult.error || 'Failed to upload image to GitHub');
        }

        console.log('✅ Avatar uploaded successfully to GitHub:', uploadResult);

        // Update the form with new path
        updateAvatar({ src: displayPath });

        // Set preview URL
        setImagePreviewUrl(result);

        alert(
          `✅ Avatar uploaded successfully!\n\n` +
          `• File: ${filename}\n` +
          `• Location: ${githubPath}\n` +
          `• Size: ${(file.size / 1024).toFixed(1)} KB\n\n` +
          `The image path has been updated. Don't forget to click "Save & Generate" to save your changes!`
        );

        // Refresh the available images list
        await loadAvailableImages();

        setUploadingImage(false);
      };

      reader.onerror = () => {
        console.error('File reader error');
        alert('Failed to read image file. Please try again.');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Image upload error:', error);
      alert(
        `❌ Failed to upload image\n\n` +
        `Error: ${error.message}\n\n` +
        `Please check:\n` +
        `• You're connected to the internet\n` +
        `• The repository exists and you have write access\n` +
        `• The file is a valid image (JPG, PNG, GIF)`
      );
      setUploadingImage(false);
    }
  };

  // Get full image URL for preview
  const getImagePreviewUrl = (src: string): string | null => {
    if (!src) return null;

    // If we have a data URL from upload, use it
    if (imagePreviewUrl) {
      return imagePreviewUrl;
    }

    // If it's already a full URL, use it
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }

    // If it's a data URL, use it
    if (src.startsWith('data:')) {
      return src;
    }

    // If it's a relative path and we have an active repo, construct GitHub raw URL
    if (src.startsWith('./')) {
      if (!activeRepo) {
        console.log('Cannot construct image URL: No active repository');
        return null;
      }
      const cleanPath = src.replace('./', '');
      const url = `https://raw.githubusercontent.com/${activeRepo.owner}/${activeRepo.name}/main/${cleanPath}`;
      console.log('Constructed image URL:', url);
      return url;
    }

    // If it starts with assets/, construct GitHub raw URL
    if (src.startsWith('assets/')) {
      if (!activeRepo) {
        console.log('Cannot construct image URL: No active repository');
        return null;
      }
      const url = `https://raw.githubusercontent.com/${activeRepo.owner}/${activeRepo.name}/main/${src}`;
      console.log('Constructed image URL:', url);
      return url;
    }

    return null;
  };

  // Contact management
  const hasContact = (contactType: keyof SidebarData['contacts']): boolean => {
    return formData.contacts[contactType] !== undefined;
  };

  const addContact = (contactType: keyof SidebarData['contacts']) => {
    const defaultContacts: Record<string, Contact> = {
      email: {
        icon: 'ion-mail-outline',
        title: 'Email',
        value: 'your@email.com',
        href: 'mailto:your@email.com'
      },
      phone: {
        icon: 'ion-phone-portrait-outline',
        title: 'Phone',
        value: '+1 (555) 000-0000',
        href: 'tel:+15550000000'
      },
      birthday: {
        icon: 'ion-calendar-outline',
        title: 'Birthday',
        value: 'January 1, 1990',
        datetime: '1990-01-01'
      },
      location: {
        icon: 'ion-location-outline',
        title: 'Location',
        value: 'Your City, Country'
      }
    };

    updateFormData({
      contacts: {
        ...formData.contacts,
        [contactType]: defaultContacts[contactType]
      }
    });
  };

  const removeContact = (contactType: keyof SidebarData['contacts']) => {
    const newContacts = { ...formData.contacts };
    delete newContacts[contactType];
    updateFormData({ contacts: newContacts });
  };

  const updateContact = (contactType: keyof SidebarData['contacts'], updates: Partial<Contact>) => {
    const currentContact = formData.contacts[contactType];
    if (!currentContact) return;

    updateFormData({
      contacts: {
        ...formData.contacts,
        [contactType]: { ...currentContact, ...updates }
      }
    });
  };

  // Social links management
  const addSocialLink = () => {
    const newSocialLink: SocialLink = {
      platform: '',
      icon: 'logo-',
      url: '#'
    };

    updateFormData({
      socialLinks: [...formData.socialLinks, newSocialLink]
    });
  };

  const updateSocialLink = (index: number, updates: Partial<SocialLink>) => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks[index] = { ...newSocialLinks[index], ...updates };
    updateFormData({ socialLinks: newSocialLinks });
  };

  const removeSocialLink = (index: number) => {
    const newSocialLinks = formData.socialLinks.filter((_, i) => i !== index);
    updateFormData({ socialLinks: newSocialLinks });
  };

  // Predefined social platforms
  const socialPlatforms = [
    { name: 'facebook', icon: 'logo-facebook' },
    { name: 'twitter', icon: 'logo-twitter' },
    { name: 'instagram', icon: 'logo-instagram' },
    { name: 'linkedin', icon: 'logo-linkedin' },
    { name: 'github', icon: 'logo-github' },
    { name: 'youtube', icon: 'logo-youtube' },
    { name: 'tiktok', icon: 'logo-tiktok' },
    { name: 'discord', icon: 'logo-discord' }
  ];

  const contactTypes: Array<{ key: keyof SidebarData['contacts']; label: string; icon: React.ComponentType<any> }> = [
    { key: 'email', label: 'Email', icon: EnvelopeIcon },
    { key: 'phone', label: 'Phone', icon: PhoneIcon },
    { key: 'birthday', label: 'Birthday', icon: CalendarIcon },
    { key: 'location', label: 'Location', icon: MapPinIcon }
  ];

  const avatarPreviewUrl = getImagePreviewUrl(formData.personalInfo.avatar.src);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <UserIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            </div>

            <div className="space-y-6">
              {/* Avatar Settings */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Profile Picture</h4>

                <div className="space-y-4">
                  {/* Current Avatar Preview */}
                  <div className="flex justify-center">
                    <div className="relative">
                      {avatarPreviewUrl ? (
                        <>
                          <img
                            src={avatarPreviewUrl}
                            alt="Avatar preview"
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-300"
                            onError={(e) => {
                              console.log('Avatar preview not yet available, will retry when image is pushed to GitHub');
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback instanceof HTMLElement) {
                                fallback.classList.remove('hidden');
                              }
                            }}
                          />
                          <div className="hidden w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-4 border-gray-300">
                            <UserIcon className="h-12 w-12 text-gray-500" />
                          </div>
                        </>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-4 border-gray-300">
                          <UserIcon className="h-12 w-12 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  {!avatarPreviewUrl && formData.personalInfo.avatar.src && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded text-center">
                      Image preview will appear after uploading or selecting an image
                    </p>
                  )}

                  {/* Image Selection Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Avatar Image
                    </label>
                    <div className="flex items-center gap-3">
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
                        className="flex-1 btn-primary flex items-center justify-center space-x-2"
                      >
                        <PhotoIcon className="h-5 w-5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload New Image'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowImageBrowser(!showImageBrowser)}
                        disabled={loadingImages}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                      >
                        <FolderIcon className="h-5 w-5" />
                        <span>{loadingImages ? 'Loading...' : 'Browse Existing'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload from your computer (JPG, PNG, GIF up to 2MB) or browse images already in your repository
                    </p>
                  </div>

                  {/* Image Browser */}
                  {showImageBrowser && (
                    <div className="bg-white border-2 border-primary-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-900">Repository Images</h5>
                        <button
                          onClick={() => setShowImageBrowser(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>

                      {availableImages.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <PhotoIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No images found in assets/images/</p>
                          <p className="text-xs mt-1">Upload your first image using the button above</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                          {availableImages.map((image) => (
                            <button
                              key={image.path}
                              type="button"
                              onClick={() => selectExistingImage(image.path)}
                              className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                formData.personalInfo.avatar.src === `./${image.path}`
                                  ? 'border-primary-500 ring-2 ring-primary-200'
                                  : 'border-gray-200 hover:border-primary-300'
                              }`}
                              title={image.name}
                            >
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-end">
                                <div className="w-full bg-black bg-opacity-70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                  {image.name}
                                </div>
                              </div>
                              {formData.personalInfo.avatar.src === `./${image.path}` && (
                                <div className="absolute top-1 right-1 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                  ✓
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Width (px)
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo.avatar.width}
                        onChange={(e) => updateAvatar({ width: e.target.value })}
                        className="input-field"
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alt Text (for accessibility)
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo.avatar.alt}
                        onChange={(e) => updateAvatar({ alt: e.target.value })}
                        className="input-field"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  {/* Current Path Display (Read-only) */}
                  <div className="bg-gray-100 rounded p-2 text-xs font-mono text-gray-600">
                    <span className="text-gray-500">Current path:</span> {formData.personalInfo.avatar.src || 'None selected'}
                  </div>
                </div>
              </div>

              {/* Name and Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.name}
                    onChange={(e) => updatePersonalInfo({ name: e.target.value })}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.title}
                    onChange={(e) => updatePersonalInfo({ title: e.target.value })}
                    className="input-field"
                    placeholder="Your job title or profession"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
              </div>
              <p className="text-sm text-gray-500">Optional - add what you need</p>
            </div>

            <div className="space-y-4">
              {contactTypes.map(({ key, label, icon: Icon }) => (
                <div key={key}>
                  {hasContact(key) ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <h4 className="text-sm font-medium text-gray-700">{label}</h4>
                        </div>
                        <button
                          onClick={() => removeContact(key)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title={`Remove ${label}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {key === 'email' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                              type="email"
                              value={formData.contacts.email?.value || ''}
                              onChange={(e) => updateContact('email', { value: e.target.value })}
                              className="input-field"
                              placeholder="your@email.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mailto Link</label>
                            <input
                              type="text"
                              value={formData.contacts.email?.href || ''}
                              onChange={(e) => updateContact('email', { href: e.target.value })}
                              className="input-field"
                              placeholder="mailto:your@email.com"
                            />
                          </div>
                        </div>
                      )}

                      {key === 'phone' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                              type="text"
                              value={formData.contacts.phone?.value || ''}
                              onChange={(e) => updateContact('phone', { value: e.target.value })}
                              className="input-field"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tel Link</label>
                            <input
                              type="text"
                              value={formData.contacts.phone?.href || ''}
                              onChange={(e) => updateContact('phone', { href: e.target.value })}
                              className="input-field"
                              placeholder="tel:+15550000000"
                            />
                          </div>
                        </div>
                      )}

                      {key === 'birthday' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Birthday (Display)</label>
                            <input
                              type="text"
                              value={formData.contacts.birthday?.value || ''}
                              onChange={(e) => updateContact('birthday', { value: e.target.value })}
                              className="input-field"
                              placeholder="June 23, 1982"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date (YYYY-MM-DD)</label>
                            <input
                              type="date"
                              value={formData.contacts.birthday?.datetime || ''}
                              onChange={(e) => updateContact('birthday', { datetime: e.target.value })}
                              className="input-field"
                            />
                          </div>
                        </div>
                      )}

                      {key === 'location' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={formData.contacts.location?.value || ''}
                            onChange={(e) => updateContact('location', { value: e.target.value })}
                            className="input-field"
                            placeholder="City, Country"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => addContact(key)}
                      className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 hover:bg-primary-50 transition-all group"
                    >
                      <div className="flex items-center justify-center space-x-2 text-gray-500 group-hover:text-primary-600">
                        <PlusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Add {label}</span>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShareIcon className="h-5 w-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Social Links</h3>
              </div>
              <button
                onClick={addSocialLink}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Link</span>
              </button>
            </div>

            {formData.socialLinks.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <ShareIcon className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No social links</h3>
                <p className="mt-1 text-sm text-gray-500">Add your social media profiles.</p>
                <div className="mt-4">
                  <button
                    onClick={addSocialLink}
                    className="btn-primary flex items-center space-x-2 mx-auto"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add First Link</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.socialLinks.map((link, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">Social Link #{index + 1}</span>
                      <button
                        onClick={() => removeSocialLink(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                        <select
                          value={link.platform}
                          onChange={(e) => {
                            const selectedPlatform = socialPlatforms.find(p => p.name === e.target.value);
                            updateSocialLink(index, {
                              platform: e.target.value,
                              icon: selectedPlatform?.icon || `logo-${e.target.value}`
                            });
                          }}
                          className="input-field"
                        >
                          <option value="">Select platform</option>
                          {socialPlatforms.map((platform) => (
                            <option key={platform.name} value={platform.name}>
                              {platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name</label>
                        <input
                          type="text"
                          value={link.icon}
                          onChange={(e) => updateSocialLink(index, { icon: e.target.value })}
                          className="input-field"
                          placeholder="logo-facebook"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile URL</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                          className="input-field"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span>Live Preview</span>
                <span className="text-xs font-normal text-gray-500 bg-green-100 px-2 py-1 rounded-full">Real-time</span>
              </h3>

              {/* Authentic Sidebar Preview */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl overflow-hidden">
                <div className="p-6 space-y-6">
                  {/* Profile Picture & Info */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      {avatarPreviewUrl ? (
                        <>
                          <img
                            src={avatarPreviewUrl}
                            alt={formData.personalInfo.avatar.alt}
                            className="w-24 h-24 rounded-3xl mx-auto object-cover border-4 border-gray-700"
                            onError={(e) => {
                              console.log('Preview avatar not available yet, showing fallback icon');
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback instanceof HTMLElement) {
                                fallback.classList.remove('hidden');
                              }
                            }}
                          />
                          <div className="hidden w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl mx-auto flex items-center justify-center border-4 border-gray-700">
                            <UserIcon className="h-12 w-12 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl mx-auto flex items-center justify-center border-4 border-gray-700">
                          <UserIcon className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                    <h4 className="mt-4 text-xl font-bold text-white">
                      {formData.personalInfo.name || 'Your Name'}
                    </h4>
                    <p className="mt-1 text-sm text-gray-400 bg-gray-800 rounded-lg px-3 py-1 inline-block">
                      {formData.personalInfo.title || 'Your Title'}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700"></div>

                  {/* Contact Info */}
                  {(hasContact('email') || hasContact('phone') || hasContact('birthday') || hasContact('location')) && (
                    <div className="space-y-3">
                      {hasContact('email') && (
                        <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                          <div className="bg-gray-800 group-hover:bg-primary-600 transition-colors p-2 rounded-lg">
                            <EnvelopeIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">EMAIL</p>
                            <p className="text-sm truncate">{formData.contacts.email?.value || 'Email'}</p>
                          </div>
                        </div>
                      )}

                      {hasContact('phone') && (
                        <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                          <div className="bg-gray-800 group-hover:bg-primary-600 transition-colors p-2 rounded-lg">
                            <PhoneIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">PHONE</p>
                            <p className="text-sm truncate">{formData.contacts.phone?.value || 'Phone'}</p>
                          </div>
                        </div>
                      )}

                      {hasContact('birthday') && (
                        <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                          <div className="bg-gray-800 group-hover:bg-primary-600 transition-colors p-2 rounded-lg">
                            <CalendarIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">BIRTHDAY</p>
                            <p className="text-sm truncate">{formData.contacts.birthday?.value || 'Birthday'}</p>
                          </div>
                        </div>
                      )}

                      {hasContact('location') && (
                        <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                          <div className="bg-gray-800 group-hover:bg-primary-600 transition-colors p-2 rounded-lg">
                            <MapPinIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">LOCATION</p>
                            <p className="text-sm truncate">{formData.contacts.location?.value || 'Location'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Links */}
                  {formData.socialLinks.length > 0 && (
                    <>
                      <div className="border-t border-gray-700"></div>
                      <div>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                          {formData.socialLinks.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                              title={link.platform}
                              onClick={(e) => e.preventDefault()}
                            >
                              <span className="text-sm font-bold text-white">
                                {link.platform ? link.platform.charAt(0).toUpperCase() : '?'}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Preview Note */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> This preview updates in real-time as you edit. Avatar shows images from your GitHub repository.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
