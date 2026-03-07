import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Chào bạn! Mình là trợ lý TicketPro. Mình có thể giúp gì cho bạn về thông tin sự kiện và vé không?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/ai/chat', {
                message: userMsg
            });

            setMessages(prev => [...prev, { role: 'ai', content: response.data.answer }]);
        } catch (error) {
            console.error("Lỗi chat AI:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Xin lỗi, hiện tại mình đang gặp trục trặc kỹ thuật. Bạn vui lòng thử lại sau nhé!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="tp-chat-widget">
            <button
                className={`tp-chat-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle AI Chat"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="tp-chat-window">
                    <div className="tp-chat-header">
                        <div className="tp-chat-avatar">🤖</div>
                        <div className="tp-chat-header-info">
                            <h4>Trợ lý TicketPro</h4>
                            <p>Đang trực tuyến</p>
                        </div>
                    </div>

                    <div className="tp-chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`tp-chat-message ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="tp-typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="tp-chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            className="tp-chat-input"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className="tp-chat-send" disabled={!input.trim() || isLoading}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
