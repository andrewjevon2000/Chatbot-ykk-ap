import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, LeadFormData } from './types';
import { initializeChat, sendMessageToGemini } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';
import LeadFormModal from './components/LeadFormModal';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Halo! Saya adalah asisten virtual YKK AP Sinar Fortuna. Bagaimana saya bisa membantu Anda hari ini dengan produk, spesifikasi, atau layanan kami?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session on mount
  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(userText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: response.text,
        timestamp: new Date(),
        groundingSources: response.sources
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: "I'm having trouble connecting right now. Please try again later or contact our team directly.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLeadSubmit = (data: LeadFormData) => {
    // In a real app, send this to a backend
    console.log("Lead captured:", data);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <img 
            src="https://ykksinarfortuna.id/wp-content/uploads/2024/09/YKK-Sinar-Fortuna_11zon.webp" 
            alt="Sinar Fortuna Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">YKK AP Sinar Fortuna</h1>
            <p className="text-xs text-green-600 font-medium flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Online
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsLeadFormOpen(true)}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-blue-200"
        >
          Request Quote
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="max-w-3xl mx-auto w-full">
            <div className="text-center text-xs text-gray-400 my-4 uppercase tracking-widest">
              Today
            </div>
            
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
               <div className="flex w-full mb-4 justify-start">
                 <TypingIndicator />
               </div>
            )}
            
            <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto relative flex items-end space-x-2">
          <div className="relative flex-1 bg-gray-100 rounded-2xl border border-transparent focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Silahkan tanyakan mengenai kebutuhan bpk/ibu disini"
              className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-slate-800 placeholder-slate-400 resize-none max-h-32 min-h-[50px] overflow-y-auto"
              rows={1}
              style={{ minHeight: '52px' }} // prevent layout shift
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-full flex-shrink-0 transition-all ${
              !inputValue.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            <svg className="w-6 h-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-gray-400">
