import { Check, CheckCheck } from "lucide-react";

 interface MessageBubbleProps {
   message: any;
   isMine: boolean;
   showAvatar: boolean;
   showStatus?: boolean;
   selectedUser:any;
 }
 
 const MessageBubble = ({ message, isMine, showAvatar, showStatus, selectedUser }: MessageBubbleProps) => {
   const getStatusIcon = () => {
  if (!isMine) return null;

  if (message.status === "sent") return <Check className="w-3 h-3" />;
  if (message.status === "delivered") return <CheckCheck className="w-3 h-3" />;
  if (message.status === "read") return <CheckCheck className="w-3 h-3 text-blue-400" />;
};


    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
        {!isMine && showAvatar && selectedUser && (
          <img
            src={selectedUser.avatar}
            alt={selectedUser.name}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        )}
        
        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
          <div
            className={`
              rounded-2xl px-4 py-3 relative
              ${isMine 
                ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-br-none' 
                : 'bg-gray-800 text-gray-100 rounded-bl-none'
              }
            `}
          >
            <p className="text-sm wrap-break-words whitespace-pre-wrap">{message.content}</p>
            
           
          </div>
          
          <div className={`flex items-center gap-2 mt-1 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
            {isMine && showStatus && (
              <span className="text-gray-400">
                {getStatusIcon()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

export default MessageBubble