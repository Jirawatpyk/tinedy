import React, { useState, useRef, useEffect } from 'react';
import { useStaffChat } from '../../hooks/useStaffChat';
import { PaperAirplaneIcon, ChatBubbleLeftEllipsisIcon } from '../../components/ui/icons';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';

const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
};

const StaffChatView: React.FC = () => {
    const { messages, isLoading, error, postMessage, isSending, admin, currentUser } = useStaffChat();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            postMessage(newMessage.trim());
            setNewMessage('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const renderContent = () => {
        if (isLoading) return <div className="flex-grow flex items-center justify-center"><Loader /></div>;
        if (error) return <div className="flex-grow flex items-center justify-center text-red-500">เกิดข้อผิดพลาด: {error.message}</div>;
        if (!admin) return <div className="flex-grow flex items-center justify-center text-slate-500">ไม่พบข้อมูลผู้ดูแลระบบ</div>;

        return (
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isSender = msg.senderId === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : ''}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl ${isSender ? 'bg-tinedy-blue text-white rounded-br-none' : 'bg-white dark:bg-slate-700 rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                             <span className="text-xs text-slate-400 mb-1">{formatTime(msg.createdAt)}</span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col font-rule">
            <header className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0">
                <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-tinedy-blue" />
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-display">
                    ติดต่อผู้ดูแลระบบ
                </h1>
            </header>
            
            {renderContent()}

            <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-end gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="พิมพ์ข้อความ..."
                        className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border-transparent focus:ring-tinedy-blue focus:border-tinedy-blue focus:bg-white dark:focus:bg-slate-800 text-sm resize-none transition-colors max-h-32 overflow-y-auto"
                        rows={1}
                        disabled={!admin || isSending}
                        style={{ height: 'auto', minHeight: '40px' }}
                    />
                    <Button onClick={handleSend} disabled={!newMessage.trim() || !admin} isLoading={isSending}>
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StaffChatView;