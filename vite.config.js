// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { fileURLToPath } from 'url'
// import path from 'path'

// const __dirname = path.dirname(fileURLToPath(import.meta.url))

// export default defineConfig({
//   plugins: [react()],
  
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//   },

//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // 1. Import basic-ssl
import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  plugins: [
    react(), 
    basicSsl() // 2. Add to plugins array
  ],
  
  server: {
    host: '0.0.0.0',
    port: 5173,

  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
