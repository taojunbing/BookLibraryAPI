import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Form, Input, Button, message, Spin, Card, Checkbox, InputNumber,
    Upload, Row, Col, Tag, Modal, Popconfirm, Space, Divider, Select
} from "antd";
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import api from "../services/bookApi";
import type { Book } from "../services/bookApi";

const apiBase = "http://localhost:7013";

interface Shelf {
    id: number;
    number: string;
    room: { id: number; name: string };
}

interface EditBookProps {
    onSuccess?: () => void;
}
export default function EditBook({ onSuccess }: EditBookProps) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [book, setBook] = useState<Book | null>(null);
    const [allBooks, setAllBooks] = useState<Book[]>([]);
    const [shelves, setShelves] = useState<Shelf[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();
    const [count, setCount] = useState<number>(1);
    const [uploading, setUploading] = useState(false);
    const [countChanged, setCountChanged] = useState(false);
    const [selectedShelfId, setSelectedShelfId] = useState<number | undefined>(undefined);
    const [isEbook, setIsEbook] = useState(false);

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

    // 拉取数据
    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get<Book>(`/books/${id}`),
            api.get<Book[]>(`/books`),
            // 这里 shelves 改成 Shelf（注意大小写）
            api.get<Shelf[]>(`/Shelf`)

        ]).then(([bookRes, listRes, shelfRes]) => {
            const bookData =  bookRes.data;
            console.log('bookData:', bookData); // 建议调试用
            setBook(bookData);
            form.setFieldsValue(bookData);

            form.setFieldsValue(bookRes.data);
            setIsEbook(bookRes.data.isEbook || false);
            setAllBooks(listRes.data);
            setShelves(shelfRes.data);
            setSelectedShelfId(bookRes.data.shelfId);
            setLoading(false);
        }).catch(() => {
            message.error("获取图书信息失败");
            setLoading(false);
        });
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        setCount(stats.totalCount);
        setCountChanged(false);
    }, [stats.totalCount]);

    // 封面上传
    const handleUpload = async ({ file }: { file: any }) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const resp = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            let url = resp.data.url;
            if (!url.startsWith("http")) url = apiBase + url;
            form.setFieldsValue({ coverUrl: url });
            setPreviewUrl(undefined);
            setTimeout(() => setPreviewUrl(url), 100);
            message.success("上传成功！");
        } catch (e) {
            message.error("上传失败");
        } finally {
            setUploading(false);
        }
    };

    // 电子书上传
    const handleEbookUpload = async ({ file }: { file: any }) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const resp = await api.post('/upload/ebook', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            let url = resp.data.url;
            if (!url.startsWith("http")) url = apiBase + url;
            form.setFieldsValue({ ebookUrl: url });
            message.success("电子书上传成功！");
        } catch (e) {
            message.error("电子书上传失败");
        } finally {
            setUploading(false);
        }
    };

    // 数量确认提交
    const handleCountSave = async () => {
        if (!book) return;
        if (!Number.isInteger(count) || count < 1) {
            message.warning("数量必须为正整数");
            setCount(stats.totalCount);
            setCountChanged(false);
            return;
        }
        const delta = count - stats.totalCount;
        if (delta === 0) {
            setCountChanged(false);
            return;
        }
        try {
            await api.post('/books/changeCount', {
                title: book.title,
                author: book.author,
                delta
            });
            message.success("数量已更新！");
            const [curRes, allRes] = await Promise.all([
                api.get(`/books/${book.id}`),
                api.get('/books')
            ]);
            setBook(curRes.data);
            setAllBooks(allRes.data);
            setCountChanged(false);
        } catch {
            message.error("数量调整失败");
            setCount(stats.totalCount);
            setCountChanged(false);
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await api.put(`/books/${id}`, {
                ...values,
                shelfId: selectedShelfId || null
            });
            message.success("修改成功！");
            if (onSuccess) onSuccess();
            navigate("/");
        } catch (e) {
            message.error("保存失败");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spin style={{ display: 'block', margin: '60px auto' }} />;
    if (!book) return <div style={{ textAlign: 'center', marginTop: 50 }}>图书不存在或已被删除</div>;

    const coverUrl = form.getFieldValue('coverUrl');
    const fullCoverUrl = coverUrl?.startsWith("http") ? coverUrl : (coverUrl ? apiBase + coverUrl : undefined);

    // 当前选中的 shelf
    const shelf = shelves.find(s => s.id === selectedShelfId);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                background: "#f8fafd"
            }}
        >
            <Card
                title={<div style={{ textAlign: "center", fontSize: 22, fontWeight: 600 }}>编辑图书</div>}
                style={{
                    width: "100%",
                    maxWidth: 700,
                    margin: "48px auto",
                    borderRadius: 16,
                    boxShadow: "0 4px 32px #dbeafe55",
                    background: "#fff"
                }}
                bodyStyle={{ padding: "32px 32px 24px 32px" }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ isAvailable: true, isEbook: false, canReadOnline: false }}
                >
                    <Row gutter={36}>
                        <Col xs={24} sm={9}>
                            {/* 封面和数量、统计信息 */}
                            <div style={{ textAlign: "center" }}>
                                <Upload
                                    accept="image/*"
                                    customRequest={handleUpload}
                                    showUploadList={false}
                                    disabled={uploading}
                                >
                                    {fullCoverUrl ?
                                        <img
                                            src={fullCoverUrl}
                                            alt="封面"
                                            style={{
                                                width: 100,
                                                height: 130,
                                                objectFit: "cover",
                                                borderRadius: 10,
                                                boxShadow: "0 2px 10px #eee",
                                                marginBottom: 10,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setPreviewUrl(fullCoverUrl)}
                                        /> :
                                        <Button icon={<PlusOutlined />} loading={uploading}>上传封面</Button>
                                    }
                                </Upload>
                                <div style={{ margin: "12px 0 18px" }}>
                                    <Tag color="blue">总数：{stats.totalCount}</Tag>
                                    <Tag color="green">可借：{stats.availableCount}</Tag>
                                    <Tag color="orange">已借出：{stats.borrowedCount}</Tag>
                                </div>
                                {/* 数量编辑 */}
                                <div style={{ margin: "16px 0 0" }}>
                                    <div style={{ fontWeight: 500, fontSize: 15 }}>数量</div>
                                    <Space>
                                        <InputNumber
                                            min={1}
                                            value={count}
                                            onChange={v => {
                                                setCount(Number(v));
                                                setCountChanged(Number(v) !== stats.totalCount);
                                            }}
                                            style={{ width: 80, margin: "8px 0" }}
                                            step={1}
                                        />
                                        <Popconfirm
                                            title="确认修改数量？"
                                            description={
                                                count > stats.totalCount
                                                    ? `将新增 ${count - stats.totalCount} 本`
                                                    : `将删除 ${stats.totalCount - count} 本（优先删未借出）`
                                            }
                                            okText="确定"
                                            cancelText="取消"
                                            disabled={!countChanged}
                                            onConfirm={handleCountSave}
                                        >
                                            <Button type="primary" size="small" disabled={!countChanged}>
                                                保存
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={15}>
                            {/* 分组展示主信息 */}
                            <Divider style={{ margin: "0 0 20px" }}>图书信息</Divider>
                            <Form.Item name="title" label="书名" rules={[{ required: true, message: '请输入书名' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="author" label="作者">
                                <Input />
                            </Form.Item>
                            <Form.Item name="category" label="分类">
                                <Input />
                            </Form.Item>
                            <Form.Item name="description" label="简介">
                                <Input.TextArea rows={2} />
                            </Form.Item>
                            <Form.Item name="coverUrl" label="封面URL">
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item name="isAvailable" valuePropName="checked" style={{ marginBottom: 8 }}>
                                <Checkbox>可借阅</Checkbox>
                            </Form.Item>
                            <Form.Item name="canReadOnline" valuePropName="checked" style={{ marginBottom: 8 }}>
                                <Checkbox>可在线阅读</Checkbox>
                            </Form.Item>
                            <Form.Item
                                name="isEbook"
                                valuePropName="checked"
                                style={{ marginBottom: 8 }}
                            >
                                <Checkbox
                                    onChange={e => setIsEbook(e.target.checked)}
                                >电子书</Checkbox>
                            </Form.Item>
                            {/* 电子书上传，只在 isEbook 为 true 时显示 */}
                            {isEbook && (
                                <Form.Item name="ebookUrl" label="电子书URL">
                                    <Input
                                        addonAfter={
                                            <Upload
                                                showUploadList={false}
                                                customRequest={handleEbookUpload}
                                                accept=".pdf,.epub,.txt"
                                            >
                                                <Button icon={<UploadOutlined />} size="small">上传电子书</Button>
                                            </Upload>
                                        }
                                    />
                                </Form.Item>
                            )}
                            <Form.Item name="publisher" label="出版社">
                                <Input />
                            </Form.Item>
                            <Form.Item name="publishDate" label="出版时间">
                                <Input placeholder="如2022-01" />
                            </Form.Item>
                            {/* 书架位置选择 */}
                            <Form.Item label="书架位置">
                                <Select
                                    placeholder="请选择书架"
                                    value={selectedShelfId}
                                    onChange={(sid) => setSelectedShelfId(sid)}
                                    options={shelves.map(s => ({
                                        label: `${s.number}（${s.room?.name || "-"}）`,
                                        value: s.id
                                    }))}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item label="房间位置">
                                <Input value={shelf?.room?.name || ""} readOnly />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item style={{ margin: "30px 0 0", textAlign: "center" }}>
                        <Button type="primary" htmlType="submit" style={{ width: 120, fontWeight: 500, borderRadius: 6 }}>
                            保存修改
                        </Button>
                        <Button
                            style={{ marginLeft: 20, width: 80, borderRadius: 6 }}
                            onClick={() => navigate("/")}
                        >取 消</Button>
                    </Form.Item>
                </Form>
                {/* 图片预览弹窗 */}
                <Modal
                    open={!!previewUrl}
                    footer={null}
                    onCancel={() => setPreviewUrl(undefined)}
                >
                    <img alt="封面预览" style={{ width: "100%" }} src={previewUrl} />
                </Modal>
            </Card>
        </div>
    );
}
