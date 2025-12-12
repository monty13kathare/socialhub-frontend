import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  reactions?: string[];
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export default function MessagePage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(conversationId || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for conversations
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      participants: [
        {
          id: '2',
          name: 'Sarah Wilson',
          username: '@sarahw',
          avatar: 'SW',
          verified: true,
          isOnline: true
        }
      ],
      lastMessage: {
        id: '101',
        conversationId: '1',
        senderId: '2',
        content: 'Hey! Did you check the new design specs?',
        timestamp: '2m ago',
        isRead: false,
        type: 'text'
      },
      unreadCount: 2,
      isGroup: false
    },
    {
      id: '2',
      participants: [
        {
          id: '3',
          name: 'Mike Johnson',
          username: '@mikej',
          avatar: 'MJ',
          verified: false,
          isOnline: false,
          lastSeen: '2h ago'
        }
      ],
      lastMessage: {
        id: '102',
        conversationId: '2',
        senderId: '1',
        content: 'Thanks for the help yesterday!',
        timestamp: '1h ago',
        isRead: true,
        type: 'text'
      },
      unreadCount: 0,
      isGroup: false
    },
    {
      id: '3',
      participants: [
        {
          id: '4',
          name: 'Tech Team',
          username: '@techteam',
          avatar: 'TT',
          verified: true,
          isOnline: true
        },
        {
          id: '5',
          name: 'Alex Chen',
          username: '@alexchen',
          avatar: 'AC',
          verified: true,
          isOnline: true
        },
        {
          id: '6',
          name: 'Maria Garcia',
          username: '@mariag',
          avatar: 'MG',
          verified: false,
          isOnline: false
        }
      ],
      lastMessage: {
        id: '103',
        conversationId: '3',
        senderId: '4',
        content: 'Maria: Just pushed the new updates to staging',
        timestamp: '30m ago',
        isRead: false,
        type: 'text'
      },
      unreadCount: 1,
      isGroup: true,
      groupName: 'Tech Team',
      groupAvatar: 'TT'
    },
    {
      id: '4',
      participants: [
        {
          id: '7',
          name: 'Creative Studio',
          username: '@creativestudio',
          avatar: 'CS',
          verified: true,
          isOnline: true
        }
      ],
      lastMessage: {
        id: '104',
        conversationId: '4',
        senderId: '7',
        content: 'Check out our latest project! 🎨',
        timestamp: '1d ago',
        isRead: true,
        type: 'text'
      },
      unreadCount: 0,
      isGroup: false
    }
  ]);

  // Mock data for messages
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({
    '1': [
      {
        id: '1',
        conversationId: '1',
        senderId: '2',
        content: 'Hey there! How are you doing?',
        timestamp: '10:30 AM',
        isRead: true,
        type: 'text'
      },
      {
        id: '2',
        conversationId: '1',
        senderId: '1',
        content: "I'm doing great! Just finished the project we were talking about.",
        timestamp: '10:31 AM',
        isRead: true,
        type: 'text'
      },
      {
        id: '3',
        conversationId: '1',
        senderId: '2',
        content: 'That\'s awesome! Can you share the details?',
        timestamp: '10:32 AM',
        isRead: true,
        type: 'text'
      },
      {
        id: '4',
        conversationId: '1',
        senderId: '1',
        content: 'Sure! I\'ll send you the documentation later today.',
        timestamp: '10:33 AM',
        isRead: true,
        type: 'text'
      },
      {
        id: '5',
        conversationId: '1',
        senderId: '2',
        content: 'Perfect! Looking forward to it.',
        timestamp: '10:34 AM',
        isRead: true,
        type: 'text'
      },
      {
        id: '101',
        conversationId: '1',
        senderId: '2',
        content: 'Hey! Did you check the new design specs?',
        timestamp: '2m ago',
        isRead: false,
        type: 'text'
      }
    ],
    '3': [
      {
        id: '6',
        conversationId: '3',
        senderId: '4',
        content: 'Welcome to the Tech Team group!',
        timestamp: '9:00 AM',
        isRead: true,
        type: 'text'
      },
      {
        id: '7',
        conversationId: '3',
        senderId: '5',
        content: 'Thanks! Excited to be here 🚀',
        timestamp: '9:05 AM',
        isRead: true,
        type: 'text'
      },
      {
        id: '8',
        conversationId: '3',
        senderId: '6',
        content: 'Hello everyone! Looking forward to collaborating.',
        timestamp: '9:10 AM',
        isRead: true,
        type: 'text'
      },
      {
        id: '103',
        conversationId: '3',
        senderId: '4',
        content: 'Maria: Just pushed the new updates to staging',
        timestamp: '30m ago',
        isRead: false,
        type: 'text'
      }
    ]
  });

  const currentUser: User = {
    id: '1',
    name: 'John Doe',
    username: '@johndoe',
    avatar: 'JD',
    verified: false,
    isOnline: true
  };

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const newMessageObj: Message = {
      id: Date.now().toString(),
      conversationId: activeConversation,
      senderId: currentUser.id,
      content: newMessage,
      timestamp: 'Just now',
      isRead: false,
      type: 'text'
    };

    // Add to messages
    setMessages(prev => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMessageObj]
    }));

    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation 
          ? {
              ...conv,
              lastMessage: newMessageObj,
              unreadCount: 0
            }
          : conv
      )
    );

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationDisplayName = (conversation: Conversation): string => {
    if (conversation.isGroup && conversation.groupName) {
      return conversation.groupName;
    }
    return conversation.participants[0]?.name || 'Unknown';
  };

  const getConversationAvatar = (conversation: Conversation): string => {
    if (conversation.isGroup && conversation.groupAvatar) {
      return conversation.groupAvatar;
    }
    return conversation.participants[0]?.avatar || '?';
  };

  const getOnlineStatus = (conversation: Conversation): string => {
    if (conversation.isGroup) {
      const onlineCount = conversation.participants.filter(p => p.isOnline).length;
      return `${onlineCount} online`;
    }
    const participant = conversation.participants[0];
    return participant?.isOnline ? 'Online' : `Last seen ${participant?.lastSeen}`;
  };

  const filteredConversations = conversations.filter(conv =>
    getConversationDisplayName(conv).toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = activeConversation ? conversations.find(c => c.id === activeConversation) : null;
  const currentMessages = activeConversation ? messages[activeConversation] || [] : [];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-900">
      {/* Conversations List */}
      <div className={`${
        activeConversation ? 'hidden md:flex' : 'flex'
      } w-full md:w-96 flex-col bg-slate-800/50 backdrop-blur-xl border-r border-purple-500/20`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <button className="w-10 h-10 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white hover:from-purple-700 hover:to-pink-700 transition-all">
              ✏️
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-3 text-slate-400">🔍</div>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => {
                setActiveConversation(conversation.id);
                navigate(`/messages/${conversation.id}`);
              }}
              className={`p-4 border-b border-slate-700/30 cursor-pointer transition-all ${
                activeConversation === conversation.id
                  ? 'bg-purple-600/20 border-purple-500/40'
                  : 'hover:bg-slate-700/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 bg-linear-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {getConversationAvatar(conversation)}
                  </div>
                  {!conversation.isGroup && conversation.participants[0]?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {getConversationDisplayName(conversation)}
                    </h3>
                    <span className="text-slate-400 text-xs whitespace-nowrap">
                      {conversation.lastMessage.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm truncate mb-1">
                    {conversation.lastMessage.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs">
                      {getOnlineStatus(conversation)}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${
        activeConversation ? 'flex' : 'hidden md:flex'
      } flex-1 flex-col bg-slate-900/50`}>
        {activeConversation && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-slate-800/50 backdrop-blur-xl border-b border-purple-500/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setActiveConversation(null);
                      navigate('/messages');
                    }}
                    className="md:hidden text-slate-400 hover:text-white p-2"
                  >
                    ←
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 bg-linear-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold">
                      {getConversationAvatar(currentConversation)}
                    </div>
                    {!currentConversation.isGroup && currentConversation.participants[0]?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">
                      {getConversationDisplayName(currentConversation)}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {getOnlineStatus(currentConversation)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all">
                    📞
                  </button>
                  <button className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all">
                    🎥
                  </button>
                  <button className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all">
                    ⓘ
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentMessages.map((message) => {
                const isOwnMessage = message.senderId === currentUser.id;
                const sender = isOwnMessage 
                  ? currentUser 
                  : currentConversation.participants.find(p => p.id === message.senderId) 
                  || currentConversation.participants[0];

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-3 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      {!isOwnMessage && (
                        <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                          {sender?.avatar || '?'}
                        </div>
                      )}

                      {/* Message Content */}
                      <div className={`rounded-2xl p-4 ${
                        isOwnMessage
                          ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-slate-800/50 text-white border border-slate-700/50'
                      }`}>
                        {!currentConversation.isGroup && !isOwnMessage && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-sm">{sender?.name}</span>
                            {sender?.verified && (
                              <span className="text-blue-400 text-xs">✓</span>
                            )}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`text-xs mt-2 ${
                          isOwnMessage ? 'text-purple-200' : 'text-slate-400'
                        }`}>
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-slate-800/50 backdrop-blur-xl border-t border-purple-500/20 p-4">
              <div className="flex items-end space-x-4">
                <div className="flex space-x-2">
                  <button className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all">
                    📎
                  </button>
                  <button className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all">
                    🎨
                  </button>
                  <button className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all">
                    😊
                  </button>
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-linear-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ➤
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-32 h-32 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Your Messages</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              Send private messages to your friends or start a group conversation. Your chats will appear here.
            </p>
            <button className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
              Start New Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}