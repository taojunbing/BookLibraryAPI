import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { BookOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from "axios";
import Register from './Register';

const { Title } = Typography;

/**
 * 登录API
 */
const loginApi = async (username: string, password: string) => {
    const res = await axios.post('http://localhost:7013/api/Auth/login', {
        userName: username,
        password: password,
    });
    return res.data;
};

export default function Login({ onLogin }: { onLogin: () => void }) {
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // 显示注册页面
    if (showRegister) {
        return <Register onSuccess={() => setShowRegister(false)} onCancel={() => setShowRegister(false)} />;
    }

    /**
     * 登录表单提交
     */
    const onFinish = async (values: { username: string, password: string }) => {
        setLoading(true);
        try {
            const data = await loginApi(values.username, values.password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);         // <--- 新增
            localStorage.setItem('username', data.username); // <--- 新增
            message.success('登录成功');
            onLogin();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                message.error(err.response?.data || '用户名或密码错误');
            } else {
                message.error('用户名或密码错误');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: "linear-gradient(135deg, #f7ecd2 0%, #e6c086 100%)"
        }}>
            <Card
                style={{ width: 380, borderRadius: 16, boxShadow: '0 4px 32px #e6c08644' }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    {/* 历史图书LOGO */}
                    <BookOutlined style={{ fontSize: 48, color: "#b79042" }} />
                    <Title level={3} style={{ margin: "10px 0 0 0", color: "#856d36", fontFamily: "STSong,serif" }}>
                        典藏历史图书馆
                    </Title>
                    <div style={{ color: "#c1a570", marginBottom: 6 }}>欢迎登录</div>
                </div>
                <Form name="login" onFinish={onFinish} layout="vertical" autoComplete="off">
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            登录
                        </Button>
                        <Button type="link" block onClick={() => setShowRegister(true)}>
                            没有账号？去注册
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{ color: "#aaa", textAlign: "center", fontSize: 12, marginTop: 8 }}>
                    <span>初始账号：admin / 123456</span>
                </div>
            </Card>
        </div>
    );
}
