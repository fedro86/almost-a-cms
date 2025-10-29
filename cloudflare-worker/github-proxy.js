/**
 * Cloudflare Worker - GitHub Device Flow CORS Proxy
 *
 * This tiny serverless function proxies GitHub Device Flow API calls
 * to add CORS headers, enabling browser-based authentication.
 *
 * Deploy to Cloudflare Workers (free tier):
 * 1. Go to https://workers.cloudflare.com/
 * 2. Create new worker
 * 3. Paste this code
 * 4. Deploy
 * 5. Copy the worker URL and set VITE_GITHUB_PROXY_URL in .env
 *
 * Cost: $0 (free tier: 100,000 requests/day)
 */

export default {
  async fetch(request) {
    // Only allow POST requests
    if (request.method !== 'POST' && request.method !== 'OPTIONS') {
      return new Response('Method not allowed', {
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // Get request body
      const body = await request.text();
      const data = JSON.parse(body);

      // Determine which GitHub endpoint to call
      let githubUrl;
      if (data.endpoint === 'device_code') {
        githubUrl = 'https://github.com/login/device/code';
      } else if (data.endpoint === 'access_token') {
        githubUrl = 'https://github.com/login/oauth/access_token';
      } else {
        return new Response('Invalid endpoint', {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // Proxy request to GitHub
      const githubResponse = await fetch(githubUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.params),
      });

      const githubData = await githubResponse.text();

      // Return with CORS headers
      return new Response(githubData, {
        status: githubResponse.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }
  },
};
