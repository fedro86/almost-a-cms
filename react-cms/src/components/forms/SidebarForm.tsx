import React, { useState } from 'react';
import { PlusIcon, TrashIcon, UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, CalendarIcon, ShareIcon } from '@heroicons/react/24/outline';

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
    email: Contact;
    phone: Contact;
    birthday: Contact;
    location: Contact;
  };
  socialLinks: SocialLink[];
}

interface SidebarFormProps {
  data: SidebarData;
  onChange: (data: SidebarData) => void;
}

export const SidebarForm: React.FC<SidebarFormProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<SidebarData>(data);

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

  const updateContact = (contactType: keyof SidebarData['contacts'], updates: Partial<Contact>) => {
    updateFormData({
      contacts: {
        ...formData.contacts,
        [contactType]: { ...formData.contacts[contactType], ...updates }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sidebar Profile</h2>
        <p className="text-gray-600">
          Configure your personal information and contact details that appear in the sidebar.
        </p>
      </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Source
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.avatar.src}
                  onChange={(e) => updateAvatar({ src: e.target.value })}
                  className="input-field"
                  placeholder="./assets/images/my-avatar.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (px)
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.avatar.width}
                  onChange={(e) => updateAvatar({ width: e.target.value })}
                  className="input-field"
                  placeholder="80"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={formData.personalInfo.avatar.alt}
                onChange={(e) => updateAvatar({ alt: e.target.value })}
                className="input-field"
                placeholder="Your name for accessibility"
              />
            </div>
          </div>

          {/* Name and Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
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
                Professional Title
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
        <div className="flex items-center space-x-2 mb-4">
          <PhoneIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <EnvelopeIcon className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">Email</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.contacts.email.value}
                  onChange={(e) => updateContact('email', { value: e.target.value })}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mailto Link
                </label>
                <input
                  type="text"
                  value={formData.contacts.email.href || ''}
                  onChange={(e) => updateContact('email', { href: e.target.value })}
                  className="input-field"
                  placeholder="mailto:your@email.com"
                />
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <PhoneIcon className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">Phone</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Display)
                </label>
                <input
                  type="text"
                  value={formData.contacts.phone.value}
                  onChange={(e) => updateContact('phone', { value: e.target.value })}
                  className="input-field"
                  placeholder="+1 (213) 352-2795"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tel Link
                </label>
                <input
                  type="text"
                  value={formData.contacts.phone.href || ''}
                  onChange={(e) => updateContact('phone', { href: e.target.value })}
                  className="input-field"
                  placeholder="tel:+12133522795"
                />
              </div>
            </div>
          </div>

          {/* Birthday */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <CalendarIcon className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">Birthday</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birthday (Display)
                </label>
                <input
                  type="text"
                  value={formData.contacts.birthday.value}
                  onChange={(e) => updateContact('birthday', { value: e.target.value })}
                  className="input-field"
                  placeholder="June 23, 1982"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DateTime (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={formData.contacts.birthday.datetime || ''}
                  onChange={(e) => updateContact('birthday', { datetime: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <MapPinIcon className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">Location</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.contacts.location.value}
                onChange={(e) => updateContact('location', { value: e.target.value })}
                className="input-field"
                placeholder="Sacramento, California, USA"
              />
            </div>
          </div>
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
            <span>Add Social Link</span>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon Name
                    </label>
                    <input
                      type="text"
                      value={link.icon}
                      onChange={(e) => updateSocialLink(index, { icon: e.target.value })}
                      className="input-field"
                      placeholder="logo-facebook"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile URL
                    </label>
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

      {/* Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sidebar Preview</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-sm">
          {/* Personal Info Preview */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-900">
              {formData.personalInfo.name || 'Your Name'}
            </h4>
            <p className="text-sm text-gray-500">
              {formData.personalInfo.title || 'Your Title'}
            </p>
          </div>

          {/* Contact Info Preview */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{formData.contacts.email.value || 'Email'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <PhoneIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{formData.contacts.phone.value || 'Phone'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{formData.contacts.birthday.value || 'Birthday'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{formData.contacts.location.value || 'Location'}</span>
            </div>
          </div>

          {/* Social Links Preview */}
          {formData.socialLinks.length > 0 && (
            <div className="flex space-x-2">
              {formData.socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center"
                  title={link.platform}
                >
                  <span className="text-xs text-gray-500">
                    {link.platform.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};