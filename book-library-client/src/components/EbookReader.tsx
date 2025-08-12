import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState, useRef } from "react";
import { Input, Button, Spin, message } from "antd";
import api from "../services/bookApi";

// Worker 路径配置
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const withFullHost = (url?: string) =>
    !url ? ""
        : url.startsWith("http")
            ? url
            : `http://localhost:7013${url}`;

export default function EbookReader() {
    const { id } = useParams<{ id: string }>();
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundPages, setFoundPages] = useState<number[]>([]);
    const documentRef = useRef<any>(null);
    const [pdfUrl, setPdfUrl] = useState<string>("");

    useEffect(() => {
        if (!id) return;
        api.get(`/books/${id}`)
            .then(res => {
                const ebookUrl = res.data.ebookUrl;
                const realUrl = withFullHost(ebookUrl);
                setPdfUrl(realUrl);
            })
            .catch(() => message.error("获取电子书信息失败"));
    }, [id]);

    async function handleSearch() {
        if (!searchText || !numPages || !documentRef.current) return;
        setSearching(true);
        setFoundPages([]);
        try {
            const pdf = documentRef.current.pdf;
            const pagesWithKeyword: number[] = [];
            for (let pageIndex = 1; pageIndex <= numPages; pageIndex++) {
                const page = await pdf.getPage(pageIndex);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                if (pageText.includes(searchText)) {
                    pagesWithKeyword.push(pageIndex);
                }
            }
            setFoundPages(pagesWithKeyword);
            if (pagesWithKeyword.length) {
                setPageNumber(pagesWithKeyword[0]);
            } else {
                message.info("未找到相关内容。");
            }
        } finally {
            setSearching(false);
        }
    }

    return (
        <div
            style={{
                maxWidth: 900,
                margin: "40px auto",
                padding: 24,
                borderRadius: 12,
                background: "#fafbfc",
                boxShadow: "0 4px 24px #0001",
                minHeight: "80vh",
                display: "flex",
                flexDirection: "column"
            }}
        >
            {/* 顶部搜索栏 */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
                position: "relative",
                zIndex: 2,
                background: "#fff",
                padding: "12px 20px",
                borderRadius: 8,
                boxShadow: "0 2px 8px #0001",
            }}>
                <Input.Search
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onSearch={handleSearch}
                    loading={searching}
                    placeholder="全文搜索（关键词）"
                    style={{ width: 320, minWidth: 140, fontSize: 16 }}
                    allowClear
                    enterButton="搜索"
                />
                <Button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(n => Math.max(1, n - 1))}
                >上一页</Button>
                <span style={{ margin: "0 10px", fontSize: 16 }}>
                    第 <b>{pageNumber}</b> / {numPages || '-'} 页
                </span>
                <Button
                    disabled={!!numPages && pageNumber >= numPages}
                    onClick={() => setPageNumber(n => Math.min(numPages || 1, n + 1))}
                >下一页</Button>
                {foundPages.length > 1 && (
                    <Button
                        type="link"
                        onClick={() => {
                            const idx = foundPages.indexOf(pageNumber);
                            if (idx >= 0 && idx < foundPages.length - 1) {
                                setPageNumber(foundPages[idx + 1]);
                            } else {
                                setPageNumber(foundPages[0]);
                            }
                        }}
                        style={{ marginLeft: 18 }}
                    >
                        跳到下一个结果 ({foundPages.length})
                    </Button>
                )}
            </div>
            {/* PDF 阅读区（滚动框架） */}
            <div
                style={{
                    flex: 1,
                    background: "#333",
                    borderRadius: 8,
                    padding: 16,
                    minHeight: 500,
                    boxShadow: "0 2px 16px #2222",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    overflow: "auto", // 关键：内容溢出时滚动
                    maxHeight: "68vh", // 限定阅读区高度
                    marginTop: 12
                }}
            >
                {!pdfUrl ? (
                    <Spin tip="加载电子书链接..." />
                ) : (
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        loading={<Spin tip="加载电子书..." />}
                        inputRef={documentRef}
                    >
                        <Page
                            pageNumber={pageNumber}
                            width={780}
                            loading={<Spin tip="加载页面..." />}
                        />
                    </Document>
                )}
            </div>
        </div>
    );
}
