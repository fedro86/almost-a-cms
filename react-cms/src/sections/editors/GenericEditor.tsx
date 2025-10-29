/**
 * Generic Section Editor
 * Placeholder editor for sections that don't have custom editors yet
 */

import React, { useState, useEffect } from 'react';

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
  const [jsonText, setJsonText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
      setJsonText(JSON.stringify(jsonData, null, 2));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    try {
      const parsedData = JSON.parse(jsonText);
      setData(parsedData);
      setSaveStatus('saving');

      // Call parent onSave callback
      if (onSave) {
        onSave(parsedData);
      }

      // Simulate save
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);

    } catch (err: any) {
      setSaveStatus('error');
      setError('Invalid JSON: ' + err.message);
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
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{sectionName}</h2>
        <p className="text-sm text-gray-600 mt-1">Edit {dataFile}</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          ⚠️ This is a temporary JSON editor. A custom visual editor will be created for this section.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          JSON Data
        </label>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          spellCheck={false}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={loadData}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Reset
        </button>

        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`px-6 py-2 rounded-lg font-medium ${
            saveStatus === 'saved'
              ? 'bg-green-600 text-white'
              : saveStatus === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && '✓ Saved'}
          {saveStatus === 'error' && '✗ Error'}
          {saveStatus === 'idle' && 'Save Changes'}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview Data</h3>
        <pre className="text-xs text-gray-600 overflow-auto max-h-48">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default GenericEditor;
