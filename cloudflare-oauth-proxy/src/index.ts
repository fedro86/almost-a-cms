export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ALLOWED_ORIGINS: string; // Comma-separated: "https://yourdomain.com,https://www.yourdomain.com"
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // Parse allowed origins
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());

    // CORS headers (dynamic based on origin)
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // Only add origin if it's allowed
    if (allowedOrigins.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Health check endpoint
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'OAuth proxy is running',
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
        }
      );
    }

    // Token exchange endpoint
    if (request.method === 'POST' && url.pathname === '/auth/token') {
      try {
        // Validate origin
        if (!allowedOrigins.includes(origin)) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized origin' }),
            {
              status: 403,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Parse request body
        const body = await request.json() as { code?: string };
        const { code } = body;

        if (!code || typeof code !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Authorization code is required' }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Validate code format (basic sanity check)
        if (code.length < 10 || code.length > 100) {
          return new Response(
            JSON.stringify({ error: 'Invalid authorization code format' }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Exchange code for token with GitHub
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'AlmostaCMS/1.0',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`GitHub API error: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json() as any;

        // Check for errors from GitHub
        if (tokenData.error) {
          return new Response(
            JSON.stringify({
              error: 'Token exchange failed',
              details: tokenData.error_description || tokenData.error
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Return access token
        return new Response(
          JSON.stringify({
            access_token: tokenData.access_token,
            token_type: tokenData.token_type || 'bearer',
            scope: tokenData.scope || 'repo,workflow'
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
          }
        );

      } catch (error) {
        console.error('Token exchange error:', error);

        return new Response(
          JSON.stringify({
            error: 'Token exchange failed',
            message: error instanceof Error ? error.message : 'Unknown error'
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  },
};
