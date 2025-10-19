'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  EyeIcon, 
  ClockIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

interface Room {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  participants: Participant[];
  supervisorConsent: boolean;
  status: 'active' | 'expired' | 'ended';
}

interface Participant {
  id: string;
  nickname: string;
  role: string;
  joinedAt: Date;
}

interface LogEntry {
  id: string;
  roomId: string;
  timestamp: Date;
  action: string;
  details: any;
}

export default function AdminDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Socket.IO 연결
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Admin connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Admin disconnected from server');
      setIsConnected(false);
    });

    // 룸 이벤트 수신
    newSocket.on('system:participant-joined', (data) => {
      addLog('participant-joined', data);
      updateRoomParticipants(data.roomId, data.participant);
    });

    newSocket.on('system:participant-left', (data) => {
      addLog('participant-left', data);
      removeRoomParticipant(data.roomId, data.participantId);
    });

    newSocket.on('message:received', (data) => {
      addLog('message-received', {
        roomId: data.roomId,
        senderNickname: data.senderNickname,
        messageType: data.type,
        timestamp: data.timestamp,
      });
    });

    newSocket.on('room:extended', (data) => {
      addLog('room-extended', data);
      updateRoomExpiry(data.roomId, data.newExpiresAt);
    });

    newSocket.on('system:room-expired', (data) => {
      addLog('room-expired', data);
      updateRoomStatus(data.roomId, 'expired');
    });

    newSocket.on('system:room-ended', (data) => {
      addLog('room-ended', data);
      updateRoomStatus(data.roomId, 'ended');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // 로그 추가
  const addLog = (action: string, details: any) => {
    const logEntry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      roomId: details.roomId || 'unknown',
      timestamp: new Date(),
      action,
      details,
    };
    
    setLogs(prev => [logEntry, ...prev].slice(0, 100)); // 최대 100개 유지
  };

  // 룸 참여자 업데이트
  const updateRoomParticipants = (roomId: string, participant: Participant) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, participants: [...room.participants, participant] }
        : room
    ));
  };

  const removeRoomParticipant = (roomId: string, participantId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, participants: room.participants.filter(p => p.id !== participantId) }
        : room
    ));
  };

  const updateRoomExpiry = (roomId: string, newExpiresAt: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, expiresAt: new Date(newExpiresAt) }
        : room
    ));
  };

  const updateRoomStatus = (roomId: string, status: 'active' | 'expired' | 'ended') => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, status }
        : room
    ));
  };

  // 모니터링 시작/중지
  const toggleMonitoring = () => {
    if (!socket) return;
    
    if (isMonitoring) {
      // 모니터링 중지
      setIsMonitoring(false);
      addLog('monitoring-stopped', { timestamp: new Date() });
    } else {
      // 모니터링 시작
      setIsMonitoring(true);
      addLog('monitoring-started', { timestamp: new Date() });
    }
  };

  // 룸 선택
  const selectRoom = (room: Room) => {
    setSelectedRoom(room);
    addLog('room-selected', { roomId: room.id, nickname: room.participants[0]?.nickname });
  };

  // 로그 내보내기
  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'ended': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600">실시간 상담 모니터링 및 관리</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm text-gray-600">
                  {isConnected ? '연결됨' : '연결 끊김'}
                </span>
              </div>
              
              <button
                onClick={toggleMonitoring}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
                  isMonitoring 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <StopIcon className="h-4 w-4" />
                    <span>모니터링 중지</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    <span>모니터링 시작</span>
                  </>
                )}
              </button>
              
              <button
                onClick={exportLogs}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                로그 내보내기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 활성 룸 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">활성 상담 룸</h2>
                <p className="text-sm text-gray-600">현재 진행 중인 상담 세션</p>
              </div>
              
              <div className="p-6">
                {rooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    활성 룸이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRoom?.id === room.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => selectRoom(room)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {room.id}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(room.status)}`}>
                              {room.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <UserGroupIcon className="h-4 w-4" />
                              <span>{room.participants.length}명</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{getTimeRemaining(room.expiresAt)}</span>
                            </div>
                            {room.supervisorConsent && (
                              <div className="flex items-center space-x-1">
                                <EyeIcon className="h-4 w-4" />
                                <span>감독</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          참여자: {room.participants.map(p => p.nickname).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 선택된 룸 정보 */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">룸 상세 정보</h2>
              </div>
              
              <div className="p-6">
                {selectedRoom ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">룸 ID</label>
                      <p className="text-sm text-gray-900">{selectedRoom.id}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">상태</label>
                      <p className={`text-sm px-2 py-1 rounded-full inline-block ${getStatusColor(selectedRoom.status)}`}>
                        {selectedRoom.status}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">남은 시간</label>
                      <p className="text-sm text-gray-900">{getTimeRemaining(selectedRoom.expiresAt)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">참여자</label>
                      <div className="space-y-2">
                        {selectedRoom.participants.map((participant) => (
                          <div key={participant.id} className="text-sm text-gray-900">
                            {participant.nickname} ({participant.role})
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">감독 동의</label>
                      <p className="text-sm text-gray-900">
                        {selectedRoom.supervisorConsent ? '동의함' : '동의 안함'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    룸을 선택하세요.
                  </div>
                )}
              </div>
            </div>

            {/* 활동 로그 */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">활동 로그</h2>
                <p className="text-sm text-gray-600">실시간 이벤트 기록</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      로그가 없습니다.
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {log.action}
                          </span>
                          <span className="text-gray-500">
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                        <div className="text-gray-600 text-xs">
                          룸: {log.roomId}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}