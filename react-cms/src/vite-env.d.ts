/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_CLIENT_ID: string;
  readonly VITE_APP_URL: string;
  readonly VITE_TEMPLATE_OWNER: string;
  readonly VITE_TEMPLATE_REPO: string;
  // Legacy OAuth (deprecated)
  readonly VITE_OAUTH_REDIRECT_URI?: string;
  readonly VITE_OAUTH_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
