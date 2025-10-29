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
        <div key={key} className="flex items-center space-x-3">
          <input
            type="checkbox"
            id={fullPath.join('.')}
            checked={value}
            onChange={(e) => updateNestedValue(fullPath, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={fullPath.join('.')} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        </div>
      );
    }

    if (fieldType === 'textarea') {
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <textarea
            value={value}
            onChange={(e) => updateNestedValue(fullPath, e.target.value)}
            className="textarea-field"
            rows={4}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        </div>
      );
    }

    return (
      <div key={key}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type={fieldType}
          value={value}
          onChange={(e) => {
            const newValue = fieldType === 'number' ? Number(e.target.value) : e.target.value;
            updateNestedValue(fullPath, newValue);
          }}
          className="input-field"
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
      <div key={key} className="card">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => toggleSection(fullPath.join('.'))}
            className="flex items-center space-x-2 text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span>{label}</span>
            {isCollapsed ? (
              <ChevronDownIcon className="h-5 w-5" />
            ) : (
              <ChevronUpIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-normal text-gray-500">({array.length} items)</span>
          </button>
          <button
            onClick={() => addArrayItem(fullPath, template)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add {label.slice(0, -1)}</span>
          </button>
        </div>

        {!isCollapsed && (
          <div className="space-y-4">
            {array.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Bars3Icon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">
                      {label.slice(0, -1)} #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveArrayItem(fullPath, index, 'up')}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Move up"
                      >
                        <ChevronUpIcon className="h-4 w-4" />
                      </button>
                    )}
                    {index < array.length - 1 && (
                      <button
                        onClick={() => moveArrayItem(fullPath, index, 'down')}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Move down"
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeArrayItem(fullPath, index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {renderObject(item, [...fullPath, index])}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render object (nested fields)
  const renderObject = (obj: any, path: string[] = []): React.ReactNode => {
    return Object.entries(obj).map(([key, value]) => {
      // Skip null/undefined
      if (value === null || value === undefined) return null;

      // Array field
      if (Array.isArray(value)) {
        return renderArrayField(key, value, path);
      }

      // Nested object (not array)
      if (typeof value === 'object') {
        const isCollapsed = collapsedSections.has([...path, key].join('.'));
        return (
          <div key={key} className="card">
            <button
              onClick={() => toggleSection([...path, key].join('.'))}
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors w-full text-left mb-4"
            >
              <span>{generateLabel(key)}</span>
              {isCollapsed ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronUpIcon className="h-5 w-5" />
              )}
            </button>
            {!isCollapsed && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                {renderObject(value, [...path, key])}
              </div>
            )}
          </div>
        );
      }

      // Primitive field
      return renderField(key, value, path);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {renderObject(formData)}
    </div>
  );
};
