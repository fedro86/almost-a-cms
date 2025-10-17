const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Enable CORS for local development
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OAuth proxy server is running' });
});

// Token exchange endpoint
app.post('/auth/token', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
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
          'Content-Type': 'application/json'
        },
      }
    );

    console.log('Token exchange successful');

    // Return the token data to the frontend
    res.json(response.data);

  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Token exchange failed',
      details: error.response?.data || error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 OAuth proxy server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Token exchange endpoint: http://localhost:${PORT}/auth/token\n`);

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
