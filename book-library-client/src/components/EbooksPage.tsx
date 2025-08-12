// EbooksPage.tsx
//import React, { useState } from 'react';
import { useState } from 'react';

import { List, Card, Tag, Button, Input } from 'antd';
import { BookOutlined, ReadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../services/bookApi'; // 假设Book类型已定义

export default function EbooksPage({ books }: { books: Book[] }) {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const ebooks = books.filter(b => b.isEbook);
    const filtered = ebooks.filter(
        b =>
            b.title.includes(search) ||
            (b.author && b.author.includes(search)) ||
            (b.category && b.category.includes(search))
    );
    //const withFullHost = (url?: string) =>
    //    !url ? ""
    //        : url.startsWith("http")
    //            ? url
    //            : `https//localhost:7013${url}`;


    return (

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
            <h2>
                <ReadOutlined style={{ color: "#bfa058", fontSize: 26, marginRight: 10 }} />
                电子书专区
            </h2>
            <Input.Search
                placeholder="搜索书名/作者/分类"
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                style={{ marginBottom: 20, width: 350 }}
            />
            <List
                grid={{ gutter: 18, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={filtered}
                renderItem={book => (
                    <List.Item>
                        <Card
                            hoverable
                            cover={book.coverUrl && (
                                <img
                                    src={
                                        book.coverUrl.startsWith("http")
                                            ? book.coverUrl
                                            : `http://localhost:7013${book.coverUrl}`
                                    }
                                    alt={book.title}
                                    style={{ height: 160, objectFit: "cover" }}
                                />
                            )}
                            style={{ borderColor: "#bfa058", minHeight: 280, borderRadius: 12 }}
                            actions={[
                                book.canReadOnline && book.ebookUrl && (
                                    <Button
                                        key="read"
                                        type="primary"
                                        icon={<ReadOutlined />}
                                        onClick={() => navigate(`/reader/${book.id}`)}
                                    >
                                        在线阅读
                                    </Button>
                                )
                                //book.ebookUrl && (
                                //    <Button
                                //        key="download"
                                //        type="link"
                                //        href={book.ebookUrl}
                                //        target="_blank"
                                //        download
                                //    >
                                //        下载
                                //    </Button>
                                //)
                            ]}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 10
                            }}>
                                <BookOutlined style={{ color: "#bfa058", marginRight: 7 }} />
                                <span style={{
                                    fontWeight: "bold",
                                    fontSize: 17,
                                    color: "#5a4126"
                                }}>
                                    {book.title}
                                </span>
                            </div>
                            <div style={{ color: "#555" }}>作者：{book.author || "-"}</div>
                            <div style={{ color: "#888" }}>分类：{book.category || "-"}</div>
                            <div>
                                <Tag color="geekblue">电子书</Tag>
                                {book.publisher && <Tag color="blue">{book.publisher}</Tag>}
                                {book.publishDate && <Tag>{book.publishDate}</Tag>}
                            </div>
                        </Card>
                    </List.Item>
                )}
                pagination={{ pageSize: 8, showSizeChanger: true }}
                locale={{ emptyText: "暂无电子书" }}
            />
        </div>
    );
}
