/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import axios from 'axios';
import { UserAddOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function Register({
    onSuccess,
    onCancel
}: {
    onSuccess: () => void,
    onCancel: () => void
}) {
    const [loading, setLoading] = useState(false);

    // 提交注册
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await axios.post('http://localhost:7013/api/Auth/register', {
                userName: values.username,
                password: values.password,
                email: values.email,
                role: "User" // 强制为普通用户
            });
            message.success('注册成功，请登录');
            onSuccess();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                message.error(err.response?.data || '注册失败');
            } else {
                message.error('注册失败');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: "transparent"
        }}>
            <Card
                style={{ width: 380, borderRadius: 16, boxShadow: '0 4px 32px #e6c08633' }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <UserAddOutlined style={{ fontSize: 38, color: "#888" }} />
                    <Title level={4} style={{ margin: "10px 0 0 0" }}>新用户注册</Title>
                </div>
                <Form name="register" onFinish={onFinish} layout="vertical" autoComplete="off">
                    <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input placeholder="用户名" size="large" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[
                        { required: true, message: '请输入密码' },
                        { min: 6, message: '密码至少6位' }
                    ]}>
                        <Input.Password placeholder="密码" size="large" />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" rules={[
                        { type: 'email', message: '请输入有效的邮箱' },
                        { required: true, message: '请输入邮箱' }
                    ]}>
                        <Input placeholder="邮箱" size="large" />
                    </Form.Item>
                    {/* 管理员注册禁用：role固定为User，用户看不到 */}
                    <Form.Item name="role" initialValue="User" style={{ display: 'none' }}>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>注册</Button>
                    </Form.Item>
                    <Form.Item>
                        <Button type="link" block onClick={onCancel}>返回登录</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
