import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  proxy: {
    '/api': {
      target: 'https://healthconnect-w2m6.onrender.com', // Replace with your backend server URL
      changeOrigin: true,
      secure: false,
    },
  },
})