import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				client: '/client/gameClientNative.ts'
			},
			output: {
				format: 'iife',
				dir: 'dist-native'
			}
		},
	},
	server: {
		// vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
		port: 3000
	},
	plugins: [],
	optimizeDeps: {

	},
});