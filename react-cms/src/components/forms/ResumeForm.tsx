import React, { useState } from 'react';
import { PlusIcon, TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface TimelineItem {
  title: string;
  period: string;
  description: string;
}

interface Skill {
  name: string;
  percentage: string;
}

interface ResumeData {
  title: string;
  education: {
    title: string;
    icon: string;
    timeline: TimelineItem[];
  };
  experience: {
    title: string;
    icon: string;
    timeline: TimelineItem[];
  };
  skills: {
    title: string;
    list: Skill[];
  };
}

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<ResumeData>(data);

  const updateFormData = (updates: Partial<ResumeData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  const addTimelineItem = (section: 'education' | 'experience') => {
    const newItem: TimelineItem = {
      title: '',
      period: '',
      description: ''
    };

    updateFormData({
      [section]: {
        ...formData[section],
        timeline: [...formData[section].timeline, newItem]
      }
    });
  };

  const updateTimelineItem = (section: 'education' | 'experience', index: number, updates: Partial<TimelineItem>) => {
    const newTimeline = [...formData[section].timeline];
    newTimeline[index] = { ...newTimeline[index], ...updates };

    updateFormData({
      [section]: {
        ...formData[section],
        timeline: newTimeline
      }
    });
  };

  const removeTimelineItem = (section: 'education' | 'experience', index: number) => {
    const newTimeline = formData[section].timeline.filter((_, i) => i !== index);

    updateFormData({
      [section]: {
        ...formData[section],
        timeline: newTimeline
      }
    });
  };

  const addSkill = () => {
    const newSkill: Skill = { name: '', percentage: '0' };
    updateFormData({
      skills: {
        ...formData.skills,
        list: [...formData.skills.list, newSkill]
      }
    });
  };

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const newSkills = [...formData.skills.list];
    newSkills[index] = { ...newSkills[index], ...updates };

    updateFormData({
      skills: {
        ...formData.skills,
        list: newSkills
      }
    });
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.skills.list.filter((_, i) => i !== index);
    updateFormData({
      skills: {
        ...formData.skills,
        list: newSkills
      }
    });
  };

  const TimelineSection = ({ title, section }: { title: string; section: 'education' | 'experience' }) => (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <button
          onClick={() => addTimelineItem(section)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add {title.slice(0, -1)}</span>
        </button>
      </div>

      <div className="space-y-4">
        {formData[section].timeline.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bars3Icon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
              </div>
              <button
                onClick={() => removeTimelineItem(section, index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateTimelineItem(section, index, { title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Creative Director"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <input
                  type="text"
                  value={item.period}
                  onChange={(e) => updateTimelineItem(section, index, { period: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 2015 — Present"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={item.description}
                onChange={(e) => updateTimelineItem(section, index, { description: e.target.value })}
                className="textarea-field"
                rows={3}
                placeholder="Describe your role and achievements..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Page Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="input-field"
            placeholder="Resume"
          />
        </div>
      </div>

      {/* Education Section */}
      <TimelineSection title="Education" section="education" />

      {/* Experience Section */}
      <TimelineSection title="Experience" section="experience" />

      {/* Skills Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Skills</h3>
          <button
            onClick={addSkill}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={formData.skills.title}
            onChange={(e) => updateFormData({
              skills: { ...formData.skills, title: e.target.value }
            })}
            className="input-field"
            placeholder="My skills"
          />
        </div>

        <div className="space-y-3">
          {formData.skills.list.map((skill, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bars3Icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Skill #{index + 1}</span>
                </div>
                <button
                  onClick={() => removeSkill(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(index, { name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Web Design"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proficiency (%)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.percentage}
                      onChange={(e) => updateSkill(index, { percentage: e.target.value })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-primary-600">
                      {skill.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};