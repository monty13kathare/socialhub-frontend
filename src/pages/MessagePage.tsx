import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChatUsers } from "../api/user";
import { createConversation } from "../api/chat";
import { getUser } from "../utils/userStorage";

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
  type: "text" | "image" | "file";
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
  const [activeConversation, setActiveConversation] = useState<string | null>(
    conversationId || null
  );
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  // Mock data for conversations
  const [conversations, setConversations] = useState<any[]>([]);

  // Mock data for messages
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});

  const currentUser: any = getUser();

  useEffect(() => {
    const loadConversations = async () => {
      const data = await getChatUsers();
      setUsers(data?.data);
      console.log("users data", data?.data);
    };

    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const newMessageObj: Message = {
      id: Date.now().toString(),
      conversationId: activeConversation,
      senderId: currentUser._id,
      content: newMessage,
      timestamp: "Just now",
      isRead: false,
      type: "text",
    };

    // Add to messages
    setMessages((prev) => ({
      ...prev,
      [activeConversation]: [
        ...(prev[activeConversation] || []),
        newMessageObj,
      ],
    }));

    // Update conversation last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? {
              ...conv,
              lastMessage: newMessageObj,
              unreadCount: 0,
            }
          : conv
      )
    );

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationDisplayName = (conversation: Conversation): string => {
    if (conversation.isGroup && conversation.groupName) {
      return conversation.groupName;
    }
    return conversation.participants[0]?.name || "Unknown";
  };

  const getConversationAvatar = (conversation: Conversation): string => {
    if (conversation.isGroup && conversation.groupAvatar) {
      return conversation.groupAvatar;
    }
    return conversation.participants[0]?.avatar || "?";
  };

  const getOnlineStatus = (conversation: Conversation): string => {
    if (conversation.isGroup) {
      const onlineCount = conversation.participants.filter(
        (p) => p.isOnline
      ).length;
      return `${onlineCount} online`;
    }
    const participant = conversation.participants[0];
    return participant?.isOnline
      ? "Online"
      : `Last seen ${participant?.lastSeen}`;
  };

  // const filteredConversations = conversations.filter(conv =>
  //   getConversationDisplayName(conv).toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const currentConversation = activeConversation
    ? conversations.find((c) => c.id === activeConversation)
    : null;
  const currentMessages = activeConversation
    ? messages[activeConversation] || []
    : [];

  const handleUserClick = async (user: any) => {
    const res = await createConversation(user._id);

    const conversationId = res.data._id;
    navigate(`/messages/${conversationId}`, {
      state: { user }, // 👈 pass full user data
    });
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-900">
      {/* Conversations List */}
      <div
        className={`${
          activeConversation ? "hidden md:flex" : "flex"
        } w-full md:w-96 flex-col bg-slate-800/50 backdrop-blur-xl border-r border-purple-500/20`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            {/* <button className="w-10 h-10 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white hover:from-purple-700 hover:to-pink-700 transition-all">
              ✏️
            </button> */}
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
          {users.map((user: any) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user)}
              className={`p-4 border-b border-slate-700/30 cursor-pointer transition-all hover:bg-slate-700/30`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-14 h-14 bg-linear-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      user.name[0]
                    )}
                  </div>
                  {!user?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {user.name}
                    </h3>
                    <span className="text-slate-400 text-xs whitespace-nowrap">
                      {/* {conversation.lastMessage.timestamp} */}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm truncate mb-1">
                    {/* {conversation.lastMessage.content} */}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs">
                      {/* {getOnlineStatus(conversation)} */}
                      {!user.isOnline ? "online" : "offline"}
                    </span>
                    {/* {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`${
          activeConversation ? "flex" : "hidden md:flex"
        } w-full flex-col bg-slate-900/50`}
      >
        {activeConversation && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-slate-800/50 backdrop-blur-xl border-b border-purple-500/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setActiveConversation(null);
                      navigate("/messages");
                    }}
                    className="md:hidden text-slate-400 hover:text-white p-2"
                  >
                    ←
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 bg-linear-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold">
                      {getConversationAvatar(currentConversation)}
                    </div>
                    {!currentConversation.isGroup &&
                      currentConversation.participants[0]?.isOnline && (
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
                const isOwnMessage = message.senderId === currentUser._id;
                const sender = isOwnMessage
                  ? currentUser
                  : currentConversation.participants.find(
                      (p: any) => p.id === message.senderId
                    ) || currentConversation.participants[0];

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex space-x-3 max-w-xs lg:max-w-md ${
                        isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      {!isOwnMessage && (
                        <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                          {sender?.avatar || "?"}
                        </div>
                      )}

                      {/* Message Content */}
                      <div
                        className={`rounded-2xl p-4 ${
                          isOwnMessage
                            ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-slate-800/50 text-white border border-slate-700/50"
                        }`}
                      >
                        {!currentConversation.isGroup && !isOwnMessage && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-sm">
                              {sender?.name}
                            </span>
                            {sender?.verified && (
                              <span className="text-blue-400 text-xs">✓</span>
                            )}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <div
                          className={`text-xs mt-2 ${
                            isOwnMessage ? "text-purple-200" : "text-slate-400"
                          }`}
                        >
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
                    style={{ minHeight: "44px", maxHeight: "120px" }}
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
            <h3 className="text-2xl font-bold text-white mb-2">
              Your Messages
            </h3>
            <p className="text-slate-400 mb-6 max-w-md">
              Send private messages to your friends or start a group
              conversation. Your chats will appear here.
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
