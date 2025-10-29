/**
 * useSections Hook
 *
 * Auto-discovers and loads template sections based on .almostacms.json configuration
 * Returns list of available sections with their metadata and editor components
 */

import { useState, useEffect } from 'react';
import { SECTION_REGISTRY, SectionDefinition, getSection, isSectionRegistered } from '../sections/registry';

export interface TemplateSection {
  id: string;
  dataFile: string;
  order: number;
  required: boolean;
  label?: string;
  hidden?: boolean;
}

export interface LoadedSection extends TemplateSection {
  name: string;
  icon: string;
  category: string;
  description: string;
  editor: () => Promise<any>;
}

export interface UseSectionsResult {
  sections: LoadedSection[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useSections(): UseSectionsResult {
  const [sections, setSections] = useState<LoadedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSections() {
    try {
      setLoading(true);
      setError(null);

      console.log('[useSections] Loading template configuration...');

      // 1. Load .almostacms.json configuration
      // Try multiple paths: root first, then relative to base
      let configResponse;
      let config;

      try {
        // First try: root of the site (works in production)
        configResponse = await fetch('/.almostacms.json');
        if (configResponse.ok) {
          config = await configResponse.json();
          console.log('[useSections] Configuration loaded from root:', config);
        }
      } catch (e) {
        console.log('[useSections] Failed to load from root, trying alternative paths...');
      }

      // Second try: relative to current location (works in dev mode when embedded)
      if (!config) {
        try {
          const basePath = import.meta.env.BASE_URL || '/';
          const configPath = basePath === '/' ? '/.almostacms.json' : `${basePath}../.almostacms.json`;
          console.log('[useSections] Trying path:', configPath);
          configResponse = await fetch(configPath);
          if (configResponse.ok) {
            config = await configResponse.json();
            console.log('[useSections] Configuration loaded from:', configPath);
          }
        } catch (e) {
          console.error('[useSections] Failed to load from base path');
        }
      }

      if (!config) {
        throw new Error('Failed to load .almostacms.json configuration from any location');
      }

      // 2. Check if sections array exists
      if (!config.sections || !Array.isArray(config.sections)) {
        console.warn('[useSections] No sections array found in configuration');
        setSections([]);
        setLoading(false);
        return;
      }

      // 3. Build section list from configuration
      const loadedSections: LoadedSection[] = [];

      for (const sectionConfig of config.sections) {
        // Skip hidden sections
        if (sectionConfig.hidden) {
          console.log(`[useSections] Skipping hidden section: ${sectionConfig.id}`);
          continue;
        }

        // Check if section is registered
        if (!isSectionRegistered(sectionConfig.id)) {
          console.warn(`[useSections] Unknown section type: ${sectionConfig.id} - Skipping`);
          continue;
        }

        // Get section definition from registry
        const sectionDef = getSection(sectionConfig.id);
        if (!sectionDef) {
          continue;
        }

        // Combine config with registry definition
        const loadedSection: LoadedSection = {
          ...sectionConfig,
          name: sectionDef.name,
          icon: sectionDef.icon,
          category: sectionDef.category,
          description: sectionDef.description,
          editor: sectionDef.editor,
          label: sectionConfig.label || sectionDef.name,
        };

        loadedSections.push(loadedSection);
        console.log(`[useSections] Loaded section: ${loadedSection.id} (${loadedSection.label})`);
      }

      // 4. Sort by order
      loadedSections.sort((a, b) => a.order - b.order);

      // 5. Validate required sections have data files
      for (const section of loadedSections) {
        if (section.required) {
          try {
            const dataPath = `/data/${section.dataFile}`;
            console.log(`[useSections] Checking required section data: ${dataPath}`);

            const dataResponse = await fetch(dataPath);

            if (!dataResponse.ok) {
              console.error(`[useSections] Required section missing data: ${section.id} (${dataPath})`);
              // Don't throw error, just warn - data file might not exist in dev yet
            } else {
              console.log(`[useSections] ✓ Required section data exists: ${section.id}`);
            }
          } catch (err) {
            console.error(`[useSections] Error checking ${section.dataFile}:`, err);
          }
        }
      }

      console.log(`[useSections] Successfully loaded ${loadedSections.length} sections`);
      setSections(loadedSections);

    } catch (err: any) {
      console.error('[useSections] Error loading sections:', err);
      setError(err.message || 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSections();
  }, []);

  return {
    sections,
    loading,
    error,
    reload: loadSections
  };
}
