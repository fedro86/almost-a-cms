import React from 'react';
import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

/**
 * Migration Banner Component
 *
 * Displays a banner encouraging users to migrate from centralized
 * almostacms.com admin to embedded admin in their sites.
 *
 * This is part of the transition strategy to fully decentralized architecture.
 */
export function DecentralizedMigrationBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Transitioning to Decentralized Admin
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            AlmostaCMS is moving to a fully decentralized architecture where each site has its own
            embedded admin panel. This eliminates ongoing infrastructure costs and makes your site
            completely independent.
          </p>

          <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">
              Future Admin URL:
            </h4>
            <div className="flex items-center space-x-2 text-sm">
              <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-900">
                https://username.github.io/your-site/admin
              </code>
              <ArrowRightIcon className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700 font-medium">Your Own Admin</span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm text-blue-800 font-medium">Benefits of embedded admin:</p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4">
              <li>• No dependency on almostacms.com</li>
              <li>• Works offline after first load</li>
              <li>• Faster (no external requests)</li>
              <li>• More private (direct GitHub API)</li>
              <li>• Future-proof architecture</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This centralized admin will continue to work during the
              transition period. Sites created after the next update will automatically have
              embedded admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DecentralizedMigrationBanner;
