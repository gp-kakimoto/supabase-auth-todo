/// <reference types="vitest" />

import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  resolve:{
    alias:{
      "@": path.resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
  test: {
    globals: true,
   /* env: {
      NEXT_PUBLIC_SUPABASE_URL:  'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-test-key',
    },*/
    environment: 'happy-dom',
    setupFiles: ['./vitest-setup.ts'],
  },
})
