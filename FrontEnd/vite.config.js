import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load nội dung file .env (để đọc VITE_API_BASE_URL)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,            // Cần thiết để đổi host header (Bắt buộc với Pinggy/Ngrok)
          secure: false,                 // Bỏ qua lỗi chứng chỉ SSL
          // Thêm các header cần thiết để đục thủng Pinggy
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'bypass-tunnel-reminder': 'true',
            'User-Agent': 'PostmanRuntime/7.32.3' // Mẹo: Các tool hầm (tunnel) hay tự cho qua nếu biết đây là Postman
          }
        }
      }
    }
  }
})
