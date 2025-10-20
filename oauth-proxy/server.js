const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Environment-based CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OAuth proxy server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Token exchange endpoint
app.post('/auth/token', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Basic validation
    if (typeof code !== 'string' || code.length < 10 || code.length > 100) {
      return res.status(400).json({ error: 'Invalid authorization code format' });
    }

    console.log('Exchanging code for access token...');

    // Exchange authorization code for access token
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'AlmostaCMS/1.0'
        },
      }
    );

    // Check for GitHub errors
    if (response.data.error) {
      console.error('GitHub OAuth error:', response.data);
      return res.status(400).json({
        error: 'Token exchange failed',
        details: response.data.error_description || response.data.error
      });
    }

    console.log('Token exchange successful');

    // Return only necessary data
    res.json({
      access_token: response.data.access_token,
      token_type: response.data.token_type || 'bearer',
      scope: response.data.scope || 'repo,workflow'
    });

  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Token exchange failed',
      message: error.response?.data?.error_description || error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 OAuth proxy server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Token exchange endpoint: http://localhost:${PORT}/auth/token`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}\n`);

  // Verify environment variables
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.warn('⚠️  WARNING: GitHub credentials not found in .env file!');
    console.warn('   Please create a .env file with:');
    console.warn('   GITHUB_CLIENT_ID=your_client_id');
    console.warn('   GITHUB_CLIENT_SECRET=your_client_secret\n');
  } else {
    console.log('✅ GitHub credentials loaded from .env\n');
  }
});
