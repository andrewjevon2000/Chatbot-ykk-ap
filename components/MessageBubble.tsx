import React from 'react';
import { Message, Role } from '../types';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm sm:text-base leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-white border border-gray-100 text-slate-800 rounded-tl-none'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => <a {...props} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" />,
                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-4 mb-2 space-y-1" />,
                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-4 mb-2 space-y-1" />,
                p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                strong: ({ node, ...props }) => <strong {...props} className="font-semibold" />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        )}
        
        {message.isError && (
          <p className="text-red-200 text-xs mt-2 italic">Failed to send message. Please try again.</p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;