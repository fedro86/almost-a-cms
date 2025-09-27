import React, { useState } from 'react';
import { PlusIcon, TrashIcon, Bars3Icon, DocumentTextIcon, PhotoIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface BlogPost {
  image: {
    src: string;
    alt: string;
  };
  category: string;
  date: string;
  title: string;
  text: string;
}

interface BlogData {
  title: string;
  posts: BlogPost[];
}

interface BlogFormProps {
  data: BlogData;
  onChange: (data: BlogData) => void;
}

export const BlogForm: React.FC<BlogFormProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<BlogData>(data);

  const updateFormData = (updates: Partial<BlogData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  // Get unique categories from existing posts
  const getCategories = () => {
    const categories = Array.from(new Set(formData.posts.map(post => post.category)));
    return categories.length > 0 ? categories : ['Design', 'Development', 'General'];
  };

  // Post management
  const addPost = () => {
    const newPost: BlogPost = {
      image: {
        src: './assets/images/blog-1.jpg',
        alt: ''
      },
      category: 'Design',
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      title: '',
      text: ''
    };

    updateFormData({
      posts: [...formData.posts, newPost]
    });
  };

  const updatePost = (index: number, updates: Partial<BlogPost>) => {
    const newPosts = [...formData.posts];
    newPosts[index] = { ...newPosts[index], ...updates };
    updateFormData({ posts: newPosts });
  };

  const updatePostImage = (index: number, imageUpdates: Partial<BlogPost['image']>) => {
    const newPosts = [...formData.posts];
    newPosts[index] = {
      ...newPosts[index],
      image: { ...newPosts[index].image, ...imageUpdates }
    };
    updateFormData({ posts: newPosts });
  };

  const removePost = (index: number) => {
    const newPosts = formData.posts.filter((_, i) => i !== index);
    updateFormData({ posts: newPosts });
  };

  const duplicatePost = (index: number) => {
    const postToDuplicate = { ...formData.posts[index] };
    postToDuplicate.title = `${postToDuplicate.title} (Copy)`;
    const newPosts = [...formData.posts];
    newPosts.splice(index + 1, 0, postToDuplicate);
    updateFormData({ posts: newPosts });
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="input-field"
            placeholder="Blog"
          />
        </div>
      </div>

      {/* Blog Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Posts</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formData.posts.length}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Categories</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{getCategories().length}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Latest Post</span>
          </div>
          <p className="text-sm font-medium text-purple-600 mt-1">
            {formData.posts.length > 0 ? formatDate(formData.posts[0].date) : 'No posts'}
          </p>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5" />
            <span>Blog Posts</span>
          </h3>
          <button
            onClick={addPost}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Post</span>
          </button>
        </div>

        {formData.posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blog posts</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first blog post.</p>
            <div className="mt-6">
              <button
                onClick={addPost}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add First Post</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {formData.posts.map((post, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Bars3Icon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Post #{index + 1}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {post.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => duplicatePost(index)}
                      className="text-blue-500 hover:text-blue-700 transition-colors text-sm"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => removePost(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Post Content */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Post Title
                      </label>
                      <input
                        type="text"
                        value={post.title}
                        onChange={(e) => updatePost(index, { title: e.target.value })}
                        className="input-field"
                        placeholder="Enter post title..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={post.category}
                          onChange={(e) => updatePost(index, { category: e.target.value })}
                          className="input-field"
                        >
                          {getCategories().map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Publication Date
                        </label>
                        <input
                          type="date"
                          value={post.date}
                          onChange={(e) => updatePost(index, { date: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Post Excerpt
                      </label>
                      <textarea
                        value={post.text}
                        onChange={(e) => updatePost(index, { text: e.target.value })}
                        className="textarea-field"
                        rows={4}
                        placeholder="Write a brief excerpt or summary of your post..."
                      />
                    </div>
                  </div>

                  {/* Right Column - Image Settings & Preview */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                        <PhotoIcon className="h-4 w-4" />
                        <span>Featured Image</span>
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Image Source
                          </label>
                          <input
                            type="text"
                            value={post.image.src}
                            onChange={(e) => updatePostImage(index, { src: e.target.value })}
                            className="input-field text-sm"
                            placeholder="./assets/images/blog-1.jpg"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={post.image.alt}
                            onChange={(e) => updatePostImage(index, { alt: e.target.value })}
                            className="input-field text-sm"
                            placeholder="Descriptive alt text"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Post Preview */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900 text-sm">
                          {post.title || 'Untitled Post'}
                        </h5>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                          <span>•</span>
                          <span>{formatDate(post.date)}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {post.text || 'No excerpt provided...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Management */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories Used</h3>
        <div className="flex flex-wrap gap-2">
          {getCategories().map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {category}
              <span className="ml-2 text-xs bg-blue-200 px-1 rounded">
                {formData.posts.filter(post => post.category === category).length}
              </span>
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Categories are automatically created when you assign them to posts. You can type new category names in the category dropdown.
        </p>
      </div>
    </div>
  );
};