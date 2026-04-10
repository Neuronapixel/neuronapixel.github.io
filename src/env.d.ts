/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_SSL_CERT?: string;
  readonly VITE_DEV_SSL_KEY?: string;
  readonly VITE_GTM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
