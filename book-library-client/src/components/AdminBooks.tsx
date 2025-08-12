import React, { useState, useEffect } from 'react';
import { Table, Button, Upload, message, Modal, Form, Input, Popconfirm, Checkbox } from 'antd';
import { UploadOutlined, DownloadOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import api from '../services/bookApi';
import type { Book } from '../services/bookApi';

interface AdminBooksProps {
    showImport?: boolean;
    showExport?: boolean;
    showBorrowExport?: boolean;
    showAdd?: boolean;
}

export default function AdminBooks({
    showImport = true,
    showExport = true,
    showBorrowExport = true,
    showAdd = true
}: AdminBooksProps) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // 获取数据
    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/books');
            setBooks(res.data);
        } catch {
            message.error("获取图书失败");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchBooks(); }, []);

    // 批量导出
    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/Books/export', {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            let filename = "books.xlsx";
            const disposition = response.headers['content-disposition'];
            if (disposition) {
                const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
            }
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url; link.download = filename;
            document.body.appendChild(link); link.click();
            setTimeout(() => { window.URL.revokeObjectURL(url); document.body.removeChild(link); }, 100);
        } catch {
            message.error('导出失败');
        }
    };

    // 借阅记录导出
    const handleBorrowExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/Borrow/export', {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            let filename = "borrow.xlsx";
            const disposition = response.headers['content-disposition'];
            if (disposition) {
                const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
            }
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url; link.download = filename;
            document.body.appendChild(link); link.click();
            setTimeout(() => { window.URL.revokeObjectURL(url); document.body.removeChild(link); }, 100);
        } catch {
            message.error('借阅记录导出失败');
        }
    };

    // ✅ 批量导入：使用 customRequest + axios(api)
    const uploadProps = {
        name: 'file',
        accept: '.xlsx,.csv,.xls',
        showUploadList: false,
        customRequest: async (options: any) => {
            const { file, onSuccess, onError } = options;
            try {
                const formData = new FormData();
                formData.append('file', file as File);
                const res = await api.post('/Books/import', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    responseType: 'json'
                });
                message.success('导入成功');
                onSuccess?.(res.data);
                fetchBooks();
            } catch (err: any) {
                console.error(err);
                message.error('导入失败：' + (err.response?.data?.message || err.message));
                onError?.(err);
            }
        }
    };

    // 删除
    const handleDelete = async (id?: number) => {
        const ids = id !== undefined ? [id] : (selectedRowKeys as number[]);
        if (ids.length === 0) return message.warning('请选择要删除的图书');
        setLoading(true);
        try {
            await Promise.all(ids.map(i => api.delete(`/books/${i}`)));
            message.success('删除成功'); setSelectedRowKeys([]); fetchBooks();
        } catch {
            message.error('删除失败，请稍后重试');
        } finally { setLoading(false); }
    };

    // 新增
    const openAddModal = () => { setModalVisible(true); form.resetFields(); };

    const handleSave = async () => {
        const values = await form.validateFields();
        if (values.shelfId === "" || values.shelfId === undefined) values.shelfId = null;
        else {
            values.shelfId = Number(values.shelfId);
            if (isNaN(values.shelfId)) values.shelfId = null;
        }
        ['coverUrl', 'ebookUrl', 'author', 'category', 'description', 'publisher', 'publishDate'].forEach(k => {
            if (values[k] === '') values[k] = null;
        });
        values.isAvailable = !!values.isAvailable;
        values.canReadOnline = !!values.canReadOnline;
        values.isEebook = !!values.isEebook;
        await api.post('/books', values);
        message.success('新增成功'); setModalVisible(false); fetchBooks();
    };

    // 表格
    const columns = [
        { title: '书名', dataIndex: 'title', key: 'title', render: (t: string) => <b style={{ fontWeight: 700 }}>{t}</b> },
        { title: '作者', dataIndex: 'author', key: 'author' },
        { title: '分类', dataIndex: 'category', key: 'category' },
        { title: '出版社', dataIndex: 'publisher', key: 'publisher' },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Book) => (
                <>
                    <Button icon={<EditOutlined />} type="link" onClick={() => navigate(`/edit/${record.id}`)}>编辑</Button>
                    <Popconfirm title="确认删除这本书吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </>
            )
        }
    ];

    if (localStorage.getItem('role') !== 'Admin') return <div>无权限访问</div>;

    return (
        <div style={{ padding: 36, maxWidth: 1200, margin: '0 auto' }}>
            {/* 工具栏（按需显示） */}
            <div style={{ marginBottom: 18, display: 'flex', gap: 16 }}>
                {showImport && (
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>批量导入</Button>
                    </Upload>
                )}
                {showExport && (
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>批量导出</Button>
                )}
                {showBorrowExport && (
                    <Button icon={<DownloadOutlined />} onClick={handleBorrowExport}>借阅记录导出</Button>
                )}
                {showAdd && (
                    <Button icon={<PlusOutlined />} type="primary" onClick={openAddModal}>新增图书</Button>
                )}
            </div>

            <Table
                rowKey="id"
                loading={loading}
                rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                columns={columns}
                dataSource={books}
                pagination={{ pageSize: 10, showSizeChanger: true }}
            />

            {/* 新增弹窗 */}
            <Modal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSave}
                title="新增图书"
                destroyOnClose
                forceRender
            >
                <Form form={form} layout="vertical" initialValues={{ isAvailable: true, canReadOnline: false, isEbook: false }}>
                    <Form.Item label="书名" name="title" rules={[{ required: true, message: '请输入书名' }]}><Input /></Form.Item>
                    <Form.Item label="作者" name="author"><Input /></Form.Item>
                    <Form.Item label="分类" name="category"><Input /></Form.Item>
                    <Form.Item label="简介" name="description"><Input.TextArea rows={2} /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
