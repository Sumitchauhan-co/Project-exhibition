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
						if (
							id.includes('react') ||
							id.includes('react-dom') ||
							id.includes('react-router')
						) {
							return 'vendor-core';
						}
						if (id.includes('framer-motion')) {
							return 'vendor-motion';
						}
						if (id.includes('lucide-react')) {
							return 'vendor-icons';
						}
						return 'vendor';
					}
				},
			},
		},
	},
});
