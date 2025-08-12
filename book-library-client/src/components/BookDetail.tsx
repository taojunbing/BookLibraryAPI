import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/bookApi";
import type { Book } from "../services/bookApi";
import { Card, Spin, Button, Tag, Typography, message, Row, Col, Divider } from "antd";
const { Title, Paragraph, Text } = Typography;

export default function BookDetail() {
    const { id } = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [allBooks, setAllBooks] = useState<Book[]>([]); // 用于统计
    const [myBorrowRecord, setMyBorrowRecord] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        api.get(`/books/${id}`).then(res => {
            setBook(res.data);
            setLoading(false);
        }).catch(() => {
            message.error("获取图书详情失败");
            setLoading(false);
        });
        // 获取全部书，做统计用
        api.get('/books').then(res => setAllBooks(res.data));
        // 查询我的借阅历史，找出这本书有没有在借阅中（当前用户）
        api.get('/Borrow/history').then(res => {
            const myBorrow = res.data.find((r: any) => r.bookId === Number(id) && !r.isReturned);
            setMyBorrowRecord(myBorrow);
        });
    }, [id]);

    // 统计同类书数量
    //function getBookStats(allBooks: Book[], book: Book | null) {
    //    if (!book) return { totalCount: 1, availableCount: book?.isAvailable ? 1 : 0, borrowedCount: book && !book.isAvailable ? 1 : 0 };
    //    const sameBooks = allBooks.filter(b => b.title === book.title && b.author === book.author);
    //    return {
    //        totalCount: sameBooks.length,
    //        availableCount: sameBooks.filter(b => b.isAvailable).length,
    //        borrowedCount: sameBooks.filter(b => !b.isAvailable).length
    //    }
    //}
    function getBookStats(allBooks: Book[], book: Book | null) {
        if (!book) return { totalCount: 1, availableCount: 0, borrowedCount: 0 };
        const sameBooks = allBooks.filter(b => b.title === book.title && b.author === book.author);
        return {
            totalCount: sameBooks.length,
            availableCount: sameBooks.filter(b => b.isAvailable).length,
            borrowedCount: sameBooks.filter(b => !b.isAvailable).length
        };
    }

    const stats = getBookStats(allBooks, book);

    // 借阅
    const handleBorrow = async () => {
        try {
            await api.post('/Borrow/borrow', { bookIds: [Number(id)] });
            message.success('借阅成功！');
            setBook(book ? { ...book, isAvailable: false } : null);
        } catch (e) {
            message.error('借阅失败');
        }
    };

    // 归还
    const handleReturn = async () => {
        if (!myBorrowRecord) return;
        try {
            await api.post('/Borrow/return', { recordIds: [myBorrowRecord.id] });
            message.success('归还成功！');
            setBook(book ? { ...book, isAvailable: true } : null);
        } catch (e) {
            message.error('归还失败');
        }
    };

    if (loading) return <Spin style={{ display: 'block', margin: '60px auto' }} />;
    if (!book) return <div style={{ textAlign: 'center', marginTop: 50 }}>图书不存在或已被删除</div>;

    return (
        <Card
            title={<Title level={4} style={{ margin: 0 }}>{book.title}</Title>}
            extra={<Button onClick={() => navigate(-1)}>返回</Button>}
            style={{ maxWidth: 900, margin: "40px auto", borderRadius: 16 }}
            bodyStyle={{ padding: "32px 24px" }}
        >
            <Row gutter={36}>
                {/* 左栏：封面 + 数量统计 + 借阅/归还按钮 */}
                <Col xs={24} md={9}>
                    <div style={{ textAlign: 'center' }}>
                        {book.coverUrl ?
                            <img src={book.coverUrl} alt={book.title}
                                style={{ maxWidth: 280, maxHeight: 420, borderRadius: 8, boxShadow: "0 2px 8px #ddd", marginBottom: 16 }}
                            /> :
                            <div style={{ width: 280, height: 420, background: "#f2f2f2", borderRadius: 8, lineHeight: "220px", margin: "0 auto 16px" }}>无封面</div>
                        }
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                        <Tag color="blue">总数：{stats.totalCount}</Tag>
                        <Tag color="green">可借：{stats.availableCount}</Tag>
                        <Tag color="orange">已借出：{stats.borrowedCount}</Tag>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: 10 }}>
                        <Tag color={book.isAvailable ? "green" : "gray"}>
                            {book.isAvailable ? "可借阅" : "已借出"}
                        </Tag>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <Button
                            type="primary"
                            disabled={!book.isAvailable}
                            onClick={handleBorrow}
                            style={{ marginRight: 10 }}
                        >借阅</Button>
                        <Button
                            type="primary"
                            danger
                            disabled={!myBorrowRecord || myBorrowRecord.isReturned}
                            onClick={handleReturn}
                        >还书</Button>
                    </div>
                </Col>
                {/* 右栏：所有字段信息 */}
                <Col xs={24} md={15}>
                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                        <Text strong>作者：</Text>{book.author || "-"}
                    </div>
                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                        <Text strong>分类：</Text>{book.category || "-"}
                    </div>
                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                        <Text strong>出版社：</Text>{book.publisher || "-"}
                    </div>
                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                        <Text strong>出版时间：</Text>{book.publishDate || "-"}
                    </div>
                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                        <Text strong>书架ID：</Text>{book.shelfId || "-"}
                    </div>
                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                        <Text strong>电子书：</Text>{book.isEbook ? "是" : "否"}
                        {book.isEbook && book.ebookUrl && (
                            <Tag color="geekblue" style={{ marginLeft: 8 }}>
                                <a href={book.ebookUrl} target="_blank" rel="noopener noreferrer">电子书链接</a>
                            </Tag>
                        )}
                    </div>
                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                        <Text strong>可在线阅读：</Text>{book.canReadOnline ? "是" : "否"}
                    </div>
                    <Divider />
                    <div>
                        <Text strong>简介：</Text>
                        <Paragraph style={{ margin: "8px 0" }}>
                            {book.description || <span style={{ color: "#bbb" }}>暂无简介</span>}
                        </Paragraph>
                    </div>
                </Col>
            </Row>
        </Card>
    );
}
