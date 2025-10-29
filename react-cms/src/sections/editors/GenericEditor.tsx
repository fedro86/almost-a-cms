/**
 * Generic Section Editor
 * Visual editor that automatically generates forms from JSON structure
 */

import React, { useState, useEffect } from 'react';
import { DynamicFormEditor } from '../../components/DynamicFormEditor';

interface GenericEditorProps {
  sectionId: string;
  sectionName: string;
  dataFile: string;
  onSave?: (data: any) => void;
}

export function GenericEditor({ sectionId, sectionName, dataFile, onSave }: GenericEditorProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, [dataFile]);

  async function loadData() {
    try {
      setLoading(true);
      const response = await fetch(`/data/${dataFile}`);

      if (!response.ok) {
        throw new Error(`Failed to load ${dataFile}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(newData: any) {
    setData(newData);
    setHasUnsavedChanges(true);
    setError(null);
  }

  function handleSave() {
    try {
      setSaveStatus('saving');

      // Call parent onSave callback
      if (onSave) {
        onSave(data);
      }

      // Simulate save
      setTimeout(() => {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);

    } catch (err: any) {
      setSaveStatus('error');
      setError('Failed to save: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading {sectionName}...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading {sectionName}</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Save Button */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{sectionName}</h2>
            <p className="text-sm text-gray-600 mt-1">Edit {dataFile}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving' || !hasUnsavedChanges}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                saveStatus === 'saved'
                  ? 'bg-green-600 text-white'
                  : saveStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : hasUnsavedChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && '✓ Saved'}
              {saveStatus === 'error' && '✗ Error'}
              {saveStatus === 'idle' && (hasUnsavedChanges ? 'Save Changes' : 'No Changes')}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Dynamic Form Editor */}
      {data && (
        <DynamicFormEditor
          data={data}
          onChange={handleChange}
          title={sectionName}
        />
      )}
    </div>
  );
}

export default GenericEditor;
