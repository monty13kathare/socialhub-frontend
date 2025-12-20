import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type FormEvent,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";
import { getMessages } from "../api/chat";
import { getUser } from "../utils/userStorage";
import { Send, Image, Smile, MoreVertical, ChevronLeft } from "lucide-react";
import MessageBubble from "../components/message/MessageBubble";

// Types
interface User {
  _id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  _id: string;
  senderId: string | User;
  content: string;
  type: "text" | "image";
  createdAt: string;
  status?: "sent" | "delivered" | "read";
}

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any | null>(null);

  const { state } = useLocation();
  const { conversationId } = useParams();
  const selectedUser = state?.user as any | undefined;
  const currentUser: any = getUser();

  // Get sender ID utility
  const getSenderId = useCallback((sender: string | User) => {
    return typeof sender === "string" ? sender : sender?._id;
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Socket connection
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  // Fetch messages and setup socket events
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await getMessages(conversationId);
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    socket.emit("join_conversation", conversationId);

    socket.on("typing", (data: { userId: string }) => {
      setIsTyping(true);
      console.log("typing data", data);
      setTypingUser(data);
    });

    socket.on("stop_typing", () => {
      setIsTyping(false);
      setTypingUser(null);
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [conversationId]);

  useEffect(() => {
    const handleReceiveMessage = (msg: Message) => {
      setMessages((prev) => {
        // 👇 If this is MY message, replace temp message
        if (getSenderId(msg.senderId) === currentUser._id) {
          return prev.map((m) =>
            m._id.startsWith("temp-") ? { ...msg, status: "delivered" } : m
          );
        }

        // 👇 Receiver side: avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;

        return [...prev, { ...msg, status: "delivered" }];
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join_conversation", conversationId);

    return () => {
      socket.emit("leave_conversation", conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    const handleReceiveMessage = (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, { ...msg, status: "delivered" }];
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (!isLoading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isTyping]);

  // Send message
  const sendMessage = (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !conversationId || isSending) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      _id: tempId,
      senderId: currentUser._id,
      content: text.trim(),
      type: "text",
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setText("");
    setIsSending(true);

    socket.emit(
      "send_message",
      {
        conversationId,
        senderId: currentUser._id,
        content: optimisticMessage.content,
      },
      (res: any) => {
        setIsSending(false);

        if (res?.success) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempId ? { ...res.message, status: "delivered" } : m
            )
          );
        }
      }
    );
  };

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    socket.emit("typing", {
      conversationId,
      userId: currentUser._id,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId });
    }, 2000);
  }, [conversationId, currentUser._id]);

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-r from-purple-500 to-pink-500 animate-pulse" />
          <h2 className="text-xl font-semibold text-white">
            Select a conversation
          </h2>
          <p className="text-gray-400 mt-2">Choose someone to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col  max-h-[calc(100vh-5rem)] bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="fixed w-full top-20 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className=" text-gray-300 hover:text-white">
              <ChevronLeft className="w-6 h-6" onClick={() => navigate(-1)} />
            </button>
            <div className="relative">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500"
              />
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                  !selectedUser.isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </div>
            <div>
              <h2 className="text-white font-bold">{selectedUser.name}</h2>
              <div className="flex items-center gap-2">
                {isTyping && typingUser === selectedUser._id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-purple-400 ml-1">
                      typing...
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {!selectedUser.isOnline ? "Active now" : "recently"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth max-h-full mt-20"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-pink-500 animate-spin" />
              <p className="text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <div className="w-24 h-24 rounded-full bg-linear-to-r from-purple-500/20 to-pink-500/20 mb-6 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Send className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-400 max-w-md">
              Send your first message to {selectedUser.name} and start chatting
            </p>
          </div>
        ) : (
          <>
            <div className="text-center my-6">
              <span className="text-xs text-gray-500 bg-gray-900 px-4 py-2 rounded-full">
                Today
              </span>
            </div>
            {messages.map((msg, index) => {
              const isMine = getSenderId(msg.senderId) === currentUser._id;
              const prevMessage = messages[index - 1];
              const showAvatar =
                !prevMessage ||
                getSenderId(prevMessage.senderId) !==
                  getSenderId(msg.senderId) ||
                new Date(msg.createdAt).getTime() -
                  new Date(prevMessage.createdAt).getTime() >
                  300000; // 5 minutes
              const showStatus = !isMine || index === messages.length - 1;

              return (
                <div key={msg._id} className="animate-fadeIn">
                  <MessageBubble
                    message={msg}
                    isMine={isMine}
                    showAvatar={!isMine && showAvatar}
                    showStatus={showStatus}
                    selectedUser={selectedUser}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 p-4">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <Image className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message..."
              className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-2xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-32"
              rows={1}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <button
                type="submit"
                disabled={!text.trim() || isSending}
                className={`
                  p-2 rounded-full transition-all duration-300
                  ${
                    text.trim()
                      ? "bg-linear-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
