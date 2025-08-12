import { Carousel, Button } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import { useRef } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

// 导航栏和 Banner 高度
const NAV_HEIGHT = 72;
const BANNER_HEIGHT = 220;
export const TOTAL_TOP = NAV_HEIGHT + BANNER_HEIGHT; // 292px

const banners = [
    {
        img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
        title: "穿越时光的典藏",
        desc: "探索珍贵的历史典籍，阅览文明的璀璨足迹。",
        btn: "立即查阅",
        link: "/",
        key: "home"
    },
    {
        img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=1200&q=80",
        title: "数字图书·新体验",
        desc: "随时随地，开启在线阅读，海量电子资源等你发现。",
        btn: "电子资源",
        link: "/cloud",
        key: "cloud"
    },
    {
        img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
        title: "学术借阅 智慧传承",
        desc: "便捷借还，个人借阅中心一站管理。",
        btn: "我的借阅",
        link: "/history",
        key: "history"
    }
];

type BannerCarouselProps = {
    menuKey: string;
    setMenuKey: (v: string) => void;
    setIsLogin: (v: boolean) => void;
};

export default function BannerCarousel({ menuKey, setMenuKey, setIsLogin }: BannerCarouselProps) {
    const carouselRef = useRef<CarouselRef>(null);
    const navigate = useNavigate();

    const handleBannerClick = (item: typeof banners[0]) => {
        setMenuKey(item.key);
        navigate(item.link);
    };

    return (
        <>
            {/* 固定的导航 + Banner */}
            <div
                style={{
                    width: "100%",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    zIndex: 1100,
                    background: "#fff",
                }}
            >
                <NavBar menuKey={menuKey} setMenuKey={setMenuKey} setIsLogin={setIsLogin} />
                <div
                    style={{
                        width: "100%",
                        height: BANNER_HEIGHT,
                        background: "linear-gradient(90deg, #fffae0 0%, #f7e2bb 100%)",
                        borderRadius: "0 0 20px 20px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: 1400,
                            height: BANNER_HEIGHT,
                            position: "relative",
                            borderRadius: 16,
                            overflow: "hidden",
                            margin: "0 auto"
                        }}
                    >
                        <Carousel
                            autoplay
                            pauseOnHover
                            effect="fade"
                            dots
                            ref={carouselRef}
                            style={{ width: "100%", height: BANNER_HEIGHT }}
                        >
                            {banners.map((item, idx) => (
                                <div key={idx}>
                                    <div
                                        style={{
                                            width: "100%",
                                            height: BANNER_HEIGHT,
                                            background: `url(${item.img}) center/cover no-repeat`,
                                            position: "relative",
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                top: 0,
                                                width: "100%",
                                                height: "100%",
                                                background:
                                                    "linear-gradient(90deg,rgba(247,226,187,0.97) 32%,rgba(255,255,255,0.06) 100%)",
                                                zIndex: 1,
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: "relative",
                                                zIndex: 2,
                                                display: "flex",
                                                alignItems: "center",
                                                height: "100%",
                                                paddingLeft: 64,
                                            }}
                                        >
                                            <div>
                                                <h2
                                                    style={{
                                                        fontSize: 28,
                                                        color: "#a97b2b",
                                                        fontWeight: 700,
                                                        marginBottom: 8,
                                                        letterSpacing: 2,
                                                        fontFamily: "STSong,serif",
                                                    }}
                                                >
                                                    {item.title}
                                                </h2>
                                                <div
                                                    style={{
                                                        fontSize: 16,
                                                        color: "#553c18",
                                                        marginBottom: 20,
                                                        maxWidth: 450,
                                                    }}
                                                >
                                                    {item.desc}
                                                </div>
                                                <Button
                                                    type="primary"
                                                    size="middle"
                                                    style={{
                                                        background: "#e6c086",
                                                        border: "none",
                                                        color: "#553c18",
                                                        fontWeight: 600,
                                                    }}
                                                    onClick={() => handleBannerClick(item)}
                                                >
                                                    {item.btn}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                        {/* 左右箭头按钮 */}
                        <Button
                            type="default"
                            icon={<LeftOutlined />}
                            style={{
                                position: "absolute",
                                left: 14,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "#fffbe6cc",
                                border: "none",
                                boxShadow: "0 2px 8px #e6c08644",
                                zIndex: 10,
                            }}
                            shape="circle"
                            size="large"
                            onClick={() => carouselRef.current?.prev()}
                        />
                        <Button
                            type="default"
                            icon={<RightOutlined />}
                            style={{
                                position: "absolute",
                                right: 14,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "#fffbe6cc",
                                border: "none",
                                boxShadow: "0 2px 8px #e6c08644",
                                zIndex: 10,
                            }}
                            shape="circle"
                            size="large"
                            onClick={() => carouselRef.current?.next()}
                        />
                    </div>
                </div>
            </div>

            {/* 占位，推开后面内容 */}
            <div style={{ height: TOTAL_TOP }} />
        </>
    );
}
