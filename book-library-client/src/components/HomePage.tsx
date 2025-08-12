import { useState } from 'react';
import {
    List, Card, Tag, Button, Popconfirm, message, Spin, Empty,
    Input, Row, Col, Typography, Layout
} from 'antd';
import { BookOutlined, SearchOutlined } from '@ant-design/icons';
import { borrowBooks, deleteBook } from '../services/bookApi';
import type { Book } from '../services/bookApi';
import { useNavigate } from "react-router-dom";
import AddBookModal from './AddBookModal';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

interface HomePageProps {
    books: Book[];
    fetchBooks: () => void;
    loading: boolean;
    search: string;
    setSearch: (v: string) => void;
    menuKey: string;
    setMenuKey: (v: string) => void;
    setIsLogin: (v: boolean) => void;
}

function getBookStats(allBooks: Book[], book: Book) {
    const sameBooks = allBooks.filter((b: Book) => b.title === book.title && b.author === book.author);
    return {
        totalCount: sameBooks.length,
        borrowedCount: sameBooks.filter(b => !b.isAvailable).length,
        remainCount: sameBooks.filter(b => b.isAvailable).length
    };
}

function HomePage(props: HomePageProps) {
    const { books, fetchBooks, loading, search, setSearch } = props;
    const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

    const filteredBooks = books.filter(
        book =>
            book.title.includes(search) ||
            (book.author && book.author.includes(search))
    );

    const onBatchBorrow = async () => {
        if (selectedBookIds.length === 0) return;
        try {
            await borrowBooks(selectedBookIds);
            message.success("批量借阅成功");
            setSelectedBookIds([]);
            fetchBooks();
        } catch {
            message.error("批量借阅失败");
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', background: "#f7f8fa" }}>
            <Content style={{
                maxWidth: 1400,
                margin: "0 auto",
                padding: "20px 18px 24px 18px",  // 上面padding加大一点
                width: "100%"
            }}>
                <Row gutter={28} align="stretch">
                    <Col xs={24} md={8} lg={7} xl={6}>
                        <div style={{
                            background: "#f9f9f9",
                            borderRadius: 14,
                            boxShadow: "0 2px 8px #f0f1f2",
                            padding: 18,
                            marginBottom: 32,
                        }}>
                            <AddBookModal onSuccess={fetchBooks} />
                            <Input
                                prefix={<SearchOutlined />}
                                placeholder="搜索书名/作者"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                allowClear
                                style={{ marginTop: 16 }}
                            />
                            <Button
                                type="primary"
                                disabled={selectedBookIds.length === 0}
                                style={{ marginTop: 10, width: "100%" }}
                                onClick={onBatchBorrow}
                            >
                                批量借阅
                            </Button>
                        </div>
                    </Col>
                    <Col xs={24} md={16} lg={18}>
                        <Spin spinning={loading}>
                            <List
                                grid={{
                                    gutter: 16,
                                    xs: 1,
                                    sm: 2,
                                    md: 3,
                                    lg: 3,
                                    xl: 3,
                                    xxl: 4
                                }}
                                dataSource={filteredBooks}
                                locale={{ emptyText: <Empty description="暂无图书" /> }}
                                renderItem={(book: Book) => {
                                    const stats = getBookStats(books, book);
                                    return (
                                        <List.Item>
                                            <div style={{ display: "flex", alignItems: "flex-start" }}>

                                                <Card
                                                    hoverable
                                                    style={{
                                                        width: 300,
                                                        minHeight: 250,
                                                        borderRadius: 14,
                                                        background: "#fffbe6",
                                                        boxShadow: "0 4px 16px #e6c08622",
                                                    }}
                                                    bodyStyle={{ padding: 14, paddingTop: 12 }}
                                                >
                                                    {/* 第一行：标题 */}
                                                    <div
                                                        style={{
                                                            fontWeight: "bold",
                                                            fontFamily: "SimHei, 'Microsoft YaHei', Arial, sans-serif",
                                                            fontSize: 20,
                                                            color: "#5a4126",
                                                            lineHeight: "28px",
                                                            marginBottom: 6,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 6,
                                                            whiteSpace: "pre-line",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            minHeight: 28,
                                                        }}
                                                        title={book.title}
                                                    >
                                                        <BookOutlined style={{
                                                            fontSize: 22,
                                                            marginRight: 8,
                                                            color: "#fff",
                                                            background: "#bfa058",
                                                            borderRadius: "50%",
                                                            padding: 3,
                                                            boxShadow: "0 1px 3px #e6c08644"
                                                        }} />

                                                        {book.title}
                                                    </div>


                                                    {/* 第二行：操作区 */}
                                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                                                        {book.isAvailable ? (
                                                            <Tag color="green">可借阅</Tag>
                                                        ) : (
                                                            <Tag color="gray">已借出</Tag>
                                                        )}

                                                        <Button
                                                            size="small"
                                                            type="primary"
                                                            //  disabled={!book.isAvailable}
                                                            disabled={stats.remainCount <= 0}
                                                            onClick={async () => {
                                                                try {
                                                                    await borrowBooks([book.id]);
                                                                    message.success("借阅成功");
                                                                    fetchBooks();
                                                                } catch {
                                                                    message.error("借阅失败");
                                                                }
                                                            }}
                                                        >
                                                            借阅
                                                        </Button>

                                                        {role === "Admin" && (
                                                            <>
                                                                <Button type="link" onClick={() => navigate(`/edit/${book.id}`)}>
                                                                    编辑
                                                                </Button>
                                                                <Popconfirm
                                                                    title="确认删除这本书吗？"
                                                                    onConfirm={async () => {
                                                                        await deleteBook(book.id);
                                                                        message.success("删除成功！");
                                                                        fetchBooks();
                                                                    }}
                                                                    okText="确定"
                                                                    cancelText="取消"
                                                                >
                                                                    <Button type="link" danger size="small">
                                                                        删除
                                                                    </Button>
                                                                </Popconfirm>
                                                            </>
                                                        )}

                                                        <Button type="link" onClick={() => navigate(`/detail/${book.id}`)}>
                                                            详情
                                                        </Button>
                                                    </div>

                                                    {/* 卡片内容 */}
                                                    <div>
                                                        <Text strong>作者：</Text>
                                                        {book.author || "-"}
                                                    </div>
                                                    <div>
                                                        <Text>分类：</Text>
                                                        {book.category || "-"}
                                                    </div>

                                                    {book.coverUrl && (
                                                        <div style={{ textAlign: "center", margin: "10px 0" }}>
                                                            <img
                                                                src={book.coverUrl.startsWith("http")
                                                                    ? book.coverUrl
                                                                    : `http://localhost:7013${book.coverUrl}`}
                                                                alt={book.title}
                                                                style={{
                                                                    maxWidth: 120,
                                                                    maxHeight: 80,
                                                                    borderRadius: 8,
                                                                    boxShadow: "0 2px 6px #eee",
                                                                    objectFit: "cover"
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                        {book.publisher && <Tag color="blue">{book.publisher}</Tag>}
                                                        {book.publishDate && <Tag>{book.publishDate}</Tag>}
                                                        {book.isEbook && book.ebookUrl && (
                                                            <Tag color="geekblue">
                                                                <a href={book.ebookUrl} target="_blank" rel="noopener noreferrer">
                                                                    电子书
                                                                </a>
                                                            </Tag>
                                                        )}
                                                        {book.canReadOnline && <Tag color="cyan">支持在线阅读</Tag>}
                                                    </div>

                                                    {book.description && (
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#888",
                                                                marginTop: 8,
                                                                maxHeight: 48,
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis"
                                                            }}
                                                        >
                                                            {book.description}
                                                        </div>
                                                    )}

                                                    {/* 统计信息 */}
                                                    <div style={{ marginTop: 12 }}>
                                                        <Tag color="blue">总数：{stats.totalCount}</Tag>
                                                        <Tag color="orange">已借出：{stats.borrowedCount}</Tag>
                                                        <Tag color="green">剩余：{stats.remainCount}</Tag>
                                                    </div>
                                                </Card>
                                            </div>
                                        </List.Item>
                                    );
                                }}
                                pagination={{ pageSize: 6, showSizeChanger: true }}
                            />
                        </Spin>
                    </Col>
                </Row>
            </Content>
            <Footer style={{ textAlign: 'center', color: "#aaa" }}>
                史志办线上图书馆 ©2025 — Powered by Ant Design & React
            </Footer>
        </Layout>
    );
}

export default HomePage;
