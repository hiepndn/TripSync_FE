import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            // Tự động update service worker khi có version mới
            devOptions: {
                enabled: true, // Bật PWA trong dev để test
            },
            workbox: {
                // Cache chiến lược cho từng loại tài nguyên
                runtimeCaching: [
                    {
                        // Cache API calls — dùng NetworkFirst: thử mạng trước, fallback cache
                        urlPattern: /^https?:\/\/localhost:8080\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'tripsync-api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 ngày
                            },
                            networkTimeoutSeconds: 5, // Timeout 5s → fallback cache
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        // Cache Supabase Storage (tài liệu, ảnh) — CacheFirst vì file không đổi
                        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'tripsync-storage-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 ngày
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        // Cache Google Fonts và static assets
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 năm
                            },
                        },
                    },
                ],
                // Pre-cache toàn bộ app shell (JS, CSS, HTML)
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            },
            manifest: {
                name: 'TripSync',
                short_name: 'TripSync',
                description: 'Lên kế hoạch du lịch nhóm thông minh',
                theme_color: '#19e66b',
                background_color: '#f0fdf4',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/fly_logo_web.png',
                        sizes: '192x192',
                        type: 'image/jpeg',
                        purpose: 'any',
                    },
                    {
                        src: '/fly_logo_web.png',
                        sizes: '512x512',
                        type: 'image/jpeg',
                        purpose: 'any',
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@features': path.resolve(__dirname, './src/features'),
            '@components': path.resolve(__dirname, './src/components'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@config': path.resolve(__dirname, './src/config'),
            '@types': path.resolve(__dirname, './src/types'),
        },
    },
    server: {
        port: 3000,
    },
});
