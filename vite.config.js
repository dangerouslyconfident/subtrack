import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Preparing the alchemy circle for Vite to summon our web app
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // Forging the Progressive Web App so it haunts the user's home screen natively
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: true },
      manifest: {
        name: 'SubTrack Spatial',
        short_name: 'SubTrack',
        description: 'Premium Spatial Bento Subscription Tracking Protocol',
        theme_color: '#050508',
        background_color: '#050508',
        display: 'standalone',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%236366f1"/><text x="50" y="65" font-family="sans-serif" font-size="50" font-weight="900" fill="white" text-anchor="middle">S</text></svg>',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%236366f1"/><text x="50" y="65" font-family="sans-serif" font-size="50" font-weight="900" fill="white" text-anchor="middle">S</text></svg>',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
});
