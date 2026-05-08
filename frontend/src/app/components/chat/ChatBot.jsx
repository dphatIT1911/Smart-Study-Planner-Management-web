import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import config from '../../../config';

const BASE = config.API_BASE_URL?.endsWith('/') ? config.API_BASE_URL.slice(0, -1) : config.API_BASE_URL;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Chào bạn! Mình là AI Trợ lý học tập. Bạn cần tư vấn điều gì hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token hết hạn hoặc không hợp lệ -> Xóa và bắt đăng nhập lại
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error('Lỗi kết nối máy chủ');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            if (dataStr === '[ERROR]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content += data.content;
                  return newMessages;
                });
              }
            } catch (err) {
              console.error('Lỗi parse JSON:', err);
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, hệ thống AI đang quá tải hoặc gặp sự cố. Bạn vui lòng thử lại sau nhé!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 z-[9999] flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? 20 : 0, pointerEvents: isOpen ? 'none' : 'auto' }}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <MessageCircle size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md z-10">
              <div className="flex items-center space-x-3">
                <div className="bg-white text-blue-600 p-1.5 rounded-full shadow-inner">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Tư vấn Học tập AI</h3>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-blue-100 uppercase tracking-wider">Đang hoạt động</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-red-200 transition-colors p-1.5 rounded-full hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm shadow-md' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-md'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="text-[11px] font-semibold text-blue-500 mb-1 flex items-center space-x-1.5">
                        <Bot size={12} /><span>AI Trợ lý</span>
                      </div>
                    )}
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start relative z-10"
                >
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200/60 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] relative z-10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="w-full bg-gray-100 placeholder-gray-400 text-gray-700 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1 text-white bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="translate-x-[1px] translate-y-[-1px]" />
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-[10px] text-gray-400">Được tích hợp OpenAI để tối ưu ChatGPT</p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
