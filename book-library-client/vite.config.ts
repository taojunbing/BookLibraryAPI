import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        //设置https时启用
        //https: {
        //    key: fs.readFileSync('./localhost-key.pem'),
        //    cert: fs.readFileSync('./localhost.pem'),
        //},
        port: 5173,
        proxy: {
            // 这里是关键！所有以 /api 开头的请求都会被转发到你的后端
            '/api': {
                target: 'http://localhost:7013',  // 你的.NET后端端口
                changeOrigin: true,
                secure: false, // 本地开发用自签名证书时必须加上
            }
        }
    }
})
