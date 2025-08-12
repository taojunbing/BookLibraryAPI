import { useEffect, useState } from 'react';
import { getBooks } from './services/bookApi';
import type { Book } from './services/bookApi';
import Login from './components/Login';
import EditBook from './components/EditBook';
import BookDetail from './components/BookDetail';
import BorrowHistory from './components/BorrowHistory';
import AdminBooks from './components/AdminBooks';
import BannerCarousel from "./components/BannerCarousel";
import EbooksPage from './components/EbooksPage';
import EbookReader from './components/EbookReader';
import HomePage from './components/HomePage';
import UserCenter from './components/UserCenter';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { message } from "antd";

// Banner高度(含NavBar)全站统一，建议高度 300px，如有变动可调整
const BANNER_HEIGHT = 300;

// 统一带Banner和顶部padding的Layout
function BannerLayout({
    menuKey,
    setMenuKey,
    setIsLogin
}: {
    menuKey: string;
    setMenuKey: (v: string) => void;
    setIsLogin: (v: boolean) => void;
}) {
    return (
        <>
            <BannerCarousel
                menuKey={menuKey}
                setMenuKey={setMenuKey}
                setIsLogin={setIsLogin}
            />
            {/* 内容区顶部留出和Banner一样的空间，防止被遮挡 */}
            <div style={{ minHeight: "100vh", background: "#f7f8fa", paddingTop: 292 }}>
                <Outlet />
            </div>
        </>
    );
}

function App() {
    const [isLogin, setIsLogin] = useState(() => !!localStorage.getItem('token'));
    const [role, setRole] = useState(() => localStorage.getItem("role"));
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [menuKey, setMenuKey] = useState('home');

    // 获取图书列表
    const fetchBooks = () => {
        setLoading(true);
        getBooks()
            .then(res => setBooks(res.data))
            .catch(err => message.error('获取图书失败: ' + (err.message || err)))
            .finally(() => setLoading(false));
    };

    useEffect(() => { setRole(localStorage.getItem("role")); }, [isLogin]);
    useEffect(() => { fetchBooks(); }, []);

    if (!isLogin) {
        return <Login onLogin={() => setIsLogin(true)} />;
    }

    return (
        <Router>
            <Routes>
                {/* 全站都带BannerLayout（包含首页） */}
                <Route
                    element={
                        <BannerLayout
                            menuKey={menuKey}
                            setMenuKey={setMenuKey}
                            setIsLogin={setIsLogin}
                        />
                    }
                >
                    <Route
                        path="/"
                        element={
                            <HomePage
                                books={books}
                                fetchBooks={fetchBooks}
                                loading={loading}
                                search={search}
                                setSearch={setSearch}
                                menuKey={menuKey}
                                setMenuKey={setMenuKey}
                                setIsLogin={setIsLogin}
                            />
                        }
                    />
                    <Route path="/edit/:id" element={<EditBook onSuccess={fetchBooks} />} />
                    <Route path="/detail/:id" element={<BookDetail />} />
                    <Route path="/history" element={<BorrowHistory />} />
                    <Route path="/user" element={<UserCenter />} />
                    <Route path="/ebooks" element={<EbooksPage books={books} />} />
                    <Route path="/reader/:id" element={<EbookReader />} />
                    <Route
                        path="/admin/books"
                        element={role === "Admin" ? <AdminBooks /> : <Navigate to="/user" />}
                    />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
