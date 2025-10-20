import React, { useRef, useEffect } from 'react';
import { useAdminChat } from '../hooks/useAdminChat';
import { ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon } from '../components/ui/icons';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
};

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return formatTime(isoString);
    }
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

const ChatView: React.FC = () => {
    const { 
        conversations, 
        selectedStaffId, 
        selectConversation, 
        selectedConversationMessages, 
        isLoading, 
        error,
        postMessage,
        isSending,
        currentUser
    } = useAdminChat();
    
    const [newMessage, setNewMessage] = React.useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedConversationMessages]);
    
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
    
    if (isLoading) {
        return <div className="flex-grow flex items-center justify-center"><Loader /></div>;
    }

    if (error) {
        return <div className="flex-grow flex items-center justify-center text-red-500">เกิดข้อผิดพลาด: {error.message}</div>;
    }

    const selectedStaff = conversations.find(c => c.staffMember.id === selectedStaffId)?.staffMember;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none dark:border dark:border-slate-800 flex flex-grow min-h-0 h-full">
            {/* Left Panel: Conversation List */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 flex-shrink-0">
                    <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-tinedy-blue"/>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Inbox</h2>
                </header>
                <div className="overflow-y-auto">
                    {conversations.map(convo => (
                        <button
                            key={convo.staffMember.id}
                            onClick={() => selectConversation(convo.staffMember.id)}
                            className={`w-full text-left p-4 flex items-center gap-4 transition-colors ${selectedStaffId === convo.staffMember.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-tinedy-green text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                                {convo.staffMember.name.charAt(0)}
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{convo.staffMember.name}</p>
                                    <p className="text-xs text-slate-400 flex-shrink-0">{formatDate(convo.lastMessage.createdAt)}</p>
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                     <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{convo.lastMessage.content}</p>
                                     {convo.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{convo.unreadCount}</span>
                                     )}
                                </div>
                            </div>
                        </button>
                    ))}
                     {conversations.length === 0 && <p className="text-center text-sm text-slate-500 p-8">No conversations yet.</p>}
                </div>
            </div>

            {/* Right Panel: Chat Window */}
            <div className="w-2/3 flex flex-col">
                {selectedStaffId ? (
                    <>
                        <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Conversation with {selectedStaff?.name}</h3>
                        </header>

                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
                            {selectedConversationMessages.map(msg => {
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
                        
                        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800">
                             <div className="flex items-end gap-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border-transparent focus:ring-tinedy-blue focus:border-tinedy-blue focus:bg-white dark:focus:bg-slate-800 text-sm resize-none transition-colors max-h-32 overflow-y-auto"
                                    rows={1}
                                    disabled={isSending}
                                    style={{ height: 'auto', minHeight: '40px' }}
                                />
                                <Button onClick={handleSend} disabled={!newMessage.trim()} isLoading={isSending}>
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500">
                        <ChatBubbleLeftEllipsisIcon className="w-16 h-16 text-slate-300 dark:text-slate-600"/>
                        <p className="mt-4 font-semibold">Select a conversation</p>
                        <p className="text-sm">Choose a staff member from the left to view messages.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatView;