import { useState } from 'react';
import { Button, Modal } from 'antd';
import AddBook from './AddBook';

// 声明 props 类型
interface AddBookModalProps {
    onSuccess?: () => void;
}
export default function AddBookModal({ onSuccess }: AddBookModalProps ) {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <Button type="primary" block onClick={() => setVisible(true)}>
                新增图书
            </Button>
            <Modal
                title="新增图书"
                open={visible}
                onCancel={() => setVisible(false)}
                footer={null}
                destroyOnClose
                maskClosable={false}
            >
                <AddBook
                    onSuccess={() => {
                        setVisible(false);
                        onSuccess?.();
                    }}
                />
            </Modal>
        </>
    );
}
