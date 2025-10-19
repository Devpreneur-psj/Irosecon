'use client';

import { Message, MessageType } from '@/types';
import { formatTime } from '@/ui/utils';
import { PaperClipIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
}

export default function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case MessageType.TEXT:
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
      
      case MessageType.IMAGE:
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <PhotoIcon className="h-4 w-4" />
              <span>이미지</span>
            </div>
            {message.metadata.fileInfo && (
              <img
                src={message.metadata.fileInfo.url}
                alt="Uploaded image"
                className="max-w-xs rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        );
      
      case MessageType.FILE:
        return (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <PaperClipIcon className="h-4 w-4 text-gray-500" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {message.metadata.fileInfo?.name || '파일'}
              </div>
              <div className="text-xs text-gray-500">
                {message.metadata.fileInfo?.size ? 
                  formatFileSize(message.metadata.fileInfo.size) : 
                  '알 수 없는 크기'
                }
              </div>
            </div>
            {message.metadata.fileInfo?.url && (
              <a
                href={message.metadata.fileInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                다운로드
              </a>
            )}
          </div>
        );
      
      case MessageType.SYSTEM:
        return (
          <div className="text-center text-sm text-gray-500 italic">
            {message.content}
          </div>
        );
      
      default:
        return <div>{message.content}</div>;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">💬</div>
          <p>대화를 시작해보세요</p>
          <p className="text-sm">메시지를 입력하여 상담을 시작할 수 있습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.senderNickname === currentUserId;
        const isSystem = message.type === MessageType.SYSTEM;

        if (isSystem) {
          return (
            <div key={message.id} className="flex justify-center">
              <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                {message.content}
              </div>
            </div>
          );
        }

        return (
          <div
            key={message.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
              {!isCurrentUser && (
                <div className="text-xs text-gray-500 mb-1 px-2">
                  {message.senderNickname}
                </div>
              )}
              
              <div
                className={`px-3 py-2 rounded-lg ${
                  isCurrentUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {renderMessageContent(message)}
              </div>
              
              <div className={`text-xs text-gray-400 mt-1 px-2 ${
                isCurrentUser ? 'text-right' : 'text-left'
              }`}>
                {formatMessageTime(message.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
