import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('recharts') || id.includes('d3-')) return 'charts';
          if (id.includes('@lottiefiles')) return 'lottie';
          if (id.includes('three')) return 'three';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
