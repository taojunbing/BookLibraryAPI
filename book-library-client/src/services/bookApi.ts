import axios from 'axios';

// 定义 Book 类型
export interface Book {
    id: number;
    title: string;
    author?: string;
    category?: string;
    description?: string;
    coverUrl?: string;
    isAvailable: boolean;
    canReadOnline: boolean;
    shelfId?: number;
    isEbook: boolean;
    ebookUrl?: string;
    publisher?: string;
    publishDate?: string;
}

// 创建 axios 实例
const api = axios.create({
    // baseURL: 'http://localhost:7013/api',
    // ✅ 关键：用相对路径，交给 Vite 代理到后端
    baseURL: '/api',
});

// 获取全部图书列表
export const getBooks = () => api.get<Book[]>('/books');

// 删除图书
export const deleteBook = (id: number) => api.delete(`/Books/${id}`);

// 借阅
export const borrowBooks = (bookIds: number[]) => api.post('/Borrow/borrow', { bookIds });

// 获取借阅历史
export const getBorrowHistory = () => api.get("/Borrow/history");

// 还书
export const returnBooks = (recordIds: number[]) => api.post('/Borrow/return', { recordIds });


// 所有 API 请求自动携带 token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = 'Bearer ' + token; // 注意空格
    }
    return config;
});

export default api;
