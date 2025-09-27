import React, { useState } from 'react';
import { PlusIcon, TrashIcon, Bars3Icon, PhotoIcon } from '@heroicons/react/24/outline';

interface Service {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  avatar: string;
  name: string;
  date?: string;
  text: string;
}

interface AboutData {
  title: string;
  description: string[];
  services: {
    title: string;
    list: Service[];
  };
  testimonials: Testimonial[];
  clients: string[];
}

interface AboutFormProps {
  data: AboutData;
  onChange: (data: AboutData) => void;
}

export const AboutForm: React.FC<AboutFormProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<AboutData>(data);

  const updateFormData = (updates: Partial<AboutData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  const addDescriptionParagraph = () => {
    updateFormData({
      description: [...formData.description, '']
    });
  };

  const updateDescriptionParagraph = (index: number, value: string) => {
    const newDescription = [...formData.description];
    newDescription[index] = value;
    updateFormData({ description: newDescription });
  };

  const removeDescriptionParagraph = (index: number) => {
    const newDescription = formData.description.filter((_, i) => i !== index);
    updateFormData({ description: newDescription });
  };

  const addService = () => {
    const newService: Service = {
      icon: './assets/images/icon-design.svg',
      title: '',
      description: ''
    };
    updateFormData({
      services: {
        ...formData.services,
        list: [...formData.services.list, newService]
      }
    });
  };

  const updateService = (index: number, updates: Partial<Service>) => {
    const newServices = [...formData.services.list];
    newServices[index] = { ...newServices[index], ...updates };
    updateFormData({
      services: {
        ...formData.services,
        list: newServices
      }
    });
  };

  const removeService = (index: number) => {
    const newServices = formData.services.list.filter((_, i) => i !== index);
    updateFormData({
      services: {
        ...formData.services,
        list: newServices
      }
    });
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      avatar: './assets/images/avatar-1.png',
      name: '',
      text: ''
    };
    updateFormData({
      testimonials: [...formData.testimonials, newTestimonial]
    });
  };

  const updateTestimonial = (index: number, updates: Partial<Testimonial>) => {
    const newTestimonials = [...formData.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], ...updates };
    updateFormData({ testimonials: newTestimonials });
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = formData.testimonials.filter((_, i) => i !== index);
    updateFormData({ testimonials: newTestimonials });
  };

  const addClient = () => {
    updateFormData({
      clients: [...formData.clients, './assets/images/logo-1-color.png']
    });
  };

  const updateClient = (index: number, value: string) => {
    const newClients = [...formData.clients];
    newClients[index] = value;
    updateFormData({ clients: newClients });
  };

  const removeClient = (index: number) => {
    const newClients = formData.clients.filter((_, i) => i !== index);
    updateFormData({ clients: newClients });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="input-field"
            placeholder="About me"
          />
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Description</h3>
          <button
            onClick={addDescriptionParagraph}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Paragraph</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.description.map((paragraph, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bars3Icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Paragraph #{index + 1}</span>
                </div>
                <button
                  onClick={() => removeDescriptionParagraph(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <textarea
                value={paragraph}
                onChange={(e) => updateDescriptionParagraph(index, e.target.value)}
                className="textarea-field"
                rows={4}
                placeholder="Write about yourself..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Services</h3>
          <button
            onClick={addService}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Services Section Title
          </label>
          <input
            type="text"
            value={formData.services.title}
            onChange={(e) => updateFormData({
              services: { ...formData.services, title: e.target.value }
            })}
            className="input-field"
            placeholder="What i'm doing"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.services.list.map((service, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <PhotoIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Service #{index + 1}</span>
                </div>
                <button
                  onClick={() => removeService(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon Path
                  </label>
                  <input
                    type="text"
                    value={service.icon}
                    onChange={(e) => updateService(index, { icon: e.target.value })}
                    className="input-field"
                    placeholder="./assets/images/icon-design.svg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Title
                  </label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => updateService(index, { title: e.target.value })}
                    className="input-field"
                    placeholder="Web design"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) => updateService(index, { description: e.target.value })}
                    className="textarea-field"
                    rows={3}
                    placeholder="Describe your service..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Testimonials</h3>
          <button
            onClick={addTestimonial}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Testimonial</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bars3Icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Testimonial #{index + 1}</span>
                </div>
                <button
                  onClick={() => removeTestimonial(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar Path
                  </label>
                  <input
                    type="text"
                    value={testimonial.avatar}
                    onChange={(e) => updateTestimonial(index, { avatar: e.target.value })}
                    className="input-field"
                    placeholder="./assets/images/avatar-1.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(index, { name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {testimonial.date !== undefined && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date (optional)
                  </label>
                  <input
                    type="text"
                    value={testimonial.date || ''}
                    onChange={(e) => updateTestimonial(index, { date: e.target.value })}
                    className="input-field"
                    placeholder="2021-06-14"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Testimonial Text
                </label>
                <textarea
                  value={testimonial.text}
                  onChange={(e) => updateTestimonial(index, { text: e.target.value })}
                  className="textarea-field"
                  rows={4}
                  placeholder="Client feedback..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Logos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Client Logos</h3>
          <button
            onClick={addClient}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Logo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formData.clients.map((client, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Logo #{index + 1}</span>
                <button
                  onClick={() => removeClient(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <input
                type="text"
                value={client}
                onChange={(e) => updateClient(index, e.target.value)}
                className="input-field"
                placeholder="./assets/images/logo-1-color.png"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};