import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGitHub } from '../../hooks/useGitHub';
import { useRepo } from '../../hooks/useRepo';
import { GITHUB_CONFIG } from '../../config/github';

/**
 * FirstTimeSetup Component
 *
 * Wizard for creating a new portfolio repository from template
 */
export function FirstTimeSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createRepo, enablePages, loading, error: githubError } = useGitHub();
  const { selectRepo } = useRepo();

  const [step, setStep] = useState<'name' | 'creating' | 'enabling-pages' | 'complete'>('name');
  const [repoName, setRepoName] = useState('my-portfolio');
  const [description, setDescription] = useState('My personal portfolio website');
  const [error, setError] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [pagesUrl, setPagesUrl] = useState<string | null>(null);

  /**
   * Handle repository creation
   */
  const handleCreate = async () => {
    if (!user) return;

    setError(null);
    setStep('creating');

    try {
      // Create repository from template
      const result = await createRepo(
        GITHUB_CONFIG.templateOwner,
        GITHUB_CONFIG.templateRepo,
        repoName,
        description
      );

      if (!result) {
        throw new Error(githubError || 'Failed to create repository');
      }

      setRepoUrl(result.url);

      // Wait a moment for GitHub to process the repo creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Enable GitHub Pages
      setStep('enabling-pages');

      const pagesResult = await enablePages(user.login, repoName);

      if (pagesResult && pagesResult.url) {
        setPagesUrl(pagesResult.url);
      }

      // Store active repo
      selectRepo({
        owner: user.login,
        name: repoName,
        fullName: result.fullName,
        url: result.url,
        hasPages: !!pagesResult,
        pagesUrl: pagesResult?.url,
      });

      setStep('complete');

    } catch (err: any) {
      setError(err.message || 'Failed to set up portfolio');
      setStep('name');
    }
  };

  /**
   * Handle finish - navigate to dashboard
   */
  const handleFinish = () => {
    navigate('/dashboard');
  };

  /**
   * Validate repository name
   */
  const isValidRepoName = (name: string): boolean => {
    return /^[a-zA-Z0-9._-]+$/.test(name) && name.length > 0 && name.length <= 100;
  };

  const canCreate = isValidRepoName(repoName) && !loading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Your Portfolio
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your personal portfolio website in a few simple steps
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Step: Repository Name */}
          {step === 'name' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Choose a Repository Name
                </h2>
                <p className="text-gray-600 mb-6">
                  This will create a new repository in your GitHub account with the vCard portfolio template.
                </p>
              </div>

              <div>
                <label htmlFor="repoName" className="block text-sm font-medium text-gray-700 mb-2">
                  Repository Name
                </label>
                <input
                  type="text"
                  id="repoName"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="my-portfolio"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Repository URL: github.com/{user?.login}/{repoName}
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My personal portfolio website"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!canCreate}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Portfolio
                </button>
              </div>
            </div>
          )}

          {/* Step: Creating Repository */}
          {step === 'creating' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Creating Repository...
              </h2>
              <p className="text-gray-600">
                Setting up your portfolio repository from template
              </p>
            </div>
          )}

          {/* Step: Enabling GitHub Pages */}
          {step === 'enabling-pages' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Enabling GitHub Pages...
              </h2>
              <p className="text-gray-600">
                Configuring your live website
              </p>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Portfolio Created Successfully!
              </h2>
              <p className="text-gray-600 mb-8">
                Your portfolio is ready. You can now edit content and customize your site.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Repository Created</p>
                      <a href={repoUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {repoUrl}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">GitHub Pages Enabled</p>
                      {pagesUrl && (
                        <a href={pagesUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          {pagesUrl}
                        </a>
                      )}
                      {!pagesUrl && (
                        <p className="text-sm text-gray-500">Your site will be live shortly at {user?.login}.github.io/{repoName}</p>
                      )}
                    </div>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleFinish}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        {step === 'name' && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">What will be created:</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                A new GitHub repository in your account
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                vCard portfolio template (HTML, CSS, JS)
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Content data files (JSON format)
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                GitHub Pages enabled (live website)
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Automatic deployment workflow
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FirstTimeSetup;
