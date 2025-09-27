import React, { useState } from 'react';
import { PlusIcon, TrashIcon, Bars3Icon, MapPinIcon, EnvelopeIcon, CogIcon } from '@heroicons/react/24/outline';

interface FormField {
  type: string;
  name: string;
  placeholder: string;
  required: boolean;
}

interface FormButton {
  type: string;
  icon: string;
  text: string;
  disabled: boolean;
}

interface ContactData {
  title: string;
  map: {
    src: string;
    width: number;
    height: number;
  };
  form: {
    title: string;
    action: string;
    fields: FormField[];
    button: FormButton;
  };
}

interface ContactFormProps {
  data: ContactData;
  onChange: (data: ContactData) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<ContactData>(data);

  const updateFormData = (updates: Partial<ContactData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  const updateMap = (updates: Partial<ContactData['map']>) => {
    updateFormData({
      map: { ...formData.map, ...updates }
    });
  };

  const updateContactForm = (updates: Partial<ContactData['form']>) => {
    updateFormData({
      form: { ...formData.form, ...updates }
    });
  };

  const updateFormButton = (updates: Partial<FormButton>) => {
    updateContactForm({
      button: { ...formData.form.button, ...updates }
    });
  };

  // Form field management
  const addFormField = () => {
    const newField: FormField = {
      type: 'text',
      name: '',
      placeholder: '',
      required: false
    };

    updateContactForm({
      fields: [...formData.form.fields, newField]
    });
  };

  const updateFormField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...formData.form.fields];
    newFields[index] = { ...newFields[index], ...updates };

    updateContactForm({ fields: newFields });
  };

  const removeFormField = (index: number) => {
    const newFields = formData.form.fields.filter((_, i) => i !== index);
    updateContactForm({ fields: newFields });
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'number', label: 'Number' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Page Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Page Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="input-field"
            placeholder="Contact"
          />
        </div>
      </div>

      {/* Map Section */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <MapPinIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">Map Embed</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps Embed URL
            </label>
            <textarea
              value={formData.map.src}
              onChange={(e) => updateMap({ src: e.target.value })}
              className="textarea-field"
              rows={3}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this URL from Google Maps → Share → Embed a map → Copy HTML → Extract the src URL
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Map Width (px)
              </label>
              <input
                type="number"
                value={formData.map.width}
                onChange={(e) => updateMap({ width: Number(e.target.value) })}
                className="input-field"
                placeholder="400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Map Height (px)
              </label>
              <input
                type="number"
                value={formData.map.height}
                onChange={(e) => updateMap({ height: Number(e.target.value) })}
                className="input-field"
                placeholder="300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <EnvelopeIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">Contact Form</h3>
        </div>

        <div className="space-y-6">
          {/* Form Basic Settings */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Form Settings</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form Title
                </label>
                <input
                  type="text"
                  value={formData.form.title}
                  onChange={(e) => updateContactForm({ title: e.target.value })}
                  className="input-field"
                  placeholder="Contact Form"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form Action URL
                </label>
                <input
                  type="text"
                  value={formData.form.action}
                  onChange={(e) => updateContactForm({ action: e.target.value })}
                  className="input-field"
                  placeholder="#"
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Form Fields</h4>
              <button
                onClick={addFormField}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Field</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.form.fields.map((field, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Bars3Icon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Field #{index + 1}</span>
                      {field.required && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Required
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFormField(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => updateFormField(index, { type: e.target.value })}
                        className="input-field"
                      >
                        {fieldTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateFormField(index, { name: e.target.value })}
                        className="input-field"
                        placeholder="fieldname"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) => updateFormField(index, { placeholder: e.target.value })}
                      className="input-field"
                      placeholder="Enter placeholder text..."
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`field-required-${index}`}
                      checked={field.required}
                      onChange={(e) => updateFormField(index, { required: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`field-required-${index}`} className="text-sm font-medium text-gray-700">
                      Required field
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button Settings */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <CogIcon className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">Submit Button</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.form.button.text}
                  onChange={(e) => updateFormButton({ text: e.target.value })}
                  className="input-field"
                  placeholder="Send Message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon Name
                </label>
                <input
                  type="text"
                  value={formData.form.button.icon}
                  onChange={(e) => updateFormButton({ icon: e.target.value })}
                  className="input-field"
                  placeholder="paper-plane"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Type
                </label>
                <select
                  value={formData.form.button.type}
                  onChange={(e) => updateFormButton({ type: e.target.value })}
                  className="input-field"
                >
                  <option value="submit">Submit</option>
                  <option value="button">Button</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <input
                type="checkbox"
                id="button-disabled"
                checked={formData.form.button.disabled}
                onChange={(e) => updateFormButton({ disabled: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="button-disabled" className="text-sm font-medium text-gray-700">
                Button disabled by default
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Preview</h3>

        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md">
          <h4 className="text-lg font-medium text-gray-900 mb-4">{formData.form.title}</h4>

          <div className="space-y-4">
            {formData.form.fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.placeholder}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder={field.placeholder}
                    disabled
                  />
                ) : (
                  <input
                    type={field.type}
                    className="input-field"
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
              </div>
            ))}

            <button
              disabled={formData.form.button.disabled}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                formData.form.button.disabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {formData.form.button.text}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};