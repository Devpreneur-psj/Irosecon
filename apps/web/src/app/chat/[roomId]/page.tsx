'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { 
  PaperAirplaneIcon, 
  PhotoIcon, 
  DocumentIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  senderId: string;
  senderNickname: string;
  type: 'text' | 'image' | 'file';
  content: string;
  timestamp: Date;
  encrypted: boolean;
}

interface Participant {
  id: string;
  nickname: string;
  role: string;
  joinedAt: Date;
}

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const nickname = searchParams.get('nickname') || '익명';
  const supervisorConsent = searchParams.get('supervisor') === 'true';

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15분
  const [roomStatus, setRoomStatus] = useState<'active' | 'expired' | 'ended'>('active');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Socket.IO 연결
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // 룸 참여
      newSocket.emit('room:join', {
        roomId,
        nickname,
        publicKey: 'dummy-key', // 실제로는 암호화 키 생성
        supervisorConsent,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('room:joined', (data) => {
      console.log('Joined room:', data);
      setParticipants(data.room.participants || []);
    });

    newSocket.on('system:participant-joined', (data) => {
      setParticipants(prev => [...prev, data.participant]);
    });

    newSocket.on('system:participant-left', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.participantId));
    });

    newSocket.on('message:received', (message) => {
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp),
      }]);
    });

    newSocket.on('message:typing', (data) => {
      if (data.participantId !== newSocket.id) {
        setIsTyping(data.isTyping);
      }
    });

    newSocket.on('room:extended', (data) => {
      setTimeRemaining(prev => prev + (data.additionalMinutes * 60));
    });

    newSocket.on('system:room-expired', () => {
      setRoomStatus('expired');
    });

    newSocket.on('system:room-ended', () => {
      setRoomStatus('ended');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, nickname, supervisorConsent]);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 타이머
  useEffect(() => {
    if (roomStatus !== 'active') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setRoomStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roomStatus]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    socket.emit('message:send', {
      roomId,
      content: newMessage.trim(),
      metadata: { encrypted: true },
    });

    setNewMessage('');
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket) return;

    socket.emit('message:typing', { roomId, isTyping });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('message:typing', { roomId, isTyping: false });
      }, 1000);
    }
  };

  const extendSession = () => {
    if (!socket) return;
    socket.emit('room:extend', { roomId, additionalMinutes: 15 });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              상담 룸: {roomId}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>참여자: {participants.length}명</span>
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                )}
                <span>{isConnected ? '연결됨' : '연결 끊김'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={extendSession}
              disabled={roomStatus !== 'active'}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              연장하기
            </button>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === socket?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === socket?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.senderNickname}
              </div>
              <div className="text-sm">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border px-4 py-2 rounded-lg">
              <div className="text-sm text-gray-500">상담사가 입력 중...</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      {roomStatus === 'active' ? (
        <div className="bg-white border-t p-4">
          <div className="flex space-x-2">
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping(e.target.value.length > 0);
                }}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              
              <button
                onClick={() => {/* 파일 업로드 */}}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
                disabled={!isConnected}
              >
                <PhotoIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => {/* 파일 업로드 */}}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
                disabled={!isConnected}
              >
                <DocumentIcon className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border-t p-4 text-center">
          <p className="text-red-600 font-medium">
            {roomStatus === 'expired' ? '세션이 만료되었습니다.' : '세션이 종료되었습니다.'}
          </p>
        </div>
      )}
    </div>
  );
}