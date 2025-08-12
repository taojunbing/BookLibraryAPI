import { useEffect, useState } from "react";
import { List, Card, Spin, Button, Checkbox, Tag, Typography, message } from "antd";
import { getBorrowHistory, returnBooks } from "../services/bookApi";

const { Title } = Typography;

export default function BorrowHistory() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);

    // 拉取借阅历史
    const fetchHistory = () => {
        setLoading(true);
        getBorrowHistory()
            .then(res => setHistory(res.data))
            .catch(() => message.error("获取借阅历史失败"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // 勾选
    const onCheck = (checked: boolean, id: number) => {
        setSelected(list => checked ? [...list, id] : list.filter(x => x !== id));
    };

    // 批量归还
    const onBatchReturn = async () => {
        if (selected.length === 0) return;
        setLoading(true);
        try {
            await returnBooks(selected);
            message.success("归还成功！");
            setSelected([]);
            fetchHistory();
        } catch {
            message.error("归还失败！");
        } finally {
            setLoading(false);
        }
    };

    // 单条归还
    const onReturnOne = async (id: number) => {
        setLoading(true);
        try {
            await returnBooks([id]);
            message.success("归还成功！");
            setSelected(list => list.filter(x => x !== id));
            fetchHistory();
        } catch {
            message.error("归还失败！");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={<Title level={4} style={{ margin: 0 }}>借阅历史</Title>}
            extra={
                <Button
                    type="primary"
                    disabled={selected.length === 0}
                    onClick={onBatchReturn}
                >
                    批量归还
                </Button>
            }
            style={{ maxWidth: 780, margin: "36px auto", borderRadius: 12 }}
        >
            <Spin spinning={loading}>
                <List
                    dataSource={history}
                    locale={{ emptyText: "暂无借阅记录" }}
                    pagination={{ pageSize: 8, showSizeChanger: true }}
                    renderItem={record => (
                        <List.Item
                            style={{ borderBottom: "1px solid #f0f0f0", alignItems: "center" }}
                            actions={[
                                !record.isReturned &&
                                <Button
                                    size="small"
                                    danger
                                    onClick={() => onReturnOne(record.id)}
                                >归还</Button>
                            ]}
                        >
                            <Checkbox
                                checked={selected.includes(record.id)}
                                disabled={record.isReturned}
                                style={{ marginRight: 14 }}
                                onChange={e => onCheck(e.target.checked, record.id)}
                            />
                            <div style={{ flex: 1 }}>
                                <div>
                                    <span style={{ fontWeight: 500 }}>{record.bookTitle || "【未知图书】"}</span>
                                    <Tag color={record.isReturned ? "gray" : "green"} style={{ marginLeft: 10 }}>
                                        {record.isReturned ? "已归还" : "借阅中"}
                                    </Tag>
                                </div>
                                <div style={{ fontSize: 13, color: "#888" }}>
                                    借阅时间：{new Date(record.borrowTime).toLocaleString()}
                                    {record.isReturned && (
                                        <>，归还时间：{new Date(record.returnTime).toLocaleString()}</>
                                    )}
                                    {!record.isReturned && record.dueTime && (
                                        <>，到期：{new Date(record.dueTime).toLocaleDateString()}</>
                                    )}
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </Spin>
        </Card>
    );
}
