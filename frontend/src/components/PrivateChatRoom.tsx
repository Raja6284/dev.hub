import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface Message {
  _id: string;
  sender: string;
  senderName: string;
  recipient: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ChatRoom {
  _id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

const PrivateChatRoom: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Join private chat system
    if (user) {
      newSocket.emit('join_private_chat', user.id);
    }

    // Listen for events
    newSocket.on('private_message', (msg: Message) => {
      if (selectedChat && (msg.sender === selectedChat || msg.recipient === selectedChat)) {
        setMessages(prev => [...prev, msg]);
      }
      updateChatRooms(msg);
    });

    newSocket.on('user_typing_private', (data: { userId: string; userName: string; chatId: string }) => {
      if (data.chatId === selectedChat && data.userId !== user?.id) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.userName), data.userName]);
      }
    });

    newSocket.on('user_stop_typing_private', (data: { userId: string; userName: string; chatId: string }) => {
      if (data.chatId === selectedChat) {
        setTypingUsers(prev => prev.filter(u => u !== data.userName));
      }
    });

    newSocket.on('user_online_status', (data: { userId: string; isOnline: boolean }) => {
      setUsers(prev => prev.map(u => 
        u._id === data.userId ? { ...u, isOnline: data.isOnline } : u
      ));
    });

    fetchUsers();
    fetchChatRooms();

    return () => {
      newSocket.close();
    };
  }, [user, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/search', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { q: searchQuery }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get('/api/chat/rooms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChatRooms(response.data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await axios.get(`/api/chat/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const updateChatRooms = (newMessage: Message) => {
    setChatRooms(prev => {
      const updated = prev.map(room => {
        if (room.participants.includes(newMessage.sender) && room.participants.includes(newMessage.recipient)) {
          return {
            ...room,
            lastMessage: newMessage,
            unreadCount: selectedChat === getChatId(newMessage.sender, newMessage.recipient) ? 0 : room.unreadCount + 1
          };
        }
        return room;
      });
      
      // If no existing room found, create new one
      const existingRoom = updated.find(room => 
        room.participants.includes(newMessage.sender) && room.participants.includes(newMessage.recipient)
      );
      
      if (!existingRoom) {
        updated.push({
          _id: getChatId(newMessage.sender, newMessage.recipient),
          participants: [newMessage.sender, newMessage.recipient],
          lastMessage: newMessage,
          unreadCount: selectedChat === getChatId(newMessage.sender, newMessage.recipient) ? 0 : 1
        });
      }
      
      return updated.sort((a, b) => 
        new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()
      );
    });
  };

  const getChatId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket || !user || !selectedChat) return;

    const recipientId = selectedChat;
    socket.emit('private_message', {
      senderId: user.id,
      senderName: user.name,
      recipientId,
      message: message.trim()
    });

    setMessage('');
    handleStopTyping();
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    
    if (!isTyping && socket && user && selectedChat) {
      setIsTyping(true);
      socket.emit('typing_private', { 
        userId: user.id, 
        userName: user.name, 
        chatId: selectedChat 
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping && socket && user && selectedChat) {
      setIsTyping(false);
      socket.emit('stop_typing_private', { 
        userId: user.id, 
        userName: user.name, 
        chatId: selectedChat 
      });
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const startChat = (userId: string) => {
    setSelectedChat(userId);
    fetchMessages(getChatId(user?.id || '', userId));
    if (isMobileView) {
      setIsMobileView(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSelectedUser = () => {
    return users.find(u => u._id === selectedChat);
  };

  const filteredUsers = users.filter(u => 
    u._id !== user?.id && 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl pt-8 mx-auto h-[600px] flex rounded-lg overflow-hidden shadow-lg">
      {/* Sidebar */}
      <div className={`${isMobileView && selectedChat ? 'hidden' : 'flex'} flex-col w-full md:w-80 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className={`w-full border p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((chatUser) => (
            <div
              key={chatUser._id}
              onClick={() => startChat(chatUser._id)}
              className={`p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 ${
                selectedChat === chatUser._id
                  ? isDark ? 'bg-gray-700' : 'bg-blue-50'
                  : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    isDark ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    {chatUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                    isDark ? 'border-gray-800' : 'border-white'
                  } ${chatUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {chatUser.name}
                  </p>
                  <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {chatUser.isOnline ? 'Online' : `Last seen ${formatTime(chatUser.lastSeen.toString())}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className={`p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isMobileView && (
                    <button
                      onClick={() => setSelectedChat(null)}
                      className={`mr-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      ←
                    </button>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    isDark ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    {getSelectedUser()?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getSelectedUser()?.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getSelectedUser()?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === user?.id
                      ? 'bg-blue-600 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-white text-gray-900 shadow-sm'
                  }`}>
                    <div className="text-sm">{msg.message}</div>
                    <div className={`text-xs mt-1 ${
                      msg.sender === user?.id
                        ? 'text-blue-200'
                        : isDark
                          ? 'text-gray-500'
                          : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
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
                        {typingUsers[0]} is typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className={`p-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
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
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Select a conversation
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose a user from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateChatRoom;