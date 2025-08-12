// components/NavBar.tsx
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Typography, message } from "antd";
import {
    BookOutlined,
    ReadOutlined,
    PieChartOutlined,
    UserOutlined,
    CloudOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

export default function NavBar({
    menuKey,
    setMenuKey,
    setIsLogin,
}: {
    menuKey: string;
    setMenuKey: (key: string) => void;
    setIsLogin: (v: boolean) => void;
}) {
    const navigate = useNavigate();

    return (
        <Header
            style={{
                background: "#fff",
                color: "#5a4126",
                boxShadow: "0 1px 12px #eee",
                height: 72,
                padding: 0,
                position: "sticky",
                top: 0,
                zIndex: 99,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                    maxWidth: 1800,
                    margin: "0 auto",
                    padding: "0 36px",
                }}
            >
                <Avatar
                    style={{
                        backgroundColor: "#e6c086",
                        marginRight: 18,
                        boxShadow: "0 2px 10px #e6c08688",
                    }}
                    size={48}
                    icon={<BookOutlined style={{ fontSize: 36, color: "#5a4126" }} />}
                />
                <Title
                    level={3}
                    style={{
                        margin: "0 36px 0 0",
                        color: "#5a4126",
                        letterSpacing: 3,
                        fontFamily: "STSong, serif",
                    }}
                >
                    九江史志在线图书馆
                </Title>
                <Menu
                    mode="horizontal"
                    selectedKeys={[menuKey]}
                    onClick={({ key }) => {
                        setMenuKey(key);
                        if (key === "home") navigate("/");
                        else if (key === "ebooks") navigate("/ebooks");
                        else if (key === "history") navigate("/history");
                        else if (key === "user") navigate("/user");
                        else if (key === "stat") message.info("演示系统暂未开放统计");
                        else if (key === "cloud") message.info("电子资源后续上线");
                    }}
                    style={{
                        flex: 1,
                        minWidth: 480,
                        fontWeight: 500,
                        fontSize: 16,
                        background: "transparent",
                    }}
                    items={[
                        { key: "home", icon: <BookOutlined />, label: "首页" },
                        { key: "ebooks", icon: <ReadOutlined />, label: "电子书专区" },
                        //{ key: "stat", icon: <PieChartOutlined />, label: "借阅统计" },
                        { key: "history", icon: <PieChartOutlined />, label: "借阅历史" },
                        { key: "cloud", icon: <CloudOutlined />, label: "电子资源" },
                        { key: "user", icon: <UserOutlined />, label: "用户中心" },
                    ]}





                />
                <Button
                    type="link"
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("username");
                        localStorage.removeItem("role");
                        setIsLogin(false);
                    }}
                >
                    退出登录
                </Button>
                <div
                    style={{
                        minWidth: 120,
                        textAlign: "right",
                        color: "#888",
                        fontSize: 13,
                    }}
                >
                    欢迎您登录线上图书馆
                </div>
            </div>
        </Header>
    );
}
