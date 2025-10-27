'use client';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { MessageType } from '@counseling/types';
import { Button } from '@counseling/ui';

interface Message {
  id: string;
  senderNickname: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  encrypted: boolean;
  metadata?: {
    fileInfo?: {
      url: string;
      name: string;
      size: number;
    };
  };
}

interface Socket {
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

interface RoomMonitorProps {
  roomId: string;
  messages: Message[];
  socket: Socket | null;
}

export default function RoomMonitor({ roomId, messages, socket }: RoomMonitorProps) {
  const [showDecrypted, setShowDecrypted] = useState(true);

  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderMessageContent = (message: Message) => {
    if (!showDecrypted && message.encrypted) {
      return (
        <div className="text-gray-400 italic">
          [암호화된 메시지]
        </div>
      );
    }

    switch (message.type) {
      case MessageType.TEXT:
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
      
      case MessageType.IMAGE:
        const imageUrl = message.metadata?.fileInfo?.url;
        return (
          <div className="space-y-2">
            <div className="text-sm text-blue-600">📷 이미지</div>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Uploaded image"
                className="max-w-xs rounded-lg"
              />
            )}
          </div>
        );
      
      case MessageType.FILE:
        return (
          <div className="space-y-2">
            <div className="text-sm text-blue-600">📎 파일</div>
            <div className="text-sm text-gray-600">
              {message.metadata?.fileInfo?.name || '파일'}
            </div>
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

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              룸 모니터: {roomId}
            </h2>
            <p className="text-sm text-gray-500">
              실시간 대화 모니터링
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowDecrypted(!showDecrypted)}
              variant="secondary"
              size="sm"
            >
              {showDecrypted ? (
                <>
                  <EyeSlashIcon className="h-4 w-4 mr-1" />
                  암호화 표시
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4 mr-1" />
                  복호화 표시
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">👁️</div>
              <p>대화 내용이 없습니다</p>
              <p className="text-sm">참여자가 메시지를 보내면 여기에 표시됩니다</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
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
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {message.senderNickname}
                    </span>
                    {message.encrypted && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        암호화됨
                      </span>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
                
                <div className="text-gray-800">
                  {renderMessageContent(message)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
