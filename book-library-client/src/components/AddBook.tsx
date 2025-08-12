import { Form, Input, Button, Checkbox, message, InputNumber } from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { TOTAL_TOP } from '../components/BannerCarousel'; // ✅ 导入顶部高度常量

interface AddBookProps {
    onSuccess?: () => void;
}

const api = axios.create({
    baseURL: 'http://localhost:7013/api',
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
const tailLayout = {
    wrapperCol: { offset: 6, span: 18 },
};

export default function AddBook({ onSuccess }: AddBookProps) {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const userRole = localStorage.getItem('role') || 'member';

    const onFinish = async (values: any) => {
        const count = Number(values.count) || 1;
        const data = {
            Title: values.title || "",
            Author: values.author || "",
            Category: values.category || "",
            Description: values.description || "",
            CoverUrl: values.coverUrl || "",
            IsAvailable: values.isAvailable ?? true,
            CanReadOnline: values.canReadOnline ?? false,
            ShelfId: values.shelfId ? Number(values.shelfId) : null,
            IsEbook: values.isEbook ?? false,
            EbookUrl: values.ebookUrl || "",
            Publisher: values.publisher || "",
            PublishDate: values.publishDate || "",
        };
        setLoading(true);
        try {
            for (let i = 0; i < count; i++) {
                await api.post('/Books', data);
            }
            message.success(`成功添加${count}本图书！`);
            form.resetFields();
            onSuccess?.();
        } catch (err: any) {
            console.error('❌ 添加失败：', err.response?.data || err.message);
            message.error('添加失败: ' + (err.response?.data?.message || JSON.stringify(err.response?.data)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: TOTAL_TOP + 20 }}> {/* ✅ 避开 Banner */}
            <Form
                form={form}
                {...layout}
                onFinish={onFinish}
                style={{
                    margin: '16px auto',
                    padding: 16,
                    background: '#fafafa',
                    borderRadius: 8,
                    maxWidth: 600, // ✅ 表单居中
                }}
                initialValues={{
                    isAvailable: true,
                    isEbook: false,
                    canReadOnline: false,
                    count: 1,
                }}
            >
                <Form.Item
                    name="title"
                    label="书名"
                    rules={[{ required: true, message: '请输入书名' }]}
                >
                    <Input placeholder="书名" />
                </Form.Item>

                <Form.Item name="author" label="作者">
                    <Input placeholder="作者" />
                </Form.Item>

                <Form.Item name="category" label="分类">
                    <Input placeholder="分类" />
                </Form.Item>

                <Form.Item name="description" label="简介">
                    <Input.TextArea placeholder="简介" />
                </Form.Item>

                <Form.Item name="coverUrl" label="封面URL">
                    <Input placeholder="图片地址" />
                </Form.Item>

                {userRole !== 'member' && (
                    <Form.Item name="isAvailable" label="可借阅" valuePropName="checked">
                        <Checkbox />
                    </Form.Item>
                )}

                <Form.Item name="canReadOnline" label="可在线阅读" valuePropName="checked">
                    <Checkbox />
                </Form.Item>

                <Form.Item name="isEbook" label="电子书" valuePropName="checked">
                    <Checkbox />
                </Form.Item>

                <Form.Item name="ebookUrl" label="电子书URL">
                    <Input placeholder="电子书链接" />
                </Form.Item>

                <Form.Item name="shelfId" label="书架ID">
                    <Input placeholder="数字" />
                </Form.Item>

                <Form.Item name="publisher" label="出版社">
                    <Input placeholder="出版社" />
                </Form.Item>

                <Form.Item name="publishDate" label="出版时间">
                    <Input placeholder="如2022-01" />
                </Form.Item>

                <Form.Item
                    name="count"
                    label="数量"
                    initialValue={1}
                    rules={[{ type: 'number', min: 1, message: '至少添加一本' }]}
                >
                    <InputNumber type="number" min={1} placeholder="默认1本" />
                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        提交
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
