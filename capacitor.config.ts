import type { CapacitorConfig } from '@capacitor/cli';

// Casca nativa (Capacitor). Carrega o app já hospedado no Vercel dentro da
// WebView nativa; os recursos nativos (push, Apple Health) entram por plugins.
const config: CapacitorConfig = {
  appId: 'com.treinapro.app',
  appName: 'TreinaPro',
  webDir: 'native-www',
  server: {
    url: 'https://treinapro-gamma.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
