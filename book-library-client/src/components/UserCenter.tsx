import { useEffect, useState } from "react";
import {
    Card,
    Button,
    List,
    Tag,
    Typography,
    message,
    Upload,
    Modal,
} from "antd";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import AdminBooks from "./AdminBooks";
import api from "../services/bookApi";

const { Title } = Typography;

export default function UserCenter() {
    const [role, setRole] = useState(() => localStorage.getItem("role") || "User");
    const [borrowed, setBorrowed] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [reloadTick, setReloadTick] = useState(0); // 导入成功后用于刷新 AdminBooks

    // 刷新角色和借阅记录
    const refresh = async () => {
        const r = localStorage.getItem("role") || "User";
        setRole(r);
        if (r !== "Admin") {
            setLoading(true);
            try {
                const res = await api.get("/Borrow/history");
                setBorrowed(res.data || []);
            } catch {
                message.error("获取借阅记录失败");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        refresh();
        const onStorage = () => refresh();
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    /** ========= 批量导入（Excel/CSV） ========= **/
    const handleImport: RcCustomRequestOptions["customRequest"] = async (options) => {
        const { file, onSuccess, onError } = options as any;
        try {
            const form = new FormData();
            form.append("file", file as File); // 后端 IFormFile 参数名：file

            const res = await api.post("/Books/import", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const { success, count, failedRows } = res.data || {};
            if (success) {
                message.success(`导入成功：${count ?? 0} 本`);
                if (Array.isArray(failedRows) && failedRows.length) {
                    Modal.warning({
                        title: "部分数据未导入",
                        width: 560,
                        content: (
                            <div style={{ maxHeight: 260, overflow: "auto" }}>
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {failedRows.map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        ),
                    });
                }
                setReloadTick((t) => t + 1); // 刷新下方表格
                onSuccess?.(res.data);
            } else {
                message.error("导入失败");
                onError?.(new Error("import failed"));
            }
        } catch (err: any) {
            message.error("导入失败：" + (err?.response?.data?.message || err.message));
            onError?.(err);
        }
    };

    const uploadProps = {
        name: "file",
        accept: ".xlsx,.xls,.csv",
        showUploadList: false,
        customRequest: handleImport,
        beforeUpload: (file: File) => {
            const ok =
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xls") ||
                file.name.endsWith(".csv");
            if (!ok) message.warning("请上传 .xlsx / .xls / .csv 文件");
            return ok || Upload.LIST_IGNORE;
        },
    };

    /** ========= 批量导出图书 ========= **/
    const handleExportBooks = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/Books/export", {
                responseType: "blob",
                headers: { Authorization: `Bearer ${token}` },
            });

            let filename = "books.xlsx";
            const disposition = response.headers["content-disposition"];
            if (disposition) {
                const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) filename = decodeURIComponent(match[1].replace(/['"]/g, ""));
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);
        } catch {
            message.error("批量导出失败");
        }
    };

    /** ========= 借阅记录导出 ========= **/
    const handleExportBorrow = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/Borrow/export", {
                responseType: "blob",
                headers: { Authorization: `Bearer ${token}` },
            });

            let filename = "borrow.xlsx";
            const disposition = response.headers["content-disposition"];
            if (disposition) {
                const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) filename = decodeURIComponent(match[1].replace(/['"]/g, ""));
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);
        } catch {
            message.error("借阅记录导出失败");
        }
    };

    /** ========= 管理员页面 ========= **/
    if (role === "Admin") {
        return (
            <div style={{ maxWidth: 1200, margin: "20px auto", padding: "220px 18px 24px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Title level={3}>管理员后台</Title>
                    <Button
                        type="link"
                        danger
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                        }}
                    >
                        退出登录
                    </Button>
                </div>

                {/* 工具栏：导入 / 导出 */}
                <div style={{ marginBottom: 18, display: "flex", gap: 8 }}>
                    <Upload {...uploadProps}>
                        <Button>批量导入</Button>
                    </Upload>
                    <Button onClick={handleExportBooks}>批量导出</Button>
                    <Button onClick={handleExportBorrow}>借阅记录导出</Button>
                </div>

                {/* 隐藏 AdminBooks 自己的工具栏，靠上面这行按钮统一操作；导入后用 key 强制刷新 */}
                <AdminBooks
                    key={reloadTick}
                    showImport={false}
                    showExport={false}
                    showBorrowExport={false}
                    showAdd={false}
                />
            </div>
        );
    }

    /** ========= 普通会员页面 ========= **/
    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Title level={3}>个人借阅中心</Title>
                <Button
                    type="link"
                    danger
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/";
                    }}
                >
                    退出登录
                </Button>
            </div>

            <Card style={{ marginBottom: 20 }}>
                <div>用户名：{localStorage.getItem("username")}</div>
                <div>角色：会员</div>
            </Card>

            <List
                loading={loading}
                dataSource={borrowed}
                locale={{ emptyText: "暂无借阅记录" }}
                pagination={{
                    pageSize: 8,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 8, 10, 20],
                }}
                renderItem={(item) => (
                    <List.Item style={{ padding: "18px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ width: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: "bold", fontSize: 16 }}>
                                    {item.bookTitle || item.title}
                                </span>
                                {item.isReturned ? <Tag color="green">已归还</Tag> : <Tag color="red">未归还</Tag>}
                            </div>
                            <div style={{ color: "#555", margin: "5px 0" }}>
                                <span>作者：</span>
                                {item.bookAuthor || item.author || "-"}
                            </div>
                            <div style={{ color: "#888" }}>
                                <span>借阅时间：</span>
                                {item.borrowTime?.substring(0, 10)}
                                <span style={{ marginLeft: 32 }}>到期时间：</span>
                                {item.dueTime?.substring(0, 10)}
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
}
