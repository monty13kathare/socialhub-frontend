import { useState, useEffect, useRef } from "react";

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
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: "text" | "image" | "file";
  reactions?: { emoji: string; users: string[] }[];
}

interface ChatProps {
  user: User;
  onBack?: () => void;
  isMobile?: boolean;
  initialMessages?: Message[];
  onMessageSend?: (message: string) => void;
}

export default function Chat({
  user,
  onBack,
  isMobile = false,
  initialMessages = [],
  onMessageSend,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messageStatus, setMessageStatus] = useState<
    "sending" | "sent" | "failed" | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [newMessage]);

  // Mock initial messages if none provided
  useEffect(() => {
    if (initialMessages.length === 0) {
      const defaultMessages: Message[] = [
        {
          id: "1",
          senderId: user.id,
          content: "Hey there! How are you doing?",
          timestamp: "10:30 AM",
          isRead: true,
          type: "text",
        },
        {
          id: "2",
          senderId: "current",
          content:
            "I'm doing great! Just finished the project we were talking about.",
          timestamp: "10:31 AM",
          isRead: true,
          type: "text",
        },
        {
          id: "3",
          senderId: user.id,
          content: "That's awesome! Can you share the details?",
          timestamp: "10:32 AM",
          isRead: true,
          type: "text",
        },
        {
          id: "4",
          senderId: "current",
          content: "Sure! I'll send you the documentation later today.",
          timestamp: "10:33 AM",
          isRead: true,
          type: "text",
        },
        {
          id: "5",
          senderId: user.id,
          content: "Perfect! Looking forward to it. 🚀",
          timestamp: "10:34 AM",
          isRead: true,
          type: "text",
          reactions: [{ emoji: "👍", users: ["current"] }],
        },
      ];
      setMessages(defaultMessages);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setMessageStatus("sending");

    // Create temporary message (will be replaced with actual response)
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: "current",
      content: messageContent,
      timestamp: "Sending...",
      isRead: false,
      type: "text",
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      // If custom message handler provided, use it
      if (onMessageSend) {
        await onMessageSend(messageContent);
      }

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Replace temporary message with confirmed one
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? {
                ...msg,
                id: Date.now().toString(),
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isRead: true,
              }
            : msg
        )
      );

      setMessageStatus("sent");

      // Simulate typing indicator and response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: user.id,
          content: getRandomResponse(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isRead: false,
          type: "text",
        };
        setMessages((prev) => [...prev, response]);
      }, 2000);
    } catch (error) {
      // Mark message as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? { ...msg, timestamp: "Failed to send" }
            : msg
        )
      );
      setMessageStatus("failed");
      console.error("Failed to send message:", error);
    }
  };

  const getRandomResponse = () => {
    const responses = [
      "That's interesting! Tell me more.",
      "I see what you mean. 🤔",
      "Thanks for sharing that!",
      "That sounds amazing!",
      "I totally agree with you.",
      "Let me think about that...",
      "That's a great point!",
      "I'm glad you mentioned that.",
      "Could you elaborate on that?",
      "That's really helpful, thank you!",
      "I've been thinking about that too.",
      "That makes perfect sense.",
      "Interesting perspective!",
      "I appreciate you sharing that.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(
            (r) => r.emoji === emoji
          );
          if (existingReaction) {
            // Remove reaction if user already reacted
            if (existingReaction.users.includes("current")) {
              const updatedReactions =
                existingReaction.users.length > 1
                  ? msg.reactions
                      ?.map((r) =>
                        r.emoji === emoji
                          ? {
                              ...r,
                              users: r.users.filter((u) => u !== "current"),
                            }
                          : r
                      )
                      .filter((r) => r.users.length > 0)
                  : msg.reactions?.filter((r) => r.emoji !== emoji);

              return {
                ...msg,
                reactions: updatedReactions,
              };
            } else {
              // Add user to existing reaction
              return {
                ...msg,
                reactions: msg.reactions?.map((r) =>
                  r.emoji === emoji
                    ? { ...r, users: [...r.users, "current"] }
                    : r
                ),
              };
            }
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                { emoji, users: ["current"] },
              ],
            };
          }
        }
        return msg;
      })
    );
  };

  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  const formatTimestamp = (timestamp: string) => {
    if (timestamp === "Sending..." || timestamp === "Failed to send") {
      return timestamp;
    }
    return timestamp;
  };

  const handleAttachment = (type: "image" | "file") => {
    // Simulate file input click
    const input = document.createElement("input");
    input.type = "file";
    if (type === "image") {
      input.accept = "image/*";
    } else {
      input.accept = "*/*";
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle file upload logic here
        console.log("Selected file:", file);
        // You would typically upload the file and then send a message with the file URL
      }
    };

    input.click();
  };

  const retryFailedMessage = (messageId: string) => {
    const failedMessage = messages.find((msg) => msg.id === messageId);
    if (failedMessage && failedMessage.timestamp === "Failed to send") {
      setNewMessage(failedMessage.content);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      {/* Chat Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && onBack && (
              <button
                onClick={onBack}
                className="text-slate-400 hover:text-white p-2 transition-colors rounded-xl hover:bg-slate-700/50"
                title="Back to conversations"
              >
                ←
              </button>
            )}
            <div className="relative">
              <div className="w-12 h-12 bg-linear-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                {user.avatar}
              </div>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-white font-semibold">{user.name}</h2>
                {user.verified && (
                  <span className="text-blue-400" title="Verified">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm">
                {user.isOnline ? (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Online</span>
                  </span>
                ) : (
                  `Last seen ${user.lastSeen}`
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all"
              title="Voice call"
            >
              📞
            </button>
            <button
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all"
              title="Video call"
            >
              🎥
            </button>
            <button
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all"
              title="Conversation info"
            >
              ⓘ
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {/* {!isConnected && (
                <div className="bg-yellow-500/20 text-yellow-200 px-4 py-2 text-sm text-center">
                    Connection lost. Attempting to reconnect...
                </div>
            )} */}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === "current";
          const isFailed = message.timestamp === "Failed to send";

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
                {/* Avatar - Only show for received messages */}
                {!isOwnMessage && (
                  <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                    {user.avatar}
                  </div>
                )}

                {/* Message Content */}
                <div className="group relative max-w-full">
                  <div
                    className={`rounded-2xl p-4 relative ${
                      isOwnMessage
                        ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-slate-800/50 text-white border border-slate-700/50"
                    } ${isFailed ? "opacity-70" : ""}`}
                  >
                    <p className="text-sm leading-relaxed wrap-break-words">
                      {message.content}
                    </p>
                    <div
                      className={`flex items-center space-x-2 mt-2 ${
                        isOwnMessage ? "text-purple-200" : "text-slate-400"
                      }`}
                    >
                      <span className="text-xs">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {isOwnMessage && message.isRead && (
                        <span className="text-xs">✓✓</span>
                      )}
                    </div>

                    {/* Retry button for failed messages */}
                    {isFailed && (
                      <button
                        onClick={() => retryFailedMessage(message.id)}
                        className="absolute -bottom-2 -right-2 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition-colors"
                        title="Retry sending"
                      >
                        🔄
                      </button>
                    )}
                  </div>

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div
                      className={`flex space-x-1 mt-2 ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.reactions.map((reaction, index) => (
                        <div
                          key={index}
                          className={`bg-slate-700/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center space-x-1 cursor-pointer hover:bg-slate-600/80 transition-colors ${
                            reaction.users.includes("current")
                              ? "ring-1 ring-purple-400"
                              : ""
                          }`}
                          onClick={() =>
                            addReaction(message.id, reaction.emoji)
                          }
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-slate-300">
                            {reaction.users.length}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Reactions */}
                  <div
                    className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                      isOwnMessage
                        ? "left-0 -translate-x-full"
                        : "right-0 translate-x-full"
                    } flex bg-slate-800/90 backdrop-blur-sm rounded-2xl p-1 space-x-1 shadow-lg border border-slate-700/50`}
                  >
                    {quickReactions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(message.id, emoji)}
                        className="w-8 h-8 hover:bg-slate-700/50 rounded-xl transition-all transform hover:scale-110 active:scale-95"
                        title={`Add ${emoji} reaction`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex space-x-3 max-w-xs lg:max-w-md">
              <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                {user.avatar}
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-t border-purple-500/20 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex space-x-1">
            <button
              onClick={() => handleAttachment("image")}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all"
              title="Attach image"
            >
              📷
            </button>
            <button
              onClick={() => handleAttachment("file")}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all"
              title="Attach file"
            >
              📎
            </button>
            <button
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-all"
              title="Add emoji"
            >
              😊
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
              rows={1}
              style={{ minHeight: "44px" }}
            />
            {messageStatus === "sending" && (
              <div className="absolute right-3 top-3 w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || messageStatus === "sending"}
            className="bg-linear-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 disabled:hover:scale-100"
            title="Send message"
          >
            {messageStatus === "sending" ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "➤"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
