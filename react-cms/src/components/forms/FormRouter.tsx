import React from 'react';
import { ResumeForm } from './ResumeForm';
import { AboutForm } from './AboutForm';
import { PortfolioForm } from './PortfolioForm';
import { ContactForm } from './ContactForm';
import { BlogForm } from './BlogForm';
import { NavbarForm } from './NavbarForm';
import { SidebarForm } from './SidebarForm';
import { JsonEditor } from '../JsonEditor';

interface FormRouterProps {
  filename: string;
  data: any;
  onSave: (data: any) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

export const FormRouter: React.FC<FormRouterProps> = ({
  filename,
  data,
  onSave,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = React.useState(data);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Update form data and track changes
  const handleFormChange = (newData: any) => {
    setFormData(newData);
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(data));
  };

  // Save changes
  const handleSave = async () => {
    const success = await onSave(formData);
    if (success) {
      setHasChanges(false);
    }
  };

  // Reset to original data
  const handleReset = () => {
    setFormData(data);
    setHasChanges(false);
  };

  // Header with save controls
  const FormHeader = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {getFormTitle(filename)}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {getFormDescription(filename)}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
            className="btn-secondary"
          >
            Reset
          </button>

          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn-secondary"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Saving...' : 'Save & Generate'}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ● Unsaved changes
          </span>
        </div>
      )}
    </div>
  );

  // Get appropriate form based on filename
  const renderForm = () => {
    switch (filename) {
      case 'resume':
        return (
          <ResumeForm
            data={formData}
            onChange={handleFormChange}
          />
        );

      case 'about':
        return (
          <AboutForm
            data={formData}
            onChange={handleFormChange}
          />
        );

      case 'portfolio':
        return (
          <PortfolioForm
            data={formData}
            onChange={handleFormChange}
          />
        );

      case 'contact':
        return (
          <ContactForm
            data={formData}
            onChange={handleFormChange}
          />
        );

      case 'blog':
        return (
          <BlogForm
            data={formData}
            onChange={handleFormChange}
          />
        );

      case 'navbar':
        return (
          <NavbarForm
            data={formData}
            onChange={handleFormChange}
          />
        );

      case 'sidebar':
        return (
          <SidebarForm
            data={formData}
            onChange={handleFormChange}
          />
        );

      // For other content types, fall back to JSON editor
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Form view not available
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>A custom form hasn't been created for "{filename}" yet. You can still edit the JSON directly below, or switch back to the dashboard.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <JsonEditor
                filename={filename}
                data={data}
                onSave={onSave}
                onCancel={onCancel}
                isLoading={isLoading}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <FormHeader />
      <div className="flex-1 overflow-auto p-6">
        {renderForm()}
      </div>
    </div>
  );
};

// Helper function to get form title
function getFormTitle(filename: string): string {
  const titles: Record<string, string> = {
    about: 'About Section',
    resume: 'Resume & Experience',
    portfolio: 'Portfolio Projects',
    blog: 'Blog Posts',
    contact: 'Contact Information',
    navbar: 'Navigation Menu',
    sidebar: 'Sidebar Profile'
  };

  return titles[filename] || `Editing ${filename}`;
}

// Helper function to get form description
function getFormDescription(filename: string): string {
  const descriptions: Record<string, string> = {
    about: 'Personal information, services, testimonials and client logos',
    resume: 'Education, work experience, and professional skills',
    portfolio: 'Projects showcase and case studies',
    blog: 'Blog posts and articles',
    contact: 'Contact information and social links',
    navbar: 'Main navigation menu items',
    sidebar: 'Sidebar content and profile information'
  };

  return descriptions[filename] || 'JSON content editor';
}