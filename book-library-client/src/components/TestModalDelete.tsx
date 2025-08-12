import { useState } from 'react';
import { Button, Modal } from 'antd';

export default function TestModalDelete() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)} type="primary">
                测试弹窗
            </Button>
            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={() => {
                    Modal.success({ content: '你点了确定！' });
                    setOpen(false);
                }}
                title="测试弹窗"
            >
                这是一个最简单的弹窗Demo！
            </Modal>
        </>
    );
}
