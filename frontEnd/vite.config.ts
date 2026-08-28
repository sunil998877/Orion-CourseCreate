import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        dedupe: ['react', 'react-dom'],
    },
    server: {
        allowedHosts: true,
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'recharts'],
        exclude: ['lucide-react'],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const normalized = id.replace(/\\/g, '/');
                    if (!normalized.includes('node_modules'))
                        return;
                    if (normalized.includes('/@lottiefiles/'))
                        return 'lottie';
                    if (normalized.includes('/three/'))
                        return 'three';
                    if (normalized.includes('/framer-motion/'))
                        return 'motion';
                },
            },
        },
    },
});
