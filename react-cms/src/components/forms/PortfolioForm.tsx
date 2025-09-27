import React, { useState } from 'react';
import { PlusIcon, TrashIcon, Bars3Icon, PhotoIcon, TagIcon } from '@heroicons/react/24/outline';

interface Category {
  name: string;
  isActive: boolean;
}

interface Project {
  category: string;
  image: {
    src: string;
    alt: string;
  };
  title: string;
  isActive: boolean;
}

interface PortfolioData {
  title: string;
  categories: Category[];
  projects: Project[];
}

interface PortfolioFormProps {
  data: PortfolioData;
  onChange: (data: PortfolioData) => void;
}

export const PortfolioForm: React.FC<PortfolioFormProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<PortfolioData>(data);

  const updateFormData = (updates: Partial<PortfolioData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  // Category management
  const addCategory = () => {
    const newCategory: Category = {
      name: '',
      isActive: false
    };
    updateFormData({
      categories: [...formData.categories, newCategory]
    });
  };

  const updateCategory = (index: number, updates: Partial<Category>) => {
    const newCategories = [...formData.categories];
    newCategories[index] = { ...newCategories[index], ...updates };
    updateFormData({ categories: newCategories });
  };

  const removeCategory = (index: number) => {
    const newCategories = formData.categories.filter((_, i) => i !== index);
    updateFormData({ categories: newCategories });
  };

  const setActiveCategory = (index: number) => {
    const newCategories = formData.categories.map((cat, i) => ({
      ...cat,
      isActive: i === index
    }));
    updateFormData({ categories: newCategories });
  };

  // Project management
  const addProject = () => {
    const newProject: Project = {
      category: 'web development',
      image: {
        src: './assets/images/project-1.jpg',
        alt: ''
      },
      title: '',
      isActive: true
    };
    updateFormData({
      projects: [...formData.projects, newProject]
    });
  };

  const updateProject = (index: number, updates: Partial<Project>) => {
    const newProjects = [...formData.projects];
    newProjects[index] = { ...newProjects[index], ...updates };
    updateFormData({ projects: newProjects });
  };

  const updateProjectImage = (index: number, imageUpdates: Partial<Project['image']>) => {
    const newProjects = [...formData.projects];
    newProjects[index] = {
      ...newProjects[index],
      image: { ...newProjects[index].image, ...imageUpdates }
    };
    updateFormData({ projects: newProjects });
  };

  const removeProject = (index: number) => {
    const newProjects = formData.projects.filter((_, i) => i !== index);
    updateFormData({ projects: newProjects });
  };

  // Get available categories for project dropdown
  const getAvailableCategories = () => {
    return formData.categories
      .filter(cat => cat.name.toLowerCase() !== 'all')
      .map(cat => cat.name.toLowerCase());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="input-field"
            placeholder="Portfolio"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <TagIcon className="h-5 w-5" />
            <span>Categories</span>
          </h3>
          <button
            onClick={addCategory}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formData.categories.map((category, index) => (
            <div
              key={index}
              className={`bg-gray-50 rounded-lg p-4 border transition-all duration-200 ${
                category.isActive ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bars3Icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">
                    Category #{index + 1}
                  </span>
                  {category.isActive && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeCategory(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => updateCategory(index, { name: e.target.value })}
                  className="input-field"
                  placeholder="Category name"
                />

                <button
                  onClick={() => setActiveCategory(index)}
                  disabled={category.isActive}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    category.isActive
                      ? 'bg-primary-600 text-white cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.isActive ? 'Currently Active' : 'Set as Active'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <PhotoIcon className="h-5 w-5" />
            <span>Projects</span>
          </h3>
          <button
            onClick={addProject}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {formData.projects.map((project, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Bars3Icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">
                    Project #{index + 1}
                  </span>
                  {project.isActive && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Project Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject(index, { title: e.target.value })}
                    className="input-field"
                    placeholder="Project name"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={project.category}
                    onChange={(e) => updateProject(index, { category: e.target.value })}
                    className="input-field"
                  >
                    {getAvailableCategories().map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Settings */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Image Settings</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Image Source
                      </label>
                      <input
                        type="text"
                        value={project.image.src}
                        onChange={(e) => updateProjectImage(index, { src: e.target.value })}
                        className="input-field text-sm"
                        placeholder="./assets/images/project-1.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={project.image.alt}
                        onChange={(e) => updateProjectImage(index, { alt: e.target.value })}
                        className="input-field text-sm"
                        placeholder="Descriptive alt text"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`project-active-${index}`}
                    checked={project.isActive}
                    onChange={(e) => updateProject(index, { isActive: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`project-active-${index}`} className="text-sm font-medium text-gray-700">
                    Show in portfolio
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {formData.projects.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first project.</p>
            <div className="mt-6">
              <button
                onClick={addProject}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Project</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TagIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Categories</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formData.categories.length}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <PhotoIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Total Projects</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{formData.projects.length}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <PhotoIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Active Projects</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {formData.projects.filter(p => p.isActive).length}
          </p>
        </div>
      </div>
    </div>
  );
};