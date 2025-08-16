import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

const ChatRoom: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Join chat room
    if (user) {
      newSocket.emit('user_online', user.id);
    }

    // Listen for events
    newSocket.on('chat_history', (history: Message[]) => {
      setMessages(history);
    });

    newSocket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('online_users_count', (count: number) => {
      setOnlineCount(count);
    });

    newSocket.on('user_typing', (data: { userId: string; userName: string }) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.userName), data.userName]);
      }
    });

    newSocket.on('user_stop_typing', (data: { userId: string; userName: string }) => {
      setTypingUsers(prev => prev.filter(u => u !== data.userName));
    });

    return () => {
      newSocket.close();
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket || !user) return;

    socket.emit('chat_message', {
      userId: user.id,
      userName: user.name,
      message: message.trim()
    });

    setMessage('');
    handleStopTyping();
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    
    if (!isTyping && socket && user) {
      setIsTyping(true);
      socket.emit('typing', { userId: user.id, userName: user.name });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping && socket && user) {
      setIsTyping(false);
      socket.emit('stop_typing', { userId: user.id, userName: user.name });
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (msg: Message) => msg.userId === user?.id;

  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col pt-8 mt-16">
      {/* Chat Header */}
      <div className={`p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-t-lg shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              💬 DevHub Chat
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Connect with fellow developers
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {onlineCount} online
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              No messages yet
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Be the first to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwnMessage(msg)
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-white text-gray-900 shadow-sm'
              }`}>
                {!isOwnMessage(msg) && (
                  <div className={`text-xs font-medium mb-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {msg.userName}
                  </div>
                )}
                <div className="text-sm">{msg.message}</div>
                <div className={`text-xs mt-1 ${
                  isOwnMessage(msg)
                    ? 'text-blue-200'
                    : isDark
                      ? 'text-gray-500'
                      : 'text-gray-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce delay-100 ${isDark ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce delay-200 ${isDark ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className={`p-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-b-lg`}>
        <div className="flex space-x-3">
          <input
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
        <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {message.length}/500 characters
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;