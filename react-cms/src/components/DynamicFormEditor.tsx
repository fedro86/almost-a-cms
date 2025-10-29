import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

/**
 * Dynamic Form Editor
 *
 * Automatically generates visual forms from JSON data structure.
 * Supports:
 * - Nested objects
 * - Arrays with add/remove/reorder
 * - Different field types (text, textarea, URL, etc.)
 * - Toggle sections on/off
 * - Move items up/down
 */

interface DynamicFormEditorProps {
  data: any;
  onChange: (data: any) => void;
  title?: string;
}

type FieldType = 'text' | 'textarea' | 'url' | 'email' | 'number' | 'boolean';

interface FieldMetadata {
  type: FieldType;
  label: string;
  placeholder?: string;
}

// Detect field type from key name and value
function detectFieldType(key: string, value: any): FieldType {
  const lowerKey = key.toLowerCase();

  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';

  if (lowerKey.includes('url') || lowerKey.includes('link') || lowerKey.includes('href')) {
    return 'url';
  }
  if (lowerKey.includes('email')) {
    return 'email';
  }
  if (lowerKey.includes('description') || lowerKey.includes('text') || lowerKey.includes('content')) {
    return 'textarea';
  }

  return 'text';
}

// Generate human-readable label from camelCase/snake_case key
function generateLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // camelCase
    .replace(/_/g, ' ') // snake_case
    .replace(/^./, str => str.toUpperCase()) // capitalize first letter
    .trim();
}

export const DynamicFormEditor: React.FC<DynamicFormEditorProps> = ({
  data,
  onChange,
  title = 'Edit Content'
}) => {
  const [formData, setFormData] = useState<any>(data);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const updateFormData = (updates: any) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  const updateNestedValue = (path: string[], value: any) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    setFormData(newData);
    onChange(newData);
  };

  const toggleSection = (sectionKey: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionKey)) {
      newCollapsed.delete(sectionKey);
    } else {
      newCollapsed.add(sectionKey);
    }
    setCollapsedSections(newCollapsed);
  };

  // Array item operations
  const addArrayItem = (path: string[], template: any) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;

    for (const key of path) {
      current = current[key];
    }

    current.push(JSON.parse(JSON.stringify(template)));

    setFormData(newData);
    onChange(newData);
  };

  const removeArrayItem = (path: string[], index: number) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;

    for (const key of path) {
      current = current[key];
    }

    current.splice(index, 1);

    setFormData(newData);
    onChange(newData);
  };

  const moveArrayItem = (path: string[], index: number, direction: 'up' | 'down') => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;

    for (const key of path) {
      current = current[key];
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= current.length) return;

    [current[index], current[newIndex]] = [current[newIndex], current[index]];

    setFormData(newData);
    onChange(newData);
  };

  // Render different field types
  const renderField = (key: string, value: any, path: string[] = []) => {
    const fullPath = [...path, key];
    const fieldType = detectFieldType(key, value);
    const label = generateLabel(key);

    if (fieldType === 'boolean') {
      return (
        <div key={key} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            id={fullPath.join('.')}
            checked={value}
            onChange={(e) => updateNestedValue(fullPath, e.target.checked)}
            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor={fullPath.join('.')} className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            {label}
          </label>
        </div>
      );
    }

    if (fieldType === 'textarea') {
      return (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
          <textarea
            value={value}
            onChange={(e) => updateNestedValue(fullPath, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[100px] text-sm text-gray-900 placeholder-gray-400 transition-shadow hover:border-gray-400"
            rows={4}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        </div>
      );
    }

    return (
      <div key={key} className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <input
          type={fieldType}
          value={value}
          onChange={(e) => {
            const newValue = fieldType === 'number' ? Number(e.target.value) : e.target.value;
            updateNestedValue(fullPath, newValue);
          }}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400 transition-shadow hover:border-gray-400"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      </div>
    );
  };

  // Render array field
  const renderArrayField = (key: string, array: any[], path: string[] = []) => {
    const fullPath = [...path, key];
    const label = generateLabel(key);
    const template = array.length > 0 ? array[0] : {};
    const isCollapsed = collapsedSections.has(fullPath.join('.'));

    return (
      <div key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection(fullPath.join('.'))}
              className="flex items-center space-x-3 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                {isCollapsed ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronUpIcon className="h-5 w-5" />
                )}
              </div>
              <span>{label}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {array.length} {array.length === 1 ? 'item' : 'items'}
              </span>
            </button>
            <button
              onClick={() => addArrayItem(fullPath, template)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm hover:shadow-md"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              <span>Add {label.slice(0, -1)}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-6 space-y-4 bg-gray-50">
            {array.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Bars3Icon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-4">No items yet</p>
                <button
                  onClick={() => addArrayItem(fullPath, template)}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add First Item
                </button>
              </div>
            ) : (
              array.map((item, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  {/* Item Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200 text-gray-600">
                        <Bars3Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {label.slice(0, -1)} #{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveArrayItem(fullPath, index, 'up')}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Move up"
                        >
                          <ChevronUpIcon className="h-4 w-4" />
                        </button>
                      )}
                      {index < array.length - 1 && (
                        <button
                          onClick={() => moveArrayItem(fullPath, index, 'down')}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Move down"
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeArrayItem(fullPath, index)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Content */}
                  <div className="p-4 space-y-4">
                    {renderObject(item, [...fullPath, index])}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Render object (nested fields)
  const renderObject = (obj: any, path: (string | number)[] = []): React.ReactNode => {
    return Object.entries(obj).map(([key, value]) => {
      // Skip null/undefined
      if (value === null || value === undefined) return null;

      // Array field
      if (Array.isArray(value)) {
        return renderArrayField(key, value, path.map(String));
      }

      // Nested object (not array)
      if (typeof value === 'object') {
        const pathStr = [...path.map(String), key];
        const isCollapsed = collapsedSections.has(pathStr.join('.'));
        return (
          <div key={key} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-4">
            <button
              onClick={() => toggleSection(pathStr.join('.'))}
              className="flex items-center space-x-2 text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors w-full text-left"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-600">
                {isCollapsed ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronUpIcon className="h-4 w-4" />
                )}
              </div>
              <span>{generateLabel(key)}</span>
            </button>
            {!isCollapsed && (
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-blue-200">
                {renderObject(value, [...path, key])}
              </div>
            )}
          </div>
        );
      }

      // Primitive field
      return renderField(key, value, path.map(String));
    });
  };

  return (
    <div className="space-y-6">
      {renderObject(formData)}
    </div>
  );
};
