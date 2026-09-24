import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
		},
	},
	build: {
		chunkSizeWarningLimit: 600,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						// Core React runtime dependencies
						if (
							id.includes('react/') ||
							id.includes('react-dom/') ||
							id.includes('react-router')
						) {
							return 'vendor-core';
						}
						// Heavy animation library
						if (id.includes('framer-motion')) {
							return 'vendor-motion';
						}
						// Charting libraries
						if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
							return 'vendor-charts';
						}
						// Icon library
						if (id.includes('lucide-react')) {
							return 'vendor-icons';
						}
						// UI Utilities (Radix, clsx, tailwind-merge, etc.)
						if (
							id.includes('@radix-ui') ||
							id.includes('clsx') ||
							id.includes('tailwind-merge')
						) {
							return 'vendor-ui';
						}
						// Fallback for all other third-party npm packages
						return 'vendor-misc';
					}
				},
			},
		},
	},
});
