import React, { useState } from 'react';
import { PlusIcon, TrashIcon, Bars3Icon, LinkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  isActive: boolean;
}

interface NavbarData {
  list: NavItem[];
}

interface NavbarFormProps {
  data: NavbarData;
  onChange: (data: NavbarData) => void;
}

export const NavbarForm: React.FC<NavbarFormProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<NavbarData>(data);

  const updateFormData = (updates: Partial<NavbarData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  // Navigation item management
  const addNavItem = () => {
    const newNavItem: NavItem = {
      name: '',
      isActive: false
    };

    updateFormData({
      list: [...formData.list, newNavItem]
    });
  };

  const updateNavItem = (index: number, updates: Partial<NavItem>) => {
    const newList = [...formData.list];
    newList[index] = { ...newList[index], ...updates };
    updateFormData({ list: newList });
  };

  const removeNavItem = (index: number) => {
    const newList = formData.list.filter((_, i) => i !== index);
    updateFormData({ list: newList });
  };

  const setActiveNavItem = (index: number) => {
    const newList = formData.list.map((item, i) => ({
      ...item,
      isActive: i === index
    }));
    updateFormData({ list: newList });
  };

  // Move nav item up or down
  const moveNavItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.list.length - 1) return;

    const newList = [...formData.list];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap items
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];

    updateFormData({ list: newList });
  };

  // Get suggested navigation items
  const getSuggestedItems = () => {
    const existing = formData.list.map(item => item.name.toLowerCase());
    const suggestions = ['About', 'Resume', 'Portfolio', 'Blog', 'Contact', 'Services', 'Projects'];
    return suggestions.filter(item => !existing.includes(item.toLowerCase()));
  };

  const addSuggestedItem = (name: string) => {
    addNavItem();
    const newIndex = formData.list.length;
    updateNavItem(newIndex, { name });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Navigation Menu</h2>
        <p className="text-gray-600">
          Manage your website's main navigation menu. The active item represents the current page.
        </p>
      </div>

      {/* Navigation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Items</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formData.list.length}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Active Item</span>
          </div>
          <p className="text-sm font-bold text-green-600 mt-1">
            {formData.list.find(item => item.isActive)?.name || 'None'}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Bars3Icon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Menu Order</span>
          </div>
          <p className="text-sm font-medium text-purple-600 mt-1">Drag to reorder</p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Bars3Icon className="h-5 w-5" />
            <span>Menu Items</span>
          </h3>
          <button
            onClick={addNavItem}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>

        {formData.list.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No navigation items</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first navigation item.</p>
            <div className="mt-6">
              <button
                onClick={addNavItem}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add First Item</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.list.map((item, index) => (
              <div
                key={index}
                className={`bg-gray-50 rounded-lg p-4 border transition-all duration-200 ${
                  item.isActive ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <Bars3Icon className="h-5 w-5 text-gray-400 cursor-move" />
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      {item.isActive && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateNavItem(index, { name: e.target.value })}
                        className="input-field"
                        placeholder="Navigation item name"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Move buttons */}
                    <button
                      onClick={() => moveNavItem(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveNavItem(index, 'down')}
                      disabled={index === formData.list.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>

                    {/* Set Active button */}
                    <button
                      onClick={() => setActiveNavItem(index)}
                      disabled={item.isActive}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        item.isActive
                          ? 'bg-primary-600 text-white cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Set Active'}
                    </button>

                    {/* Remove button */}
                    <button
                      onClick={() => removeNavItem(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Suggestions */}
      {getSuggestedItems().length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add</h3>
          <p className="text-sm text-gray-600 mb-4">
            Common navigation items you might want to add:
          </p>
          <div className="flex flex-wrap gap-2">
            {getSuggestedItems().map((suggestion, index) => (
              <button
                key={index}
                onClick={() => addSuggestedItem(suggestion)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Preview</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <nav className="flex justify-center space-x-8">
            {formData.list.map((item, index) => (
              <a
                key={index}
                href="#"
                className={`text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                    : 'text-gray-300 hover:text-white'
                }`}
                onClick={(e) => e.preventDefault()}
              >
                {item.name || `Item ${index + 1}`}
              </a>
            ))}
          </nav>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          This is how your navigation menu will appear on your website.
        </p>
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• The active item indicates which page is currently being viewed</li>
          <li>• Use the ↑↓ buttons or drag to reorder navigation items</li>
          <li>• Keep navigation names short and descriptive</li>
          <li>• Only one item can be active at a time</li>
        </ul>
      </div>
    </div>
  );
};