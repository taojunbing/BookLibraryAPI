import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        //����httpsʱ����
        //https: {
        //    key: fs.readFileSync('./localhost-key.pem'),
        //    cert: fs.readFileSync('./localhost.pem'),
        //},
        port: 5173,
        proxy: {
            // �����ǹؼ��������� /api ��ͷ�����󶼻ᱻת������ĺ��
            '/api': {
                target: 'http://localhost:7013',  // ���.NET��˶˿�
                changeOrigin: true,
                secure: false, // ���ؿ�������ǩ��֤��ʱ�������
            }
        }
    }
})
