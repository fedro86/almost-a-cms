import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

interface JsonEditorProps {
  filename: string;
  data: any;
  onSave: (data: any) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  filename,
  data,
  onSave,
  onCancel,
  isLoading
}) => {
  const [jsonString, setJsonString] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const formatted = JSON.stringify(data, null, 2);
    setJsonString(formatted);
    setHasChanges(false);
  }, [data]);

  const validateJson = (value: string) => {
    try {
      JSON.parse(value);
      setIsValid(true);
      setError(null);
      return true;
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      return false;
    }
  };

  const handleChange = (value: string) => {
    setJsonString(value);
    setHasChanges(value !== JSON.stringify(data, null, 2));
    validateJson(value);
  };

  const handleSave = async () => {
    if (!isValid) return;

    try {
      const parsedData = JSON.parse(jsonString);
      const success = await onSave(parsedData);
      if (success) {
        setHasChanges(false);
      }
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  const handleReset = () => {
    const formatted = JSON.stringify(data, null, 2);
    setJsonString(formatted);
    setHasChanges(false);
    setIsValid(true);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Editing: {filename}.json
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Edit the JSON content below
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              disabled={!hasChanges || isLoading}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              <span>Reset</span>
            </button>

            <button
              onClick={onCancel}
              disabled={isLoading}
              className="btn-secondary flex items-center space-x-2"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Cancel</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!isValid || !hasChanges || isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckIcon className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Save & Generate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isValid
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {isValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
            </span>

            {hasChanges && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ● Unsaved changes
              </span>
            )}
          </div>

          <div className="text-gray-500">
            Lines: {jsonString.split('\n').length}
          </div>
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 p-6">
        <textarea
          value={jsonString}
          onChange={(e) => handleChange(e.target.value)}
          className={`textarea-field h-full font-mono text-sm leading-relaxed ${
            !isValid ? 'border-red-300 focus:ring-red-500' : ''
          }`}
          placeholder="Enter JSON content..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};