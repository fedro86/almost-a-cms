/**
 * AlmostaCMS Data Loader
 *
 * Utility for loading JSON data files and populating HTML templates.
 * Works with data attributes: data-json-source and data-json-field
 */

class AlmostaCMSDataLoader {
  constructor(options = {}) {
    this.basePath = options.basePath || '';
    this.dataPath = options.dataPath || 'data/';
    this.cache = new Map();
  }

  /**
   * Load a JSON file
   * @param {string} filename - Name of JSON file (without extension)
   * @returns {Promise<Object>} Parsed JSON data
   */
  async load(filename) {
    // Check cache first
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    try {
      const url = `${this.basePath}${this.dataPath}${filename}.json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(filename, data);
      return data;
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Load multiple JSON files
   * @param {...string} filenames - Names of JSON files to load
   * @returns {Promise<Array>} Array of parsed JSON data
   */
  async loadAll(...filenames) {
    try {
      return await Promise.all(filenames.map(f => this.load(f)));
    } catch (error) {
      console.error('Error loading multiple files:', error);
      throw error;
    }
  }

  /**
   * Get nested property from object using dot notation
   * @param {Object} obj - Source object
   * @param {string} path - Dot-separated path (e.g., "user.name.first")
   * @returns {*} Value at path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) =>
      current?.[prop], obj
    );
  }

  /**
   * Populate HTML element with data
   * @param {string|Element} selector - CSS selector or DOM element
   * @param {*} data - Data to populate
   * @param {Function} renderFn - Optional render function
   */
  populate(selector, data, renderFn) {
    const element = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!element) {
      console.warn(`Element not found: ${selector}`);
      return;
    }

    if (renderFn) {
      element.innerHTML = renderFn(data);
    } else {
      element.textContent = data;
    }
  }

  /**
   * Auto-populate elements with data-json-* attributes
   * @param {Object} dataMap - Map of source names to data objects
   */
  autoPopulate(dataMap) {
    // Find all elements with data-json-source attribute
    const elements = document.querySelectorAll('[data-json-source]');

    elements.forEach(element => {
      const source = element.getAttribute('data-json-source');
      const field = element.getAttribute('data-json-field');

      if (!source || !dataMap[source]) {
        console.warn(`Data source not found: ${source}`);
        return;
      }

      const data = dataMap[source];
      const value = field ? this.getNestedValue(data, field) : data;

      if (value === undefined || value === null) {
        console.warn(`Field not found: ${field} in ${source}`);
        return;
      }

      // Special handling for different element types
      if (element.tagName === 'IMG') {
        element.src = value;
        if (!element.alt) {
          element.alt = field?.split('.').pop() || 'Image';
        }
      } else if (element.tagName === 'A') {
        element.href = value;
        if (!element.textContent.trim()) {
          element.textContent = value;
        }
      } else {
        element.textContent = value;
      }
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlmostaCMSDataLoader;
}
