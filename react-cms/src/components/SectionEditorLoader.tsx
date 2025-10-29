/**
 * SectionEditorLoader Component
 * Dynamically loads and renders section editors from the registry
 */

import React, { useState, useEffect, Suspense } from 'react';
import { getSection, isSectionRegistered } from '../sections/registry';
import { useSections } from '../hooks/useSections';

interface SectionEditorLoaderProps {
  filename: string;
  data: any;
  onSave: (data: any) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

export const SectionEditorLoader: React.FC<SectionEditorLoaderProps> = ({
  filename,
  data,
  onSave,
  onCancel,
  isLoading
}) => {
  const { sections } = useSections();
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<any> | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Find the section configuration that matches this filename
  const section = sections.find(s => s.dataFile === `${filename}.json`);

  useEffect(() => {
    async function loadEditor() {
      try {
        if (!section) {
          console.warn(`[SectionEditorLoader] No section found for file: ${filename}`);
          setEditorError(`No section registered for ${filename}`);
          return;
        }

        console.log(`[SectionEditorLoader] Loading editor for section: ${section.id}`);

        // Get section definition from registry
        const sectionDef = getSection(section.id);
        if (!sectionDef) {
          setEditorError(`Section definition not found: ${section.id}`);
          return;
        }

        // Dynamically load the editor component
        const editorModule = await sectionDef.editor();
        const Editor = editorModule.default || editorModule.GenericEditor;

        setEditorComponent(() => Editor);
        setEditorError(null);
      } catch (err: any) {
        console.error('[SectionEditorLoader] Error loading editor:', err);
        setEditorError(err.message);
      }
    }

    loadEditor();
  }, [section, filename]);

  // Header with save controls
  const FormHeader = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {section?.label || filename}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {section?.description || `Editing ${filename}`}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (editorError) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <FormHeader />
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Editor</h3>
            <p className="text-red-600 text-sm">{editorError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!EditorComponent) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <FormHeader />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading editor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <FormHeader />
      <div className="flex-1 overflow-auto p-6">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <EditorComponent
            sectionId={section?.id || filename}
            sectionName={section?.name || filename}
            dataFile={`${filename}.json`}
            onSave={onSave}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default SectionEditorLoader;
